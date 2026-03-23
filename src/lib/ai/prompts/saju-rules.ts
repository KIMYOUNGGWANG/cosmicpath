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

    // 9. 대운 정보 (10년 주기 운세)
    if (saju.daeun) {
        lines.push('');
        lines.push(lang === 'ko' ? '【대운 (10년 주기 운세)】' : '【Daewoon (10-Year Fortune Cycle)】');
        lines.push(`${lang === 'ko' ? '방향' : 'Direction'}: ${saju.daeun.direction} (${saju.daeun.basis})`);
        lines.push(`${lang === 'ko' ? '대운 시작 나이' : 'Start Age'}: ${saju.daeun.startAge}${lang === 'ko' ? '세' : ' years old'}`);

        if (saju.daeun.currentDaeun) {
            const current = saju.daeun.currentDaeun;
            lines.push(`${lang === 'ko' ? '★ 현재 대운' : '★ Current Daewoon'}: ${current.stem}${current.branch} (${current.startAge}~${current.endAge}${lang === 'ko' ? '세' : 'yo'}) - ${current.tenGod}`);
        }

        // 다음 대운 정보 (있는 경우)
        if (saju.daeun.currentDaeun) {
            const currentIdx = saju.daeun.sequence.findIndex(d =>
                d.stem === saju.daeun!.currentDaeun!.stem &&
                d.branch === saju.daeun!.currentDaeun!.branch
            );
            if (currentIdx >= 0 && currentIdx < saju.daeun.sequence.length - 1) {
                const nextDaeun = saju.daeun.sequence[currentIdx + 1];
                lines.push(`${lang === 'ko' ? '→ 다음 대운' : '→ Next Daewoon'}: ${nextDaeun.stem}${nextDaeun.branch} (${nextDaeun.startAge}${lang === 'ko' ? '세부터' : 'yo~'}) - ${nextDaeun.tenGod}`);
            }
        }

        // 대운 흐름 요약 (처음 5개)
        lines.push('');
        lines.push(lang === 'ko' ? '대운 흐름 (앞으로 50년):' : 'Daewoon Flow (Next 50 years):');
        saju.daeun.sequence.slice(0, 5).forEach((d, i) => {
            const marker = saju.daeun?.currentDaeun?.stem === d.stem && saju.daeun?.currentDaeun?.branch === d.branch ? '◀' : '';
            lines.push(`  ${d.startAge}~${d.endAge}${lang === 'ko' ? '세' : 'yo'}: ${d.stem}${d.branch} (${d.tenGod}) ${marker}`);
        });
    }

    return lines.join('\n');
}

/**
 * 채팅용 경량 사주 해석 지시문 (Slim)
 *
 * 핵심 3블록만 포함: SAJU_ANALYSIS + INTERPRETATION_RULES + TIMING_HINT
 * 세운/월운/대운 상세는 Premium Phase 3에서 다루므로 채팅에서는 생략.
 * → Lost in the Middle 방지 + 토큰 절약 (~60줄 vs 원본 ~200줄)
 */
export function getSajuChatDirective(saju: SajuResult, lang: 'ko' | 'en' = 'ko'): string {
    const sajuContext = formatSajuForPrompt(saju, lang);
    const currentDaeun = saju.daeun?.currentDaeun;
    const nextDaeunInfo = (() => {
        if (!saju.daeun?.currentDaeun) return null;
        const currentIdx = saju.daeun.sequence.findIndex(d =>
            d.stem === saju.daeun!.currentDaeun!.stem &&
            d.branch === saju.daeun!.currentDaeun!.branch
        );
        if (currentIdx >= 0 && currentIdx < saju.daeun.sequence.length - 1) {
            return saju.daeun.sequence[currentIdx + 1];
        }
        return null;
    })();

    if (lang === 'ko') {
        return `
<SAJU_ANALYSIS>
${sajuContext}
</SAJU_ANALYSIS>

<SAJU_INTERPRETATION_RULES>
1. 위 사주 분석은 결정론적 엔진에서 계산된 정확한 데이터입니다.
2. 격국(${saju.gyeokguk?.type || '보통격'})과 용신(${saju.enhancedYongsin?.primary ? FIVE_ELEMENTS[saju.enhancedYongsin.primary] : '미정'})을 중심으로 해석하세요.
3. 신강/신약(${saju.enhancedYongsin?.bodyStrength || '중화'})에 따른 조언을 제공하세요.
4. 사주는 타고난 성향(50% 가중치)이므로, 점성술/타로와 교차 검증하세요.
${currentDaeun ? `5. 현재 대운: ${currentDaeun.stem}${currentDaeun.branch} (${currentDaeun.startAge}~${currentDaeun.endAge}세, ${currentDaeun.tenGod}) — 답변에 자연스럽게 반영하세요.` : ''}
${nextDaeunInfo ? `6. 다음 대운 전환: ${nextDaeunInfo.startAge}세부터 ${nextDaeunInfo.stem}${nextDaeunInfo.branch} (${nextDaeunInfo.tenGod})` : ''}
</SAJU_INTERPRETATION_RULES>

<TIMING_HINT>
- 시기 질문에는 구체적으로 답하세요: "올해 5월(사월) 전후로 전환점" ✓ / "곧 좋아질 것" ✗
${currentDaeun ? `- 대운 전환 시점인 ${nextDaeunInfo ? nextDaeunInfo.startAge + '세' : 'XX세'}까지 현재 기조를 참고하세요.` : ''}
</TIMING_HINT>
`;
    } else {
        return `
<SAJU_ANALYSIS>
${sajuContext}
</SAJU_ANALYSIS>

<SAJU_INTERPRETATION_RULES>
1. The above Saju analysis is accurate data calculated by a deterministic engine.
2. Focus on Structure (${saju.gyeokguk?.type || '보통격'}) and Yongsin (${saju.enhancedYongsin?.primary || 'undetermined'}).
3. Provide advice based on body strength (${saju.enhancedYongsin?.bodyStrength || '중화'}).
4. Saju represents innate tendencies (50% weight) — cross-validate with Astrology/Tarot.
${currentDaeun ? `5. Current Daewoon: ${currentDaeun.stem}${currentDaeun.branch} (Age ${currentDaeun.startAge}~${currentDaeun.endAge}, ${currentDaeun.tenGod}).` : ''}
${nextDaeunInfo ? `6. Next Daewoon transition: Age ${nextDaeunInfo.startAge} → ${nextDaeunInfo.stem}${nextDaeunInfo.branch} (${nextDaeunInfo.tenGod})` : ''}
</SAJU_INTERPRETATION_RULES>

<TIMING_HINT>
- Be specific with timing: "Around May of this year, expect a turning point" ✓ / "Good things will happen soon" ✗
${currentDaeun ? `- Reference the Daewoon transition at age ${nextDaeunInfo ? nextDaeunInfo.startAge : 'XX'} for long-term context.` : ''}
</TIMING_HINT>
`;
    }
}

