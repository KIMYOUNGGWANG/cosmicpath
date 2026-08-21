/**
 * SajuMind Core Type Definitions
 * Designed for global English wellness and emotional pattern management.
 */

export type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface DayMasterArchetype {
  stem: string; // e.g. '甲', '갑', 'Yang Wood'
  element: FiveElement;
  yinYang: 'yang' | 'yin';
  englishName: string; // e.g. 'The Pioneer Tree (Yang Wood)'
  shortTitle: string; // e.g. 'Deep Ocean', 'Sturdy Oak'
  archetype: string; // e.g. 'Visionary Leader'
  coreNature: string; // Brief English description
  emotionalTension: string; // Typical emotional friction (e.g. 'Impatience when growth is blocked')
  groundingHabit: string; // Recommended micro-habit
}

export interface SajuChartProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  birthCity: string;
  timezone: string;
  dayMaster: DayMasterArchetype;
  fourPillars: {
    year: { stem: string; branch: string; element: FiveElement; animalEn: string };
    month: { stem: string; branch: string; element: FiveElement; animalEn: string };
    day: { stem: string; branch: string; element: FiveElement; animalEn: string };
    hour?: { stem: string; branch: string; element: FiveElement; animalEn: string };
  };
  elementPercentages: Record<FiveElement, number>;
  dominantElement: FiveElement;
  currentDaeunSummary?: string;
}

export type SajuMindEmotion =
  | 'Anxious'
  | 'Overthinking'
  | 'Heavy'
  | 'Neutral'
  | 'Motivated'
  | 'Clear'
  | 'Frustrated'
  | 'Peaceful';

export interface DailyTransitInfo {
  date: string; // YYYY-MM-DD
  pillar: {
    stem: string;
    branch: string;
    stemHangul: string;
    branchHangul: string;
    element: FiveElement;
    animalEn: string;
  };
  relationToDayMaster: {
    type: 'same' | 'generates_me' | 'i_generate' | 'controls_me' | 'i_control' | 'clash' | 'combine';
    labelEn: string; // e.g. 'Deep Reflection & Processing Energy'
    energyIntensity: 'high' | 'moderate' | 'gentle';
    weatherMetaphor: string; // e.g. 'Clear morning mist - sharp analytical focus, prone to over-pondering'
  };
}

export interface CheckInRequest {
  userId?: string;
  guestId?: string;
  emotion: SajuMindEmotion;
  tags: string[];
  note?: string;
  userProfile?: {
    name?: string;
    birthDate: string;
    birthTime?: string;
    birthCity?: string;
    timezone?: string;
  };
}

export interface CheckInResult {
  id: string;
  date: string;
  emotion: SajuMindEmotion;
  tags: string[];
  note?: string;
  dailyTransit: DailyTransitInfo;
  aiFeedback: {
    observation: string;
    patternConnection: string;
    smallAction: string;
    fullText: string;
  };
  createdAt: string;
}

export interface WeeklyPatternSummary {
  weekRange: string;
  totalCheckIns: number;
  dominantEmotion: SajuMindEmotion;
  emotionBreakdown: Record<string, number>;
  elementalFlowSummary: string;
  aiWeeklyInsight: {
    emotionalTheme: string;
    sajuTimingConnection: string;
    unnoticedPattern: string;
    gentleSuggestion: string;
    fullReport: string;
  };
}

export interface DecisionLogEntry {
  id: string;
  title: string;
  description?: string;
  sajuTimingSnapshot: {
    transitDate: string;
    elementalInfluence: string;
    timingScore: number; // 1-100
  };
  status: 'PENDING' | 'DECIDED' | 'REVIEWED';
  outcomeNote?: string;
  createdAt: string;
}
