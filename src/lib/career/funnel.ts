import { z } from 'zod';
import { CareerInputValues, CareerWorryType } from '@/types/career';

const CareerUnlockPayloadSchema = z.object({
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthtime: z.string().regex(/^\d{2}:\d{2}$/),
  gender: z.enum(['M', 'F']),
  worryType: z.enum(['transition', 'first_job', 'promotion', 'burnout']),
  tarotCards: z.array(z.number()).optional(),
});

export type CareerUnlockPayload = z.infer<typeof CareerUnlockPayloadSchema>;

function mapGenderCode(gender: CareerInputValues['gender']): 'M' | 'F' {
  return gender === 'male' ? 'M' : 'F';
}

function mapGenderLabel(gender: CareerUnlockPayload['gender']): 'male' | 'female' {
  return gender === 'M' ? 'male' : 'female';
}

export function toCareerUnlockPayload(values: CareerInputValues): CareerUnlockPayload {
  return {
    birthday: values.birthDate,
    birthtime: values.birthTime || '12:00',
    gender: mapGenderCode(values.gender),
    worryType: values.worryType,
  };
}

export function toCareerInputValues(payload: CareerUnlockPayload): CareerInputValues {
  return {
    birthDate: payload.birthday,
    birthTime: payload.birthtime,
    gender: mapGenderLabel(payload.gender),
    worryType: payload.worryType as CareerWorryType,
  };
}

export function parseStoredCareerUnlockPayload(raw: string | null): CareerUnlockPayload | null {
  if (!raw) return null;

  try {
    return CareerUnlockPayloadSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
