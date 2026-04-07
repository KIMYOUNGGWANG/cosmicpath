import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';
import { sendFollowUpNudgeEmail } from '@/lib/email/sender';
import { trackGrowthEvent } from '@/lib/growth-events';
import { createSingleUsePromotionCode } from '@/lib/promo-codes';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';

export type FollowUpStage = 'D2_DISCOUNT' | 'D5_COSMIC_WINDOW' | 'H48' | 'D7';

export const DEFAULT_FOLLOW_UP_STAGES: FollowUpStage[] = ['D2_DISCOUNT', 'D5_COSMIC_WINDOW', 'D7'];

const DISCOUNT_STAGE_DISCOUNT = 20;
const DISCOUNT_STAGE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const DISCOUNT_STAGE_ALIASES = new Set<FollowUpStage>(['D2_DISCOUNT', 'H48']);

const MAX_ATTEMPTS = Number(process.env.FOLLOWUP_MAX_ATTEMPTS ?? '3');

interface FollowUpJobMetadata {
  subjectHint?: string;
  sentAt?: string;
  promoCodeId?: string;
  promoCode?: string;
  discount?: number;
  offerUrl?: string;
  expiresAt?: string;
  cosmicWindowTitle?: string;
  cosmicWindowLabel?: string;
  phase4Url?: string;
  runtimeEnvironment?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

type CosmicSeasonKey =
  | 'CAPRICORN'
  | 'AQUARIUS'
  | 'PISCES'
  | 'ARIES'
  | 'TAURUS'
  | 'GEMINI'
  | 'CANCER'
  | 'LEO'
  | 'VIRGO'
  | 'LIBRA'
  | 'SCORPIO'
  | 'SAGITTARIUS';

interface CosmicWindowContent {
  seasonLabel: string;
  title: string;
  summary: string;
  highlight: string;
}

const COSMIC_WINDOW_COPY: Record<CosmicSeasonKey, CosmicWindowContent> = {
  CAPRICORN: {
    seasonLabel: '염소자리 시즌',
    title: '이번 주 하늘의 포인트: 염소자리 시즌',
    summary: '현실적인 선택과 장기 계획을 다시 세우기 좋은 흐름입니다.',
    highlight: 'Phase 4에서 일, 돈, 연애 중 무엇을 먼저 구조화해야 하는지 확인해보세요.',
  },
  AQUARIUS: {
    seasonLabel: '물병자리 시즌',
    title: '이번 주 하늘의 포인트: 물병자리 시즌',
    summary: '고정관념에서 한 발 벗어나 새로운 선택지를 열어보기 좋은 구간입니다.',
    highlight: 'Phase 4에서 지금 삶의 흐름을 바꿀 핵심 변수를 확인해보세요.',
  },
  PISCES: {
    seasonLabel: '물고기자리 시즌',
    title: '이번 주 하늘의 포인트: 물고기자리 시즌',
    summary: '감정과 직감이 예민해지는 주간이라 관계와 선택의 결이 더 선명해집니다.',
    highlight: 'Phase 4에서 연애, 커리어, 재정 중 어디에 에너지를 써야 할지 정밀하게 보세요.',
  },
  ARIES: {
    seasonLabel: '양자리 시즌',
    title: '이번 주 하늘의 포인트: 양자리 시즌',
    summary: '미루던 결정을 밀어붙이기보다 우선순위를 선명하게 정리하기 좋은 타이밍입니다.',
    highlight: 'Phase 4에서 지금 바로 실행해야 할 영역과 멈춰야 할 영역을 확인해보세요.',
  },
  TAURUS: {
    seasonLabel: '황소자리 시즌',
    title: '이번 주 하늘의 포인트: 황소자리 시즌',
    summary: '돈, 안정감, 관계의 지속 가능성을 점검하기 좋은 흐름입니다.',
    highlight: 'Phase 4에서 재물운과 관계 패턴을 함께 보는 구간이 특히 유효합니다.',
  },
  GEMINI: {
    seasonLabel: '쌍둥이자리 시즌',
    title: '이번 주 하늘의 포인트: 쌍둥이자리 시즌',
    summary: '대화와 선택지가 많아지는 시기라 방향을 좁히는 기준이 더 중요해집니다.',
    highlight: 'Phase 4에서 일과 연애의 우선순위를 어떤 기준으로 나눌지 보세요.',
  },
  CANCER: {
    seasonLabel: '게자리 시즌',
    title: '이번 주 하늘의 포인트: 게자리 시즌',
    summary: '안정감, 가족, 감정 회복이 중요한 테마로 떠오르는 구간입니다.',
    highlight: 'Phase 4에서 감정 소모가 큰 영역과 회복이 필요한 지점을 확인해보세요.',
  },
  LEO: {
    seasonLabel: '사자자리 시즌',
    title: '이번 주 하늘의 포인트: 사자자리 시즌',
    summary: '자기 표현과 존재감이 커지는 흐름이라 선택의 무게도 더 커집니다.',
    highlight: 'Phase 4에서 커리어와 관계에서 어떻게 존재감을 써야 하는지 확인해보세요.',
  },
  VIRGO: {
    seasonLabel: '처녀자리 시즌',
    title: '이번 주 하늘의 포인트: 처녀자리 시즌',
    summary: '디테일과 루틴을 다시 정비하면 결과 차이가 커지는 구간입니다.',
    highlight: 'Phase 4에서 건강, 일, 재정 루틴을 어떤 순서로 손봐야 하는지 보세요.',
  },
  LIBRA: {
    seasonLabel: '천칭자리 시즌',
    title: '이번 주 하늘의 포인트: 천칭자리 시즌',
    summary: '관계의 균형과 거래의 조건을 다시 살피기 좋은 흐름입니다.',
    highlight: 'Phase 4에서 연애와 재정의 밸런스를 동시에 점검해보세요.',
  },
  SCORPIO: {
    seasonLabel: '전갈자리 시즌',
    title: '이번 주 하늘의 포인트: 전갈자리 시즌',
    summary: '숨겨진 감정, 집착, 진짜 욕망이 드러나기 쉬운 구간입니다.',
    highlight: 'Phase 4에서 내가 집착하는 영역과 놓아야 할 영역을 명확히 보세요.',
  },
  SAGITTARIUS: {
    seasonLabel: '사수자리 시즌',
    title: '이번 주 하늘의 포인트: 사수자리 시즌',
    summary: '시야를 넓히고 더 큰 방향을 다시 잡기 좋은 시기입니다.',
    highlight: 'Phase 4에서 내년까지 이어질 확장 포인트를 먼저 확인해보세요.',
  },
};

function parseJobMetadata(raw: string | null | undefined): FollowUpJobMetadata {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as FollowUpJobMetadata;
    }
  } catch {
    // Ignore malformed metadata and fall back to empty object.
  }

  return {};
}

