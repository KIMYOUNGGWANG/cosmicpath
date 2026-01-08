/**
 * 사주 명리학 해석 규칙 + 엔진 통합 (Saju Interpretation Rules)
 * Phase 8: 프롬프트 통합
 * 
 * 가중치: 50% (본질, 장기 운세)
 * 사용: AI 프롬프트에 컨텍스트로 주입
 * 
 * 사주명리학 시스템 지침 v1.0.3 기준
 */

import {
    SajuResult,
    FIVE_ELEMENTS,
    TEN_GOD_ENGLISH,
    getGyeokgukDescription,
    getShinSalSummary,
} from '../../engines/saju';

import { analyzePatterns, PatternAnalysisResult } from '../../engines/saju-patterns';

export const SAJU_RULES = {
    version: '2.0.0',
    weight: 0.50,
    role: '본질, 장기 운세, 타고난 성향 (결정론적 계산 기반)',

    // ============ 십신 그룹 해석 가이드 ============
    tenGodGroups: {
        companion: {
            korean: '비겁',
            members: ['비견', '겁재'],
            meaning: '자아, 형제, 동료 관계',
            positive: '자립심, 추진력',
            negative: '고집, 경쟁 과다'
        },
        output: {
            korean: '식상',
            members: ['식신', '상관'],
            meaning: '표현, 재능, 자녀',
            positive: '창의력, 표현력',
            negative: '과도한 비판, 에너지 소모'
        },
        wealth: {
            korean: '재성',
            members: ['정재', '편재'],
            meaning: '재물, 아버지, 배우자(남성)',
            positive: '재물운, 현실감각',
            negative: '물욕, 근검과 투기 사이 균형'
        },
        power: {
            korean: '관성',
            members: ['정관', '편관'],
            meaning: '직장, 권력, 배우자(여성)',
            positive: '책임감, 명예',
            negative: '스트레스, 압박'
        },
        resource: {
            korean: '인성',
            members: ['정인', '편인'],
            meaning: '학문, 어머니, 보호',
            positive: '지혜, 학습력',
            negative: '의존성, 고립'
        }
    },

    // ============ 12운성 해석 가이드 ============
    twelveStageGuide: {
        '장생': { strength: 'strong', meaning: '새로운 시작, 성장의 에너지' },
        '목욕': { strength: 'medium', meaning: '성장 초기, 변화와 시련' },
        '관대': { strength: 'strong', meaning: '성인, 사회적 성취' },
        '건록': { strength: 'strong', meaning: '정점 직전, 녹봉과 안정' },
        '제왕': { strength: 'strong', meaning: '최고점, 왕의 기운' },
        '쇠': { strength: 'medium', meaning: '하강 시작, 성숙과 경험' },
        '병': { strength: 'weak', meaning: '쇠약, 에너지 보존 필요' },
        '사': { strength: 'weak', meaning: '끝과 새 시작 준비' },
        '묘': { strength: 'weak', meaning: '잠재, 내면 성찰' },
        '절': { strength: 'weak', meaning: '단절, 초심으로 회귀' },
        '태': { strength: 'medium', meaning: '잉태, 새로운 가능성' },
        '양': { strength: 'medium', meaning: '양육, 준비 기간' }
    },

    // ============ 격국 해석 가이드 ============
    gyeokgukGuide: {
        '정관격': '명예와 직장에서 성공, 책임감이 강함',
        '편관격': '결단력과 추진력, 권력 지향적',
        '정재격': '안정적 재물, 근면성실',
        '편재격': '사업/투자 운, 변동성 있는 재물',
        '정인격': '학문과 지혜, 교육 관련 적성',
        '편인격': '통찰력과 종교/철학적 성향',
        '식신격': '재능과 창의력, 표현 능력',
        '상관격': '언변과 비판력 (관리 필요)',
        '건록격': '강한 자아, 독립심',
        '양인격': '강렬한 추진력 (충동 조절 필요)',
        '보통격': '균형 잡힌 일반적 구조'
    },

    // ============ 신강/신약 해석 가이드 ============
    bodyStrengthGuide: {
        신강: {
            meaning: '일간이 강해 에너지가 넘침',
            needs: '식상/재성으로 에너지를 발산해야 함',
            advice: '목표를 세우고 적극적으로 도전하세요'
        },
        신약: {
            meaning: '일간이 약해 지원이 필요',
            needs: '비겁/인성으로 힘을 보충해야 함',
            advice: '무리하지 말고 내실을 다지세요'
        },
        중화: {
            meaning: '균형 잡힌 상태',
            needs: '격국과 조후에 따라 용신 결정',
            advice: '균형을 유지하며 기회를 포착하세요'
        }
    },

    // ============ 오행 상생상극 ============
    fiveElements: {
        generate: { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' },
        overcome: { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' },
        modernTerms: {
            wood: '성장 에너지 (창의, 시작)',
            fire: '열정 에너지 (표현, 리더십)',
            earth: '안정 에너지 (신뢰, 중재)',
            metal: '집중 에너지 (결단, 원칙)',
            water: '지혜 에너지 (유연, 직관)'
        }
    },

    // ============ 교차 검증 규칙 ============
    crossValidation: {
        withAstrology: {
            fire: ['Aries', 'Leo', 'Sagittarius'],
            earth: ['Taurus', 'Virgo', 'Capricorn'],
            metal: ['Gemini', 'Libra', 'Aquarius'],
            water: ['Cancer', 'Scorpio', 'Pisces'],
            wood: ['Aries', 'Leo']
        },
        conflictResolution: '사주 해석이 우선, 점성술로 시기 보완, 타로로 현재 에너지 확인'
    }
};

/**
 * SajuResult를 AI 프롬프트 컨텍스트로 변환
 */
export function formatSajuForPrompt(saju: SajuResult, lang: 'ko' | 'en' = 'ko'): string {
    const lines: string[] = [];

    // 1. 기본 정보
    lines.push(lang === 'ko' ? '=== 사주 분석 결과 ===' : '=== Saju Analysis Results ===');
    lines.push(lang === 'ko'
        ? `일간(Day Master): ${saju.dayMaster} (${FIVE_ELEMENTS[saju.elements[2].stem]})`
        : `Day Master: ${saju.dayMaster} (${saju.elements[2].stem})`
    );

    // 2. 사주 원국
    lines.push('');
    lines.push(lang === 'ko' ? '【사주 원국】' : '【Four Pillars】');
    lines.push(lang === 'ko'
        ? `년주: ${saju.yeonPillar.stem}${saju.yeonPillar.branch} | 십신: ${saju.tenGods.year}`
        : `Year: ${saju.yeonPillar.stem}${saju.yeonPillar.branch} | TenGod: ${TEN_GOD_ENGLISH[saju.tenGods.year] || saju.tenGods.year}`
    );
    lines.push(lang === 'ko'
        ? `월주: ${saju.monthPillar.stem}${saju.monthPillar.branch} | 십신: ${saju.tenGods.month}`
        : `Month: ${saju.monthPillar.stem}${saju.monthPillar.branch} | TenGod: ${TEN_GOD_ENGLISH[saju.tenGods.month] || saju.tenGods.month}`
    );
    lines.push(lang === 'ko'
        ? `일주: ${saju.dayPillar.stem}${saju.dayPillar.branch} | 십신: ${saju.tenGods.day} (본인)`
        : `Day: ${saju.dayPillar.stem}${saju.dayPillar.branch} | TenGod: ${TEN_GOD_ENGLISH[saju.tenGods.day] || saju.tenGods.day} (Self)`
    );
    lines.push(lang === 'ko'
        ? `시주: ${saju.hourPillar.stem}${saju.hourPillar.branch} | 십신: ${saju.tenGods.hour}`
        : `Hour: ${saju.hourPillar.stem}${saju.hourPillar.branch} | TenGod: ${TEN_GOD_ENGLISH[saju.tenGods.hour] || saju.tenGods.hour}`
    );

    // 3. 12운성
    if (saju.twelveStages) {
        lines.push('');
        lines.push(lang === 'ko' ? '【12운성】' : '【Twelve Stages】');
        lines.push(`${lang === 'ko' ? '년' : 'Year'}: ${saju.twelveStages.year} | ${lang === 'ko' ? '월' : 'Month'}: ${saju.twelveStages.month} | ${lang === 'ko' ? '일' : 'Day'}: ${saju.twelveStages.day} | ${lang === 'ko' ? '시' : 'Hour'}: ${saju.twelveStages.hour}`);
    }

    // 4. 격국
    if (saju.gyeokguk) {
        lines.push('');
        lines.push(lang === 'ko' ? '【격국】' : '【Structure】');
        lines.push(`${saju.gyeokguk.type} (${getGyeokgukDescription(saju.gyeokguk)})`);
        lines.push(`${lang === 'ko' ? '근거' : 'Basis'}: ${saju.gyeokguk.basis}`);
    }

    // 5. 용신
    if (saju.enhancedYongsin) {
        lines.push('');
        lines.push(lang === 'ko' ? '【용신 (필요한 기운)】' : '【Yongsin (Needed Element)】');
        lines.push(`${lang === 'ko' ? '신강/신약' : 'Body Strength'}: ${saju.enhancedYongsin.bodyStrength} (${saju.enhancedYongsin.bodyScore}${lang === 'ko' ? '점' : 'pt'})`);
        lines.push(`${lang === 'ko' ? '1순위 용신' : 'Primary'}: ${FIVE_ELEMENTS[saju.enhancedYongsin.primary]} (${saju.enhancedYongsin.primary})`);
        lines.push(`${lang === 'ko' ? '2순위 용신' : 'Secondary'}: ${FIVE_ELEMENTS[saju.enhancedYongsin.secondary]} (${saju.enhancedYongsin.secondary})`);
        lines.push(lang === 'ko' ? saju.enhancedYongsin.reasoning : saju.enhancedYongsin.reasoning_en);
    }

    // 6. 지지 상호작용
    if (saju.interactions) {
        lines.push('');
        lines.push(lang === 'ko' ? '【지지 상호작용】' : '【Branch Interactions】');

        if (saju.interactions.clashes.length > 0) {
            lines.push(`${lang === 'ko' ? '충' : 'Clashes'}: ${saju.interactions.clashes.map(c => c.description).join(', ')}`);
        }
        if (saju.interactions.combines.length > 0) {
            lines.push(`${lang === 'ko' ? '합' : 'Combines'}: ${saju.interactions.combines.map(c => c.description).join(', ')}`);
        }
        if (saju.interactions.threeHarmonies.length > 0) {
            lines.push(`${lang === 'ko' ? '삼합' : 'Three Harmonies'}: ${saju.interactions.threeHarmonies.map(c => c.description).join(', ')}`);
        }
        if (saju.interactions.punishments.length > 0) {
            lines.push(`${lang === 'ko' ? '형' : 'Punishments'}: ${saju.interactions.punishments.map(c => c.description).join(', ')}`);
        }
        if (saju.interactions.voids.length > 0) {
            lines.push(`${lang === 'ko' ? '공망' : 'Voids'}: ${saju.interactions.voids.join(', ')}`);
        }
    }

    // 7. 신살
    if (saju.shinSal) {
        lines.push('');
        lines.push(lang === 'ko' ? '【신살】' : '【Divine Stars】');
        lines.push(getShinSalSummary(saju.shinSal));
        if (saju.shinSal.positive.length > 0) {
            saju.shinSal.positive.forEach(s => {
                lines.push(`  ✦ ${s.name}: ${s.description}`);
            });
        }
        if (saju.shinSal.negative.length > 0) {
            saju.shinSal.negative.forEach(s => {
                lines.push(`  ⚠ ${s.name}: ${s.description}`);
            });
        }
    }

    // 8. 패턴 분석
    const patterns = analyzePatterns(saju);
    if (patterns.patterns.length > 0) {
        lines.push('');
        lines.push(lang === 'ko' ? '【사주 패턴】' : '【Saju Patterns】');
        lines.push(`${lang === 'ko' ? '종합 등급' : 'Overall Grade'}: ${patterns.grade} (${patterns.overallScore}${lang === 'ko' ? '점' : 'pt'})`);
        lines.push(lang === 'ko' ? patterns.summary : patterns.summaryEn);

        patterns.patterns.forEach(p => {
            const icon = p.category === 'positive' ? '✦' : p.category === 'negative' ? '⚠' : '○';
            lines.push(`  ${icon} ${lang === 'ko' ? p.name : p.nameEn}: ${lang === 'ko' ? p.description : p.descriptionEn}`);
        });
    }

    return lines.join('\n');
}

/**
 * 사주 해석 지시문 생성
 */
export function getSajuInterpretationDirective(saju: SajuResult, lang: 'ko' | 'en' = 'ko'): string {
    const sajuContext = formatSajuForPrompt(saju, lang);

    if (lang === 'ko') {
        return `
<SAJU_ANALYSIS>
${sajuContext}
</SAJU_ANALYSIS>

<SAJU_INTERPRETATION_RULES>
1. 위 사주 분석은 결정론적 엔진에서 계산된 정확한 데이터입니다.
2. 격국(${saju.gyeokguk?.type || '보통격'})과 용신(${saju.enhancedYongsin?.primary ? FIVE_ELEMENTS[saju.enhancedYongsin.primary] : '미정'})을 중심으로 해석하세요.
3. 신강/신약(${saju.enhancedYongsin?.bodyStrength || '중화'})에 따른 조언을 제공하세요.
4. 발견된 패턴(길격/흉격)을 자연스럽게 통합하세요.
5. 신살(길신/흉살)을 참조하되, 과장 없이 균형 있게 언급하세요.
6. 사주는 타고난 성향(50% 가중치)이므로, 점성술/타로와 교차 검증하세요.
</SAJU_INTERPRETATION_RULES>
`;
    } else {
        return `
<SAJU_ANALYSIS>
${sajuContext}
</SAJU_ANALYSIS>

<SAJU_INTERPRETATION_RULES>
1. The above Saju analysis is accurate data calculated by a deterministic engine.
2. Focus your interpretation on the Structure (${saju.gyeokguk?.type || '보통격'}) and Yongsin (${saju.enhancedYongsin?.primary || 'undetermined'}).
3. Provide advice based on body strength (${saju.enhancedYongsin?.bodyStrength || '중화'}).
4. Naturally integrate detected patterns (positive/negative).
5. Reference divine stars (positive/negative) with balance, without exaggeration.
6. Saju represents innate tendencies (50% weight), so cross-validate with Astrology/Tarot.
</SAJU_INTERPRETATION_RULES>
`;
    }
}

export default SAJU_RULES;
