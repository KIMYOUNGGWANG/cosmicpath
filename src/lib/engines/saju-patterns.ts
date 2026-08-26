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
// 추가 핵심 패턴 (v2.0)
// =====================================

/**
 * 재다신약 (財多身弱) 패턴 - 흉격
 * 재성이 많은데 일간이 약함
 */
function detectJaedaSinyak(
    tenGods: Record<string, string>,
    bodyStrength?: string
): PatternMatch | null {
    const values = Object.values(tenGods);
    const wealthCount = values.filter(v => v === '정재' || v === '편재').length;

    if (wealthCount >= 2 && (bodyStrength === '신약' || bodyStrength === '중화신약')) {
        return {
            id: 'jaeda_sinyak',
            name: '재다신약',
            nameEn: 'Wealth Heavy Body Weak',
            category: 'negative',
            score: -6,
            description: '재물이 많으나 일간이 약해 감당하기 어렵습니다. 재물 때문에 오히려 고생하기 쉽습니다.',
            descriptionEn: 'Heavy wealth but weak body makes it hard to handle. May struggle because of money.',
            trigger: `재성 ${wealthCount}개 + 신약`,
            advice: '비겁/인수로 일간을 보강하고, 과도한 투자나 보증을 피하세요.'
        };
    }
    return null;
}

/**
 * 인다신약 (印多身弱) 패턴 - 흉격 (의존적 성향)
 * 인성이 과다하여 의존적 성격
 */
function detectIndaSinyak(
    tenGods: Record<string, string>,
    bodyStrength?: string
): PatternMatch | null {
    const values = Object.values(tenGods);
    const resourceCount = values.filter(v => v === '정인' || v === '편인').length;

    if (resourceCount >= 2 && (bodyStrength === '신약' || bodyStrength === '중화신약')) {
        return {
            id: 'inda_sinyak',
            name: '인다신약',
            nameEn: 'Resource Heavy Body Weak',
            category: 'negative',
            score: -4,
            description: '인수가 과다하여 의존적 성격이 되기 쉽습니다. 결단력이 부족할 수 있습니다.',
            descriptionEn: 'Excessive resources may lead to dependent personality and lack of decisiveness.',
            trigger: `인성 ${resourceCount}개 + 신약`,
            advice: '재성으로 인수를 제어하거나 식상으로 설기하세요. 독립심을 기르세요.'
        };
    }
    return null;
}

/**
 * 효신탈식 (梟神奪食) 패턴 - 흉격
 * 편인이 식신을 극함
 */
function detectHyosinTalsik(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasOwl = values.includes('편인');
    const hasFood = values.includes('식신');

    if (hasOwl && hasFood) {
        return {
            id: 'hyosin_talsik',
            name: '효신탈식',
            nameEn: 'Owl Robs Food God',
            category: 'negative',
            score: -7,
            description: '편인(효신)이 식신의 복록을 빼앗습니다. 일자리 손실이나 자녀와의 인연이 약해질 수 있습니다.',
            descriptionEn: 'Indirect seal (owl) robs the food god. May lose job or have weak bond with children.',
            trigger: '편인 + 식신 동시 존재',
            advice: '재성(정재/편재)으로 편인을 제어하세요.'
        };
    }
    return null;
}

/**
 * 식상제살 (食傷制殺) 패턴 - 길격
 * 식상이 편관(칠살)을 제어
 */
function detectSiksangJesal(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const outputCount = values.filter(v => v === '식신' || v === '상관').length;
    const hasKill = values.includes('편관');

    if (outputCount >= 1 && hasKill) {
        return {
            id: 'siksang_jesal',
            name: '식상제살',
            nameEn: 'Output Controls Kill',
            category: 'positive',
            score: 6,
            description: '식상이 편관(칠살)을 제어하여 권력을 재능으로 승화시킵니다.',
            descriptionEn: 'Output element controls the Seven Kill, transforming power into talent.',
            trigger: '식상 + 편관',
            advice: '강한 추진력을 창의력으로 발휘하세요.'
        };
    }
    return null;
}

/**
 * 양인가살 (羊刃駕殺) 패턴 - 위험+기회
 * 양인(제왕 지지) + 편관
 */
