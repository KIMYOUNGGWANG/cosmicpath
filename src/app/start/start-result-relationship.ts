export function compactText(value: string | undefined, fallback: string, maxLength = 220) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  if (!normalized) return fallback;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

export function getRelationshipVerdictLabel(value: string, isEn: boolean) {
  const normalized = value.toLowerCase();
  if (normalized.includes('기다') || normalized.includes('wait')) return isEn ? 'Wait' : '대기';
  if (
    normalized.includes('보류') ||
    normalized.includes('금지') ||
    normalized.includes('하지') ||
    normalized.includes('hold') ||
    normalized.includes('avoid')
  ) {
    return isEn ? 'Hold' : '보류';
  }
  if (
    normalized.includes('축소') ||
    normalized.includes('짧') ||
    normalized.includes('narrow') ||
    normalized.includes('short')
  ) {
    return isEn ? 'Narrow' : '축소';
  }
  if (
    normalized.includes('연락') ||
    normalized.includes('움직') ||
    normalized.includes('contact') ||
    normalized.includes('move')
  ) {
    return isEn ? 'Contact' : '연락';
  }
  return value;
}

export function isRelationshipContactTimingSource(source: string) {
  return (
    source === 'next_move_report_mvp_v1' ||
    source === 'relationship_contact_timing_v1' ||
    source === 'en_relationship_contact_timing_v1'
  );
}

export function getRelationshipFollowupEvent(source: string) {
  if (source === 'next_move_report_mvp_v1') return 'next_move_report_followup_seeded';

  return source === 'en_relationship_contact_timing_v1'
    ? 'en_relationship_contact_followup_seeded'
    : 'relationship_contact_followup_seeded';
}

export function getRelationshipLandingVariant(source: string, isEn: boolean) {
  if (source === 'next_move_report_mvp_v1') return 'next_move_report_mvp_v1';
  if (source === 'en_relationship_contact_timing_v1') return 'en_contact_timing_v1';

  return isEn ? 'en_korean_saju_decision_timing_v1' : 'ko_decision_timing_oracle_v1';
}
