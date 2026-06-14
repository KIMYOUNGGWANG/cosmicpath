import type { OracleQuestionIntent } from '@/lib/ai/oracle-personas';
import type { FreeFocusLanguage, FreeFocusPayload } from './free-focus-contract';

const RELATIONSHIP_SAFETY_INTENTS = new Set<OracleQuestionIntent>(['compatibility', 'reunion', 'timing']);

const HIGH_RISK_RELATIONSHIP_TERMS = [
  '스토킹', '감시', '몰래', '집 앞', '회사 앞', '찾아가', '찾아갈', '따라가',
  '계속 확인', '계속 전화', '계속 연락', '거절했는데', '차단했는데', '협박', '압박',
  'stalk', 'stalking', 'surveillance', 'follow them', 'show up', 'blocked me', 'threat', 'pressure',
] as const;

function isHighRiskRelationshipQuestion(question: string | undefined): boolean {
  const normalized = question?.trim().toLowerCase();
  return Boolean(normalized) && HIGH_RISK_RELATIONSHIP_TERMS.some((term) => normalized?.includes(term.toLowerCase()));
}

export function shouldApplyRelationshipSafetyHold(params: {
  readonly questionIntent: OracleQuestionIntent;
  readonly question?: string;
}): boolean {
  return RELATIONSHIP_SAFETY_INTENTS.has(params.questionIntent) && isHighRiskRelationshipQuestion(params.question);
}

export function buildRelationshipSafetyFreeFocus(language: FreeFocusLanguage): FreeFocusPayload {
  if (language === 'en') {
    return {
      decision_label: 'hold_or_stop',
      delayed_choice: 'Whether to keep contacting this person',
      timing_boundary: 'Hold now and review only after the pressure or surveillance pattern has stopped.',
      first_action: 'Step back from repeated checking and choose one safer boundary today.',
      avoid: 'Do not send another message, show up, monitor, threaten, or pressure them.',
      confidence_note: 'Safety overrides timing when the question includes pressure or surveillance behavior.',
      gaeun_action: 'Gaeun action: pause contact today, write one boundary you can keep, and avoid checking, showing up, or pressure.',
      action_conclusion: 'Hold: do not send another message right now. Step back from repeated checking, surveillance, or pressure and choose a safer boundary instead.',
      evidence_summary: 'The relationship signal is high-risk because the question includes pressure or surveillance behavior; the safest verdict is to pause.',
      next_question: 'What boundary can I keep without checking or pressuring them again?',
    };
  }

  return {
    decision_label: 'hold_or_stop',
    delayed_choice: '이 사람에게 계속 연락할지 말지',
    timing_boundary: '지금은 보류하고, 압박이나 감시 행동이 멈춘 뒤에만 다시 검토하세요.',
    first_action: '반복 확인을 멈추고 오늘 지킬 수 있는 안전한 경계 하나를 정하세요.',
    avoid: '추가 연락, 찾아가기, 감시, 협박, 답장 압박을 하지 마세요.',
    confidence_note: '압박이나 감시 신호가 있으면 연락 타이밍보다 안전 경계를 우선합니다.',
    gaeun_action: '가은 액션: 오늘은 연락을 멈추고, 확인·찾아가기·압박 대신 지킬 경계 한 문장을 적으세요.',
    action_conclusion: '보류: 지금은 추가 연락을 보내지 마세요. 반복 확인, 감시, 압박 대신 안전한 거리와 경계를 먼저 잡아야 합니다.',
    evidence_summary: '질문에 스토킹, 감시, 압박 신호가 있어 연락 타이밍보다 안전 경계를 우선합니다.',
    next_question: '상대를 다시 확인하거나 압박하지 않고 지킬 수 있는 경계는 무엇인가요?',
  };
}
