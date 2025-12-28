/**
 * 충돌 해결 엔진 (Conflict Resolution Engine)
 * 3원 결과의 일치/충돌을 분석하고 신뢰도 점수 계산
 */

import { Tag, TagExtractionResult, getTopTags } from './tag-engine';

// 매칭 결과 타입
export interface MatchingResult {
    score: number;              // 0-100
    level: 'high' | 'medium' | 'low';
    matchingTags: string[];     // 2원 이상에서 일치하는 태그
    conflictingTags: string[];  // 충돌하는 태그
    dominantSource: 'saju' | 'astrology' | 'tarot' | 'balanced';
}

// 신뢰도 결과 타입
export interface ConfidenceResult {
    score: number;              // 1-5 (별점)
    percentage: number;         // 0-100
    level: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
    message: string;
    recommendation: string;
}

// 최종 해석 가이드 타입
export interface InterpretationGuide {
    matching: MatchingResult;
    confidence: ConfidenceResult;
    prioritySource: 'saju' | 'astrology' | 'tarot';
    tone: 'confident' | 'balanced' | 'exploratory';
    keyThemes: string[];
    warnings: string[];
}

/**
 * 질문의 시간 프레임 분석
 */
export type TimeFrame = 'short' | 'medium' | 'long';

export function analyzeTimeFrame(question: string): TimeFrame {
    const shortTermKeywords = ['오늘', '내일', '이번 주', '며칠', '당장', '지금'];
    const mediumTermKeywords = ['이번 달', '다음 달', '몇 주', '분기'];
    const longTermKeywords = ['올해', '내년', '앞으로', '장기적', '미래', '전반적'];

    const lowerQuestion = question.toLowerCase();

    if (shortTermKeywords.some(kw => lowerQuestion.includes(kw))) {
        return 'short';
    }
    if (mediumTermKeywords.some(kw => lowerQuestion.includes(kw))) {
        return 'medium';
    }
    if (longTermKeywords.some(kw => lowerQuestion.includes(kw))) {
        return 'long';
    }

    return 'medium'; // 기본값
}

/**
 * 시간 프레임에 따른 우선순위 소스 결정
 */
export function getPrioritySource(timeFrame: TimeFrame): 'saju' | 'astrology' | 'tarot' {
    switch (timeFrame) {
        case 'short':
            return 'tarot';      // 단기: 타로 우선 (직관적, 현재 상황)
        case 'medium':
            return 'astrology';  // 중기: 점성술 우선 (행성 운행)
        case 'long':
            return 'saju';       // 장기: 사주 우선 (선천적 기운)
        default:
            return 'astrology';
    }
}

/**
 * 태그 매칭 스코어 계산
 */
export function calculateMatchingScore(tagResult: TagExtractionResult): MatchingResult {
    const { sajuTags, astrologyTags, tarotTags, uniqueTags } = tagResult;

    // 각 소스의 태그 값을 Set으로 변환
    const sajuTagSet = new Set(sajuTags.map(t => t.value));
    const astrologyTagSet = new Set(astrologyTags.map(t => t.value));
    const tarotTagSet = new Set(tarotTags.map(t => t.value));

    // 2원 이상에서 공통으로 나타나는 태그
    const matchingTags: string[] = [];
    const conflictingTags: string[] = [];

    uniqueTags.forEach(tag => {
        const inSaju = sajuTagSet.has(tag);
        const inAstrology = astrologyTagSet.has(tag);
        const inTarot = tarotTagSet.has(tag);

        const sourceCount = [inSaju, inAstrology, inTarot].filter(Boolean).length;

        if (sourceCount >= 2) {
            matchingTags.push(tag);
        }
    });

    // 충돌 태그 식별 (반대 극성)
    const polarityMap: Record<string, Tag['polarity'][]> = {};

    [...sajuTags, ...astrologyTags, ...tarotTags].forEach(tag => {
        if (!polarityMap[tag.value]) {
            polarityMap[tag.value] = [];
        }
        polarityMap[tag.value].push(tag.polarity);
    });

    Object.entries(polarityMap).forEach(([tag, polarities]) => {
        const hasPositive = polarities.includes('positive');
        const hasNegative = polarities.includes('negative') || polarities.includes('caution');

        if (hasPositive && hasNegative) {
            conflictingTags.push(tag);
        }
    });

    // 매칭 스코어 계산
    // 기본: 일치 태그 비율 × 가중치
    const totalPossibleMatches = uniqueTags.length;
    const matchRatio = totalPossibleMatches > 0
        ? matchingTags.length / totalPossibleMatches
        : 0;

    // 충돌 패널티
    const conflictPenalty = conflictingTags.length * 0.05;

    // 최종 스코어 (0-100)
    const rawScore = matchRatio * 100 - conflictPenalty * 100;
    const score = Math.max(0, Math.min(100, rawScore));

    // 레벨 결정
    let level: MatchingResult['level'];
    if (score >= 70) {
        level = 'high';
    } else if (score >= 40) {
        level = 'medium';
    } else {
        level = 'low';
    }

    // 지배적 소스 결정
    const sourceCounts = {
        saju: sajuTags.length,
        astrology: astrologyTags.length,
        tarot: tarotTags.length,
    };

    const maxCount = Math.max(...Object.values(sourceCounts));
    const dominantSources = Object.entries(sourceCounts)
        .filter(([, count]) => count === maxCount)
        .map(([source]) => source);

    const dominantSource: MatchingResult['dominantSource'] =
        dominantSources.length === 1
            ? dominantSources[0] as 'saju' | 'astrology' | 'tarot'
            : 'balanced';

    return {
        score: Math.round(score),
        level,
        matchingTags,
        conflictingTags,
        dominantSource,
    };
}

