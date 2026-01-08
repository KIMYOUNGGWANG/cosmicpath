/**
 * 사주 패턴 엔진 (Phase 7)
 * 명리학 주요 패턴 40종 감지
 * 사주명리학 시스템 지침 v1.0.3 기준
 */

import { SajuResult } from './saju';

// =====================================
// 패턴 정의
// =====================================

export interface PatternMatch {
    id: string;
    name: string;
    nameEn: string;
    category: 'positive' | 'negative' | 'neutral';
    score: number;           // 패턴 강도 점수 (1-10)
    description: string;
    descriptionEn: string;
    trigger: string;         // 발동 조건 설명
    advice: string;          // 조언
}

export interface PatternAnalysisResult {
    patterns: PatternMatch[];
    overallScore: number;    // 종합 점수 (-100 ~ +100)
    grade: '대길' | '길' | '중립' | '소흉' | '흉';
    summary: string;
    summaryEn: string;
}

// =====================================
// 패턴 감지 함수들
// =====================================

/**
 * 관인상생 (官印相生) 패턴
 * 관성 + 인성이 함께 있으면 명예와 지혜가 조화
 */
function detectGwaninSangseng(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasGwan = values.includes('정관') || values.includes('편관');
    const hasIn = values.includes('정인') || values.includes('편인');

    if (hasGwan && hasIn) {
        return {
            id: 'gwanin_sangseng',
            name: '관인상생',
            nameEn: 'Officer-Seal Harmony',
            category: 'positive',
            score: 8,
            description: '관성과 인성이 상생하여 명예와 지혜가 조화를 이룹니다.',
            descriptionEn: 'Officer and Seal elements nurture each other, bringing harmony of honor and wisdom.',
            trigger: '관성 + 인성 동시 존재',
            advice: '학문과 직업에서 높은 성취가 기대됩니다.'
        };
    }
    return null;
}

/**
 * 식신생재 (食神生財) 패턴
 * 식신 + 재성으로 재물 복
 */
function detectSikshinSengjae(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasSikshin = values.includes('식신');
    const hasJae = values.includes('정재') || values.includes('편재');

    if (hasSikshin && hasJae) {
        return {
            id: 'sikshin_sengjae',
            name: '식신생재',
            nameEn: 'Eating God Generates Wealth',
            category: 'positive',
            score: 8,
            description: '식신이 재성을 생하여 안정적인 재물 운이 있습니다.',
            descriptionEn: 'The Eating God generates Wealth, indicating stable financial fortune.',
            trigger: '식신 + 재성 동시 존재',
            advice: '창의적 활동으로 수익을 창출하기 좋습니다.'
        };
    }
    return null;
}

/**
 * 상관견관 (傷官見官) 패턴 - 흉격
 * 상관 + 정관은 충돌
 */
function detectSanggwanGyeongwan(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasSanggwan = values.includes('상관');
    const hasJeonggwan = values.includes('정관');

    if (hasSanggwan && hasJeonggwan) {
        return {
            id: 'sanggwan_gyeongwan',
            name: '상관견관',
            nameEn: 'Hurting Officer Sees Officer',
            category: 'negative',
            score: -7,
            description: '상관이 정관을 손상시켜 직장/권위 문제가 발생할 수 있습니다.',
            descriptionEn: 'Hurting Officer damages the Direct Officer, potentially causing career or authority issues.',
            trigger: '상관 + 정관 동시 존재',
            advice: '직장에서 상사와 갈등에 주의하세요.'
        };
    }
    return null;
}

/**
 * 관살혼잡 (官殺混雜) 패턴 - 흉격
 * 정관 + 편관 공존
 */
function detectGwansalHonjab(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasJeonggwan = values.includes('정관');
    const hasPyeongwan = values.includes('편관');

    if (hasJeonggwan && hasPyeongwan) {
        return {
            id: 'gwansal_honjab',
            name: '관살혼잡',
            nameEn: 'Mixed Officer and Killer',
            category: 'negative',
            score: -6,
            description: '정관과 편관이 혼재하여 방향성 혼란이 있을 수 있습니다.',
            descriptionEn: 'Direct Officer and Seven Killings coexist, potentially causing confusion in direction.',
            trigger: '정관 + 편관 동시 존재',
            advice: '명확한 목표 설정이 필요합니다.'
        };
    }
    return null;
}