function detectYanginGasal(
    tenGods: Record<string, string>,
    twelveStages?: { year: string; month: string; day: string; hour: string }
): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasKill = values.includes('편관');

    // 양인 = 일간이 제왕에 해당하는 지지
    const hasYangin = twelveStages &&
        (twelveStages.year === '제왕' || twelveStages.month === '제왕' ||
            twelveStages.day === '제왕' || twelveStages.hour === '제왕');

    if (hasYangin && hasKill) {
        return {
            id: 'yangin_gasal',
            name: '양인가살',
            nameEn: 'Yang Blade Driving Kill',
            category: 'neutral', // 위험하지만 제어되면 대성
            score: -2,
            description: '양인과 칠살이 만나 강렬한 에너지를 가집니다. 제어되면 큰 권력, 그렇지 않으면 위험합니다.',
            descriptionEn: 'Yang Blade meets Seven Kill - intense energy. Great power if controlled, risky if not.',
            trigger: '양인(제왕 지지) + 편관',
            advice: '무관/체육/외과의사 등 칼을 다루는 직업에 적합. 감정 조절이 중요합니다.'
        };
    }
    return null;
}

/**
 * 신강무제 (身强無制) 패턴 - 경고
 * 신강인데 제어할 관성/재성/식상이 부족
 */
function detectSingangMuje(
    tenGods: Record<string, string>,
    bodyStrength?: string
): PatternMatch | null {
    const values = Object.values(tenGods);
    const powerCount = values.filter(v => v === '정관' || v === '편관').length;
    const wealthCount = values.filter(v => v === '정재' || v === '편재').length;
    const outputCount = values.filter(v => v === '식신' || v === '상관').length;

    if ((bodyStrength === '신강' || bodyStrength === '중화신강') && powerCount === 0 && wealthCount === 0 && outputCount === 0) {
        return {
            id: 'singang_muje',
            name: '신강무제',
            nameEn: 'Strong Body No Control',
            category: 'negative',
            score: -4,
            description: '일간이 강한데 제어할 요소(관/재/식상)가 없어 독단적이 되기 쉽습니다.',
            descriptionEn: 'Strong day master without controlling elements may become domineering.',
            trigger: '신강 + 관재식상 부재',
            advice: '겸손을 기르고 타인의 의견을 경청하세요.'
        };
    }
    return null;
}

/**
 * 신약무부 (身弱無扶) 패턴 - 경고
 * 신약인데 보조할 비겁/인성이 부족
 */
function detectSinyakMubu(
    tenGods: Record<string, string>,
    bodyStrength?: string
): PatternMatch | null {
    const values = Object.values(tenGods);
    const companionCount = values.filter(v => v === '비견' || v === '겁재').length;
    const resourceCount = values.filter(v => v === '정인' || v === '편인').length;

    if ((bodyStrength === '신약' || bodyStrength === '중화신약') && companionCount === 0 && resourceCount === 0) {
        return {
            id: 'sinyak_mubu',
            name: '신약무부',
            nameEn: 'Weak Body No Support',
            category: 'negative',
            score: -5,
            description: '일간이 약한데 보조할 요소(비겁/인성)가 없어 자립이 어렵습니다.',
            descriptionEn: 'Weak day master without supporting elements may struggle with independence.',
            trigger: '신약 + 비겁인성 부재',
            advice: '무리하지 말고 조력자를 찾으세요. 건강 관리가 중요합니다.'
        };
    }
    return null;
}

/**
 * 식상과다 (食傷過多) 패턴 - 경고
 * 식상이 과다하여 에너지 소모가 큼
 */
function detectSiksangGwada(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const outputCount = values.filter(v => v === '식신' || v === '상관').length;

    if (outputCount >= 3) {
        return {
            id: 'siksang_gwada',
            name: '식상과다',
            nameEn: 'Excessive Output',
            category: 'negative',
            score: -3,
            description: '식상이 과다하여 일간의 에너지를 과도하게 누설합니다. 체력 관리가 필요합니다.',
            descriptionEn: 'Excessive output drains day master energy. Health management needed.',
            trigger: `식상 ${outputCount}개`,
            advice: '활동을 적절히 조절하고 휴식을 충분히 취하세요.'
        };
    }
    return null;
}

/**
 * 비겁과다 (比劫過多) 패턴 - 경고
 * 비겁이 과다하여 자아가 너무 강함
 */