function getReadingLanguage(raw: string | null | undefined): 'ko' | 'en' {
  if (!raw) {
    return 'ko';
  }

  try {
    const parsed = asRecord(JSON.parse(raw));
    return parsed?.language === 'en' ? 'en' : 'ko';
  } catch {
    return 'ko';
  }
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
}

function resolveStage(stage: string): FollowUpStage | null {
  if (stage === 'D2_DISCOUNT' || stage === 'D5_COSMIC_WINDOW' || stage === 'H48' || stage === 'D7') {
    return stage;
  }
  return null;
}

function getCosmicSeasonKey(referenceDate: Date): CosmicSeasonKey {
  const month = referenceDate.getUTCMonth() + 1;
  const day = referenceDate.getUTCDate();
  const monthDay = month * 100 + day;

  if (monthDay >= 120 && monthDay <= 218) return 'AQUARIUS';
  if (monthDay >= 219 && monthDay <= 320) return 'PISCES';
  if (monthDay >= 321 && monthDay <= 419) return 'ARIES';
  if (monthDay >= 420 && monthDay <= 520) return 'TAURUS';
  if (monthDay >= 521 && monthDay <= 620) return 'GEMINI';
  if (monthDay >= 621 && monthDay <= 722) return 'CANCER';
  if (monthDay >= 723 && monthDay <= 822) return 'LEO';
  if (monthDay >= 823 && monthDay <= 922) return 'VIRGO';
  if (monthDay >= 923 && monthDay <= 1022) return 'LIBRA';
  if (monthDay >= 1023 && monthDay <= 1121) return 'SCORPIO';
  if (monthDay >= 1122 && monthDay <= 1221) return 'SAGITTARIUS';
  if (monthDay >= 1222 || monthDay <= 119) return 'CAPRICORN';

  return 'PISCES';
}

