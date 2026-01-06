import { z } from 'zod';

// Flexible schema that validates core structure but allows various data shapes
export const saveReadingSchema = z.object({
    data: z.any(), // Accept any data format (string or object)
    metadata: z.any().optional(),
    id: z.string().optional(), // UUID not strictly required
});

export const sendEmailSchema = z.object({
    email: z.string().email(),
    readingId: z.string().min(1),
    lang: z.enum(['ko', 'en']).default('ko'),
});

export const paymentSchema = z.object({
    productId: z.string().min(1),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    metadata: z.record(z.string(), z.string()).optional(),
});

export const chatMessageSchema = z.object({
    message: z.string().min(1).max(1000),
    readingId: z.string().uuid(),
    stream: z.boolean().optional(),
});