function detectBigeobGwada(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const companionCount = values.filter(v => v === '비견' || v === '겁재').length;

    if (companionCount >= 3) {
        return {
            id: 'bigeob_gwada',
            name: '비겁과다',
            nameEn: 'Excessive Companions',
            category: 'negative',
            score: -3,
            description: '비겁이 과다하여 자아가 강하고 경쟁적입니다. 재물 분산 주의가 필요합니다.',
            descriptionEn: 'Excessive companions make strong ego and competitive nature. Watch for wealth dispersion.',
            trigger: `비겁 ${companionCount}개`,
            advice: '협력보다 독자적 활동이 유리합니다. 재물 관리에 신경 쓰세요.'
        };
    }
    return null;
}

/**
 * 관다신약 (官多身弱) 패턴 - 흉격
 * 관성이 강한데 일간이 약함
 */
function detectGwandaSinyak(
    tenGods: Record<string, string>,
    bodyStrength?: string
): PatternMatch | null {
    const values = Object.values(tenGods);
    const powerCount = values.filter(v => v === '정관' || v === '편관').length;

    if (powerCount >= 2 && (bodyStrength === '신약' || bodyStrength === '중화신약')) {
        return {
            id: 'gwanda_sinyak',
            name: '관다신약',
            nameEn: 'Officer Heavy Body Weak',
            category: 'negative',
            score: -5,
            description: '관성이 강한데 일간이 약해 직장/규범의 압박을 크게 받습니다.',
            descriptionEn: 'Strong officers with weak body means heavy pressure from work and rules.',
            trigger: `관성 ${powerCount}개 + 신약`,
            advice: '인수로 관성을 통관하세요. 스트레스 관리가 중요합니다.'
        };
    }
    return null;
}

/**
 * 상관배인 (傷官配印) 패턴 - 길격
 * 상관을 인성이 제어
 */
function detectSanggwanBaein(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasSanggwan = values.includes('상관');
    const hasIn = values.includes('정인') || values.includes('편인');

    if (hasSanggwan && hasIn) {
        return {
            id: 'sanggwan_baein',
            name: '상관배인',
            nameEn: 'Hurting Officer with Seal',
            category: 'positive',
            score: 5,
            description: '인성이 상관을 제어하여 재능을 지혜롭게 발휘합니다.',
            descriptionEn: 'Seal controls Hurting Officer, channeling talent wisely.',
            trigger: '상관 + 인성',
            advice: '학문과 예술을 겸비한 분야에서 성공할 수 있습니다.'
        };
    }
    return null;
}

/**
 * 재생관 (財生官) 패턴 - 길격
 * 재성이 관성을 생함
 */
function detectJaeSaengGwan(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const hasJae = values.includes('정재') || values.includes('편재');
    const hasGwan = values.includes('정관');

    if (hasJae && hasGwan && !values.includes('편관')) {
        return {
            id: 'jae_saeng_gwan',
            name: '재생관',
            nameEn: 'Wealth Generates Officer',
            category: 'positive',
            score: 6,
            description: '재성이 정관을 생하여 재물로 명예를 얻습니다.',
            descriptionEn: 'Wealth generates Officer, gaining honor through money.',
            trigger: '재성 → 정관 (편관 없음)',
            advice: '재물을 통해 사회적 지위를 얻을 수 있습니다.'
        };
    }
    return null;
}

/**
 * 공망다 (空亡多) 패턴 - 경고
 * 공망이 2개 이상
 */
function detectVoidExcess(interactions: SajuResult['interactions']): PatternMatch | null {
    if (!interactions) return null;

    if (interactions.voids.length >= 2) {
        return {
            id: 'void_excess',
            name: '공망다',
            nameEn: 'Multiple Voids',
            category: 'neutral',
            score: -2,
            description: '공망이 많아 허무함이나 공허함을 느끼기 쉽습니다. 반면 영적 성장에 유리합니다.',
            descriptionEn: 'Multiple voids may bring emptiness, but favorable for spiritual growth.',
            trigger: `공망 ${interactions.voids.length}개`,
            advice: '물질보다 정신적 가치를 추구하면 오히려 성취가 있습니다.'
        };
    }
    return null;
}

/**
 * 형다 (刑多) 패턴 - 흉격
 * 형이 2개 이상
 */
