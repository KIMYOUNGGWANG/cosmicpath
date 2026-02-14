import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

type ApplySource = 'webhook' | 'sync_verify';

interface ApplyChatCreditResult {
  applied: boolean;
  creditsAdded: number;
  totalCredits?: number;
  readingId?: string;
  reason?: 'not_chat_credit' | 'missing_reading_id' | 'already_applied';
}

function parsePaymentMetadata(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function parseCredits(raw: string | undefined): number {
  const parsed = Number.parseInt(raw || '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function applyChatCreditFromSession(
  session: Stripe.Checkout.Session,
  source: ApplySource
): Promise<ApplyChatCreditResult> {
  const metadata = session.metadata || {};
  if (metadata.type !== 'chat_credit') {
    return { applied: false, creditsAdded: 0, reason: 'not_chat_credit' };
  }

  const readingId = metadata.readingId;
  if (!readingId) {
    return { applied: false, creditsAdded: 0, reason: 'missing_reading_id' };
  }

  const creditsToAdd = parseCredits(metadata.credits);

  return prisma.$transaction(async (tx) => {
    // Use executeRaw for advisory lock because pg_advisory_xact_lock returns void.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${session.id})::bigint)`;

    const existingPayment = await tx.payment.findUnique({
      where: { orderId: session.id },
      select: { metadata: true },
    });

    const existingMeta = parsePaymentMetadata(existingPayment?.metadata);
    if (existingMeta.chatCreditAppliedAt) {
      const existingSession = await tx.chatSession.findUnique({
        where: { readingResultId: readingId },
        select: { credits: true },
      });
      return {
        applied: false,
        creditsAdded: 0,
        totalCredits: existingSession?.credits,
        readingId,
        reason: 'already_applied',
      };
    }

    const chatSession = await tx.chatSession.upsert({
      where: { readingResultId: readingId },
      create: {
        readingResultId: readingId,
        credits: 1 + creditsToAdd,
      },
      update: {
        credits: { increment: creditsToAdd },
      },
      select: { credits: true },
    });

    const mergedMeta = {
      ...existingMeta,
      ...metadata,
      type: 'chat_credit',
      readingId,
      credits: String(creditsToAdd),
      chatCreditAppliedAt: new Date().toISOString(),
      chatCreditAppliedBy: source,
    };

    await tx.payment.upsert({
      where: { orderId: session.id },
      create: {
        orderId: session.id,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'DONE',
        method: 'STRIPE',
        receiptUrl: session.url || null,
        customerEmail: metadata.email || session.customer_details?.email || '',
        readingId,
        metadata: JSON.stringify(mergedMeta),
      },
      update: {
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'DONE',
        method: 'STRIPE',
        receiptUrl: session.url || null,
        customerEmail: metadata.email || session.customer_details?.email || '',
        readingId,
        metadata: JSON.stringify(mergedMeta),
      },
    });

    return {
      applied: true,
      creditsAdded: creditsToAdd,
      totalCredits: chatSession.credits,
      readingId,
    };
  });
}
