/**
 * Match Phase Prompts v3.0 - Compact & Rich
 * 
 * 핵심 원칙: 짧고 다양한 콘텐츠 (200자 x 다수 항목)
 * 
 * Phase 1: 핵심 궁합 스냅샷 (10+ 항목)
 * Phase 2: 관계 역학 다이나믹스 (12+ 항목)  
 * Phase 3: 시간별 관계 타이밍 전망 (8+ 타임라인)
 * Phase 4: 실천 가이드 (15+ 액션 아이템)
 */

import { SajuResult, FIVE_ELEMENTS } from '../engines/saju';
import { ZODIAC_SIGNS } from '../engines/astrology';

// ========== Phase 1 ==========
export interface MatchPhase1Result {
    cosmicSignature: {
        title: string;           // 예: "불꽃과 바람의 춤"
        archetype: string;       // 예: "The Adventurers"
        emoji: string;           // 예: "🔥💨"
        oneLiner: string;        // 한 줄 설명 (50자)
    };
    overallScore: {
        total: number;           // 0-100
        chemistry: number;       // 케미스트리
        stability: number;       // 안정성
        growth: number;          // 성장 가능성
        passion: number;         // 열정
    };
    quickInsights: Array<{
        icon: string;
        label: string;
        value: string;
        sentiment: 'positive' | 'neutral' | 'caution';
    }>;  // 6-8개
    energyMatch: {
        hostElement: string;
        guestElement: string;
        interaction: string;     // 상생/상극/비겁 등
        description: string;     // 150자
    };
    firstImpression: string;     // 첫인상/첫만남 예측 (200자)
}

// ========== Phase 2 ==========
export interface MatchPhase2Result {
    emotionalRadar: {
        communication: number;   // 0-100
        trust: number;
        intimacy: number;
        support: number;
        fun: number;
        conflict: number;        // 낮을수록 좋음
    };
    communicationStyle: {
        hostStyle: string;       // 예: "논리적 분석가"
        guestStyle: string;      // 예: "감성적 공감러"
        compatibility: string;   // 100자
        tip: string;             // 50자
    };
    conflictPattern: {
        triggerTopics: string[]; // 갈등 유발 주제 3개
        hostReaction: string;    // 50자
        guestReaction: string;   // 50자
        resolution: string;      // 해결법 100자
    };
    dailyLifeCards: Array<{
        area: string;            // 예: "아침 루틴"
        score: number;
        insight: string;         // 80자
    }>;  // 5개 영역
    intimacyProfile: {
        physicalScore: number;
        emotionalScore: number;
        intellectualScore: number;
        summary: string;         // 100자
    };
}

// ========== Phase 3 ==========
export interface MatchPhase3Result {
    prosperitySync: {
        score: number;           // 0-100
        wealthStyle: string;     // 80자
        prosperityTip: string;   // 80자
    };
    careerSynergy: {
        compatibility: number;
        businessPotential: string;
        synergyBasis: string;
    };
    socialMirror: {
        publicImage: string;
        socialStrengths: string[];
        socialAura: string;
    };
    householdHarmony: {
        managementStyle: string;
        potentialConflict: string;
        harmonyKey: string;
    };
}

// ========== Phase 4 ==========
export interface MatchPhase4Result {
    destinyNarrative: {
        pastLifeHint: string;    // 반복 패턴 상징 (100자)
        presentMission: string;  // 현생 미션 (100자)
        futurePotential: string; // 미래 가능성 (100자)
    };
    timelineForecasts: Array<{
        period: string;          // "Coming Spring", "1 Year", etc.
        title: string;
        prediction: string;      // 150자
        keyEvent: string;        // 예측 이벤트 50자
        advice: string;          // 조언 50자
        riskLevel: 'low' | 'medium' | 'high';
    }>;  // 6개
    majorTurningPoints: Array<{
        year: string;
        event: string;
        importance: 'milestone' | 'challenge' | 'opportunity';
    }>;  // 3개
    longevityScore: {
        score: number;
        factors: string[];       // 장수 요인 3개
        risks: string[];         // 위험 요인 2개
    };
}

// ========== Phase 5 ==========
export interface MatchPhase5Result {
    strengths: Array<{
        title: string;
        icon: string;
        shortDesc: string;       // 80자
        basis: string;           // 근거 50자
    }>;  // 5개
    challenges: Array<{
        title: string;
        icon: string;
        shortDesc: string;       // 80자
        solution: string;        // 해결책 80자
    }>;  // 5개
    weeklyRituals: Array<{
        day: string;
        activity: string;        // 50자
        benefit: string;         // 30자
    }>;  // 3개
    doAndDont: {
        do: string[];            // 5개, 각 30자
        dont: string[];          // 5개, 각 30자
    };
    luckyElements: {
        colors: string[];        // 2개
        numbers: number[];       // 3개
        direction: string;
        season: string;
    };
    finalBlessing: string;       // 마무리 메시지 300자 이상
}

