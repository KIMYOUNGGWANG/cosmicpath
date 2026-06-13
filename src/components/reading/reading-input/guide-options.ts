import type { ReadingContext } from '@/lib/ai/prompt-builder';
import {
    getOraclePersona,
    ORACLE_CHARACTER_IDS,
    type OracleCharacterId,
    type OracleQuestionIntent,
} from '@/lib/ai/oracle-personas';
import { getGuideAlternativeScore } from '@/components/reading/intake/guide-fit-copy';
import type { AlternativeGuideOption, ReadingLanguage } from './types';

type BuildAlternativeGuideOptionsInput = {
    readonly language: ReadingLanguage;
    readonly context: ReadingContext;
    readonly questionIntent: OracleQuestionIntent;
    readonly recommendedCharacterId: OracleCharacterId;
    readonly selectedCharacterId: OracleCharacterId;
};

export function buildAlternativeGuideOptions({
    language,
    context,
    questionIntent,
    recommendedCharacterId,
    selectedCharacterId,
}: BuildAlternativeGuideOptionsInput): readonly AlternativeGuideOption[] {
    const isEn = language === 'en';

    return ORACLE_CHARACTER_IDS
        .map((id, order) => {
            const persona = getOraclePersona(id);
            return {
                id,
                order,
                persona,
                strength: isEn ? persona.strengthsEn[0] : persona.strengthsKo[0],
                score: getGuideAlternativeScore(persona, context, questionIntent, recommendedCharacterId),
            };
        })
        .filter((item) => item.id !== selectedCharacterId)
        .sort((left, right) => {
            if (right.score !== left.score) return right.score - left.score;
            return left.order - right.order;
        })
        .slice(0, 2);
}