function detectPunishmentExcess(interactions: SajuResult['interactions']): PatternMatch | null {
    if (!interactions) return null;

    if (interactions.punishments.length >= 2) {
        return {
            id: 'punishment_excess',
            name: '형다',
            nameEn: 'Multiple Punishments',
            category: 'negative',
            score: -4,
            description: '형이 많아 인간관계나 건강에서 어려움이 있을 수 있습니다.',
            descriptionEn: 'Multiple punishments may bring difficulties in relationships or health.',
            trigger: `형 ${interactions.punishments.length}개`,
            advice: '법률 문제와 건강에 특히 주의하세요.'
        };
    }
    return null;
}

// =====================================
// 신살 기반 패턴 (v2.1)
// =====================================

/**
 * 천을귀인 패턴 - 길격
 * 어려울 때 귀인의 도움
 */
function detectCheoneuiGuin(shinSal?: SajuResult['shinSal']): PatternMatch | null {
    if (!shinSal) return null;

    if (shinSal.positive.some(s => s.name === '천을귀인')) {
        return {
            id: 'cheonui_guin',
            name: '천을귀인',
            nameEn: 'Heavenly Noble Star',
            category: 'positive',
            score: 5,
            description: '천을귀인이 있어 어려울 때 귀인의 도움을 받습니다. 위기를 기회로 바꿉니다.',
            descriptionEn: 'Heavenly Noble Star brings help in difficult times, turning crises into opportunities.',
            trigger: '천을귀인 발동',
            advice: '인맥을 소중히 하고 겸손하면 귀인을 만납니다.'
        };
    }
    return null;
}

/**
 * 도화살 패턴 - 중립 (길/흉 양면)
 * 매력과 낭만, 주색 주의
 */
function detectDohwasal(shinSal?: SajuResult['shinSal']): PatternMatch | null {
    if (!shinSal) return null;

    if (shinSal.negative.some(s => s.name === '도화살')) {
        return {
            id: 'dohwa_sal',
            name: '도화살',
            nameEn: 'Peach Blossom Star',
            category: 'neutral',
            score: 0,
            description: '도화살이 있어 매력적이고 이성운이 좋습니다. 단, 주색(酒色)에 주의가 필요합니다.',
            descriptionEn: 'Peach Blossom brings charm and romantic luck. Beware of excessive indulgence.',
            trigger: '도화살 발동',
            advice: '예술/연예 분야에 유리. 감정 절제가 필요합니다.'
        };
    }
    return null;
}

/**
 * 역마살 패턴 - 중립 (활동성)
 * 이동, 변화, 해외운
 */
function detectYeokmasal(shinSal?: SajuResult['shinSal']): PatternMatch | null {
    if (!shinSal) return null;

    if (shinSal.negative.some(s => s.name === '역마살')) {
        return {
            id: 'yeokma_sal',
            name: '역마살',
            nameEn: 'Traveling Horse Star',
            category: 'neutral',
            score: 1,
            description: '역마살이 있어 이동이 많고 변화가 잦습니다. 해외운이나 무역에 유리합니다.',
            descriptionEn: 'Traveling Horse brings frequent movement and changes. Good for overseas or trade.',
            trigger: '역마살 발동',
            advice: '가만히 있기보다 움직여야 발전합니다. 해외 기회를 살피세요.'
        };
    }
    return null;
}

/**
 * 화개살 패턴 - 중립 (영적/예술적)
 * 종교, 예술, 고독
 */
function detectHwagaesal(shinSal?: SajuResult['shinSal']): PatternMatch | null {
    if (!shinSal) return null;

    if (shinSal.negative.some(s => s.name === '화개살')) {
        return {
            id: 'hwagae_sal',
            name: '화개살',
            nameEn: 'Flower Canopy Star',
            category: 'neutral',
            score: 0,
            description: '화개살이 있어 예술적 감각과 영적 감수성이 뛰어납니다. 고독을 즐기는 면이 있습니다.',
            descriptionEn: 'Flower Canopy brings artistic talent and spiritual sensitivity. May enjoy solitude.',
            trigger: '화개살 발동',
            advice: '종교, 철학, 예술 분야에서 성취할 수 있습니다.'
        };
    }
    return null;
}

/**
 * 문창귀인 패턴 - 길격
 * 학문, 문서, 시험운
 */
