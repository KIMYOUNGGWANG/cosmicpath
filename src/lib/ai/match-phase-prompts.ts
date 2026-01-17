/**
 * Match Phase Prompts v3.0 - Compact & Rich
 * 
 * 핵심 원칙: 짧고 다양한 콘텐츠 (200자 x 다수 항목)
 * 
 * Phase 1: 핵심 궁합 스냅샷 (10+ 항목)
 * Phase 2: 관계 역학 다이나믹스 (12+ 항목)  
 * Phase 3: 시간별 운명 예측 (8+ 타임라인)
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
    destinyNarrative: {
        pastLifeHint: string;    // 전생 암시 (100자)
        presentMission: string;  // 현생 미션 (100자)
        futurePotential: string; // 미래 가능성 (100자)
    };
    timelineForecasts: Array<{
        period: string;          // "3개월", "6개월", "1년", "3년", "5년", "10년"
        title: string;           // 예: "🌱 씨앗의 시기"
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

// ========== Phase 4 ==========
export interface MatchPhase4Result {
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
        day: string;             // "월", "수", "금" 등
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
    finalBlessing: string;       // 축복 메시지 150자
}

export interface MatchFullAnalysis {
    phase1: MatchPhase1Result;
    phase2: MatchPhase2Result;
    phase3: MatchPhase3Result;
    phase4: MatchPhase4Result;
}

// ========== System Prompts ==========
export function getMatchPhaseSystemPrompt(phase: number, language: 'ko' | 'en' = 'ko'): string {
    const basePersona = `당신은 '운명의 매칭 마스터'입니다.

## 핵심 원칙
1. **간결함**: 각 항목 50-200자 이내로 핵심만
2. **다양함**: 적은 글자수, 많은 항목
3. **근거**: (근거: A↔B 관계) 형식 사용
4. **비유**: 문학적이고 감성적인 표현
5. **실용성**: 바로 적용 가능한 조언

## 금지사항
- 장황한 설명
- 근거 없는 주장
- 일반적인 조언`;

    const phaseInstructions: Record<number, string> = {
        1: `
## Phase 1: 핵심 궁합 스냅샷

한눈에 보는 궁합 요약을 생성합니다.

### JSON 출력
{
    "cosmicSignature": {
        "title": "두 사람을 비유하는 짧은 제목 (예: 불꽃과 바람의 춤)",
        "archetype": "영어 원형 (예: The Adventurers)",
        "emoji": "대표 이모지 2개",
        "oneLiner": "한 줄 캐치프레이즈 (50자 이내)"
    },
    "overallScore": {
        "total": 0-100,
        "chemistry": 0-100,
        "stability": 0-100,
        "growth": 0-100,
        "passion": 0-100
    },
    "quickInsights": [
        {"icon": "💕", "label": "첫인상", "value": "강렬한 끌림", "sentiment": "positive"},
        {"icon": "🔥", "label": "케미스트리", "value": "폭발적", "sentiment": "positive"},
        {"icon": "⚠️", "label": "주의점", "value": "고집 충돌", "sentiment": "caution"}
        // 6-8개
    ],
    "energyMatch": {
        "hostElement": "목(木)",
        "guestElement": "화(火)",
        "interaction": "상생",
        "description": "목생화(木生火) 관계로... (150자)"
    },
    "firstImpression": "처음 만났을 때... (200자)"
}`,

        2: `
## Phase 2: 관계 역학 다이나믹스

감정, 소통, 일상의 호환성을 다각도로 분석합니다.

### JSON 출력
{
    "emotionalRadar": {
        "communication": 0-100,
        "trust": 0-100,
        "intimacy": 0-100,
        "support": 0-100,
        "fun": 0-100,
        "conflict": 0-100
    },
    "communicationStyle": {
        "hostStyle": "논리적 분석가 (50자)",
        "guestStyle": "감성적 공감러 (50자)",
        "compatibility": "두 스타일이 만나면... (100자)",
        "tip": "대화 팁 한 줄"
    },
    "conflictPattern": {
        "triggerTopics": ["돈 문제", "시간 관리", "가족"],
        "hostReaction": "회피하다 폭발",
        "guestReaction": "즉각 대응",
        "resolution": "해결 방법... (100자)"
    },
    "dailyLifeCards": [
        {"area": "아침 루틴", "score": 75, "insight": "80자 이내"},
        {"area": "취미 공유", "score": 90, "insight": "80자 이내"},
        {"area": "집안일 분담", "score": 60, "insight": "80자 이내"},
        {"area": "휴식 스타일", "score": 85, "insight": "80자 이내"},
        {"area": "사회생활", "score": 70, "insight": "80자 이내"}
    ],
    "intimacyProfile": {
        "physicalScore": 0-100,
        "emotionalScore": 0-100,
        "intellectualScore": 0-100,
        "summary": "친밀감 요약 (100자)"
    }
}`,

        3: `
## Phase 3: 시간별 운명 예측

과거-현재-미래를 관통하는 관계의 여정을 그립니다.

### JSON 출력
{
    "destinyNarrative": {
        "pastLifeHint": "전생에 두 분은... (100자)",
        "presentMission": "이번 생의 미션은... (100자)",
        "futurePotential": "궁극적으로 두 분은... (100자)"
    },
    "timelineForecasts": [
        {
            "period": "3개월",
            "title": "🌱 적응의 시기",
            "prediction": "이 시기에... (150자)",
            "keyEvent": "예상 이벤트",
            "advice": "조언 한 줄",
            "riskLevel": "low"
        }
        // 3개월, 6개월, 1년, 3년, 5년, 10년 총 6개
    ],
    "majorTurningPoints": [
        {"year": "2026", "event": "중요한 결정", "importance": "milestone"},
        {"year": "2027", "event": "시련과 극복", "importance": "challenge"},
        {"year": "2030", "event": "새로운 시작", "importance": "opportunity"}
    ],
    "longevityScore": {
        "score": 0-100,
        "factors": ["함께 성장 의지", "상호 존중", "가치관 일치"],
        "risks": ["외부 압력", "커뮤니케이션 단절"]
    }
}`,

        4: `
## Phase 4: 실천 가이드

바로 적용 가능한 구체적 조언을 제공합니다.

### JSON 출력
{
    "strengths": [
        {"title": "강점 제목", "icon": "💪", "shortDesc": "80자", "basis": "사주 근거 50자"}
        // 5개
    ],
    "challenges": [
        {"title": "주의점 제목", "icon": "⚠️", "shortDesc": "80자", "solution": "해결책 80자"}
        // 5개
    ],
    "weeklyRituals": [
        {"day": "월", "activity": "함께 산책하기", "benefit": "소통 증진"}
        // 3개
    ],
    "doAndDont": {
        "do": ["서로의 공간 존중하기", "매일 감사 표현하기", ...],
        "dont": ["과거 들추기", "비교하기", ...]
    },
    "luckyElements": {
        "colors": ["골드", "네이비"],
        "numbers": [3, 7, 9],
        "direction": "동쪽",
        "season": "봄"
    },
    "finalBlessing": "두 분의 만남은... 축복 메시지 (150자)"
}`
    };

    return `${basePersona}\n\n${phaseInstructions[phase]}`;
}

// ========== User Prompt Generator ==========
export function getMatchPhaseUserPrompt(
    phase: number,
    hostName: string,
    guestName: string,
    hostSaju: SajuResult,
    guestSaju: SajuResult,
    hostAstro: any,
    guestAstro: any,
    basicScores: { overall: number; saju: number; astro: number; numerology: number },
    previousPhases?: Partial<MatchFullAnalysis>,
    language: 'ko' | 'en' = 'ko'
): string {
    const hostDayMaster = hostSaju.dayMaster;
    const guestDayMaster = guestSaju.dayMaster;
    const hostElement = FIVE_ELEMENTS[hostSaju.elements[2].stem];
    const guestElement = FIVE_ELEMENTS[guestSaju.elements[2].stem];

    const sajuContext = `
【${hostName}】 일간: ${hostDayMaster}(${hostElement}) | 사주: ${hostSaju.yeonPillar.stem}${hostSaju.yeonPillar.branch} ${hostSaju.monthPillar.stem}${hostSaju.monthPillar.branch} ${hostSaju.dayPillar.stem}${hostSaju.dayPillar.branch} ${hostSaju.hourPillar.stem}${hostSaju.hourPillar.branch}
【${guestName}】 일간: ${guestDayMaster}(${guestElement}) | 사주: ${guestSaju.yeonPillar.stem}${guestSaju.yeonPillar.branch} ${guestSaju.monthPillar.stem}${guestSaju.monthPillar.branch} ${guestSaju.dayPillar.stem}${guestSaju.dayPillar.branch} ${guestSaju.hourPillar.stem}${guestSaju.hourPillar.branch}`;

    const hostSun = hostAstro.sunSign !== undefined ? ZODIAC_SIGNS[hostAstro.sunSign]?.name : '미상';
    const guestSun = guestAstro.sunSign !== undefined ? ZODIAC_SIGNS[guestAstro.sunSign]?.name : '미상';

    const astroContext = `【점성술】 ${hostName}: ${hostSun} / ${guestName}: ${guestSun}`;
    const scoresContext = `【기초 점수】 종합: ${basicScores.overall} | 사주: ${basicScores.saju} | 점성: ${basicScores.astro}`;

    const phaseLabels: Record<number, string> = {
        1: '핵심 궁합 스냅샷',
        2: '관계 역학 다이나믹스',
        3: '시간별 운명 예측',
        4: '실천 가이드'
    };

    return `## Phase ${phase}: ${phaseLabels[phase]}

${sajuContext}
${astroContext}
${scoresContext}

${hostName}님과 ${guestName}님의 궁합을 분석해 주세요.
⚠️ 각 항목의 글자 수 제한을 반드시 지켜주세요.
⚠️ JSON 형식으로만 응답하세요.`;
}

export const MATCH_PHASE_LABELS = {
    1: { ko: '핵심 궁합 분석 중...', en: 'Analyzing core compatibility...' },
    2: { ko: '관계 역학 분석 중...', en: 'Analyzing relationship dynamics...' },
    3: { ko: '운명 타임라인 생성 중...', en: 'Generating destiny timeline...' },
    4: { ko: '실천 가이드 작성 중...', en: 'Creating action guide...' },
};