function getCosmicWindowContent(referenceDate: Date): CosmicWindowContent {
  return COSMIC_WINDOW_COPY[getCosmicSeasonKey(referenceDate)];
}

async function ensureDiscountOffer(job: {
  id: string;
  readingId: string;
  metadata: string | null;
}) {
  const existingMetadata = parseJobMetadata(job.metadata);
  const hasValidExpiry =
    typeof existingMetadata.expiresAt === 'string' &&
    new Date(existingMetadata.expiresAt).getTime() > Date.now();

  if (
    existingMetadata.promoCodeId &&
    existingMetadata.promoCode &&
    existingMetadata.offerUrl &&
    typeof existingMetadata.discount === 'number' &&
    hasValidExpiry
  ) {
    return existingMetadata;
  }

  const expiresAt = new Date(Date.now() + DISCOUNT_STAGE_LIFETIME_MS);
  const promoCode = await createSingleUsePromotionCode({
    prefix: 'D2',
    description: `D+2 reading discount for ${job.readingId}`,
    discount: DISCOUNT_STAGE_DISCOUNT,
    expiresAt,
  });

  const nextMetadata: FollowUpJobMetadata = {
    ...existingMetadata,
    promoCodeId: promoCode.id,
    promoCode: promoCode.code,
    discount: promoCode.discount,
    offerUrl: `${getAppUrl()}/start?promo=${encodeURIComponent(promoCode.code)}`,
    expiresAt: expiresAt.toISOString(),
  };

  await prisma.followUpJob.update({
    where: { id: job.id },
    data: {
      metadata: JSON.stringify(stampRuntimeMetadata(nextMetadata)),
    },
  });

  return nextMetadata;
}

interface ScheduleFollowUpsInput {
  readingId: string;
  email: string;
  fromDate?: Date;
}

export interface FollowUpRunSummary {
  ok: boolean;
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
}

export async function scheduleDefaultFollowUps({
  readingId,
  email,
  fromDate = new Date(),
}: ScheduleFollowUpsInput): Promise<void> {
  const stages: Array<{ stage: FollowUpStage; offsetMs: number }> = [
    { stage: 'D2_DISCOUNT', offsetMs: 48 * 60 * 60 * 1000 },
    { stage: 'D5_COSMIC_WINDOW', offsetMs: 5 * 24 * 60 * 60 * 1000 },
    { stage: 'D7', offsetMs: 7 * 24 * 60 * 60 * 1000 },
  ];

  const existingJobs = await prisma.followUpJob.findMany({
    where: {
      readingId,
      stage: { in: stages.map((item) => item.stage) },
    },
  });
  const existingJobMap = new Map(existingJobs.map((job) => [job.stage, job]));

  for (const item of stages) {
    const scheduledFor = new Date(fromDate.getTime() + item.offsetMs);
    const existingJob = existingJobMap.get(item.stage);

    if (!existingJob) {
      await prisma.followUpJob.create({
        data: {
          readingId,
          email,
          stage: item.stage,
          scheduledFor,
          status: 'PENDING',
          metadata: JSON.stringify(stampRuntimeMetadata({})),
        },
      });
      continue;
    }

    if (existingJob.status === 'SENT' || existingJob.status === 'CANCELED') {
      if (existingJob.email !== email) {
        await prisma.followUpJob.update({
          where: { id: existingJob.id },
          data: {
            email,
            metadata: JSON.stringify(stampRuntimeMetadata(parseJobMetadata(existingJob.metadata))),
          },
        });
      }
      continue;
    }

    await prisma.followUpJob.update({
      where: { id: existingJob.id },
      data: {
        email,
        scheduledFor,
        status: existingJob.status === 'FAILED' ? 'PENDING' : existingJob.status,
        lastError: null,
        metadata: JSON.stringify(stampRuntimeMetadata(parseJobMetadata(existingJob.metadata))),
      },
    });
  }
}

