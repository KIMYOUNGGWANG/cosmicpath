import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { isExternalEffectsDisabled } from '@/lib/runtime-environment';
import {
  buildFreeSummaryExpansionSystemPrompt,
  buildStructuredSystemPrompt,
  buildUserPrompt,
  type ReadingContext,
} from '@/lib/ai/prompt-builder';
import {
  generateCompletion,
  generateStructuredReport,
  StructuredParseError,
  type ModelTier,
} from '@/lib/ai/llm-client';
import { attachPremiumQualityEnvelope } from '@/lib/ai/premium-quality-envelope';
import { generatePremiumReport, generateSinglePhase } from '@/lib/ai/premium-reading-service';
import { parsePremiumPhaseResult } from '@/lib/ai/premium-report-schemas';
import type { PremiumReportPartial, UserData } from '@/lib/ai/phase-prompts';
import { buildFallbackConvergenceDiagnosis } from '@/lib/ai/three-layer-synthesis';
import {
  buildFreeSummaryPhaseTwoUserPrompt,
  buildOracleReportEnrichment,
  buildReadingMetadata,
  extractPartialJsonStringValue,
  finalizeFreeReport,
  FreeReadingCoreSchema,
  normalizeFreeSummaryContent,
  type ReadingLanguage,
} from './route-helpers';
import { sanitizeText } from './free-focus-contract';
import type { AssembledReadingRuntime } from './reading-runtime-service';

type GenerationAuditMeta = {
  requestedModel: string;
  executedModel?: string;
  isFailover?: boolean;
  textLength?: number;
  timestamp: string;
};

type EnrichedPayload = {
  success: boolean;
  report: ReturnType<typeof buildOracleReportEnrichment>;
  isPremium: boolean;
  metadata: ReturnType<typeof buildReadingMetadata> & {
    freeGenerationMode?: string;
    generationAudit?: GenerationAuditMeta;
  };
  phase?: number;
  error?: string;
};

type BuildPayloadParams = {
  success: boolean;
  report: unknown;
  runtime: AssembledReadingRuntime;
  language: ReadingLanguage;
  isPremium: boolean;
  phase?: number;
  error?: string;
  freeGenerationMode?: string;
  generationAudit?: GenerationAuditMeta;
};

type PremiumReadingParams = {
  runtime: AssembledReadingRuntime;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
  unknownTime?: boolean;
  context: ReadingContext;
  question: string;
  language: ReadingLanguage;
  phase?: number;
  previousReport?: unknown;
  partnerName?: string;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  readingId?: string;
};

type PremiumFallbackMetadata = {
  readonly reason?: string;
  readonly currentDate: string;
  readonly advisorEvidenceSummary?: string;
  readonly oracleCouncil?: {
    readonly convergenceScore?: number;
  } | null;
};

type FreeReadingParams = {
  runtime: AssembledReadingRuntime;
  context: ReadingContext;
  question: string;
  language: ReadingLanguage;
  currentPhase: number;
  effectiveModelTier: ModelTier;
  previousReport?: unknown;
  partnerName?: string;
};

function getCurrentKoreanDate() {
  return new Date().toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '-').replace(/\./g, '');
}

function isPremiumQualityGateFailure(error: string | undefined): boolean {
  return typeof error === 'string' && error.includes('PREMIUM_QUALITY_GATE_FAILED');
}

function premiumQualityGateResponse(phase: number | undefined, error: string | undefined) {
  return NextResponse.json(
    {
      success: false,
      code: 'PREMIUM_QUALITY_GATE_FAILED',
      retryable: true,
      phase,
      error: error ?? 'Premium report failed grounded quality validation.',
    },
    { status: 502 }
  );
}

function addDaysIso(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function addMonthsLabel(date: string, months: number, language: ReadingLanguage): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCMonth(parsed.getUTCMonth() + months);
  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return language === 'en' ? `${year}-${month}` : `${year}년 ${month}월`;
}

function textFor(language: ReadingLanguage, ko: string, en: string): string {
  return language === 'en' ? en : ko;
}

function getDayMaster(userData: UserData): string {
  const dayPillar = userData.sajuData?.dayPillar;
  if (!dayPillar) return 'unconfirmed day master';
  return `${dayPillar.stem}${dayPillar.branch}`;
}

function getCurrentFlow(userData: UserData): string {
  const currentDaeun = userData.sajuData?.daeun?.currentDaeun;
  const sewoon = userData.sajuData?.sewoon;
  const daeunLabel = currentDaeun ? `${currentDaeun.stem}${currentDaeun.branch}` : 'current cycle pending';
  const yearLabel = sewoon ? `${sewoon.year} ${sewoon.stem}${sewoon.branch}` : 'year flow pending';
  return `${daeunLabel} / ${yearLabel}`;
}

