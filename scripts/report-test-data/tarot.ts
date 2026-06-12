import type { FixedCard, TarotArcana, TarotCard } from './types.ts';

function findCard(selection: FixedCard, arcana: readonly TarotArcana[]) {
  const card = arcana.find((item) => item.id === selection.id);
  if (!card) throw new Error(`Unknown tarot card id: ${selection.id}`);

  return card;
}

function buildCard(selection: FixedCard, arcana: readonly TarotArcana[]): TarotCard {
  const card = findCard(selection, arcana);

  return {
    id: card.id,
    name: card.name,
    nameEn: card.nameEn,
    keywords: card.keywords,
    interpretation: selection.reversed ? card.reversed : card.upright,
    isReversed: selection.reversed,
    image: card.image,
  };
}

export function buildTarotCards(cards: FixedCard[], arcana: readonly TarotArcana[]) {
  return cards.map((selection) => buildCard(selection, arcana));
}