/**
 * 사주 해석 지시문 생성 (Full — Premium Reports / Phase Prompts 전용)
 *
 * 6개 XML 블록 포함 (150-200줄): ANALYSIS + RULES + DAEWOON + SEWOON + WOLWOON + TIMING
 * ⚠️ 채팅에서는 getSajuChatDirective()를 사용하세요 (Lost in the Middle 방지)
 */
export function getSajuInterpretationDirective(saju: SajuResult, lang: 'ko' | 'en' = 'ko'): string {
    const sajuContext = formatSajuForPrompt(saju, lang);

    // 현재 대운 및 다음 대운 정보
    const currentDaeun = saju.daeun?.currentDaeun;
    const nextDaeunInfo = (() => {
        if (!saju.daeun?.currentDaeun) return null;
        const currentIdx = saju.daeun.sequence.findIndex(d =>
            d.stem === saju.daeun!.currentDaeun!.stem &&
            d.branch === saju.daeun!.currentDaeun!.branch
        );
        if (currentIdx >= 0 && currentIdx < saju.daeun.sequence.length - 1) {
            return saju.daeun.sequence[currentIdx + 1];
        }
        return null;
    })();

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

<DAEWOON_INTERPRETATION_GUIDE>
**대운(大運) 해석 필수 지침:**
${currentDaeun ? `
- 현재 대운: ${currentDaeun.stem}${currentDaeun.branch} (${currentDaeun.startAge}~${currentDaeun.endAge}세)
- 대운 천간 십신: ${currentDaeun.tenGod} → 이 십신이 현재 삶에 미치는 영향을 분석하세요.
- 대운 지지와 원국 상호작용: 대운 지지 "${currentDaeun.branch}"가 원국의 지지들과 충/합/형 관계인지 확인하세요.
` : '- 대운 정보 없음'}
${nextDaeunInfo ? `
- 다음 대운 전환: ${nextDaeunInfo.startAge}세부터 ${nextDaeunInfo.stem}${nextDaeunInfo.branch} (${nextDaeunInfo.tenGod})
- 전환 대비: "XX세에 대운이 바뀌므로, 지금부터 준비하세요"와 같은 조언을 포함하세요.
` : ''}
</DAEWOON_INTERPRETATION_GUIDE>

<SEWOON_YEARLY_FORTUNE_GUIDE>
**세운(歲運) 해석 필수 지침:**
${saju.sewoon ? `
★ ${saju.sewoon.year}년 세운: ${saju.sewoon.stem}${saju.sewoon.branch}
- 세운 십신: ${saju.sewoon.tenGod} → 올해의 주요 에너지
- 세운 12운성: ${saju.sewoon.twelveStage}
- 길흉 판정: ${saju.sewoon.grade} (${saju.sewoon.score > 0 ? '+' : ''}${saju.sewoon.score}점)
- ${saju.sewoon.summary}
${saju.sewoon.interactions.clashWithDaewoon ? '⚠️ 운충운(運沖運): 대운과 세운이 충돌 - 매우 주의 필요' : ''}
${saju.sewoon.interactions.clashWithDayBranch ? '⚠️ 일지충: 배우자/거주지 변동 가능성' : ''}
` : '- 세운 정보 없음'}

${saju.sewoonMultiYear && saju.sewoonMultiYear.length > 0 ? `
📅 향후 5년 세운 흐름:
${saju.sewoonMultiYear.map(s => `  ${s.year}년: ${s.stem}${s.branch} (${s.tenGod}) - ${s.grade}`).join('\n')}
` : ''}
</SEWOON_YEARLY_FORTUNE_GUIDE>

<WOLWOON_MONTHLY_FORTUNE_GUIDE>
**월운(月運) 해석 필수 지침:**
${saju.wolwoon && saju.wolwoon.length > 0 ? `
📅 ${new Date().getFullYear()}년 12개월 월운:
${saju.wolwoon.map(w => {
            const icon = w.grade === '대길' ? '🌟' : w.grade === '길' ? '✨' : w.grade === '흉' ? '⚠️' : w.grade === '소흉' ? '⚡' : '○';
            return `  ${icon} ${w.month}월 (${w.stem}${w.branch}): ${w.tenGod} - ${w.grade}${w.clashWithSewoon ? ' [세운충]' : ''}`;
        }).join('\n')}

${(() => {
                    if (!saju.wolwoon) return '';
                    const best = saju.wolwoon.filter(w => w.grade === '대길' || w.grade === '길');
                    const worst = saju.wolwoon.filter(w => w.grade === '흉' || w.grade === '소흉');
                    let result = '';
                    if (best.length > 0) {
                        result += `✨ 좋은 달: ${best.map(w => w.month + '월').join(', ')} → 중요한 결정/시작에 적합\n`;
                    }
                    if (worst.length > 0) {
                        result += `⚠️ 주의 달: ${worst.map(w => w.month + '월').join(', ')} → 신중히 행동, 큰 결정 자제\n`;
                    }
                    return result;
                })()}
` : '- 월운 정보 없음'}
</WOLWOON_MONTHLY_FORTUNE_GUIDE>

<TIMING_PREDICTION_GUIDE>
**구체적 시기 예측 지침:**

월별 기운 참고:
- 1~2월 (축/인월): 겨울→봄 전환기, 새로운 시작 에너지
- 3~4월 (묘/진월): 봄 성장기, 확장과 도전의 시기
- 5~6월 (사/오월): 여름 시작, 활동력 최고조
- 7~8월 (미/신월): 결실 준비, 중간 점검 시기
- 9~10월 (유/술월): 가을 수확기, 성과 정리
- 11~12월 (해/자월): 겨울 휴식기, 내면 성찰

**예측 표현 예시:**
- ✓ "올해 5월(사월) 전후로 중요한 전환점이 예상됩니다."
- ✓ "2027년 봄(묘월)이 새로운 도전에 최적입니다."
- ✓ "대운 전환 시점인 ${nextDaeunInfo ? nextDaeunInfo.startAge + '세' : 'XX세'}까지 현재 기조를 유지하세요."
- ✗ (나쁜 예) "곧 좋은 일이 있을 것입니다." ← 이렇게 막연하게 쓰지 마세요.
</TIMING_PREDICTION_GUIDE>
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

<DAEWOON_INTERPRETATION_GUIDE>
**Daewoon (10-Year Cycle) Interpretation Guide:**
${currentDaeun ? `
- Current Daewoon: ${currentDaeun.stem}${currentDaeun.branch} (Age ${currentDaeun.startAge}~${currentDaeun.endAge})
- Daewoon Heaven Stem: ${currentDaeun.tenGod} → Analyze how this TenGod affects current life.
- Daewoon Branch Interaction: Check if "${currentDaeun.branch}" clashes/combines with natal chart branches.
` : '- No Daewoon data available'}
${nextDaeunInfo ? `
- Next Daewoon Transition: Age ${nextDaeunInfo.startAge} → ${nextDaeunInfo.stem}${nextDaeunInfo.branch} (${nextDaeunInfo.tenGod})
- Preparation Advice: Include advice like "Prepare now for the Daewoon change at age XX."
` : ''}
</DAEWOON_INTERPRETATION_GUIDE>

<TIMING_PREDICTION_GUIDE>
**Specific Timing Prediction Guide:**

Monthly Energy Reference:
- Jan~Feb: Winter→Spring transition, new beginnings
- Mar~Apr: Spring growth, expansion energy
- May~Jun: Summer start, peak activity
- Jul~Aug: Harvest preparation, mid-year review
- Sep~Oct: Autumn harvest, consolidation
- Nov~Dec: Winter rest, introspection

**Good prediction examples:**
- ✓ "Around May of this year, expect a significant turning point."
- ✓ "Spring 2027 is optimal for new ventures."
- ✓ "Maintain current momentum until your Daewoon transitions at age ${nextDaeunInfo ? nextDaeunInfo.startAge : 'XX'}."
- ✗ (Bad) "Good things will happen soon." ← Too vague, avoid this.
</TIMING_PREDICTION_GUIDE>
`;
    }
}

export default SAJU_RULES;