function getLifePathNumber(birthDate: string): number {
  const total = birthDate
    .replace(/\D/g, '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
  let value = total;
  while (value > 9) {
    value = String(value)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return Math.max(value, 1);
}

export function buildPremiumPhaseFallback(
  phaseNumber: number,
  userData: UserData,
  metadata: PremiumFallbackMetadata
): PremiumReportPartial {
  const language = userData.language || 'ko';
  const dayMaster = getDayMaster(userData);
  const currentFlow = getCurrentFlow(userData);
  const question = sanitizeText(userData.question) || textFor(language, '현재 선택', 'the current choice');
  const context = sanitizeText(userData.context) || textFor(language, '종합', 'general');
  const firstActionDate = addDaysIso(metadata.currentDate, 2);
  const reviewDate = addDaysIso(metadata.currentDate, 7);
  const decisionDate = addDaysIso(metadata.currentDate, 14);

  switch (phaseNumber) {
    case 1:
      return {
        summary: {
          title: textFor(language, '핵심 리딩 요약', 'Core reading summary'),
          content: textFor(
            language,
            `${question}에 대해서는 지금 결론을 서두르기보다 기준을 좁히고 첫 행동을 작게 고정하는 쪽이 안전합니다. ${dayMaster}와 ${currentFlow} 흐름은 감정 확신보다 검증 가능한 반응을 먼저 보라고 말합니다.`,
            `For ${question}, the safer move is to narrow the criteria and lock one small action before forcing a final answer. ${dayMaster} and ${currentFlow} point to observable response over emotional certainty.`
          ),
          trust_score: 3,
          trust_reason: textFor(
            language,
            `${context} 맥락, 사주 좌표, 카드 입력이 같은 방향으로 모이는 지점을 기준으로 정리했습니다.`,
            `This was organized from the overlap between the ${context} context, saju anchors, and card inputs.`
          ),
        },
        traits: [
          {
            type: 'recovery',
            name: textFor(language, '기준을 좁히는 사람', 'Criteria-first mover'),
            description: textFor(
              language,
              '답을 크게 믿기보다 반응을 작게 검증할 때 판단력이 살아납니다.',
              'Your judgment improves when you test a small response instead of believing a large conclusion too early.'
            ),
            grade: 'B+',
          },
        ],
        core_analysis: {
          lacking_elements: {
            elements: textFor(language, '실행 검증', 'execution evidence'),
            remedy: textFor(language, '48시간 안에 작은 확인 행동 하나', 'one small confirmation action within 48 hours'),
            description: textFor(
              language,
              '지금 부족한 것은 더 많은 해석이 아니라, 상대나 시장이 실제로 반응하는지 확인하는 증거입니다.',
              'What is missing now is not more interpretation, but evidence that the other side or the market actually responds.'
            ),
          },
          abundant_elements: {
            elements: textFor(language, '생각의 밀도', 'analysis density'),
            usage: textFor(language, '판단 기준으로 압축', 'compress into decision criteria'),
            description: textFor(
              language,
              '생각은 충분히 쌓였으니 이번 단계에서는 기준 세 개로 줄여야 흔들림이 줄어듭니다.',
              'You already have enough thinking; reducing it to three criteria will lower the noise.'
            ),
          },
        },
      };
    case 2:
      return {
        astro_deep: {
          sun_moon_dynamic: {
            title: textFor(language, '감정과 현실의 간격', 'Gap between feeling and reality'),
            content: textFor(
              language,
              `태양/달 흐름은 ${question}을 단번에 결론내리기보다, 지금 느끼는 확신과 실제 반응 사이의 간격을 보라고 합니다.`,
              `The Sun/Moon layer asks you to watch the gap between your current certainty about ${question} and the real response you receive.`
            ),
          },
          ascendant_influence: {
            title: textFor(language, '첫인상보다 반복 반응', 'Repeated response over first impression'),
            content: textFor(
              language,
              '겉으로 보이는 신호 하나보다 같은 메시지를 두 번 보냈을 때의 일관성이 더 중요합니다.',
              'One visible signal matters less than whether the response stays consistent after a second touch.'
            ),
          },
        },
      };
    case 3: {
      const lifePath = getLifePathNumber(userData.birthDate);
      return {
        numerology: {
          life_path: {
            number: lifePath,
            title: textFor(language, `생명수 ${lifePath}`, `Life path ${lifePath}`),
            meaning: textFor(
              language,
              '이번 판단은 속도보다 반복 가능한 기준을 세울 때 안정됩니다.',
              'This decision stabilizes when you use repeatable criteria rather than speed.'
            ),
            saju_connection: `${dayMaster} signal cross-checked with ${currentFlow}`,
          },
          lucky_numbers: [lifePath, 7],
          lucky_day_advice: textFor(language, `${reviewDate}에 첫 반응을 다시 점검하세요.`, `Review the first response again on ${reviewDate}.`),
        },
      };
    }
    case 4:
      return {
        saju_sections: [
          {
            id: 'day_master',
            title: textFor(language, '일간 기준점', 'Day master anchor'),
            content: textFor(
              language,
              `${dayMaster} 기준으로 보면 지금은 감정의 크기보다 실행 후 남는 증거를 봐야 하는 구간입니다.`,
              `From the ${dayMaster} anchor, this period favors evidence left after action over the size of the feeling.`
            ),
          },
          {
            id: 'current_flow',
            title: textFor(language, '현재 흐름', 'Current flow'),
            content: textFor(
              language,
              `${currentFlow} 흐름은 선택지를 넓히는 단계가 아니라 한 가지 실험으로 압축하는 단계에 가깝습니다.`,
              `${currentFlow} is closer to compressing options into one experiment than expanding the field.`
            ),
          },
        ],
      };
    case 5:
      return {
        fortune_flow: {
          major_luck: {
            title: textFor(language, '큰 흐름', 'Long cycle'),
            period: `${metadata.currentDate} onward`,
            content: textFor(
              language,
              '큰 흐름은 완전한 확신을 기다리기보다 작게 열고 빠르게 확인하는 방식에 유리합니다.',
              'The larger cycle favors opening a small test and checking quickly rather than waiting for perfect certainty.'
            ),
          },
          yearly_luck: {
            title: textFor(language, '올해의 운영 포인트', 'This year’s operating point'),
            content: textFor(
              language,
              `${question}은 ${reviewDate}까지 첫 반응을 보고, ${decisionDate} 전에는 기준을 다시 바꾸지 않는 편이 안정적입니다.`,
              `For ${question}, check the first response by ${reviewDate} and avoid changing the criteria before ${decisionDate}.`
            ),
          },
          monthly_luck: [
            {
              month: addMonthsLabel(metadata.currentDate, 0, language),
              theme: textFor(language, '작은 검증', 'Small validation'),
              advice: textFor(language, '한 가지 메시지, 한 가지 지표, 한 번의 후속 확인으로 줄이세요.', 'Use one message, one metric, and one follow-up check.'),
              score: 72,
            },
          ],
        },
      };
    case 6:
      return {
        life_areas: {
          career: {
            title: textFor(language, '일과 방향', 'Work and direction'),
            tag: textFor(language, '검증 우선', 'evidence first'),
            content: textFor(
              language,
              '일에서는 큰 전환보다 작은 제안의 반응률을 먼저 보는 편이 낫습니다.',
              'In work, read the response rate to a small offer before making a large pivot.'
            ),
          },
          wealth: {
            title: textFor(language, '돈과 리스크', 'Money and risk'),
            content: textFor(
              language,
              '비용은 늘리기보다 실험 단위를 줄이고 손실 상한을 먼저 정해야 합니다.',
              'Reduce the experiment size and define the loss limit before increasing spend.'
            ),
          },
          love: {
            title: textFor(language, '관계 흐름', 'Relationship flow'),
            content: textFor(
              language,
              '관계에서는 긴 설명보다 짧고 확인 가능한 요청이 더 좋은 신호를 줍니다.',
              'In relationships, a short and verifiable ask gives a cleaner signal than a long explanation.'
            ),
          },
          health: {
            title: textFor(language, '컨디션', 'Condition'),
            content: textFor(
              language,
              '결정 전날에는 수면과 일정 여백을 확보해 과잉 해석을 줄이세요.',
              'Before deciding, protect sleep and schedule margin to reduce over-reading.'
            ),
          },
        },
      };
    case 7:
      return {
        special_analysis: {
          noble_person: {
            title: textFor(language, '도움을 주는 사람', 'Helpful person'),
            content: textFor(
              language,
              '이번에는 위로해주는 사람보다 숫자와 기준을 같이 봐주는 사람이 귀인입니다.',
              'The helpful person is not the one who only comforts you, but the one who checks numbers and criteria with you.'
            ),
          },
          conflicts: {
            title: textFor(language, '충돌 지점', 'Conflict point'),
            content: textFor(
              language,
              '가장 큰 충돌은 더 해석하고 싶은 마음과 이미 실행해야 하는 타이밍 사이에서 납니다.',
              'The main conflict is between wanting more interpretation and already needing a test.'
            ),
          },
        },
        lucky_assets: {
          colors: [{ name: textFor(language, 'Slate Blue', 'Slate Blue'), hex: '#4F6F8F', reason: textFor(language, '판단을 차분하게 고정합니다.', 'It keeps judgment steady.') }],
          foods: [{ name: textFor(language, '따뜻한 차', 'warm tea'), benefit: textFor(language, '반응 전 속도를 낮춥니다.', 'It slows the pace before reacting.') }],
          places: [{ name: textFor(language, '조용한 작업 공간', 'quiet workspace'), description: textFor(language, '기준을 글로 정리하기 좋습니다.', 'Good for writing the criteria down.') }],
        },
        action_plan: [
          {
            date: firstActionDate,
            title: textFor(language, '첫 확인 행동', 'First confirmation action'),
            description: textFor(language, '한 문장으로 요청하거나 제안하고 반응을 기록하세요.', 'Send one concise ask or offer and record the response.'),
            type: 'test',
          },
          {
            date: reviewDate,
            title: textFor(language, '반응 점검', 'Response review'),
            description: textFor(language, '답변의 속도, 명확성, 후속 행동 여부를 비교하세요.', 'Compare response speed, clarity, and whether follow-through happened.'),
            type: 'review',
          },
          {
            date: decisionDate,
            title: textFor(language, '계속/중단 결정', 'Continue or stop decision'),
            description: textFor(language, '기준을 바꾸지 말고 증거로 계속 여부를 정하세요.', 'Do not move the criteria; decide from the evidence.'),
            type: 'decision',
          },
        ],
        date_selection: {
          auspicious: [{ date: firstActionDate, purpose: textFor(language, '작은 실행', 'small action'), reason: textFor(language, '부담 없이 신호를 확인하기 좋은 날입니다.', 'A clean day for checking a signal without overcommitting.') }],
          inauspicious: [{ date: addDaysIso(metadata.currentDate, 1), purpose: textFor(language, '최종 확정', 'final commitment'), reason: textFor(language, '아직 반응 데이터가 부족합니다.', 'Response data is still too thin.') }],
        },
      };
    case 8:
      return {
        past_life: {
          theme: {
            title: textFor(language, '반복되는 선택의 테마', 'Repeated choice theme'),
            content: textFor(
              language,
              '이번 테마는 더 믿을 만한 예언을 찾는 것이 아니라, 내 선택을 검증 가능한 구조로 바꾸는 것입니다.',
              'The theme is not finding a more believable prediction, but turning your choice into a verifiable structure.'
            ),
          },
          karma: {
            title: textFor(language, '미루는 습관', 'Delay pattern'),
            content: textFor(language, '해석이 늘어날수록 실행이 늦어지는 패턴을 끊어야 합니다.', 'Break the pattern where more interpretation delays action.'),
          },
          soul_mission: {
            title: textFor(language, '이번 선택의 임무', 'Task of this choice'),
            content: textFor(language, '작게 움직이고, 반응을 보고, 기준대로 결정하는 것입니다.', 'Move small, read the response, and decide by the criteria.'),
          },
        },
        glossary: [
          {
            term: textFor(language, '검증 기준', 'Validation criteria'),
            hanja: '檢證基準',
            definition: textFor(language, '감정이 아니라 행동 결과를 읽기 위한 기준입니다.', 'A standard for reading action results instead of emotion.'),
            context: textFor(language, `${question}의 계속 여부를 판단하는 중심 도구입니다.`, `The central tool for deciding whether to continue ${question}.`),
          },
        ],
        final_verdict: {
          title: textFor(language, '작게 열고 증거로 결정하세요', 'Open small, decide from evidence'),
          core_message: textFor(
            language,
            `${question}은 지금 전부 걸 문제가 아니라 ${firstActionDate}의 작은 실행과 ${reviewDate}의 반응 점검으로 판단할 문제입니다.`,
            `${question} should not be an all-in decision now; judge it through a small action on ${firstActionDate} and a response review on ${reviewDate}.`
          ),
          saju_foundation: `${dayMaster} / ${currentFlow}`,
          astro_support: textFor(language, '감정 확신보다 반복 반응이 더 신뢰할 만한 신호입니다.', 'Repeated response is more reliable than emotional certainty.'),
          tarot_insight: textFor(language, '수비학 및 자미두수 흐름은 방향 설정 후 짧은 실행을 권합니다.', 'Numerology and Ziwei cycles favor direction first, then a short test.'),
          action_priorities: [
            textFor(language, `${firstActionDate}에 첫 행동 하나만 실행`, `Take one first action on ${firstActionDate}`),
            textFor(language, `${reviewDate}까지 반응을 기록`, `Record responses through ${reviewDate}`),
            textFor(language, `${decisionDate}에 계속/중단 결정`, `Decide continue or stop on ${decisionDate}`),
          ],
          closing_words: textFor(
            language,
            '이번 리딩의 핵심은 더 오래 고민하는 것이 아니라, 안전하게 작게 움직여 실제 신호를 확보하는 것입니다.',
            'The point of this reading is not to think longer, but to move safely and collect a real signal.'
          ),
          convergence_diagnosis: {
            ...buildFallbackConvergenceDiagnosis({
              language,
              advisorEvidenceSummary: metadata.advisorEvidenceSummary,
              convergenceScore: metadata.oracleCouncil?.convergenceScore,
            }),
            level: 'two_aligned',
          },
          decision_packet: {
            decision_fork: {
              option_a: textFor(language, '확인할 사실과 질문을 정리한다', 'Organize the facts and questions to verify'),
              option_b: textFor(language, '기준일까지 관찰하고 보류한다', 'Observe and hold until the review date'),
              recommended_test: textFor(language, `${firstActionDate}에 문서·질문·비용 비교표 하나를 만듭니다.`, `Build one document, question, and cost comparison on ${firstActionDate}.`),
            },
            evidence_disagreement: {
              aligned: textFor(language, '복구 응답에서는 세 원천의 세부 합의를 확정하지 않습니다.', 'The recovered response does not claim detailed agreement among the three sources.'),
              conflicting: textFor(language, '세부 근거 충돌은 알 수 없으므로 현실 자료와 전문가 질문으로 확인합니다.', 'Detailed source conflict remains unknown and must be checked through real evidence and qualified questions.'),
            },
            reality_checks: [
              textFor(language, `${reviewDate}까지 실제 답변 또는 시장 반응을 기록합니다.`, `Record actual replies or market response through ${reviewDate}.`),
              textFor(language, '시간·비용·에너지 손실이 정한 한도를 넘는지 확인합니다.', 'Check whether time, cost, or energy exceeds the chosen limit.'),
            ],
            seven_day_experiment: {
              action: textFor(language, `${firstActionDate}에 확인할 문서·질문·비용 항목을 한 장으로 정리합니다.`, `Put the documents, questions, and costs to verify on one page on ${firstActionDate}.`),
              measure: textFor(language, `${reviewDate}까지 검증된 사실 두 개와 아직 모르는 점 하나를 구분합니다.`, `Separate two verified facts from one remaining unknown by ${reviewDate}.`),
              stop_rule: textFor(language, '전문 판단이 필요한 선택은 자격 있는 검토 전 확정하지 않습니다.', 'Do not finalize a regulated or professional decision before qualified review.'),
            },
            if_then_rules: [
              {
                if: textFor(language, '구체적이고 반복 가능한 반응이 확인되면', 'a concrete, repeatable response appears'),
                then: textFor(language, '다음 행동을 한 단계만 키웁니다.', 'increase the next action by one step only.'),
              },
              {
                if: textFor(language, '반응이 없거나 중단 기준을 넘으면', 'there is no response or the stop rule is crossed'),
                then: textFor(language, '확정하지 않고 선택지를 줄여 다시 검토합니다.', 'do not commit; narrow the options and review.'),
              },
            ],
          },
        },
      };
    default:
      return {};
  }
}

function buildValidatedPremiumPhaseFallback(
  phaseNumber: number,
  userData: UserData,
  metadata: PremiumFallbackMetadata
): PremiumReportPartial {
  return parsePremiumPhaseResult(
    phaseNumber,
    buildPremiumPhaseFallback(phaseNumber, userData, metadata),
    { currentDate: metadata.currentDate }
  );
}

function mergePremiumFallbackPhases(
  report: PremiumReportPartial,
  userData: UserData,
  metadata: PremiumFallbackMetadata
): PremiumReportPartial {
  const completedReport: PremiumReportPartial = { ...report };
  for (let phaseNumber = 1; phaseNumber <= 8; phaseNumber += 1) {
    Object.assign(completedReport, {
      ...buildValidatedPremiumPhaseFallback(phaseNumber, userData, metadata),
      ...completedReport,
    });
  }
  return completedReport;
}

const PHASE_KEYS: Record<number, readonly string[]> = {
  1: ['summary', 'traits', 'core_analysis'],
  2: ['astro_deep'],
  3: ['tarot_details', 'numerology'],
  4: ['saju_sections'],
  5: ['fortune_flow'],
  6: ['life_areas'],
  7: ['special_analysis', 'lucky_assets', 'action_plan', 'date_selection'],
  8: ['past_life', 'glossary', 'final_verdict'],
};

export function extractPhaseSlice(phaseNumber: number, source: unknown): PremiumReportPartial | null {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return null;
  }
  const keys = PHASE_KEYS[phaseNumber];
  if (!keys) return null;

  const record = source as Record<string, unknown>;
  const primaryKey = keys[0];
  if (!record[primaryKey]) {
    return null;
  }

  const slice: Record<string, unknown> = {};
  for (const key of keys) {
    if (record[key] !== undefined) {
      slice[key] = record[key];
    }
  }

  return slice as PremiumReportPartial;
}

const activePremiumReportCache = new Map<string, { report: PremiumReportPartial; updatedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function setReportCache(key: string, report: PremiumReportPartial) {
  if (activePremiumReportCache.size > 200) {
    const oldestKey = activePremiumReportCache.keys().next().value;
    if (oldestKey) activePremiumReportCache.delete(oldestKey);
  }
  activePremiumReportCache.set(key, { report, updatedAt: Date.now() });
}

function buildEnrichedPayload(params: BuildPayloadParams): EnrichedPayload {
  const metadata = {
    ...buildReadingMetadata({
      guide: params.runtime.guide,
      saju: params.runtime.saju,
      astrology: params.runtime.astrology,
      cards: params.runtime.cards,
      characterId: params.runtime.resolvedCharacterId,
      questionIntent: params.runtime.resolvedQuestionIntent,
      decisionAction: params.runtime.decisionAction,
      selectionMode: params.runtime.effectiveSelectionMode,
      advisorProfile: params.runtime.advisorProfile,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      precisionMetadata: params.runtime.precisionMetadata,
      oracleCouncil: params.runtime.oracleCouncil,
      partnerSaju: params.runtime.partnerSaju,
    }),
    ...(params.runtime.scenarioDecision ? { scenarioDecision: params.runtime.scenarioDecision } : {}),
    ...(params.freeGenerationMode ? { freeGenerationMode: params.freeGenerationMode } : {}),
    ...(params.generationAudit ? { generationAudit: params.generationAudit } : {}),
  };

  return {
    success: params.success,
    phase: params.phase,
    report: buildOracleReportEnrichment(params.report, {
      characterId: params.runtime.resolvedCharacterId,
      questionIntent: params.runtime.resolvedQuestionIntent,
      decisionAction: params.runtime.decisionAction,
      selectionMode: params.runtime.effectiveSelectionMode,
      language: params.language,
      advisorProfile: params.runtime.advisorProfile,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      precisionMetadata: params.runtime.precisionMetadata,
      oracleCouncil: params.runtime.oracleCouncil,
    }),
    isPremium: params.isPremium,
    error: params.error,
    metadata,
  };
}

export async function runPremiumReading(params: PremiumReadingParams) {
  const apiKey = process.env.GOOGLE_AI_API_KEY as string;
  const currentDate = getCurrentKoreanDate();
  const previousPhaseReport: PremiumReportPartial | null =
    params.previousReport && typeof params.previousReport === 'object' && !Array.isArray(params.previousReport)
      ? params.previousReport as PremiumReportPartial
      : null;
  const userData = {
    name: params.name,
    gender: params.gender,
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    unknownTime: params.unknownTime,
    characterId: params.runtime.resolvedCharacterId,
    selectionMode: params.runtime.effectiveSelectionMode,
    questionIntent: params.runtime.resolvedQuestionIntent,
    advisorProfile: params.runtime.advisorProfile,
    advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
    context: params.context,
    question: params.question,
    scenarioA: params.runtime.scenarioDecision?.scenarioA,
    scenarioB: params.runtime.scenarioDecision?.scenarioB,
    scenarioDecision: params.runtime.scenarioDecision,
    sajuData: params.runtime.saju,
    astroData: {
      sunSign: ZODIAC_SIGNS[params.runtime.astrology.sunSign].name,
      sunSignIndex: params.runtime.astrology.sunSign,
      sunSignElement: ZODIAC_SIGNS[params.runtime.astrology.sunSign].element,
      moonSign: ZODIAC_SIGNS[params.runtime.astrology.moonSign].name,
      moonSignIndex: params.runtime.astrology.moonSign,
      moonSignElement: ZODIAC_SIGNS[params.runtime.astrology.moonSign].element,
      ascendant: ZODIAC_SIGNS[params.runtime.astrology.ascendant].name,
      ascendantIndex: params.runtime.astrology.ascendant,
      ascendantElement: ZODIAC_SIGNS[params.runtime.astrology.ascendant].element,
      planets: params.runtime.astrology.planets.map((planet) => ({
        ...planet,
        signName: ZODIAC_SIGNS[planet.sign]?.name ?? 'unknown',
        signElement: ZODIAC_SIGNS[planet.sign]?.element ?? 'unknown',
      })),
      aspects: params.runtime.astrology.aspects,
      enhancedAspects: params.runtime.astrology.enhancedAspects,
      dignities: params.runtime.astrology.dignities,
      patterns: params.runtime.astrology.patterns,
      calculationSource: 'server_calculateAstrology',
    },
    tarotCards: params.runtime.cards,
    thaiAstrology: params.runtime.thaiAstrology,
    ziweiChart: params.runtime.ziweiChart,
    weeklyHeatmap: params.runtime.weeklyHeatmap,
    shadowTransformations: params.runtime.shadowTransformations,
    compatibility4D: params.runtime.compatibility4D,
    language: params.language,
    currentDate,
    partnerName: params.partnerName || undefined,
    partnerBirthDate: params.partnerBirthDate || undefined,
    partnerBirthTime: params.partnerBirthTime || undefined,
    partnerSajuData: params.runtime.partnerSaju || undefined,
  };

  const cacheKey = params.readingId || `${params.name}:${params.birthDate}:${params.birthTime}:${params.question?.trim() || ''}`;

  try {
    if (params.phase) {
      // 1. Check previousPhaseReport
      const fromPrevious = extractPhaseSlice(params.phase, previousPhaseReport);
      if (fromPrevious) {
        console.log(`[Reading API Cache] Phase ${params.phase} satisfied from previousReport`);
        return NextResponse.json(buildEnrichedPayload({
          success: true,
          phase: params.phase,
          report: fromPrevious,
          runtime: params.runtime,
          language: params.language,
          isPremium: true,
          generationAudit: {
            requestedModel: 'gemini-3.5-flash',
            executedModel: 'cache:previous_report',
            timestamp: new Date().toISOString(),
          },
        }));
      }

      // 2. Check in-memory cache
      const cachedEntry = activePremiumReportCache.get(cacheKey);
      if (cachedEntry && Date.now() - cachedEntry.updatedAt < CACHE_TTL_MS) {
        const fromCache = extractPhaseSlice(params.phase, cachedEntry.report);
        if (fromCache) {
          console.log(`[Reading API Cache] Phase ${params.phase} satisfied from memory cache`);
          return NextResponse.json(buildEnrichedPayload({
            success: true,
            phase: params.phase,
            report: fromCache,
            runtime: params.runtime,
            language: params.language,
            isPremium: true,
            generationAudit: {
              requestedModel: 'gemini-3.5-flash',
              executedModel: 'cache:memory',
              timestamp: new Date().toISOString(),
            },
          }));
        }
      }

      // 3. Check DB if readingId is present
      if (params.readingId) {
        try {
          const stored = await prisma.readingResult.findUnique({
            where: { id: params.readingId },
            select: { data: true },
          });
          if (stored?.data) {
            const parsedData = typeof stored.data === 'string' ? JSON.parse(stored.data) : stored.data;
            const fromDb = extractPhaseSlice(params.phase, parsedData);
            if (fromDb) {
              console.log(`[Reading API Cache] Phase ${params.phase} satisfied from database cache`);
              setReportCache(cacheKey, { ...(cachedEntry?.report || {}), ...(parsedData as PremiumReportPartial) });
              return NextResponse.json(buildEnrichedPayload({
                success: true,
                phase: params.phase,
                report: fromDb,
                runtime: params.runtime,
                language: params.language,
                isPremium: true,
                generationAudit: {
                  requestedModel: 'gemini-3.5-flash',
                  executedModel: 'cache:database',
                  timestamp: new Date().toISOString(),
                },
              }));
            }
          }
        } catch (dbErr) {
          console.warn('[Reading API Cache] DB read failed:', dbErr);
        }
      }

      console.log(`Executing Phase ${params.phase} for Premium Reading`);
      const phaseResult = await generateSinglePhase(
        params.phase,
        userData,
        previousPhaseReport,
        apiKey
      );

      if (!phaseResult.success) {
        if (isPremiumQualityGateFailure(phaseResult.error)) {
          return premiumQualityGateResponse(params.phase, phaseResult.error);
        }

        console.warn(
          `[Reading API] Premium phase ${params.phase} failed. Returning recovered phase payload.`,
          phaseResult.error
        );
        const fallbackReport = buildValidatedPremiumPhaseFallback(params.phase, userData, {
          reason: phaseResult.error,
          currentDate,
        });

        return NextResponse.json(buildEnrichedPayload({
          success: true,
          phase: params.phase,
          report: fallbackReport,
          runtime: params.runtime,
          language: params.language,
          isPremium: true,
          error: phaseResult.error,
          freeGenerationMode: 'premium_phase_recovery',
        }));
      }

      if (phaseResult.isFailover) {
        console.warn(
          `[Reading API Audit] Phase ${params.phase} executed with failover model ${phaseResult.executedModel} (length: ${phaseResult.textLength} chars)`
        );
      }

      if (phaseResult.data) {
        const mergedReport: PremiumReportPartial = {
          ...(cachedEntry?.report || {}),
          ...(previousPhaseReport || {}),
          ...phaseResult.data,
        };
        setReportCache(cacheKey, mergedReport);

        if (params.readingId) {
          prisma.readingResult.update({
            where: { id: params.readingId },
            data: { data: JSON.stringify(mergedReport) },
          }).catch((err) => console.warn('[Reading API Cache] Failed to persist report slice:', err));
        }
      }

      return NextResponse.json(buildEnrichedPayload({
        success: true,
        phase: params.phase,
        report: phaseResult.data,
        runtime: params.runtime,
        language: params.language,
        isPremium: true,
        generationAudit: {
          requestedModel: 'gemini-3.5-flash',
          executedModel: phaseResult.executedModel,
          isFailover: phaseResult.isFailover,
          textLength: phaseResult.textLength,
          timestamp: new Date().toISOString(),
        },
      }));
    }

    const premiumResult = await generatePremiumReport(userData, apiKey);
    if (!premiumResult.success && isPremiumQualityGateFailure(premiumResult.error)) {
      return premiumQualityGateResponse(undefined, premiumResult.error);
    }

    const report = premiumResult.success
      ? premiumResult.report
      : attachPremiumQualityEnvelope(
          mergePremiumFallbackPhases(premiumResult.report, userData, {
            reason: premiumResult.error,
            currentDate,
          }),
          userData,
          {
            reportMode: 'degraded_premium',
            providerRecovery: {
              attempted: true,
              visibleToCustomer: true,
              reason: premiumResult.error ?? 'premium_full_recovery',
            },
          }
        );

    if (premiumResult.success) {
      setReportCache(cacheKey, report);
      if (params.readingId) {
        prisma.readingResult.update({
          where: { id: params.readingId },
          data: { data: JSON.stringify(report) },
        }).catch((err) => console.warn('[Reading API Cache] Failed to persist full report:', err));
      }
    }

    return NextResponse.json(buildEnrichedPayload({
      success: true,
      report,
      runtime: params.runtime,
      language: params.language,
      isPremium: true,
      error: premiumResult.error,
      freeGenerationMode: premiumResult.success ? undefined : 'premium_full_recovery',
    }));
  } catch (premiumError) {
    console.error('Premium generation failed:', premiumError);
    return NextResponse.json(
      {
        error: '프리미엄 리포트를 불러오는 중 오류가 발생했습니다.',
        code: 'PREMIUM_GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}

export async function runFreeReading(params: FreeReadingParams) {
  const currentDate = getCurrentKoreanDate();
  const baseUserPrompt = buildUserPrompt(
    params.runtime.guide,
    params.runtime.saju,
    params.runtime.astrology,
    params.runtime.cards,
    params.context,
    params.question,
    params.language,
    currentDate,
    params.runtime.partnerSaju,
    params.partnerName,
    params.runtime.resolvedCharacterId,
    {
      questionIntent: params.runtime.resolvedQuestionIntent,
      selectionMode: params.runtime.effectiveSelectionMode,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      isPremium: false,
    }
  );

  // 무료 리딩은 초고속 결정론적 엔진(Deterministic Engine)으로 0ms 즉시 생성하여 API 비용 $0 및 제로 레이턴시 달성
  const finalizedReport = finalizeFreeReport({
    guide: params.runtime.guide,
    saju: params.runtime.saju,
    astrology: params.runtime.astrology,
    cards: params.runtime.cards,
    questionIntent: params.runtime.resolvedQuestionIntent,
    decisionAction: params.runtime.decisionAction,
    question: params.question,
    advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
    language: params.language,
    previousReport: params.previousReport,
  });

  return NextResponse.json(buildEnrichedPayload({
    success: true,
    phase: params.currentPhase,
    report: finalizedReport,
    runtime: params.runtime,
    language: params.language,
    isPremium: false,
    freeGenerationMode: 'deterministic_fallback_outline', // fallback sentinel: partial_json_recovery_outline
  }));
}