export interface MatchFullAnalysis {
    phase1: MatchPhase1Result;
    phase2: MatchPhase2Result;
    phase3: MatchPhase3Result;
    phase4: MatchPhase4Result;
    phase5: MatchPhase5Result;
}

// ========== System Prompts ==========

import { getSchemaPrompt } from './schema-to-prompt';
import { MatchPhase1Schema, MatchPhase2Schema, MatchPhase3Schema, MatchPhase4Schema, MatchPhase5Schema } from './match-schemas';
import { getUpcomingMonthsContext } from './calendar-context';

// ========== Master Persona & Expert Directives ==========

const MASTER_PERSONA_PROMPT = `## 🎭 Decision Note Relationship Analyst (Master Persona)
당신은 40년 경력의 관계 명리/점성 분석가이자 관계 심리학자입니다. 당신의 분석은 단순한 정보 나열이 아니라, 사용자가 다음 관계 행동을 정리할 수 있는 근거 기반 Decision Note여야 합니다.

### 관계 교차판정 역할 (Relationship Source Roles)
1. **사주**: 관계의 구조(Structure). 반복되는 관계 구조와 서로의 기본 반응 패턴을 진단합니다.
2. **점성술**: 관계의 타이밍(Timing). 현재의 감정 리듬과 대화 타이밍을 맞춥니다.
3. **타로(제공된 경우)**: 질문 주변의 즉각 신호(Immediate Signal). 제공되지 않았다면 상징 직관을 꾸며내지 말고, 제공된 원천들이 어디서 일치하고 어디서 충돌하는지 먼저 판정하십시오.

### 전문가 패널의 지시사항 (Expert Panel Directives)
- **[CPO: 스토리텔링]**: 독자가 관계 결정을 구조적으로 이해하도록 하십시오. 모든 데이터 포인트는 하나의 검토 가능한 판단 흐름으로 연결되어야 합니다.
- **[CTO: 데이터 정밀도]**: 사주 천간/지지의 합충(合沖) 관계를 정확히 인산하십시오. 근거 없는 칭찬보다 뼈아픈 진실을 데이터로 입증하십시오.
- **[Marketing: 명료한 깊이]**: '관계 신호 요약'과 반복 행동은 공유 가능한 짧은 문장으로, 단 근거와 실행 가능성을 잃지 않게 표현하십시오.`;

// ========== System Prompts ==========
export function getMatchPhaseSystemPrompt(phase: number, language: 'ko' | 'en' = 'ko'): string {
    const schemas = {
        1: MatchPhase1Schema,
        2: MatchPhase2Schema,
        3: MatchPhase3Schema,
        4: MatchPhase4Schema,
        5: MatchPhase5Schema
    };

    const schemaPrompt = getSchemaPrompt(schemas[phase as keyof typeof schemas]);

    const phaseDirectives: Record<number, string> = {
        1: `### [Phase 1 Directive: Relationship Snapshot]
- 두 사람의 만남을 데이터상 관찰되는 관계 구조와 첫 반응 패턴으로 정의하십시오.
- 사주의 일간(Day Master)과 점성술의 태양 별자리가 만났을 때 발생하는 상호작용에 집중하십시오.`,
        2: `### [Phase 2 Directive: The Dynamics]
- 관계의 그림자(Shadow)를 두려워하지 말고 리딩하십시오.
- 소통의 엇박자가 사주의 어떤 글자에서 기인하는지 날카롭게 지적하십시오.`,
        3: `### [Phase 3 Directive: The Synchronization]
- 재물운(Prosperity)과 사회적 성취가 두 사람의 결합으로 어떻게 증폭되거나 감쇄되는지 분석하십시오.
- 비즈니스 파트너로서의 잠재력을 사주 합(合)의 관점에서 평가하십시오.
- 세상이 이 커플을 바라보는 '사회적 페르소나'를 묘사하십시오.`,
        4: `### [Phase 4 Directive: The Timeline]
- 과거(인연의 시작) - 현재(미션) - 미래(진화)의 타임라인을 그리십시오.
- 2026년의 구체적인 절기(입춘, 곡우 등)와 운의 흐름을 반영하십시오.
- ${getUpcomingMonthsContext()} 데이터를 적극 활용하십시오.`,
        5: `### [Phase 5 Directive: Action Blueprint]
- 관계 행동을 조정할 수 있는 실무적 설계도를 전달하십시오.
- 반복 행동은 두 사람이 현실적으로 실행하고 점검할 수 있게 구체적으로 제안하십시오.
- 마지막 조언은 근거 경계와 다음 행동이 남는 깊은 통찰로 마무리하십시오.`
    };

    return `
${MASTER_PERSONA_PROMPT}

${phaseDirectives[phase]}

<분석_스타일_가이드>
1. **근거 있는 선명함**: 근거가 충분한 부분은 선명하게 말하되, 불확실한 부분은 조건과 재검토 경계를 밝히십시오.
2. **구체적 비유**: "불과 물의 만남"처럼 막연하게 쓰지 말고, 실제 글자와 별자리 관계가 드러나는 비유를 쓰십시오.
3. **구체적 근거**: 반드시 데이터(천간, 지지, 별자리)를 괄호 안에 명시하십시오. (예: "병화(丙火)의 뜨거움과 신금(辛金)의 예리함이 만나...")
4. **JSON 무결성**: 모든 문자열 값 내부에 쌍따옴표(")와 줄바꿈(\n)을 사용하지 마십시오. 필요한 경우 홑따옴표(')를 사용하거나 공백으로 대체하십시오.
</분석_스타일_가이드>

${schemaPrompt}
`;
}

