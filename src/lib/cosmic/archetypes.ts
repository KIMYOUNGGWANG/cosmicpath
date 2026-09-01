/**
 * 10대 일간(十干) 오행 페르소나 아키타입 사전
 * MZ세대 바이럴 및 인스타/스레드 공유 카드 최적화
 */

export interface SajuArchetype {
  stem: string; // 甲, 乙, ...
  element: '목' | '화' | '토' | '금' | '수';
  elementEn: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  titleKo: string;
  titleEn: string;
  subtitleKo: string;
  subtitleEn: string;
  quoteKo: string;
  quoteEn: string;
  nobleAlliesKo: string;
  nobleAlliesEn: string;
  frictionWarningKo: string;
  frictionWarningEn: string;
  keywordsKo: string[];
  keywordsEn: string[];
  gradientTheme: string;
  glowColor: string;
  emoji: string;
}

export const SAJU_ARCHETYPES: Record<string, SajuArchetype> = {
  '甲': {
    stem: '甲',
    element: '목',
    elementEn: 'Wood',
    titleKo: '숲의 거목 · 직진 불도저형 리더',
    titleEn: 'The Forest Sovereign · Bold Pioneer',
    subtitleKo: '어떤 역경에도 굴하지 않고 새로운 판을 개척하는 추진력',
    subtitleEn: 'Unshakable vision and decisive execution across uncharted territory',
    quoteKo: '“뿌리 깊은 거목은 바람에 흔들리지 않고 반드시 판을 바꾼다”',
    quoteEn: '“A deeply rooted giant tree shifts the board without wavering”',
    nobleAlliesKo: '己토 / 丙화 (소띠, 양띠)',
    nobleAlliesEn: 'Ji Earth / Bing Fire (Ox, Goat)',
    frictionWarningKo: '庚금 (충동적 마찰 조심)',
    frictionWarningEn: 'Geng Metal (Clashing impulses)',
    keywordsKo: ['압도적실행', '개척자', '돌파력', '천을귀인합류'],
    keywordsEn: ['Execution', 'Pioneer', 'Breakthrough', 'NobleAllies'],
    gradientTheme: 'from-emerald-500 via-teal-600 to-[#0d2818]',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    emoji: '🌲',
  },
  '乙': {
    stem: '乙',
    element: '목',
    elementEn: 'Wood',
    titleKo: '담쟁이 넝쿨 · 생존력 최강의 지략가',
    titleEn: 'The Resilient Vine · Master Strategist',
    subtitleKo: '어떤 환경에서도 길을 찾아내고 살아남는 유연한 적응력',
    subtitleEn: 'Unyielding flexibility that navigates any obstacle to flourish',
    quoteKo: '“부러지지 않고 휘어지며 결국 가장 높은 벽을 정복한다”',
    quoteEn: '“Bends without breaking to conquer the highest walls”',
    nobleAlliesKo: '庚금 / 壬수 (쥐띠, 원숭이띠)',
    nobleAlliesEn: 'Geng Metal / Ren Water (Rat, Monkey)',
    frictionWarningKo: '辛금 (예리한 스트레스)',
    frictionWarningEn: 'Xin Metal (Acute stress)',
    keywordsKo: ['유연한생존', '전략지략', '인맥확장', '기회포착'],
    keywordsEn: ['Adaptability', 'Strategy', 'Networking', 'Opportunity'],
    gradientTheme: 'from-teal-400 via-emerald-600 to-[#08201d]',
    glowColor: 'rgba(20, 184, 166, 0.3)',
    emoji: '🌿',
  },
  '丙': {
    stem: '丙',
    element: '화',
    elementEn: 'Fire',
    titleKo: '한낮의 태양 · 모든 판을 장악하는 혁신가',
    titleEn: 'The Solar Flare · Radiant Visionary',
    subtitleKo: '세상을 환하게 비추며 사람들을 끌어모으는 압도적 카리스마',
    subtitleEn: 'Magnificent charisma that illuminates and dominates every stage',
    quoteKo: '“태양은 숨지 않는다. 스스로 빛나며 길을 밝힐 뿐이다”',
    quoteEn: '“The sun never hides; it commands the horizon by shining”',
    nobleAlliesKo: '辛금 / 癸수 (돼지띠, 닭띠)',
    nobleAlliesEn: 'Xin Metal / Gui Water (Pig, Rooster)',
    frictionWarningKo: '壬수 (급격한 감정 충돌)',
    frictionWarningEn: 'Ren Water (Turbulent emotional wave)',
    keywordsKo: ['무한에너지', '카리스마', '혁신주도', '빛의파급력'],
    keywordsEn: ['InfiniteEnergy', 'Charisma', 'Innovation', 'Radiance'],
    gradientTheme: 'from-amber-400 via-rose-500 to-[#2c0e0e]',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    emoji: '☀️',
  },
  '丁': {
    stem: '丁',
    element: '화',
    elementEn: 'Fire',
    titleKo: '밤하늘의 촛불 · 본질을 꿰뚫는 디테일 장인',
    titleEn: 'The Sacred Flame · Deep Alchemist',
    subtitleKo: '어둠 속에서도 핵심을 포착하고 끝까지 몰입하는 집념',
    subtitleEn: 'Piercing insight and relentless focus that transforms the dark',
    quoteKo: '“작은 불씨 하나가 거대한 어둠을 온전히 밝힌다”',
    quoteEn: '“A single focused flame illuminates the deepest void”',
    nobleAlliesKo: '壬수 / 甲목 (돼지띠, 닭띠)',
    nobleAlliesEn: 'Ren Water / Jia Wood (Pig, Rooster)',
    frictionWarningKo: '癸수 (갑작스러운 냉각)',
    frictionWarningEn: 'Gui Water (Sudden cooling)',
    keywordsKo: ['초집중몰입', '디테일장인', '본질통찰', '영적직관'],
    keywordsEn: ['HyperFocus', 'Mastery', 'Insight', 'Intuition'],
    gradientTheme: 'from-rose-500 via-purple-600 to-[#1e0a24]',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    emoji: '🕯️',
  },
  '戊': {
    stem: '戊',
    element: '토',
    elementEn: 'Earth',
    titleKo: '거대한 태산 · 흔들림 없는 든든한 조력자',
    titleEn: 'The Grand Mountain · Unshakable Pillar',
    subtitleKo: '모든 사람과 자원을 품어내며 중심을 지키는 무게감',
    subtitleEn: 'Profound gravitational presence that anchors and protects all',
    quoteKo: '“태산은 침묵하나, 모든 만물이 그 품에서 자라난다”',
    quoteEn: '“The mountain stays silent, yet cradles all life”',
    nobleAlliesKo: '癸수 / 丁화 (소띠, 양띠)',
    nobleAlliesEn: 'Gui Water / Ding Fire (Ox, Goat)',
    frictionWarningKo: '甲목 (통제권 압박)',
    frictionWarningEn: 'Jia Wood (Control friction)',
    keywordsKo: ['압도적신뢰', '중심축', '포용력', '자산축적'],
    keywordsEn: ['DeepTrust', 'CoreAnchor', 'Embrace', 'WealthGrowth'],
    gradientTheme: 'from-amber-600 via-yellow-700 to-[#1f1606]',
    glowColor: 'rgba(217, 119, 6, 0.3)',
    emoji: '⛰️',
  },
  '己': {
    stem: '己',
    element: '토',
    elementEn: 'Earth',
    titleKo: '비옥한 대지 · 모든 것을 품는 실속형 프로듀서',
    titleEn: 'The Fertile Field · Master Producer',
    subtitleKo: '씨앗을 열매로 키워내고 실질적인 성과를 만들어내는 능력',
    subtitleEn: 'Nurturing intelligence that transforms raw ideas into bountiful reality',
    quoteKo: '“대지는 묵묵히 씨앗을 품어 황금빛 결실을 맺는다”',
    quoteEn: '“The fertile soil patiently turns seeds into golden harvests”',
    nobleAlliesKo: '甲목 / 丙화 (쥐띠, 원숭이띠)',
    nobleAlliesEn: 'Jia Wood / Bing Fire (Rat, Monkey)',
    frictionWarningKo: '乙목 (경계 침범 주의)',
    frictionWarningEn: 'Yi Wood (Boundary crossing)',
    keywordsKo: ['실속결실', '인재양성', '현실적감각', '재물보존'],
    keywordsEn: ['Pragmatic', 'Nurture', 'Realist', 'AssetPreserve'],
    gradientTheme: 'from-yellow-600 via-amber-700 to-[#1c1408]',
    glowColor: 'rgba(202, 138, 4, 0.3)',
    emoji: '🌾',
  },
  '庚': {
    stem: '庚',
    element: '금',
    elementEn: 'Metal',
    titleKo: '무쇠와 강철검 · 단칼에 결단을 내리는 승부사',
    titleEn: 'The Valyrian Blade · Decisive Commander',
    subtitleKo: '망설임 없이 불필요한 것을 쳐내고 판을 재편하는 결단력',
    subtitleEn: 'Razor-sharp discernment that cuts through noise to conquer',
    quoteKo: '“날카로운 칼날은 망설임을 베어내고 승리를 쟁취한다”',
    quoteEn: '“The sharp blade severs hesitation to claim decisive victory”',
    nobleAlliesKo: '乙목 / 丁화 (소띠, 양띠)',
    nobleAlliesEn: 'Yi Wood / Ding Fire (Ox, Goat)',
    frictionWarningKo: '丙화 (과열된 압박)',
    frictionWarningEn: 'Bing Fire (Overheated clash)',
    keywordsKo: ['단칼결단', '승부사', '원칙주의', '구조개혁'],
    keywordsEn: ['Decisive', 'Winner', 'Integrity', 'Restructure'],
    gradientTheme: 'from-slate-300 via-amber-200 to-[#171717]',
    glowColor: 'rgba(226, 232, 240, 0.35)',
    emoji: '⚔️',
  },
  '辛': {
    stem: '辛',
    element: '금',
    elementEn: 'Metal',
    titleKo: '다이아몬드 · 완벽주의적 날카로운 감각가',
    titleEn: 'The Diamond Core · Precision Artisan',
    subtitleKo: '고통의 연마를 거쳐 독보적인 가치와 아름다움을 뿜어내는 존재',
    subtitleEn: 'Polished through pressure to radiate singular, untouchable brilliance',
    quoteKo: '“세공된 보석은 어떤 어둠 속에서도 스스로의 가치를 입증한다”',
    quoteEn: '“A polished gem proves its supreme value even in pitch darkness”',
    nobleAlliesKo: '丙화 / 壬수 (말띠, 호랑이띠)',
    nobleAlliesEn: 'Bing Fire / Ren Water (Horse, Tiger)',
    frictionWarningKo: '丁화 (예민한 감정 소모)',
    frictionWarningEn: 'Ding Fire (Emotional burn)',
    keywordsKo: ['독보적가치', '완벽주의', '예리한감각', '고급화전략'],
    keywordsEn: ['SingularValue', 'Perfection', 'SharpTaste', 'Prestige'],
    gradientTheme: 'from-cyan-200 via-slate-400 to-[#0e1726]',
    glowColor: 'rgba(186, 230, 253, 0.35)',
    emoji: '💎',
  },
  '壬': {
    stem: '壬',
    element: '수',
    elementEn: 'Water',
    titleKo: '깊은 바다 · 무한한 확장성의 대전략가',
    titleEn: 'The Infinite Ocean · Grand Visionary',
    subtitleKo: '어떤 그릇에도 담기며 거대한 흐름을 만들어내는 지혜와 스케일',
    subtitleEn: 'Boundless depth and immense scale that shapes the global tide',
    quoteKo: '“바다는 모든 강물을 받아들이며 가장 거대한 판을 만든다”',
    quoteEn: '“The ocean embraces all rivers to orchestrate the grand tide”',
    nobleAlliesKo: '丁화 / 辛금 (토끼띠, 뱀띠)',
    nobleAlliesEn: 'Ding Fire / Xin Metal (Rabbit, Snake)',
    frictionWarningKo: '戊토 (벽에 부딪히는 답답함)',
    frictionWarningEn: 'Wu Earth (Blocked current)',
    keywordsKo: ['글로벌확장', '거시적안목', '지혜와융통', '거대한흐름'],
    keywordsEn: ['GlobalScale', 'Visionary', 'Wisdom', 'GrandTide'],
    gradientTheme: 'from-blue-500 via-indigo-700 to-[#060c24]',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    emoji: '🌊',
  },
  '癸': {
    stem: '癸',
    element: '수',
    elementEn: 'Water',
    titleKo: '봄날의 단비 · 조용히 스며들어 판을 바꾸는 킹메이커',
    titleEn: 'The Spring Mist · Subtle Kingmaker',
    subtitleKo: '드러나지 않게 사람의 마음을 얻고 판세를 뒤흔드는 심리 지략',
    subtitleEn: 'Quietly permeates hearts to decisively reshape the balance of power',
    quoteKo: '“소리 없이 내리는 단비가 마침내 온 세상을 소생시킨다”',
    quoteEn: '“The quiet spring rain gently revives the entire world”',
    nobleAlliesKo: '戊토 / 庚금 (토끼띠, 뱀띠)',
    nobleAlliesEn: 'Wu Earth / Geng Metal (Rabbit, Snake)',
    frictionWarningKo: '己토 (탁해지는 스트레스)',
    frictionWarningEn: 'Ji Earth (Murky confusion)',
    keywordsKo: ['심리통찰', '조용한장악', '킹메이커', '치유와생명'],
    keywordsEn: ['Psychology', 'SubtleDominance', 'Kingmaker', 'Vitality'],
    gradientTheme: 'from-sky-400 via-blue-600 to-[#08152e]',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    emoji: '🌧️',
  },
};

/**
 * 텍스트나 사주 결과에서 일간(Stem)을 추출하여 Archetype 반환
 */
export function getSajuArchetype(dayMaster?: string): SajuArchetype {
  if (!dayMaster) return SAJU_ARCHETYPES['甲'];

  const cleanStem = dayMaster.charAt(0);
  if (SAJU_ARCHETYPES[cleanStem]) {
    return SAJU_ARCHETYPES[cleanStem];
  }

  // 한글 매핑 지원 (갑, 을, 병, 정, 무, 기, 경, 신, 임, 계)
  const koreanMap: Record<string, string> = {
    '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊',
    '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸'
  };

  const mappedStem = koreanMap[cleanStem];
  if (mappedStem && SAJU_ARCHETYPES[mappedStem]) {
    return SAJU_ARCHETYPES[mappedStem];
  }

  return SAJU_ARCHETYPES['甲'];
}
