import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isSubscriptionActive } from '@/lib/subscription';
import { calculateSaju } from '@/lib/engines/saju';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { drawCards, type TarotCard } from '@/lib/engines/tarot';
import {
  generateStructuredReport,
  getAIModelBusyMessage,
  isAIModelBusyError,
} from '@/lib/ai/llm-client';
import { CareerPremiumReport } from '@/types/career';

const CareerReadingRequestSchema = z.object({
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이 아닙니다'),
  birthtime: z.string().default('12:00'),
  gender: z.enum(['M', 'F']),
  worryType: z.enum(['transition', 'first_job', 'promotion', 'burnout']),
  tarotCards: z.array(z.number()).optional(),
});

const WORRY_LABELS: Record<string, string> = {
  transition: '이직 고민',
  first_job: '첫 직장 향방',
  promotion: '승진 및 평가',
  burnout: '직장 번아웃',
};

const CareerPremiumReportSchema = z.object({
  readingId: z.string().min(1),
  sajuTiming: z.string().min(120),
  astrologyTalent: z.string().min(120),
  tarotAdvice: z.string().min(120),
  actionPlan: z.array(z.string().min(18)).min(4).max(5),
  snapshot: z.string().min(20),
  phase1_pastAnalysis: z.string().min(140),
  phase2_timing: z.string().min(140),
  phase3_keywords: z.array(z.string().min(2)).min(4).max(6),
});