/**
 * 신뢰도 점수 계산
 * Confidence Score = (Tag Overlap × 0.6) + (Historical Accuracy × 0.3) + (User Feedback × 0.1)
 * MVP에서는 Tag Overlap만 사용
 */
export function calculateConfidence(
    matching: MatchingResult,
    historicalAccuracy: number = 0.7,  // 기본값 70%
    userFeedback: number = 0.5         // 기본값 중립
): ConfidenceResult {
    // MVP: Tag Overlap 위주
    const tagOverlapScore = matching.score / 100;

    // 신뢰도 공식
    const rawConfidence =
        tagOverlapScore * 0.6 +
        historicalAccuracy * 0.3 +
        userFeedback * 0.1;

    // 백분율 (0-100)
    const percentage = Math.round(rawConfidence * 100);

    // 별점 (1-5)
    let score: number;
    let level: ConfidenceResult['level'];
    let message: string;
    let recommendation: string;

    if (percentage >= 80) {
        score = 5;
        level = 'very_high';
        message = '사주, 점성술, 타로가 모두 같은 방향을 가리킵니다.';
        recommendation = '확신을 가지고 행동하세요.';
    } else if (percentage >= 65) {
        score = 4;
        level = 'high';
        message = '대부분의 지표가 일치합니다.';
        recommendation = '전체적인 흐름을 따르되 세부 사항은 유연하게 대응하세요.';
    } else if (percentage >= 50) {
        score = 3;
        level = 'medium';
        message = '부분적으로 일치하지만, 다른 관점도 있습니다.';
        recommendation = '주된 흐름은 참고하되, 다양한 가능성을 열어두세요.';
    } else if (percentage >= 35) {
        score = 2;
        level = 'low';
        message = '각 시스템이 다른 시각을 제공합니다.';
        recommendation = '명확한 답보다는 여러 관점을 고려해보세요.';
    } else {
        score = 1;
        level = 'very_low';
        message = '지표들이 상충하여 명확한 방향을 제시하기 어렵습니다.';
        recommendation = '조금 더 시간을 두고 상황을 지켜보세요.';
    }

    return {
        score,
        percentage,
        level,
        message,
        recommendation,
    };
}

/**
 * 해석 가이드 생성
 */
export function generateInterpretationGuide(
    tagResult: TagExtractionResult,
    question: string = ''
): InterpretationGuide {
    // 매칭 분석
    const matching = calculateMatchingScore(tagResult);

    // 신뢰도 계산
    const confidence = calculateConfidence(matching);

    // 시간 프레임 기반 우선순위 소스
    const timeFrame = analyzeTimeFrame(question);
    const prioritySource = getPrioritySource(timeFrame);

    // 톤 결정
    let tone: InterpretationGuide['tone'];
    if (matching.level === 'high') {
        tone = 'confident';
    } else if (matching.level === 'medium') {
        tone = 'balanced';
    } else {
        tone = 'exploratory';
    }

    // 핵심 테마 추출
    const topTags = getTopTags(tagResult.allTags, 5);
    const keyThemes = topTags.map(t => t.tag);

    // 경고 사항
    const warnings: string[] = [];

    if (matching.conflictingTags.length > 0) {
        warnings.push(`일부 지표에서 상반된 신호가 감지됩니다: ${matching.conflictingTags.slice(0, 3).join(', ')}`);
    }

    if (confidence.level === 'low' || confidence.level === 'very_low') {
        warnings.push('현재 명확한 방향을 제시하기 어려운 시기입니다. 중요한 결정은 신중하게 하세요.');
    }

    // 특정 부정적 태그 경고
    const cautionTags = tagResult.allTags.filter(t =>
        t.polarity === 'caution' || t.polarity === 'negative'
    );
    if (cautionTags.length >= 3) {
        warnings.push('주의가 필요한 신호들이 여럿 감지됩니다. 신중한 접근을 권장합니다.');
    }

    return {
        matching,
        confidence,
        prioritySource,
        tone,
        keyThemes,
        warnings,
    };
}

/**
 * 신뢰도 별점 렌더링 (UI용)
 */
export function renderConfidenceStars(score: number): string {
    const filled = '⭐';
    const empty = '☆';
    return filled.repeat(score) + empty.repeat(5 - score);
}

/**
 * 매칭 레벨에 따른 색상 클래스 반환 (UI용)
 */
export function getMatchingLevelColor(level: MatchingResult['level']): string {
    switch (level) {
        case 'high':
            return 'text-green-500';
        case 'medium':
            return 'text-yellow-500';
        case 'low':
            return 'text-red-500';
        default:
            return 'text-gray-500';
    }
}