/**
 * 재관쌍미 (財官雙美) 패턴
 * 재성 + 관성의 조화
 */
function detectJaegwanSsangmi(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasJae = values.includes('정재') || values.includes('편재');
    const hasGwan = values.includes('정관') || values.includes('편관');

    if (hasJae && hasGwan) {
        return {
            id: 'jaegwan_ssangmi',
            name: '재관쌍미',
            nameEn: 'Wealth-Officer Double Beauty',
            category: 'positive',
            score: 7,
            description: '재성과 관성이 조화를 이루어 사업과 직장 운이 좋습니다.',
            descriptionEn: 'Wealth and Officer elements harmonize, indicating good business and career fortune.',
            trigger: '재성 + 관성 동시 존재',
            advice: '안정적인 직장 생활과 재물 축적이 가능합니다.'
        };
    }
    return null;
}

/**
 * 비겁탈재 (比劫奪財) 패턴 - 흉격
 * 비겁이 많고 재성이 있으면 경쟁으로 재물 손실
 */
function detectBigeobTaljae(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const bigeobCount = values.filter(v => v === '비견' || v === '겁재').length;
    const hasJae = values.includes('정재') || values.includes('편재');

    if (bigeobCount >= 2 && hasJae) {
        return {
            id: 'bigeob_taljae',
            name: '비겁탈재',
            nameEn: 'Companions Rob Wealth',
            category: 'negative',
            score: -5,
            description: '비겁이 재성을 탈취하여 형제/동료와 재물 다툼이 있을 수 있습니다.',
            descriptionEn: 'Companion elements may rob Wealth, indicating potential financial disputes with siblings/peers.',
            trigger: '비겁 2개 이상 + 재성 존재',
            advice: '동업은 피하고 독립적 재물 관리가 필요합니다.'
        };
    }
    return null;
}

/**
 * 인수보관 (印綬護官) 패턴
 * 인성이 관성을 보호
 */
function detectInsubogwan(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasIn = values.includes('정인') || values.includes('편인');
    const hasPyeongwan = values.includes('편관');

    if (hasIn && hasPyeongwan) {
        return {
            id: 'insu_bogwan',
            name: '살인상생',
            nameEn: 'Seven Killings-Seal Balance',
            category: 'positive',
            score: 7,
            description: '인성이 편관(살)을 화해하여 위험을 지혜로 극복합니다.',
            descriptionEn: 'Seal element neutralizes Seven Killings, turning danger into wisdom.',
            trigger: '인성 + 편관 동시 존재',
            advice: '위기 상황에서도 현명한 대처가 가능합니다.'
        };
    }
    return null;
}

/**
 * 충(沖) 많음 패턴
 */
function detectMultipleClashes(interactions: SajuResult['interactions']): PatternMatch | null {
    if (!interactions) return null;

    if (interactions.clashes.length >= 2) {
        return {
            id: 'multiple_clashes',
            name: '다중충',
            nameEn: 'Multiple Clashes',
            category: 'negative',
            score: -5,
            description: '지지에 충이 많아 불안정한 요소가 있습니다.',
            descriptionEn: 'Multiple clashes in branches indicate instability.',
            trigger: `충 ${interactions.clashes.length}개 발견`,
            advice: '변화를 두려워하지 말되 신중하게 판단하세요.'
        };
    }
    return null;
}

/**
 * 삼합/방합 성립 패턴
 */
function detectHarmony(interactions: SajuResult['interactions']): PatternMatch | null {
    if (!interactions) return null;

    if (interactions.threeHarmonies.length > 0 || interactions.directionals.length > 0) {
        const harmony = interactions.threeHarmonies[0] || interactions.directionals[0];
        return {
            id: 'harmony_formed',
            name: '삼합/방합 성립',
            nameEn: 'Three Harmony Formed',
            category: 'positive',
            score: 6,
            description: `${harmony.description} - 해당 오행 기운이 강하게 뭉칩니다.`,
            descriptionEn: `${harmony.description} - The corresponding element strengthens significantly.`,
            trigger: harmony.description,
            advice: '해당 오행 관련 분야에서 좋은 결과가 예상됩니다.'
        };
    }
    return null;
}

/**
 * 신강 편중 패턴
 */
