import type { ReadingContext } from '@/lib/ai/prompt-builder';
import type {
    OracleCharacterId,
    OraclePersonaProfile,
    OracleQuestionIntent,
} from '@/lib/ai/oracle-personas';

const INTENT_KEYWORDS_KO: Record<string, string[]> = {
    reunion: ['재회', '다시 만나', '다시만나', '다시 시작', '연락 올', '연락이 올', '돌아올'],
    business: ['사업', '창업', '부업', '사이드잡', '매출', '고객', '브랜드', '동업'],
    timing: ['언제', '시기', '타이밍', '몇 월', '몇월', '지금 움직', '언제쯤', '때가'],
    wealth: ['돈', '재물', '금전', '수입', '지출', '저축', '투자'],
    career: ['이직', '직장', '커리어', '진로', '면접', '승진', '취업'],
    compatibility: ['궁합', '잘 맞', '어울리', '관계', '연애', '결혼', '소개팅'],
};

const INTENT_KEYWORDS_EN: Record<string, string[]> = {
    reunion: ['ex', 'former', 'get back', 'reconcile', 'reunion', 'come back', 'breakup'],
    business: ['startup', 'business', 'client', 'customers', 'revenue', 'brand', 'partnership', 'founder'],
    timing: ['when', 'timing', 'which month', 'what month', 'best time', 'right time', 'window'],
    wealth: ['money', 'wealth', 'income', 'spending', 'savings', 'investment', 'debt'],
    career: ['job', 'career', 'work', 'promotion', 'interview', 'role', 'employment'],
    compatibility: ['compatibility', 'match', 'relationship', 'chemistry', 'dating', 'marriage', 'couple'],
};

const getMatchedKeyword = (
    question: string,
    intent: OracleQuestionIntent,
    language: 'ko' | 'en'
): string | null => {
    const map = language === 'en' ? INTENT_KEYWORDS_EN : INTENT_KEYWORDS_KO;
    const keywords = map[intent] ?? [];
    const normalized = question.trim().toLowerCase();

    return keywords.find((keyword) => normalized.includes(keyword)) ?? null;
};

export const getGuideFitCopy = (
    specialty: OracleQuestionIntent,
    guideName: string,
    language: 'ko' | 'en',
    question?: string
) => {
    const matchedKeyword = question ? getMatchedKeyword(question, specialty, language) : null;

    const copy = {
        general: {
            ko: `${guideName}는 질문 전체 흐름을 한 번에 정리하고, 지금 먼저 잡아야 할 한 가지를 또렷하게 보여줍니다.`,
            en: `${guideName} helps sort the whole picture first and shows the one move that matters most right now.`,
        },
        compatibility: {
            ko: matchedKeyword
                ? `질문에 "${matchedKeyword}" 키워드가 있어서 ${guideName}를 연결했습니다. 두 사람의 감정 온도와 리듬을 같이 봐서 관계가 실제로 굴러갈지를 더 자세히 읽어줍니다.`
                : `${guideName}는 두 사람의 감정 온도와 맞는 리듬을 같이 봐서, 관계가 실제로 잘 굴러갈지를 더 자세히 읽습니다.`,
            en: matchedKeyword
                ? `"${matchedKeyword}" in your question matched ${guideName}. They look at emotional chemistry and daily rhythm together.`
                : `${guideName} looks at emotional chemistry and daily rhythm together, so the relationship fit reads more clearly.`,
        },
        reunion: {
            ko: matchedKeyword
                ? `질문에 "${matchedKeyword}" 키워드가 있어서 ${guideName}를 먼저 연결했습니다. 다시 이어질 가능성과 반복될 패턴을 같이 짚어줍니다.`
                : `${guideName}는 다시 이어질 가능성과, 다시 만나도 반복될 문제를 같이 봐서 재회 질문에 특히 강합니다.`,
            en: matchedKeyword
                ? `"${matchedKeyword}" in your question matched ${guideName}. They read reconnection odds and repeating patterns together.`
                : `${guideName} is strong when you need to read reconnection odds and the pattern that could repeat after reunion.`,
        },
        wealth: {
            ko: matchedKeyword
                ? `질문에 "${matchedKeyword}" 키워드가 있어서 ${guideName}를 연결했습니다. 기대감보다 돈의 흐름과 손실 위험을 먼저 봐서 차분하게 정리합니다.`
                : `${guideName}는 기대감보다 돈의 흐름과 손실 위험을 먼저 봐서, 금전 질문을 더 차분하게 정리합니다.`,
            en: matchedKeyword
                ? `"${matchedKeyword}" in your question matched ${guideName}. They check cash flow and downside before hype.`
                : `${guideName} checks money flow and downside first, so financial questions stay grounded instead of hype-driven.`,
        },
        timing: {
            ko: matchedKeyword
                ? `질문에 "${matchedKeyword}" 키워드가 있어서 ${guideName}를 연결했습니다. 밀어붙일 때인지 기다릴 때인지를 더 선명하게 보여줍니다.`
                : `${guideName}는 지금 밀어붙일 때인지 기다릴 때인지에 집중해서, 행동 타이밍을 더 선명하게 보여줍니다.`,
            en: matchedKeyword
                ? `"${matchedKeyword}" in your question matched ${guideName}. They clarify whether this is the moment to move or wait.`
                : `${guideName} focuses on whether this is the moment to move or wait, which makes the timing feel much clearer.`,
        },
        career: {
            ko: matchedKeyword
                ? `질문에 "${matchedKeyword}" 키워드가 있어서 ${guideName}를 연결했습니다. 지금 역할이 맞는지, 옮길지 버틸지를 현실적으로 봐줍니다.`
                : `${guideName}는 지금 역할이 맞는지, 옮길지 버틸지를 현실적으로 봐서 커리어 질문에 잘 맞습니다.`,
            en: matchedKeyword
                ? `"${matchedKeyword}" in your question matched ${guideName}. They stay practical about role fit, moving, or holding ground.`
                : `${guideName} is strong for career questions because it stays practical about role fit, moving, or holding your ground.`,
        },
        business: {
            ko: matchedKeyword
                ? `질문에 "${matchedKeyword}" 키워드가 있어서 ${guideName}를 연결했습니다. 확장 욕심보다 구조와 검증 순서를 먼저 봐서 사업·부업 질문에 강합니다.`
                : `${guideName}는 확장 욕심보다 구조와 검증 순서를 먼저 봐서, 사업과 부업에 특히 잘 맞습니다.`,
            en: matchedKeyword
                ? `"${matchedKeyword}" in your question matched ${guideName}. They check structure and validation before expansion.`
                : `${guideName} is especially useful for business questions because it looks at structure and validation before expansion.`,
        },
    } satisfies Record<OracleQuestionIntent, { ko: string; en: string }>;

    return language === 'en' ? copy[specialty].en : copy[specialty].ko;
};

export const getGuideAlternativeScore = (
    persona: OraclePersonaProfile,
    context: ReadingContext,
    intent: OracleQuestionIntent,
    recommendedId: OracleCharacterId
) => {
    let score = 0;

    if (persona.id === recommendedId) score += 6;
    if (persona.specialty === intent) score += 4;
    if (persona.recommendedContexts.includes(context)) score += 3;

    return score;
};