// ========== User Prompt Generator ==========
export function getMatchPhaseUserPrompt(
    phase: number,
    hostName: string,
    guestName: string,
    hostSaju: SajuResult,
    guestSaju: SajuResult,
    hostAstro: { readonly sunSign?: number },
    guestAstro: { readonly sunSign?: number },
    basicScores: { overall: number; saju: number; astro: number; numerology: number },
    previousPhases?: Partial<MatchFullAnalysis>,
    language: 'ko' | 'en' = 'ko'
): string {
    const hostDayMaster = hostSaju.dayMaster;
    const guestDayMaster = guestSaju.dayMaster;
    const hostElement = FIVE_ELEMENTS[hostSaju.elements[2].stem];
    const guestElement = FIVE_ELEMENTS[guestSaju.elements[2].stem];

    const dayMasterHanja: Record<string, string> = {
        '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊',
        '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸'
    };
    const hostHanja = dayMasterHanja[hostDayMaster] || hostDayMaster;
    const guestHanja = dayMasterHanja[guestDayMaster] || guestDayMaster;

    const sajuContext = `
【${hostName}】 일간: ${hostDayMaster}(${hostHanja}, ${hostElement}) | 사주: ${hostSaju.yeonPillar.stem}${hostSaju.yeonPillar.branch} ${hostSaju.monthPillar.stem}${hostSaju.monthPillar.branch} ${hostSaju.dayPillar.stem}${hostSaju.dayPillar.branch} ${hostSaju.hourPillar.stem}${hostSaju.hourPillar.branch}
【${guestName}】 일간: ${guestDayMaster}(${guestHanja}, ${guestElement}) | 사주: ${guestSaju.yeonPillar.stem}${guestSaju.yeonPillar.branch} ${guestSaju.monthPillar.stem}${guestSaju.monthPillar.branch} ${guestSaju.dayPillar.stem}${guestSaju.dayPillar.branch} ${guestSaju.hourPillar.stem}${guestSaju.hourPillar.branch}`;

    const hostSun = hostAstro.sunSign !== undefined ? ZODIAC_SIGNS[hostAstro.sunSign]?.name : '미상';
    const guestSun = guestAstro.sunSign !== undefined ? ZODIAC_SIGNS[guestAstro.sunSign]?.name : '미상';

    const astroContext = `【점성술】 ${hostName}: ${hostSun} / ${guestName}: ${guestSun}`;
    const scoresContext = `【기초 점수】 종합: ${basicScores.overall} | 사주: ${basicScores.saju} | 점성: ${basicScores.astro}`;

    const phaseLabels: Record<number, string> = {
        1: 'Awakening: 핵심 인연 스캔',
        2: 'Dynamics: 관계 역학 진단',
        3: 'Synchronization: 재물 및 사회적 시너지',
        4: 'Timing: 관계 타이밍 전망',
        5: 'Action Blueprint: 관계 조정 계획'
    };

    return `## Phase ${phase}: ${phaseLabels[phase]}

### 📋 분석 대상 데이터
${sajuContext}
${astroContext}
${scoresContext}

### ⚖️ 관계 Decision Note 분석가의 임무
${hostName}님과 ${guestName}님의 관계 판단 자료를 펼치십시오.
1. 데이터를 기반으로 **근거 경계가 분명한 심층 분석**을 제공하십시오.
2. 각 항목은 제시된 글자 수 제한을 **최소치**로 간주하고, 최대한 풍부하고 통찰력 있게 작성하십시오.
3. 특히 ${hostName}님이 이 관계에서 어떤 행동 크기와 점검 기준을 선택해야 할지 명확한 방향을 제시하십시오.
4. 모든 문장은 전문가다운 간결함과 근거 중심 태도를 유지하십시오.

**주의**: 출력은 반드시 순수 JSON 형태여야 하며, 일간(${hostDayMaster}, ${guestDayMaster}) 정보를 오기하지 마십시오.`;
}

export const MATCH_PHASE_LABELS = {
    1: { ko: '핵심 인연 스캔 중 (The Awakening)', en: 'Scanning core bond...' },
    2: { ko: '관계 역학 정밀 진단 (The Dynamics)', en: 'Diagnosing relationship dynamics...' },
    3: { ko: '재물 및 사회적 시너지 분석 (The Synchronization)', en: 'Analyzing wealth & social synergy...' },
    4: { ko: '관계 타이밍 창 분석 중 (The Timeline)', en: 'Analyzing relationship timing windows...' },
    5: { ko: '최종 행동 설계도 작성 중 (Action Blueprint)', en: 'Creating final action blueprint...' },
};
