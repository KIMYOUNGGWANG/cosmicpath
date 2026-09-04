import type { DayMasterArchetype, DailyTransitInfo, SajuMindEmotion } from './types';

// =====================================
// Safety Filter (Crisis & Scope Guard)
// =====================================
const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'cut myself',
  'die',
  '자살',
  '자해',
  '죽고 싶',
];

const OUT_OF_SCOPE_KEYWORDS = [
  'prescribe',
  'medication',
  'diagnosis',
  'depression diagnosis',
  'bipolar',
  'schizophrenia',
  'lawsuit',
  'legal advice',
  'crypto stock investment',
];

export interface SafetyCheckResult {
  isSafe: boolean;
  fixedResponse?: string;
  category?: 'crisis' | 'out_of_scope';
}

export function checkSajuMindSafety(text: string): SafetyCheckResult {
  const lower = text.toLowerCase();

  for (const kw of CRISIS_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        isSafe: false,
        category: 'crisis',
        fixedResponse:
          "I hear how much pain you are experiencing right now. Please know you are not alone, and there is immediate support available. If you are in distress, please reach out to a trusted professional or contact the 988 Suicide & Crisis Lifeline (call/text 988 in the US/Canada, or 112/1577-0199 in Korea). SajuMind is a reflection tool and cannot substitute professional crisis care.",
      };
    }
  }

  for (const kw of OUT_OF_SCOPE_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        isSafe: false,
        category: 'out_of_scope',
        fixedResponse:
          "This question falls outside the scope of SajuMind. SajuMind is designed solely for mindful self-reflection and energetic pattern awareness, not for clinical diagnosis, medical prescription, legal counsel, or financial investment advice.",
      };
    }
  }

  return { isSafe: true };
}

// =====================================
// System Prompts as specified in PRD
// =====================================
export const SAJUMIND_SYSTEM_PROMPT = `You are SajuMind Guide. 
Your purpose is to help users understand their emotional patterns and decision tendencies using Korean Saju (Four Pillars of Destiny).

Rules:
- Never predict the future with certainty.
- Never give medical, legal, or financial advice.
- Use calm, clear, empathetic, supportive English.
- Prefer "tendency", "pattern", "possible influence", "cosmic weather" over absolute statements.
- Keep responses concise, warm, and highly relatable.
- Always end with one small, actionable suggestion when appropriate.`;

// =====================================
// Check-In AI Feedback Generator (< 80 words)
// =====================================
export interface CheckInFeedbackParams {
  userName?: string;
  emotion: SajuMindEmotion;
  tags: string[];
  note?: string;
  dayMaster: DayMasterArchetype;
  dailyTransit: DailyTransitInfo;
}

export interface CheckInAIFeedbackResponse {
  observation: string;
  patternConnection: string;
  smallAction: string;
  fullText: string;
}

export async function generateSajuMindCheckInFeedback(
  params: CheckInFeedbackParams
): Promise<CheckInAIFeedbackResponse> {
  const { tags, note } = params;

  // Check safety on user notes/tags
  const combinedText = `${note || ''} ${tags.join(' ')}`;
  const safety = checkSajuMindSafety(combinedText);
  if (!safety.isSafe && safety.fixedResponse) {
    return {
      observation: 'Support Alert',
      patternConnection: 'Care Resources',
      smallAction: 'Reach out to support services.',
      fullText: safety.fixedResponse,
    };
  }

  // Use deterministic template directly to eliminate live API costs
  return generateDeterministicCheckInFeedback(params);
}

function generateDeterministicCheckInFeedback(
  params: CheckInFeedbackParams
): CheckInAIFeedbackResponse {
  const { emotion, dayMaster, dailyTransit } = params;

  let observation = `It is completely natural to experience feeling ${emotion.toLowerCase()} right now.`;
  let pattern = `As a ${dayMaster.shortTitle} (${dayMaster.element.toUpperCase()} essence), today's ${dailyTransit.pillar.element.toUpperCase()} transit introduces ${dailyTransit.relationToDayMaster.labelEn.toLowerCase()}, which can stir internal waves.`;
  let action = dayMaster.groundingHabit;

  if (emotion === 'Anxious' || emotion === 'Overthinking') {
    observation = `Feeling ${emotion.toLowerCase()} is often a signal that your mind is processing deeper currents.`;
    pattern = `With today's ${dailyTransit.relationToDayMaster.labelEn}, your ${dayMaster.shortTitle} archetype naturally feels heightened mental activity.`;
    action = 'Take 3 deep grounding breaths and step away from screens for five minutes.';
  } else if (emotion === 'Motivated' || emotion === 'Clear') {
    observation = `You are tapping into a wonderful window of ${emotion.toLowerCase()} momentum today.`;
    pattern = `Today's cosmic weather harmonizes with your ${dayMaster.shortTitle} core to open productive clarity.`;
    action = 'Write down your single highest-impact priority and complete the first step now.';
  }

  return {
    observation,
    patternConnection: pattern,
    smallAction: action,
    fullText: `${observation} ${pattern} ${action}`,
  };
}

// =====================================
// Weekly Report AI Generator (< 180 words)
// =====================================
export interface WeeklyReportParams {
  userName?: string;
  dayMaster: DayMasterArchetype;
  checkInHistory: Array<{
    date: string;
    emotion: SajuMindEmotion;
    tags: string[];
    note?: string;
  }>;
  dominantEmotion: SajuMindEmotion;
  elementalSummary: string;
}

export interface WeeklyReportAIFeedbackResponse {
  emotionalTheme: string;
  sajuTimingConnection: string;
  unnoticedPattern: string;
  gentleSuggestion: string;
  fullReport: string;
}

export async function generateSajuMindWeeklyReport(
  params: WeeklyReportParams
): Promise<WeeklyReportAIFeedbackResponse> {
  const { dayMaster, dominantEmotion } = params;

  // Deterministic Fallback - Zero API cost & 0ms latency
  const fallback = `Over the past week, your emotional baseline leaned towards feeling ${dominantEmotion}. As a ${dayMaster.shortTitle}, your ${dayMaster.element.toUpperCase()} essence responds deeply to shifting environmental rhythms. You may notice that mental overextension peaks right before moments of hesitation. For the upcoming week, embrace gentle pacing: honor your natural rest intervals and ground major decisions in calm alignment rather than urgency.`;

  return {
    emotionalTheme: `Dominant Theme: ${dominantEmotion}`,
    sajuTimingConnection: `Resonance with ${dayMaster.shortTitle}`,
    unnoticedPattern: 'Tension between fast execution and emotional recharge.',
    gentleSuggestion: 'Ground major choices in calm alignment rather than sudden pressure.',
    fullReport: fallback,
  };
}
