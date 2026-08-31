import type { FixedCard, TarotArcana, TarotCard } from './types.ts';

export const MAJOR_ARCANA: readonly TarotArcana[] = [
  { id: 0, name: '바보', nameEn: 'The Fool', keywords: ['새로운 시작', '순수', '모험'], upright: '새로운 여정의 시작', reversed: '무모함, 경솔한 판단', image: '/images/tarot/0-fool.jpg' },
  { id: 1, name: '마법사', nameEn: 'The Magician', keywords: ['창조', '의지', '실행력'], upright: '목표 달성을 위한 도구 완비', reversed: '기만, 미숙한 실행', image: '/images/tarot/1-magician.jpg' },
  { id: 2, name: '여사제', nameEn: 'The High Priestess', keywords: ['직관', '지혜', '비밀'], upright: '내면의 통찰과 지혜', reversed: '비밀 누설, 차가운 단절', image: '/images/tarot/2-priestess.jpg' },
  { id: 3, name: '여황제', nameEn: 'The Empress', keywords: ['풍요', '모성', '결실'], upright: '물질적/감정적 풍요로움', reversed: '낭비, 과도한 의존', image: '/images/tarot/3-empress.jpg' },
  { id: 4, name: '황제', nameEn: 'The Emperor', keywords: ['권위', '안정', '통제'], upright: '확고한 리더십과 구조 확립', reversed: '독단적 폭력, 통제 상실', image: '/images/tarot/4-emperor.jpg' },
  { id: 5, name: '교황', nameEn: 'The Hierophant', keywords: ['전통', '가르침', '신뢰'], upright: '신뢰할 수 있는 조언과 멘토', reversed: '고루한 관습, 위선', image: '/images/tarot/5-hierophant.jpg' },
  { id: 6, name: '연인', nameEn: 'The Lovers', keywords: ['사랑', '선택', '조화'], upright: '중요한 선택과 감정적 결합', reversed: '갈등, 유혹에 흔들림', image: '/images/tarot/6-lovers.jpg' },
  { id: 7, name: '전차', nameEn: 'The Chariot', keywords: ['추진력', '승리', '의지'], upright: '장애물을 뚫고 전진하는 돌파력', reversed: '통제 불능, 방향 상실', image: '/images/tarot/7-chariot.jpg' },
  { id: 8, name: '힘', nameEn: 'Strength', keywords: ['인내', '용기', '부드러운 통제'], upright: '내면의 끈기와 포용력', reversed: '자기 회의, 충동적 분노', image: '/images/tarot/8-strength.jpg' },
  { id: 9, name: '은둔자', nameEn: 'The Hermit', keywords: ['성찰', '탐구', '고독'], upright: '깊은 내면의 진리 탐색', reversed: '고립, 외골수적 고집', image: '/images/tarot/9-hermit.jpg' },
  { id: 10, name: '운명의 수레바퀴', nameEn: 'Wheel of Fortune', keywords: ['전환점', '운명', '기회'], upright: '피할 수 없는 운의 전환과 기회', reversed: '정체, 불운한 지연', image: '/images/tarot/10-wheel.jpg' },
  { id: 11, name: '정의', nameEn: 'Justice', keywords: ['공정', '판단', '진실'], upright: '냉철하고 공정한 결단', reversed: '편견, 불공정한 대우', image: '/images/tarot/11-justice.jpg' },
  { id: 12, name: '매달린 사람', nameEn: 'The Hanged Man', keywords: ['희생', '새로운 관점', '기다림'], upright: '관점의 전환과 의미 있는 대기', reversed: '무의미한 희생, 완고함', image: '/images/tarot/12-hanged.jpg' },
  { id: 13, name: '죽음', nameEn: 'Death', keywords: ['종결', '변혁', '재생'], upright: '과거의 완전한 매듭과 새로운 시작', reversed: '변화 거부, 정체', image: '/images/tarot/13-death.jpg' },
  { id: 14, name: '절제', nameEn: 'Temperance', keywords: ['균형', '조화', '통합'], upright: '중용과 조화로운 융합', reversed: '극단적 불균형, 갈등', image: '/images/tarot/14-temperance.jpg' },
  { id: 15, name: '악마', nameEn: 'The Devil', keywords: ['집착', '속박', '유혹'], upright: '강한 물욕이나 관계의 집착 인지', reversed: '속박에서의 해방, 자각', image: '/images/tarot/15-devil.jpg' },
  { id: 16, name: '탑', nameEn: 'The Tower', keywords: ['급변', '충격', '각성'], upright: '예기치 못한 급격한 변화와 진실 규명', reversed: '재난 회피, 억지 유지', image: '/images/tarot/16-tower.jpg' },
  { id: 17, name: '별', nameEn: 'The Star', keywords: ['희망', '영감', '치유'], upright: '미래를 향한 긍정적 비전과 영감', reversed: '실망, 비관적 태도', image: '/images/tarot/17-star.jpg' },
  { id: 18, name: '달', nameEn: 'The Moon', keywords: ['불안', '환상', '의심'], upright: '불확실성과 안개 속을 걷는 신중함', reversed: '혼란 종식, 진실 발견', image: '/images/tarot/18-moon.jpg' },
  { id: 19, name: '태양', nameEn: 'The Sun', keywords: ['성공', '명료함', '활력'], upright: '밝은 성공과 명쾌한 성과', reversed: '일시적 구름, 과신', image: '/images/tarot/19-sun.jpg' },
  { id: 20, name: '심판', nameEn: 'Judgement', keywords: ['부활', '결단', '소명'], upright: '최종 결단의 순간과 소명 각성', reversed: '후회, 결단 회피', image: '/images/tarot/20-judgement.jpg' },
  { id: 21, name: '세계', nameEn: 'The World', keywords: ['완성', '통합', '성취'], upright: '한 주기의 완벽한 마무리와 성취', reversed: '미완성, 지연된 결말', image: '/images/tarot/21-world.jpg' },
];

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
