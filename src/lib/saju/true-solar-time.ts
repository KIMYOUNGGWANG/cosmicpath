import { resolveBirthLocation, type BirthLocation } from './cities';

export interface TrueSolarTimeOptions {
  birthDate: string;
  birthTime?: string;
  cityName?: string;
  latitude?: number;
  longitude?: number;
  unknownTime?: boolean;
}

export interface TrueSolarTimeResult {
  baseDateTime: Date;
  correctedDateTime: Date;
  correctedDate: string;
  correctedTime: string;
  offsetMinutes: number;
  location: BirthLocation;
}

const KOREA_STANDARD_MERIDIAN = 135;

function parseBirthTime(birthTime?: string): { hour: number; minute: number } {
  if (!birthTime || !/^\d{2}:\d{2}$/.test(birthTime)) {
    return { hour: 12, minute: 0 };
  }

  const [hour, minute] = birthTime.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return { hour: 12, minute: 0 };
  }

  return { hour, minute };
}

function toDateParts(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeParts(date: Date): string {
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${minute}`;
}

export function calculateTrueSolarTime(options: TrueSolarTimeOptions): TrueSolarTimeResult {
  const location = resolveBirthLocation(options);
  const { hour, minute } = parseBirthTime(options.unknownTime ? '12:00' : options.birthTime);
  const [year, month, day] = options.birthDate.split('-').map(Number);
  const baseDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

  // 한국 서비스 기준으로 KST 표준 자오선(동경 135도) 대비 1도당 4분 보정.
  const offsetMinutes = Math.round((location.longitude - KOREA_STANDARD_MERIDIAN) * 4);
  const correctedDateTime = new Date(baseDateTime);
  correctedDateTime.setMinutes(correctedDateTime.getMinutes() + offsetMinutes);

  return {
    baseDateTime,
    correctedDateTime,
    correctedDate: toDateParts(correctedDateTime),
    correctedTime: toTimeParts(correctedDateTime),
    offsetMinutes,
    location,
  };
}