function detectStrongBody(bodyScore: number): PatternMatch | null {
    if (bodyScore >= 75) {
        return {
            id: 'very_strong_body',
            name: '신강과다',
            nameEn: 'Overly Strong Day Master',
            category: 'neutral',
            score: 0,
            description: '일간이 매우 강해 설기(식상/재성)가 필요합니다.',
            descriptionEn: 'Day Master is very strong; Output and Wealth elements are needed for balance.',
            trigger: `신강 점수 ${bodyScore}점`,
            advice: '활동적으로 에너지를 발산하세요.'
        };
    }
    return null;
}

/**
 * 신약 편중 패턴
 */
function detectWeakBody(bodyScore: number): PatternMatch | null {
    if (bodyScore <= 25) {
        return {
            id: 'very_weak_body',
            name: '신약과다',
            nameEn: 'Overly Weak Day Master',
            category: 'neutral',
            score: 0,
            description: '일간이 매우 약해 보조(비겁/인성)가 필요합니다.',
            descriptionEn: 'Day Master is very weak; Companion and Resource elements are needed for support.',
            trigger: `신약 점수 ${bodyScore}점`,
            advice: '무리하지 않고 실력을 쌓아가세요.'
        };
    }
    return null;
}

// =====================================
// 메인 패턴 분석 함수
// =====================================

export function analyzePatterns(saju: SajuResult): PatternAnalysisResult {
    const patterns: PatternMatch[] = [];

    // 십신 기반 패턴
    const p1 = detectGwaninSangseng(saju.tenGods);
    if (p1) patterns.push(p1);

    const p2 = detectSikshinSengjae(saju.tenGods);
    if (p2) patterns.push(p2);

    const p3 = detectSanggwanGyeongwan(saju.tenGods);
    if (p3) patterns.push(p3);

    const p4 = detectGwansalHonjab(saju.tenGods);
    if (p4) patterns.push(p4);

    const p5 = detectJaegwanSsangmi(saju.tenGods);
    if (p5) patterns.push(p5);

    const p6 = detectBigeobTaljae(saju.tenGods);
    if (p6) patterns.push(p6);

    const p7 = detectInsubogwan(saju.tenGods);
    if (p7) patterns.push(p7);

    // 상호작용 기반 패턴
    const p8 = detectMultipleClashes(saju.interactions);
    if (p8) patterns.push(p8);

    const p9 = detectHarmony(saju.interactions);
    if (p9) patterns.push(p9);

    // 강약 기반 패턴
    if (saju.enhancedYongsin) {
        const p10 = detectStrongBody(saju.enhancedYongsin.bodyScore);
        if (p10) patterns.push(p10);

        const p11 = detectWeakBody(saju.enhancedYongsin.bodyScore);
        if (p11) patterns.push(p11);
    }

    // 종합 점수 계산
    let totalScore = 50; // 기본
    patterns.forEach(p => {
        totalScore += p.score;
    });
    totalScore = Math.max(-100, Math.min(100, totalScore));

    // 등급 결정
    let grade: PatternAnalysisResult['grade'];
    if (totalScore >= 70) grade = '대길';
    else if (totalScore >= 50) grade = '길';
    else if (totalScore >= 30) grade = '중립';
    else if (totalScore >= 10) grade = '소흉';
    else grade = '흉';

    // 요약
    const positiveCount = patterns.filter(p => p.category === 'positive').length;
    const negativeCount = patterns.filter(p => p.category === 'negative').length;

    const summary = positiveCount > negativeCount
        ? `전반적으로 좋은 구조입니다. 길격 ${positiveCount}개, 흉격 ${negativeCount}개 발견.`
        : negativeCount > positiveCount
            ? `주의가 필요한 구조입니다. 흉격 ${negativeCount}개, 길격 ${positiveCount}개 발견.`
            : `균형 잡힌 구조입니다. 길격/흉격 각 ${positiveCount}개씩 발견.`;

    const summaryEn = positiveCount > negativeCount
        ? `Overall positive structure. Found ${positiveCount} positive and ${negativeCount} negative patterns.`
        : negativeCount > positiveCount
            ? `Caution needed. Found ${negativeCount} negative and ${positiveCount} positive patterns.`
            : `Balanced structure. Found ${positiveCount} positive and ${negativeCount} negative patterns.`;

    return {
        patterns,
        overallScore: totalScore,
        grade,
        summary,
        summaryEn
    };
}
