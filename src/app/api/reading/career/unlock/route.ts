import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyCheckoutSession } from '@/lib/payment/stripe';
import { generateCareerReport } from '@/app/api/reading/career/route';
import { getAIModelBusyMessage, isAIModelBusyError } from '@/lib/ai/llm-client';

const UnlockRequestSchema = z.object({
  sessionId: z.string().min(1, 'sessionId가 필요합니다'),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthtime: z.string().default('12:00'),
  gender: z.enum(['M', 'F']),
  worryType: z.enum(['transition', 'first_job', 'promotion', 'burnout']),
  tarotCards: z.array(z.number()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userSession = await auth();
    const userId = userSession?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = UnlockRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다.', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, birthday, birthtime, gender, worryType, tarotCards } = validation.data;

    // Stripe 결제 검증
    const stripeResult = await verifyCheckoutSession(sessionId);

    if (!stripeResult.success) {
      return NextResponse.json({ error: '결제가 완료되지 않았습니다.' }, { status: 400 });
    }

    if (stripeResult.type !== 'career_report') {
      return NextResponse.json({ error: '유효하지 않은 결제 유형입니다.' }, { status: 400 });
    }

    // 중복 처리 방지 (idempotency)
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId: sessionId },
      select: { metadata: true, readingId: true },
    });

    if (existingPayment) {
      let existingMeta: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(existingPayment.metadata ?? '{}');
        existingMeta = parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        existingMeta = {};
      }

      if (existingMeta.careerReportUnlockedAt) {
        if (existingPayment.readingId) {
          const existingReading = await prisma.readingResult.findUnique({
            where: { id: existingPayment.readingId },
          });

          if (existingReading) {
            return NextResponse.json({
              unlocked: true,
              report: JSON.parse(existingReading.data),
              metadata: existingReading.metadata ? JSON.parse(existingReading.metadata) : {},
              readingId: existingReading.id,
            });
          }
        }

        return NextResponse.json({ error: '이미 처리된 세션입니다.' }, { status: 409 });
      }
    }

    // 결제 기록 저장 및 리포트 생성
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

    const paymentMeta = JSON.stringify({
      type: 'career_report',
      userId,
      sessionId,
      readingResultId: readingResult.id,
      careerReportUnlockedAt: new Date().toISOString(),
    });

    await prisma.payment.upsert({
      where: { orderId: sessionId },
      create: {
        orderId: sessionId,
        amount: stripeResult.session.amount_total ?? 0,
        currency: stripeResult.session.currency ?? 'usd',
        status: 'DONE',
        method: 'STRIPE',
        receiptUrl: stripeResult.session.url ?? null,
        customerEmail: stripeResult.customerEmail ?? '',
        readingId: readingResult.id,
        metadata: paymentMeta,
      },
      update: {
        status: 'DONE',
        readingId: readingResult.id,
        metadata: paymentMeta,
      },
    });

    return NextResponse.json({ unlocked: true, report, metadata, readingId: readingResult.id });

  } catch (error) {
    console.error('[API/reading/career/unlock] Error:', error);

    if (isAIModelBusyError(error)) {
      return NextResponse.json(
        { error: getAIModelBusyMessage('ko'), retryable: true },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
