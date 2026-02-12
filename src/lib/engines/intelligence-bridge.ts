/**
 * Intelligence Bridge v1.0 (Facts of Destiny)
 * 
 * 사주 엔진과 점성술 엔진의 수치 데이터를 통합하여,
 * AI 프롬프트에 주입할 구조화된 데이터 블록을 생성합니다.
 * 
 * 역할: Engine Raw Data → AI-Ready Structured Block
 */

import type { SajuResult } from './saju';
import type { AstrologyResult } from './astrology';
import { calculateEnhancedElementScores, type EnhancedElementReport, ELEMENT_NAMES } from './element-calculator';
import { calculateAstrologyScores, type AstrologyScoreReport } from './astrology-scorer';
import { ZODIAC_SIGNS } from './astrology';

// ============================================================================
// 타입 정의
// ============================================================================

export interface FactsOfDestinyData {
    /** 사주 오행 인텔리전스 */
    saju: {
        report: EnhancedElementReport;
        /** AI 주입용 텍스트 블록 */
        dataBlock: string;
    };
    /** 점성술 스코어 인텔리전스 */
    astrology: {
        report: AstrologyScoreReport;
        /** AI 주입용 텍스트 블록 */
        dataBlock: string;
    };
    /** 교차 분석 인사이트 */
    crossAnalysis: {
        /** 사주-점성 원소 교차 요약 */
        elementCrossover: string;
        /** 통합 에너지 프로필 */
        energyProfile: string;
    };
    /** 전체 통합 데이터 블록 (프롬프트 직접 주입용) */
    fullDataBlock: string;
}

// ============================================================================
// 메인 브릿지 함수
// ============================================================================

/**
 * 사주와 점성술 데이터를 통합하여 AI-Ready 데이터 블록 생성
 */
export function buildFactsOfDestiny(
    sajuResult: SajuResult,
    astrologyResult: AstrologyResult
): FactsOfDestinyData {
    // === 1. 사주 정량화 ===
    const sajuReport = calculateEnhancedElementScores(sajuResult);
    const sajuDataBlock = buildSajuDataBlock(sajuResult, sajuReport);

    // === 2. 점성술 정량화 ===
    const astroReport = calculateAstrologyScores(astrologyResult);
    const astroDataBlock = buildAstroDataBlock(astrologyResult, astroReport);

    // === 3. 교차 분석 ===
    const elementCrossover = buildElementCrossover(sajuReport, astroReport);
    const energyProfile = buildEnergyProfile(sajuReport, astroReport);

    // === 4. 전체 통합 블록 ===
    const fullDataBlock = `
## 📊 Facts of Destiny 데이터 (엔진 분석 결과)

### 🧧 사주 명리학 분석
${sajuDataBlock}

### 🪐 점성술 분석
${astroDataBlock}

### ⚡ 교차 분석 (사주 × 점성술)
${elementCrossover}
${energyProfile}

> ⚠️ 위 데이터는 엔진이 계산한 팩트입니다. 답변 시 반드시 위 수치를 1개 이상 인용하세요.
`.trim();

    return {
        saju: { report: sajuReport, dataBlock: sajuDataBlock },
        astrology: { report: astroReport, dataBlock: astroDataBlock },
        crossAnalysis: { elementCrossover, energyProfile },
        fullDataBlock,
    };
}

// ============================================================================
// 데이터 블록 빌더
// ============================================================================

function buildSajuDataBlock(saju: SajuResult, report: EnhancedElementReport): string {
    const lines: string[] = [];

    // 만세력
    lines.push(`- 일간(Day Master): ${saju.dayMaster}`);
    lines.push(`- 사주: ${saju.yeonPillar.stem}${saju.yeonPillar.branch} ${saju.monthPillar.stem}${saju.monthPillar.branch} ${saju.dayPillar.stem}${saju.dayPillar.branch} ${saju.hourPillar.stem}${saju.hourPillar.branch}`);

    // 오행 점수
    const el = report.scores;
    lines.push(`- 오행 점수: ${ELEMENT_NAMES.wood.emoji}목 ${el.wood}% | ${ELEMENT_NAMES.fire.emoji}화 ${el.fire}% | ${ELEMENT_NAMES.earth.emoji}토 ${el.earth}% | ${ELEMENT_NAMES.metal.emoji}금 ${el.metal}% | ${ELEMENT_NAMES.water.emoji}수 ${el.water}%`);
    lines.push(`- 지배 오행: ${report.dominant.ko} (${report.dominant.score}%)`);
    lines.push(`- 부족 오행: ${report.lacking.ko} (${report.lacking.score}%)`);
    lines.push(`- 균형 지수: ${report.balanceScore}/100`);

    if (report.missingElements.length > 0) {
        lines.push(`- ⚠️ 완전 부재: ${report.missingElements.join(', ')}`);
    }

    if (report.vitalElement) {
        lines.push(`- 용신(用神): ${report.vitalElement.ko}`);
    }

    // 12운성
    if (saju.twelveStages) {
        lines.push(`- 12운성: 연(${saju.twelveStages.year}) 월(${saju.twelveStages.month}) 일(${saju.twelveStages.day}) 시(${saju.twelveStages.hour})`);
    }

    // 신살
    if (saju.shinSal) {
        const positives = saju.shinSal.positive.map(s => s.name).join(', ');
        const negatives = saju.shinSal.negative.map(s => s.name).join(', ');
        if (positives) lines.push(`- 길신: ${positives}`);
        if (negatives) lines.push(`- 흉살: ${negatives}`);
    }

    return lines.join('\n');
}

