import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateSaju } from '@/lib/engines/saju';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import {
  generateStructuredReport,
  getAIModelBusyMessage,
  isAIModelBusyError,
} from '@/lib/ai/llm-client';

const TeaserResponseSchema = z.object({ hook: z.string() });

export const runtime = 'edge';

const TeaserRequestSchema = z.object({
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이 아닙니다'),
  birthtime: z.string().default('12:00'),
  gender: z.enum(['M', 'F']),
  worryType: z.enum(['transition', 'first_job', 'promotion', 'burnout']),
});

const WORRY_LABELS: Record<string, string> = {
  transition: '이직 고민',
  first_job: '첫 직장 향방',
  promotion: '승진 및 평가',
  burnout: '직장 번아웃',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = TeaserRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { birthday, birthtime, gender, worryType } = validation.data;

    const [year, month, day] = birthday.split('-').map(Number);
    const [hours, minutes] = birthtime.split(':').map(Number);
    const birthDate = new Date(year, month - 1, day, hours, minutes, 0);

    const [saju, astrology] = await Promise.all([
      Promise.resolve(calculateSaju(birthDate, hours, minutes, false, gender === 'M' ? 'male' : 'female')),
      Promise.resolve(calculateAstrology(birthDate, birthtime)),
    ]);

    const systemPrompt = `당신은 CosmicPath의 커리어 오라클입니다. 사주와 점성술 데이터를 보고 직업 고민에 대한 강렬한 후킹 메시지를 한국어로 1~2줄만 작성하세요. 응답은 반드시 JSON 형식으로 { "hook": "..." } 만 반환하세요.`;

    const userPrompt = `
고민: ${WORRY_LABELS[worryType]}
일간: ${saju.dayMaster}
태양궁: ${ZODIAC_SIGNS[astrology.sunSign].name}

이 사람의 ${WORRY_LABELS[worryType]} 상황에 대해 "이건 당신 얘기다"라고 느끼게 만드는 강렬한 후킹 메시지 1~2줄을 작성하세요. 구체적인 시기나 원인을 암시하되 결론은 숨기세요.`;

    const result = await generateStructuredReport(systemPrompt, userPrompt, 'free', TeaserResponseSchema);

    const hook = result.hook || '지금 이 고민이 찾아온 것은 우연이 아닙니다. 당신의 사주에 거대한 전환점이 감지되었습니다.';

    return NextResponse.json({ hook });

  } catch (error) {
    console.error('[API/reading/career/teaser] Error:', error);

    if (isAIModelBusyError(error)) {
      return NextResponse.json(
        { error: getAIModelBusyMessage('ko'), retryable: true },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
