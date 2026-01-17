/**
 * Zod Validation Schemas
 * 
 * Centralized input validation with XSS/injection prevention
 */

import { z } from 'zod';

// XSS character filter regex
const XSS_PATTERN = /[<>'"&;(){}[\]\\]/g;

// Sanitize string (remove XSS characters)
export function sanitizeString(input: string): string {
    return input.replace(XSS_PATTERN, '').trim();
}

// Custom string that sanitizes input
const safeString = (maxLength: number = 100) =>
    z.string()
        .max(maxLength, `최대 ${maxLength}자까지 입력 가능합니다`)
        .transform(sanitizeString);

// ========== Common Schemas ==========

export const nameSchema = safeString(50).refine(
    (val) => val.length >= 1,
    { message: '이름을 입력해주세요' }
);

export const emailSchema = z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .max(254)
    .transform((val) => val.toLowerCase().trim());

export const birthDateSchema = z.string()
    .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date < new Date() && date > new Date('1900-01-01');
    }, { message: '올바른 생년월일을 입력해주세요' });

export const birthTimeSchema = z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '올바른 시간 형식(HH:mm)이 아닙니다')
    .optional();

export const genderSchema = z.enum(['male', 'female']);

export const promoCodeSchema = z.string()
    .max(50)
    .regex(/^[A-Z0-9_-]+$/i, '올바른 프로모 코드 형식이 아닙니다')
    .transform((val) => val.toUpperCase().trim());

export const uuidSchema = z.string().uuid('올바른 ID 형식이 아닙니다');

// ========== API Request Schemas ==========

export const ReadingInputSchema = z.object({
    name: nameSchema,
    gender: genderSchema,
    birthDate: birthDateSchema,
    birthTime: birthTimeSchema,
    isLunar: z.boolean().optional().default(false),
    unknownTime: z.boolean().optional().default(false),
    question: safeString(500).optional(),
    context: z.enum(['love', 'career', 'finance', 'health', 'general']).optional(),
});

export const MatchInputSchema = z.object({
    hostName: nameSchema,
    hostBirth: birthDateSchema,
    hostGender: genderSchema.optional(),
    guestName: nameSchema.optional(),
    guestBirth: birthDateSchema.optional(),
    guestGender: genderSchema.optional(),
});

export const ReviewInputSchema = z.object({
    readingId: uuidSchema,
    rating: z.number().int().min(1).max(5),
    nickname: safeString(30).optional(),
    content: safeString(1000),
});

export const PromoValidateSchema = z.object({
    code: promoCodeSchema,
});

// ========== Helper Functions ==========

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const firstError = result.error.issues[0];
        throw new Error(firstError?.message || 'Validation failed');
    }
    return result.data;
}

export function validateSafe<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (!result.success) {
        return { success: false, error: result.error.issues[0]?.message || 'Validation failed' };
    }
    return { success: true, data: result.data };
}
