/**
 * CosmicPath Premium Report Schema
 * 운세위키 스타일의 방대한 분석 구조
 */

// 개별 분석 섹션
export interface AnalysisSection {
    title: string;        // 섹션 제목
    icon: string;         // 이모지 아이콘
    summary: string;      // 짧은 요약 (1-2줄)
    content: string;      // 상세 내용 (장문, \n으로 줄바꿈)
    highlights?: string[]; // 강조할 키워드들
}

// 서브섹션이 있는 분석 (직업운, 재물운 등)
export interface DetailedSection extends AnalysisSection {
    tag?: string;         // 카테고리 태그 (예: "진로 가이드")
    subsections?: {
        icon: string;
        title: string;
    }[];
}

// 오행 균형 그래프
export interface ElementBalance {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
    analysis: string;     // 오행 분석 설명
    remedy: string;       // 개운법
}

// 운세 트레이트/뱃지
export interface CosmicTrait {
    type: 'saju' | 'astro' | 'tarot';
    name: string;
    description: string;
    grade: 'S' | 'A' | 'B';
}

// 타임라인 이벤트
export interface TimelineEvent {
    period: string;
    title: string;
    type: 'opportunity' | 'warning' | 'neutral';
    description: string;
}

// 메인 리포트 구조 (Premium)
export interface PremiumReport {
    // 핵심 요약
    summary: {
        title: string;
        content: string;
        trust_score: number;
        trust_reason: string;
    };

    // 트레이트 뱃지
    traits: CosmicTrait[];

    // 핵심 정리 (레인보우 카드)
    core_analysis: {
        lacking_elements: {
            elements: string;
            remedy: string;
            description: string;
        };
        abundant_elements: {
            elements: string;
            usage: string;
            description: string;
        };
    };

    // 사주 기본 분석
    saju_basics: {
        day_master: AnalysisSection;      // 일간 분석
        strength: AnalysisSection;         // 신강/신약
        ten_gods: AnalysisSection;         // 십성 분석
        special_stars: AnalysisSection;    // 신살 분석
    };

    // 운의 흐름
    fortune_flow: {
        major_luck: AnalysisSection;       // 대운 분석
        yearly_luck: AnalysisSection;      // 세운 분석
        monthly_luck: AnalysisSection;     // 월운 분석
        timeline_scores?: {                // 10년 대운 차트 데이터
            year: number;
            score: number;
            type: 'opportunity' | 'warning' | 'neutral';
            summary: string;
        }[];
    };

    // 영역별 상세 분석
    life_areas: {
        career: DetailedSection;           // 직업/사업운
        wealth: DetailedSection;           // 재물운
        love: DetailedSection;             // 연애/배우자운
        health: DetailedSection;           // 건강운
    };

    // 특수 분석
    special_analysis: {
        noble_person: AnalysisSection;     // 귀인 분석
        charm: AnalysisSection;            // 매력살 분석
        conflicts: AnalysisSection;        // 합충형해파
    };

    // 운명의 상대 (Soulmate)
    soulmate?: {
        ideal_traits: string[];
        meeting_period: string;
        compatibility_score: number;
        description: string;
        warnings?: string;
    };

    // 럭키 에셋
    lucky_assets?: {
        colors: { name: string; hex: string; reason: string }[];
        foods: { name: string; emoji: string; benefit: string }[];
        places: { name: string; description: string }[];
    };

    // 액션 플랜
    action_plan: TimelineEvent[];

    // 용어집
    glossary?: {
        term: string;
        hanja: string;
        definition: string;
        context: string;
    }[];
}

// API 응답 타입
export interface CosmicReport {
    summary: {
        title: string;
        content: string;
        trust_score: number;
        trust_reason: string;
    };
    traits: CosmicTrait[];
    deep_dive: {
        saju: {
            balance: string;
            flow_10yr: string;
            flow_yearly: string;
        };
        astro: {
            natal: string;
            transit: string;
        };
        tarot: {
            spread_analysis: string;
            card_details: string;
        };
    };
    action_plan: {
        date: string;
        title: string;
        description: string;
        type: 'opportunity' | 'warning';
    }[];
}

// Legacy support
export interface EvaluationGraph {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
}