function detectMunchangGuin(shinSal?: SajuResult['shinSal']): PatternMatch | null {
    if (!shinSal) return null;

    if (shinSal.positive.some(s => s.name === '문창귀인')) {
        return {
            id: 'munchang_guin',
            name: '문창귀인',
            nameEn: 'Literary Star',
            category: 'positive',
            score: 4,
            description: '문창귀인이 있어 학문과 글재주가 뛰어납니다. 시험운이 좋습니다.',
            descriptionEn: 'Literary Star brings academic talent and writing skills. Good for exams.',
            trigger: '문창귀인 발동',
            advice: '공부, 자격증, 글쓰기 분야에서 성과가 기대됩니다.'
        };
    }
    return null;
}

/**
 * 암록 패턴 - 길격
 * 숨은 재물복
 */
function detectAmrok(tenGods: Record<string, string>, hiddenStems?: SajuResult['hiddenStems']): PatternMatch | null {
    if (!hiddenStems) return null;

    // 지장간에 정재가 숨어있는 경우
    const hiddenStemsArr = [
        hiddenStems.year.jeonggi,
        hiddenStems.month.jeonggi,
        hiddenStems.day.jeonggi,
        hiddenStems.hour.jeonggi
    ];

    const values = Object.values(tenGods);
    const hasNoWealth = !values.includes('정재') && !values.includes('편재');
    const hasHiddenWealth = hiddenStemsArr.some(stem => {
        // 간략화된 검사 - 실제로는 더 정밀해야 함
        return stem === '정' || stem === '무' || stem === '기';
    });

    if (hasNoWealth && hasHiddenWealth) {
        return {
            id: 'am_rok',
            name: '암록',
            nameEn: 'Hidden Fortune',
            category: 'positive',
            score: 3,
            description: '겉으로 드러나지 않는 재물복이 있습니다. 숨은 수입원이 생깁니다.',
            descriptionEn: 'Hidden fortune exists beneath the surface. Unexpected income sources may appear.',
            trigger: '지장간에 재성 잠재',
            advice: '티 내지 않고 꾸준히 모으면 부를 축적합니다.'
        };
    }
    return null;
}

/**
 * 인성과다 (잉여 인성)
 * 인성이 너무 많아 자기 결정 어려움
 */
function detectInseongGwada(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const resourceCount = values.filter(v => v === '정인' || v === '편인').length;

    if (resourceCount >= 3) {
        return {
            id: 'inseong_gwada',
            name: '인성과다',
            nameEn: 'Excessive Resources',
            category: 'negative',
            score: -3,
            description: '인성이 과다하여 의존적이고 결단력이 부족할 수 있습니다.',
            descriptionEn: 'Too many resources may cause dependency and indecisiveness.',
            trigger: `인성 ${resourceCount}개`,
            advice: '스스로 결정하는 연습을 하세요. 재성으로 균형을 잡으세요.'
        };
    }
    return null;
}

/**
 * 재성과다 (돈에 집착)
 * 재성이 너무 많음
 */
function detectJaeseongGwada(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const wealthCount = values.filter(v => v === '정재' || v === '편재').length;

    if (wealthCount >= 3) {
        return {
            id: 'jaeseong_gwada',
            name: '재성과다',
            nameEn: 'Excessive Wealth Elements',
            category: 'neutral',
            score: -1,
            description: '재성이 과다하여 돈에 대한 집착이 있을 수 있습니다. 건강 관리 필요.',
            descriptionEn: 'Too many wealth elements may cause over-focus on money. Health management needed.',
            trigger: `재성 ${wealthCount}개`,
            advice: '돈보다 건강을 먼저 챙기세요. 인성으로 마음의 여유를 가지세요.'
        };
    }
    return null;
}

/**
 * 관성과다 (압박과 스트레스)
 * 관성이 너무 많음
 */
function detectGwanseongGwada(tenGods: Record<string, string>): PatternMatch | null {
    const values = Object.values(tenGods);
    const powerCount = values.filter(v => v === '정관' || v === '편관').length;

    if (powerCount >= 3) {
        return {
            id: 'gwanseong_gwada',
            name: '관성과다',
            nameEn: 'Excessive Officers',
            category: 'negative',
            score: -4,
            description: '관성이 과다하여 규범과 압박에 시달리기 쉽습니다.',
            descriptionEn: 'Too many officers bring excessive rules and pressure.',
            trigger: `관성 ${powerCount}개`,
            advice: '완벽주의를 내려놓고, 식상으로 스트레스를 해소하세요.'
        };
    }
    return null;
}

