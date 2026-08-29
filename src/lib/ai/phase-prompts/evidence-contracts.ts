import { buildPremiumGroundingAnchors } from '../premium-grounding';
import type { UserData } from './types';

export function buildCalculationSourceContract(lang: 'ko' | 'en') {
  if (lang === 'en') {
    return `<CALCULATION_SOURCE_CONTRACT>
The Saju and astrology values below are precomputed by deterministic server engines. Do not recalculate pillars, signs, houses, aspects, dignities, luck cycles, or monthly/yearly luck inside the model.
Use only the supplied <SAJU_DATA>, <SAJU_PRECISION_DATA>, and <ASTRO_DATA> as source of truth. If a needed value is missing, say the evidence is missing or conditional; never invent a stem, branch, sign, house, aspect, degree, date, luck cycle, or chart pattern.
When citing evidence, quote the supplied value directly enough that it can be audited against the data block.
</CALCULATION_SOURCE_CONTRACT>`;
  }

  return `<계산_원천_계약>
아래 사주와 점성술 값은 서버의 결정론적 계산 엔진이 미리 산출한 값입니다. 모델 내부에서 사주 기둥, 별자리, 하우스, 각도, 품위, 대운, 세운, 월운을 다시 계산하지 마십시오.
반드시 제공된 <사주_원국>, <사주_정밀_데이터>, <점성술_데이터>만 사실 원천으로 사용하십시오. 필요한 값이 없으면 근거 부족 또는 조건부로 표시하고, 천간/지지/별자리/하우스/각도/도수/날짜/운 주기/차트 패턴을 창작하지 마십시오.
근거를 인용할 때는 데이터 블록과 대조할 수 있도록 제공된 값을 직접 인용하십시오.
</계산_원천_계약>`;
}

export function buildGroundedEvidenceContract(userData: UserData, lang: 'ko' | 'en') {
  const effectiveUserData = userData.language ? userData : { ...userData, language: lang };
  const anchors = buildPremiumGroundingAnchors(effectiveUserData)
    .map((anchor) => `- ${anchor.family}/${anchor.label}: ${anchor.text}`)
    .join('\n');

  if (lang === 'en') {
    return `<GROUNDED_EVIDENCE_CONTRACT>
Every premium phase must cite concrete supplied anchors before interpreting them.
Required anchor ledger:
${anchors || '- no supplied anchors; mark evidence as missing instead of inventing it'}
Source roles: KASI/JPL validate calculations only; Waite/Tetrabiblos/classical candidates inform doctrine only after review; tarot image rights never prove text meaning.
Do not copy raw source text into the report. Use product-authored synthesis and name the source role, claim family, and boundary.
In the visible JSON fields, include at least four source-boundary clauses using this meaning: KASI/JPL calculation-only; calculation sources are not doctrine or personality authority; Waite/Tetrabiblos are reviewed text candidates; no raw source text copying; tarot image rights are separate from meaning.
Never write that JPL, KASI, or image rights are the basis for career, personality, relationship, Saju interpretation, or Tarot meaning.
</GROUNDED_EVIDENCE_CONTRACT>`;
  }

  return `<근거_계약>
모든 프리미엄 phase는 해석 전에 아래의 입력 앵커를 글자 그대로 인용해야 합니다.
필수 앵커 목록:
${anchors || '- 제공 앵커 없음: 창작하지 말고 근거 부족으로 표시'}
원천 역할: KASI/JPL은 계산 검증 전용이고, Waite/Tetrabiblos/고전 후보는 검토된 교리 맥락 전용이며, 타로 이미지 권리는 카드 의미의 근거가 아닙니다.
원문을 리포트에 복사하지 말고, 제품이 작성한 요약으로 source role, claim family, boundary를 밝혀 쓰십시오.
JSON의 사용자 노출 필드 안에 다음 의미의 원천 경계 문장을 최소 4개 포함하십시오: KASI/JPL 계산 검증 전용, 계산 원천은 해석 권위가 아님, Waite/Tetrabiblos 검토된 텍스트 후보, 원문 복사 금지, 타로 이미지 권리와 의미 근거 분리.
JPL, KASI, 이미지 권리를 직업/성격/관계/사주 해석/타로 의미의 근거처럼 쓰지 마십시오.
</근거_계약>`;
}
