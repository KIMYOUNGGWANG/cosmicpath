import type { AstrologyResult } from '../../engines/astrology';
import type { SajuResult } from '../../engines/saju';
import type {
  OracleAdvisorProfile,
  OracleCharacterId,
  OracleQuestionIntent,
  OracleSelectionMode,
} from '../oracle-personas';

// Astro data 타입 정의
export interface AstroData {
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  planets?: AstrologyResult['planets'];
  aspects?: AstrologyResult['aspects'];
  enhancedAspects?: AstrologyResult['enhancedAspects'];
  dignities?: AstrologyResult['dignities'];
  patterns?: AstrologyResult['patterns'];
  calculationSource?: string;
  [key: string]: unknown;
}

import type { ThaiAstrologyResult } from '../../engines/thai-astrology';
import type { ZiweiChartResult } from '../../engines/ziwei';
import type { YearHeatmapResult } from '../../engines/timing-heatmap';
import type { ShadowTransformationResult } from '../../engines/saju-transformation';
import type { Compatibility4DResult } from '../../engines/compatibility-matrix';

// 사용자 입력 데이터 타입
export interface UserData {
  name?: string;
  gender?: string;
  birthDate: string;
  birthTime: string;
  unknownTime?: boolean;
  characterId?: OracleCharacterId;
  selectionMode?: OracleSelectionMode;
  questionIntent?: OracleQuestionIntent;
  advisorProfile?: OracleAdvisorProfile;
  advisorEvidenceSummary?: string;
  context: string;
  question: string;
  sajuData?: SajuResult;
  astroData?: AstroData;
  tarotCards?: unknown[];
  thaiAstrology?: ThaiAstrologyResult | null;
  ziweiChart?: ZiweiChartResult | null;
  weeklyHeatmap?: YearHeatmapResult | null;
  shadowTransformations?: ShadowTransformationResult | null;
  compatibility4D?: Compatibility4DResult | null;
  language?: 'ko' | 'en';
  currentDate?: string; // "YYYY-MM-DD"
  // 상대방 정보 (궁합/재회 분석용 - optional)
  partnerName?: string;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  partnerSajuData?: SajuResult;
}

// Phase별 부분 결과 타입
export interface PremiumReportPartial {
  summary?: {
    title: string;
    content: string;
    trust_score: number;
    trust_reason: string;
  };
  [key: string]: unknown;
}