interface RunDueFollowUpsInput {
  limit?: number;
  dryRun?: boolean;
}

export async function runDueFollowUps({
  limit = 100,
  dryRun = false,
}: RunDueFollowUpsInput = {}): Promise<FollowUpRunSummary> {
  const now = new Date();
  const appUrl = getAppUrl();
  const summary: FollowUpRunSummary = {
    ok: true,
    scanned: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  const jobs = await prisma.followUpJob.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now },
    },
    orderBy: { scheduledFor: 'asc' },
    take: limit,
  });

  summary.scanned = jobs.length;

  for (const job of jobs) {
    if (dryRun) {
      summary.skipped += 1;
      continue;
    }

    try {
      const reading = await prisma.readingResult.findUnique({
        where: { id: job.readingId },
      });

      if (!reading) {
        await prisma.followUpJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: 'Reading not found',
          },
        });

        summary.failed += 1;
        continue;
      }

      const readingUrl = `${appUrl}/share/${job.readingId}?view=full`;
      const stage = resolveStage(job.stage);
      if (!stage) {
        await prisma.followUpJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: `Invalid stage: ${job.stage}`,
          },
        });
        summary.failed += 1;
        continue;
      }
      const isDiscountStage = DISCOUNT_STAGE_ALIASES.has(stage);
      const isCosmicWindowStage = stage === 'D5_COSMIC_WINDOW';
      const isArchiveStage = stage === 'D7';
      const offer = isDiscountStage ? await ensureDiscountOffer(job) : null;
      const cosmicWindow = isCosmicWindowStage ? getCosmicWindowContent(job.scheduledFor) : null;
      const readingLanguage = getReadingLanguage(reading.metadata);
      const phase4Url = isCosmicWindowStage
        ? `${appUrl}/start?reading_id=${encodeURIComponent(job.readingId)}`
        : undefined;
      const dailyUrl = readingLanguage === 'ko' ? `${appUrl}/daily` : undefined;
      const subjectHint = isDiscountStage
        ? 'D+2 discount offer'
        : isCosmicWindowStage
          ? 'D+5 cosmic window reminder'
          : isArchiveStage
            ? 'D+7 archive notice'
            : '7-day reminder';

      await sendFollowUpNudgeEmail({
        email: job.email,
        readingId: job.readingId,
        stage,
        language: readingLanguage,
        readingUrl,
        promoCode: offer?.promoCode,
        discount: offer?.discount,
        offerUrl: offer?.offerUrl,
        expiresAt: offer?.expiresAt,
        cosmicWindow: cosmicWindow ?? undefined,
        phase4Url,
        dailyUrl,
      });

      const existingMetadata = parseJobMetadata(job.metadata);
      await prisma.followUpJob.update({
        where: { id: job.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          attempts: { increment: 1 },
          lastError: null,
          metadata: JSON.stringify(stampRuntimeMetadata({
            ...existingMetadata,
            ...(offer ?? {}),
            ...(cosmicWindow
              ? {
                cosmicWindowTitle: cosmicWindow.title,
                cosmicWindowLabel: cosmicWindow.seasonLabel,
                phase4Url,
              }
              : {}),
            subjectHint,
            sentAt: new Date().toISOString(),
          })),
        },
      });

      await trackGrowthEvent({
        event: 'followup_email_sent',
        readingId: job.readingId,
        channel: 'email',
        metadata: {
          stage: isDiscountStage ? 'D2_DISCOUNT' : stage,
          sourceStage: stage,
          language: readingLanguage,
          discount: offer?.discount,
          cosmicWindow: cosmicWindow?.seasonLabel,
        },
      });

      summary.sent += 1;
    } catch (error) {
      const nextAttempts = job.attempts + 1;
      const status = nextAttempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING';

      await prisma.followUpJob.update({
        where: { id: job.id },
        data: {
          attempts: { increment: 1 },
          status,
          lastError: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
        },
      });

      summary.failed += 1;
      devLog.error('[FollowUpJob] Failed to process job', { jobId: job.id, error });
    }
  }

  summary.ok = summary.failed === 0;
  return summary;
}