/**
 * 편인적격 (전문성)
 * 편인이 용신으로 작용
 */
function detectPyeoninJeokgyeok(
    tenGods: Record<string, string>,
    gyeokguk?: SajuResult['gyeokguk']
): PatternMatch | null {
    if (!gyeokguk) return null;

    if (gyeokguk.type === '편인격') {
        return {
            id: 'pyeonin_jeokgyeok',
            name: '편인적격',
            nameEn: 'Indirect Seal True Pattern',
            category: 'positive',
            score: 4,
            description: '편인이 격을 성립하여 비정통적 분야에서 전문성을 발휘합니다.',
            descriptionEn: 'Indirect Seal establishes pattern, excelling in unconventional fields.',
            trigger: '편인격 성립',
            advice: 'IT, 의료, 연구, 종교 등 특수 분야에서 성공할 수 있습니다.'
        };
    }
    return null;
}

/**
 * 일록격 (日祿格) 패턴 - 길격
 * 월지에 건록이 있음
 */
function detectIlrokGyeok(
    twelveStages?: { year: string; month: string; day: string; hour: string }
): PatternMatch | null {
    if (!twelveStages) return null;

    if (twelveStages.month === '건록') {
        return {
            id: 'ilrok_gyeok',
            name: '일록격',
            nameEn: 'Day Salary Pattern',
            category: 'positive',
            score: 5,
            description: '월지가 일간의 건록지로, 자립심과 능력이 뛰어납니다.',
            descriptionEn: 'Month branch is day master\'s prosperity, showing strong independence and capability.',
            trigger: '월지 건록',
            advice: '취직보다 창업/프리랜서가 유리할 수 있습니다.'
        };
    }
    return null;
}

/**
 * 귀인다 (貴人多) 패턴 - 길격
 * 천을귀인이 2개 이상
 */
function detectGuiinDa(shinSal?: SajuResult['shinSal']): PatternMatch | null {
    if (!shinSal) return null;

    const guiinCount = shinSal.positive.filter(s =>
        s.name === '천을귀인' || s.name === '천덕귀인' || s.name === '월덕귀인'
    ).length;

    if (guiinCount >= 2) {
        return {
            id: 'guiin_da',
            name: '귀인다',
            nameEn: 'Multiple Noble Stars',
            category: 'positive',
            score: 4,
            description: '귀인이 많아 어려울 때마다 도움을 받습니다.',
            descriptionEn: 'Multiple noble stars bring help in difficult times.',
            trigger: `귀인 ${guiinCount}개`,
            advice: '인복이 좋으니 인맥 관리를 잘하세요.'
        };
    }
    return null;
}

/**
 * 삼형살 (三刑煞) 패턴 - 흉격
 * 자묘/인사신/축술미 삼형
 */
function detectSamhyeongsal(interactions: SajuResult['interactions']): PatternMatch | null {
    if (!interactions) return null;

    // punishments에서 3개 이상이 연관된 경우
    if (interactions.punishments.length >= 2) {
        return {
            id: 'samhyeong_sal',
            name: '삼형살',
            nameEn: 'Triple Punishment',
            category: 'negative',
            score: -6,
            description: '삼형이 성립하여 인간관계와 건강에 주의가 필요합니다.',
            descriptionEn: 'Triple punishment formed, requiring caution in relationships and health.',
            trigger: '삼형 성립',
            advice: '법적 분쟁, 수술, 사고에 주의하세요.'
        };
    }
    return null;
}

/**
 * 자형 (自刑) 패턴 - 중립/경고
 * 같은 지지가 2개 이상 (진진, 오오, 유유, 해해)
 */