function buildAstroDataBlock(astro: AstrologyResult, report: AstrologyScoreReport): string {
    const lines: string[] = [];

    // 핵심 위상
    const sunSign = ZODIAC_SIGNS[astro.sunSign]?.name || 'Unknown';
    const moonSign = ZODIAC_SIGNS[astro.moonSign]?.name || 'Unknown';
    const ascSign = ZODIAC_SIGNS[astro.ascendant]?.name || 'Unknown';
    lines.push(`- 핵심 위상: ☀️${sunSign}(태양) | 🌙${moonSign}(달) | ⬆️${ascSign}(상승궁)`);

    // 원소 분포
    const el = report.elements;
    lines.push(`- 원소 분포: 🔥불 ${el.fire}% | 🟤흙 ${el.earth}% | 💨바람 ${el.air}% | 🌊물 ${el.water}%`);

    // 양상 분포
    const mod = report.modalities;
    lines.push(`- 양상 분포: 주도형 ${mod.cardinal}% | 고정형 ${mod.fixed}% | 변통형 ${mod.mutable}%`);

    // 품위 점수
    lines.push(`- 품위 총점: ${report.dignityTotalScore > 0 ? '+' : ''}${report.dignityTotalScore}점`);

    // 조화 점수
    lines.push(`- 조화 지수: ${report.harmonyScore}/100`);

    // TOP 3 각도
    if (report.topAspects.length > 0) {
        lines.push(`- 핵심 각도:`);
        report.topAspects.forEach(a => {
            lines.push(`  · ${a.label} (${a.type}, 정밀도 ${a.precision}%, ${a.harmony})`);
        });
    }

    // 패턴
    if (report.patterns.length > 0) {
        lines.push(`- 특수 패턴: ${report.patterns.map(p => `${p.name}(${p.nameEn})`).join(', ')}`);
    }

    return lines.join('\n');
}

function buildElementCrossover(
    sajuReport: EnhancedElementReport,
    astroReport: AstrologyScoreReport
): string {
    const lines: string[] = [];

    // 사주 오행 vs 점성 원소 매핑
    // 목(Wood) ~ 바람(Air), 화(Fire) ~ 불(Fire), 
    // 토(Earth) ~ 흙(Earth), 금(Metal)~흙/바람, 수(Water) ~ 물(Water)
    const sajuFire = sajuReport.scores.fire;
    const astroFire = astroReport.elements.fire;

    if (sajuFire >= 30 && astroFire >= 30) {
        lines.push(`- 🔥 사주 화(${sajuFire}%)와 점성 불(${astroFire}%)이 모두 강력 → 열정과 추진력이 극대화된 상태`);
    }

    const sajuWater = sajuReport.scores.water;
    const astroWater = astroReport.elements.water;
    if (sajuWater <= 10 && astroWater <= 15) {
        lines.push(`- 🌊 사주 수(${sajuWater}%)와 점성 물(${astroWater}%)이 모두 부족 → 감정 조절과 유연성 보완 필요`);
    }

    if (sajuReport.balanceScore >= 60 && astroReport.harmonyScore >= 60) {
        lines.push(`- ⚖️ 사주 균형(${sajuReport.balanceScore})과 점성 조화(${astroReport.harmonyScore})가 모두 양호 → 안정적인 근본 에너지`);
    }

    if (lines.length === 0) {
        lines.push(`- 사주 지배 오행: ${sajuReport.dominant.ko}(${sajuReport.dominant.score}%) ↔ 점성 지배 원소: ${astroReport.dominantElement.ko}(${astroReport.dominantElement.score}%)`);
    }

    return lines.join('\n');
}

function buildEnergyProfile(
    sajuReport: EnhancedElementReport,
    astroReport: AstrologyScoreReport
): string {
    // 통합 에너지 프로필 한줄 요약
    const sajuDom = sajuReport.dominant;
    const astroDom = astroReport.dominantElement;

    return `- 통합 에너지: 사주 ${sajuDom.ko}(${sajuDom.score}%) + 점성 ${astroDom.ko}(${astroDom.score}%) = 현실 실행력과 내면 에너지의 핵심 축`;
}
