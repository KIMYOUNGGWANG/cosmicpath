import { z } from 'zod';

export const DECISION_REVIEW_STORAGE_KEY = 'cosmicpath_decision_review_v1';

export type DecisionOutcome = 'worked' | 'partly' | 'did_not_work';
export type DecisionCertainty = 'clear' | 'unknown';
export type DecisionResolution = 'keep' | 'adjust' | 'close';
export type DecisionIntendedAction =
    | 'contact_now'
    | 'act_now'
    | 'wait'
    | 'reduce_scope'
    | 'unsure';

export interface DecisionReviewOutcome {
    result: DecisionOutcome;
    certainty: DecisionCertainty;
    resolution?: DecisionResolution;
    reviewedAt: string;
}

export interface DecisionReviewSeed {
    version: 1;
    source: string;
    readingId?: string;
    question: string;
    intendedAction: DecisionIntendedAction;
    createdAt: string;
    followUpDueAt: string;
    expiresAt: string;
    outcome?: DecisionReviewOutcome;
}

export type DecisionReviewState =
    | { status: 'empty' }
    | { status: 'malformed' }
    | { status: 'expired' }
    | { status: 'pending'; seed: DecisionReviewSeed }
    | { status: 'active'; seed: DecisionReviewSeed };

const isoTimestamp = z.string().datetime({ offset: true });
const decisionReviewOutcomeSchema = z.object({
    result: z.enum(['worked', 'partly', 'did_not_work']),
    certainty: z.enum(['clear', 'unknown']),
    resolution: z.enum(['keep', 'adjust', 'close']).optional(),
    reviewedAt: isoTimestamp,
}).strict();
const decisionReviewSeedSchema = z.object({
    version: z.literal(1),
    source: z.string().trim().min(1),
    readingId: z.string().trim().min(1).optional(),
    question: z.string().trim().min(1),
    intendedAction: z.enum(['contact_now', 'act_now', 'wait', 'reduce_scope', 'unsure']),
    createdAt: isoTimestamp,
    followUpDueAt: isoTimestamp,
    expiresAt: isoTimestamp,
    outcome: decisionReviewOutcomeSchema.optional(),
}).strict();

export function parseDecisionReview(raw: string | null, now = Date.now()): DecisionReviewState {
    if (!raw) return { status: 'empty' };

    try {
        const value: unknown = JSON.parse(raw);
        const parsed = decisionReviewSeedSchema.safeParse(value);
        if (!parsed.success) return { status: 'malformed' };

        const validSeed = parsed.data;
        const createdAt = Date.parse(validSeed.createdAt);
        const followUpDueAt = Date.parse(validSeed.followUpDueAt);
        const expiresAt = Date.parse(validSeed.expiresAt);
        if (createdAt >= followUpDueAt || followUpDueAt >= expiresAt) {
            return { status: 'malformed' };
        }
        if (expiresAt <= now) return { status: 'expired' };

        if (Date.parse(validSeed.followUpDueAt) > now) {
            return { status: 'pending', seed: validSeed };
        }

        return { status: 'active', seed: validSeed };
    } catch {
        return { status: 'malformed' };
    }
}

export function saveDecisionReview(seed: DecisionReviewSeed): boolean {
    if (typeof window === 'undefined') return false;

    try {
        localStorage.setItem(DECISION_REVIEW_STORAGE_KEY, JSON.stringify(seed));
        return true;
    } catch {
        return false;
    }
}
