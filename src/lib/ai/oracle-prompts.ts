import { buildChatSystemPrompt, type ChatReadingData } from './prompt-builder';

/**
 * @deprecated Use buildChatSystemPrompt from src/lib/ai/prompt-builder.ts.
 * This wrapper remains temporarily for compatibility during prompt unification.
 */
export function buildOracleChatSystemPrompt(
    readingData: ChatReadingData,
    factsOfDestinyBlock?: string
): string {
    return buildChatSystemPrompt(readingData, 'ko', factsOfDestinyBlock);
}
