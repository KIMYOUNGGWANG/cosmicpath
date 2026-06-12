export type Gender = 'male' | 'female';
export type Language = 'ko' | 'en';
export type ReadingContext = 'career' | 'love' | 'money' | 'health' | 'general';
export type CalendarType = 'solar' | 'lunar';

export type FixedCard = {
  id: number;
  reversed: boolean;
};

export type TestCase = {
  id: string;
  label: string;
  name: string;
  gender: Gender;
  birthDate: string;
  birthTime: string;
  calendarType: CalendarType;
  unknownTime: boolean;
  cityName: string;
  latitude: number;
  longitude: number;
  context: ReadingContext;
  question: string;
  language: Language;
  cards: FixedCard[];
  partner?: {
    name: string;
    gender: Gender;
    birthDate: string;
    birthTime: string;
  };
};

export type TarotCard = {
  id: number;
  name: string;
  nameEn: string;
  keywords: readonly string[];
  interpretation: string;
  isReversed: boolean;
  image: string;
};

export type TarotArcana = {
  id: number;
  name: string;
  nameEn: string;
  keywords: readonly string[];
  upright: string;
  reversed: string;
  image: string;
};

export type Pillar = {
  stem: string;
  branch: string;
};

export type LegacySaju = {
  yeonPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  dayMaster: string;
  tenGods?: Record<string, string>;
  precisionMetadata?: Record<string, unknown>;
  oracleCouncil?: Record<string, unknown>;
  raw?: Record<string, unknown>;
};

export type AstrologyPlanet = {
  sign: number;
  [key: string]: unknown;
};

export type AstrologyResult = {
  sunSign: number;
  moonSign: number;
  ascendant: number;
  planets: AstrologyPlanet[];
  aspects: unknown[];
  enhancedAspects?: unknown[];
  dignities?: unknown;
  patterns?: unknown;
};

export type RuntimeSnapshot = {
  guide: unknown;
  saju: LegacySaju;
  partnerSaju: LegacySaju | null;
  astrology: AstrologyResult;
  resolvedQuestionIntent: string;
  decisionAction: unknown;
  resolvedCharacterId: string;
  effectiveSelectionMode: string;
  advisorProfile: unknown;
  advisorEvidenceSummary: string;
  cards: TarotCard[];
  precisionMetadata?: Record<string, unknown> | null;
  oracleCouncil?: Record<string, unknown> | null;
};

export type ZodiacSign = {
  name: string;
  element: string;
};

export type AssembleReadingRuntime = (params: {
  birthDate: string;
  birthTime: string;
  gender: Gender;
  cityName: string;
  longitude: number;
  latitude: number;
  calendarType: CalendarType;
  unknownTime: boolean;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  partnerGender?: Gender;
  partnerName?: string;
  context: ReadingContext;
  question: string;
  language: Language;
  tarotCards: TarotCard[];
  storedReadingMetadata: Record<string, unknown>;
  useStoredRuntime: boolean;
  selectionMode: 'auto';
  currentPhase: number;
}) => Promise<RuntimeSnapshot>;