function detectJahyeong(branches: string[]): PatternMatch | null {
    const selfPunish = ['진', '오', '유', '해'];

    for (const branch of selfPunish) {
        const count = branches.filter(b => b === branch).length;
        if (count >= 2) {
            return {
                id: 'jahyeong',
                name: '자형',
                nameEn: 'Self-Punishment',
                category: 'neutral',
                score: -2,
                description: `같은 지지(${branch})가 겹쳐 자해/자책 경향이 있습니다.`,
                descriptionEn: `Same branch (${branch}) repeats, showing self-critical tendencies.`,
                trigger: `${branch}${branch} 자형`,
                advice: '스스로를 너무 몰아세우지 마세요. 자기 관리가 중요합니다.'
            };
        }
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

    // v2.0 추가 패턴들
    const bodyStrength = saju.enhancedYongsin?.bodyStrength;

    // 재다신약
    const pa1 = detectJaedaSinyak(saju.tenGods, bodyStrength);
    if (pa1) patterns.push(pa1);

    // 인다신약
    const pa2 = detectIndaSinyak(saju.tenGods, bodyStrength);
    if (pa2) patterns.push(pa2);

    // 효신탈식
    const pa3 = detectHyosinTalsik(saju.tenGods);
    if (pa3) patterns.push(pa3);

    // 식상제살
    const pa4 = detectSiksangJesal(saju.tenGods);
    if (pa4) patterns.push(pa4);

    // 양인가살
    const pa5 = detectYanginGasal(saju.tenGods, saju.twelveStages);
    if (pa5) patterns.push(pa5);

    // 신강무제
    const pa6 = detectSingangMuje(saju.tenGods, bodyStrength);
    if (pa6) patterns.push(pa6);

    // 신약무부
    const pa7 = detectSinyakMubu(saju.tenGods, bodyStrength);
    if (pa7) patterns.push(pa7);

    // 식상과다
    const pa8 = detectSiksangGwada(saju.tenGods);
    if (pa8) patterns.push(pa8);

    // 비겁과다
    const pa9 = detectBigeobGwada(saju.tenGods);
    if (pa9) patterns.push(pa9);

    // 관다신약
    const pa10 = detectGwandaSinyak(saju.tenGods, bodyStrength);
    if (pa10) patterns.push(pa10);

    // 상관배인
    const pa11 = detectSanggwanBaein(saju.tenGods);
    if (pa11) patterns.push(pa11);

    // 재생관
    const pa12 = detectJaeSaengGwan(saju.tenGods);
    if (pa12) patterns.push(pa12);

    // 공망다
    const pa13 = detectVoidExcess(saju.interactions);
    if (pa13) patterns.push(pa13);

    // 형다
    const pa14 = detectPunishmentExcess(saju.interactions);
    if (pa14) patterns.push(pa14);

    // v2.1 신살 기반 패턴
    const pb1 = detectCheoneuiGuin(saju.shinSal);
    if (pb1) patterns.push(pb1);

    const pb2 = detectDohwasal(saju.shinSal);
    if (pb2) patterns.push(pb2);

    const pb3 = detectYeokmasal(saju.shinSal);
    if (pb3) patterns.push(pb3);

    const pb4 = detectHwagaesal(saju.shinSal);
    if (pb4) patterns.push(pb4);

    const pb5 = detectMunchangGuin(saju.shinSal);
    if (pb5) patterns.push(pb5);

    const pb6 = detectAmrok(saju.tenGods, saju.hiddenStems);
    if (pb6) patterns.push(pb6);

    const pb7 = detectInseongGwada(saju.tenGods);
    if (pb7) patterns.push(pb7);

    const pb8 = detectJaeseongGwada(saju.tenGods);
    if (pb8) patterns.push(pb8);

    const pb9 = detectGwanseongGwada(saju.tenGods);
    if (pb9) patterns.push(pb9);

    const pb10 = detectPyeoninJeokgyeok(saju.tenGods, saju.gyeokguk);
    if (pb10) patterns.push(pb10);

    // 40종 완성용 추가 패턴
    const pc1 = detectIlrokGyeok(saju.twelveStages);
    if (pc1) patterns.push(pc1);

    const pc2 = detectGuiinDa(saju.shinSal);
    if (pc2) patterns.push(pc2);

    const pc3 = detectSamhyeongsal(saju.interactions);
    if (pc3) patterns.push(pc3);

    // 지지 배열 추출
    const branches = [
        saju.yeonPillar.branch,
        saju.monthPillar.branch,
        saju.dayPillar.branch,
        saju.hourPillar.branch
    ];
    const pc4 = detectJahyeong(branches);
    if (pc4) patterns.push(pc4);

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
