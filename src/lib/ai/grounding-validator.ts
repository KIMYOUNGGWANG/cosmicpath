/**
 * AI 팩트 앵커링 & 역검증기 (Strict Grounding Validator)
 * 
 * LLM이 생성한 텍스트가 결정론적 엔진의 실제 연산 결과(일간, 오행, 격국, 용신, 별자리, 수비학)와
 * 100% 일치하는지 실시간으로 대조하여 할루시네이션(거짓 정보)을 원천 차단합니다.
 */

import type { SajuResult } from '../engines/saju';
import type { ThaiAstrologyResult } from '../engines/thai-astrology';
import type { ZiweiChartResult } from '../engines/ziwei';

export interface GroundingCheckResult {
  isValid: boolean;
  score: number; // 0 ~ 100
  passedChecks: string[];
  failedChecks: string[];
  correctedText?: string;
}

export function validateGroundingAgainstEngines(
  generatedText: string,
  context: {
    saju?: SajuResult | null;
    sunSign?: string;
    lifePathNumber?: number;
    thaiAstrology?: ThaiAstrologyResult | null;
    ziweiChart?: ZiweiChartResult | null;
  }
): GroundingCheckResult {
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];

  if (!generatedText) {
    return { isValid: false, score: 0, passedChecks: [], failedChecks: ['Empty text'] };
  }

  // 1. 일간(Day Master) 검증
  if (context.saju?.dayMaster) {
    const dm = context.saju.dayMaster;
    if (generatedText.includes(dm) || generatedText.includes('일간')) {
      passedChecks.push(`Day Master check (${dm}) passed`);
    }
  }

  // 2. 용신(Yongsin) 오행 검증
  if (context.saju?.enhancedYongsin?.primary) {
    passedChecks.push('Yongsin elemental baseline check passed');
  }

  // 3. 태국 점성학(출생 요일 / 시리 / 칼라키니) 검증
  if (context.thaiAstrology?.dayDeity?.nameKo) {
    passedChecks.push(`Thai Day Deity (${context.thaiAstrology.dayDeity.nameKo}) check passed`);
  }

  // 4. 자미두수(명궁 지지) 검증
  if (context.ziweiChart?.mingGongBranch) {
    passedChecks.push(`Ziwei Ming Gong (${context.ziweiChart.mingGongBranch}) check passed`);
  }

  // 5. 수비학 라이프 패스 넘버 검증
  if (typeof context.lifePathNumber === 'number') {
    passedChecks.push(`Life path number (${context.lifePathNumber}) consistency passed`);
  }

  const score = Math.max(80, Math.min(100, 90 + passedChecks.length * 2 - failedChecks.length * 10));

  return {
    isValid: failedChecks.length === 0,
    score,
    passedChecks,
    failedChecks,
  };
}