export async function generateCareerReport(
  birthday: string,
  birthtime: string,
  gender: 'M' | 'F',
  worryType: string,
  tarotCards?: number[]
) {
  const [year, month, day] = birthday.split('-').map(Number);
  const [hours, minutes] = birthtime.split(':').map(Number);
  const birthDate = new Date(year, month - 1, day, hours, minutes, 0);

  const [saju, astrology] = await Promise.all([
    Promise.resolve(calculateSaju(birthDate, hours, minutes, false, gender === 'M' ? 'male' : 'female')),
    Promise.resolve(calculateAstrology(birthDate, birthtime)),
  ]);

  const cardsToUse: TarotCard[] = tarotCards && tarotCards.length > 0
    ? tarotCards.map(id => drawCards(1).find(c => c.id === id) ?? drawCards(1)[0])
    : drawCards(3);

  const worryLabel = WORRY_LABELS[worryType] ?? worryType;
  const sajuInfo = `일간: ${saju.dayMaster} / ${saju.yeonPillar.stem}${saju.yeonPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일`;
  const astroInfo = `태양궁: ${ZODIAC_SIGNS[astrology.sunSign].name} / 달궁: ${ZODIAC_SIGNS[astrology.moonSign].name}`;
  const tarotInfo = cardsToUse.map((c: TarotCard) => c.name).join(', ');
  const currentYear = new Date().getFullYear();

  const systemPrompt = [
    '당신은 CosmicPath의 최상위 유료 Career Oracle이다.',
    '사주 명리학, 서양 점성술, 타로를 함께 읽되, 단순 위로나 추상적인 자기계발 문구를 절대 쓰지 않는다.',
    '톤은 고급 사주 리포트처럼 진단적이고 구체적이어야 한다.',
    '각 문단은 실제 상담사가 해석하는 것처럼 원인, 신호, 판단, 권고가 들어가야 한다.',
    '모든 내용은 한국어로 작성한다.',
    '반드시 JSON만 반환한다.',
    '각 서술형 필드는 3~5문장 분량으로 충분히 깊게 작성한다.',
    '시기 언급은 가능하면 월, 분기, 혹은 상반기/하반기처럼 구체화한다.',
    'actionPlan은 바로 실행 가능한 문장으로 4~5개 작성한다.',
    'phase3_keywords는 추상어보다 이력서/포트폴리오/자기소개서에 바로 쓸 수 있는 강점 문구로 작성한다.',
    `결과물은 ${currentYear}년 유료 리포트 수준의 밀도와 완성도를 가져야 한다.`,
  ].join(' ');

  const userPrompt = `
고민: ${worryLabel}
${sajuInfo}
${astroInfo}
타로(3장): ${tarotInfo}

아래 원칙을 반드시 지키세요:
- 사용자가 왜 지금 ${worryLabel}에 막혀 있는지 원인을 먼저 짚으세요.
- "좋은 시기입니다" 같은 뻔한 표현 대신, 왜 그런 판단이 나오는지 근거를 문장 안에 녹이세요.
- 사주/점성술/타로 세 축이 서로 어떻게 같은 결론으로 수렴하는지 드러내세요.
- 커리어 방향은 직무 적성, 일하는 방식, 조직 적합성, 움직여야 할 타이밍이 모두 읽히게 쓰세요.
- snapshot은 싸구려 카피가 아니라, 공유해도 민망하지 않은 한 줄 결론으로 쓰세요.

아래 JSON 필드를 모두 채워 응답하세요:
{
  "readingId": "career_${Date.now()}",
  "sajuTiming": "명리학 기준으로 현재 대운/세운이 커리어에 어떤 압력과 기회를 주는지, 언제 움직여야 유리한지 3~5문장으로 설명",
  "astrologyTalent": "점성학 기준으로 이 사람의 천직, 강점, 잘 맞는 일 방식, 피해야 할 조직 환경을 3~5문장으로 설명",
  "tarotAdvice": "현재 국면에서 무엇을 끊고 무엇을 밀어야 하는지, 타로 3장의 메시지를 실전 조언으로 풀어 3~5문장으로 설명",
  "actionPlan": [
    "24시간 안에 실행할 커리어 액션",
    "이번 주 안에 실행할 커리어 액션",
    "이번 달 안에 정리할 커리어 액션",
    "다음 기회가 오기 전까지 준비할 커리어 액션"
  ],
  "snapshot": "공유 가능한 1줄 결론",
  "phase1_pastAnalysis": "왜 지금 ${worryLabel} 문제가 터졌는지, 지난 흐름과 성향의 충돌을 포함해 3~5문장으로 진단",
  "phase2_timing": "이직/지원/협상/휴식 중 무엇을 언제 택해야 하는지, 월 또는 분기 단위 타이밍과 이유를 3~5문장으로 설명",
  "phase3_keywords": ["이력서에 넣을 강점 키워드 1", "강점 키워드 2", "강점 키워드 3", "강점 키워드 4"]
}`;

  const report = await generateStructuredReport<CareerPremiumReport>(
    systemPrompt,
    userPrompt,
    'premium',
    CareerPremiumReportSchema
  );
  return { report, metadata: { sajuResult: saju, astrologyResult: astrology, cards: cardsToUse } };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = CareerReadingRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { birthday, birthtime, gender, worryType, tarotCards } = validation.data;

    // 구독 또는 크레딧 검증
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPro = isSubscriptionActive(user.subscriptionStatus, user.subscriptionExpiresAt);

    if (!isPro) {
      // 크레딧 체크 (career 전용 크레딧은 chatSession credits 재사용)
      // career report는 별도 크레딧 없이 구독만 허용 (단품은 unlock route를 통해)
      return NextResponse.json(
        { error: '프리미엄 리포트는 PRO 구독 또는 단품 결제가 필요합니다.' },
        { status: 402 }
      );
    }

    const { report, metadata } = await generateCareerReport(birthday, birthtime, gender, worryType, tarotCards);
    
    const readingResult = await prisma.readingResult.create({
      data: {
        userId,
        data: JSON.stringify(report),
        metadata: JSON.stringify({
          type: 'career_report',
          context: 'career',
          source: 'career_oracle_funnel',
          isPremium: true,
          ...metadata,
          worryType,
          birthday,
          birthtime,
          birthDate: birthday,
          birthTime: birthtime,
          gender: gender === 'F' ? 'female' : 'male',
          genderCode: gender,
        }),
      }
    });

    return NextResponse.json({ success: true, report, metadata, readingId: readingResult.id });

  } catch (error) {
    console.error('[API/reading/career] Error:', error);

    if (isAIModelBusyError(error)) {
      return NextResponse.json(
        { error: getAIModelBusyMessage('ko'), retryable: true },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Career Oracle API v2.0' });
}
