/**
 * 자미두수(紫微斗數) 글로벌 i18n 사전
 * 12궁 및 14대 주성 현대적 비즈니스 번역 매핑
 */

export interface ZiweiPalaceTranslation {
  nameHanja: string;
  nameKo: string;
  nameEn: string;
  archetypeKo: string;
  archetypeEn: string;
}

export const ZIWEI_PALACES_I18N: Record<string, ZiweiPalaceTranslation> = {
  명궁: {
    nameHanja: '命宮',
    nameKo: '명궁 (인생 본체)',
    nameEn: 'Destiny Palace (Core Identity)',
    archetypeKo: '선천적 기질, 핵심 역량 및 인생의 기본 엔진',
    archetypeEn: 'Core identity, fundamental worldview, and natural drive.',
  },
  형제궁: {
    nameHanja: '兄弟宮',
    nameKo: '형제궁 (파트너십·동료)',
    nameEn: 'Siblings & Peers Palace',
    archetypeKo: '가장 가까운 동료, 형제, 비즈니스 공동 창업자와의 합',
    archetypeEn: 'Close peers, co-founders, and inner-circle collaborations.',
  },
  부처궁: {
    nameHanja: '夫妻宮',
    nameKo: '부처궁 (배우자·소울메이트)',
    nameEn: 'Spouse & Partnership Palace',
    archetypeKo: '결혼운, 배우자의 성향 및 깊은 연인 관계 패턴',
    archetypeEn: 'Romantic partner archetype and deep relationship dynamics.',
  },
  자녀궁: {
    nameHanja: '子女宮',
    nameKo: '자녀궁 (후배·프로젝트)',
    nameEn: 'Children & Creation Palace',
    archetypeKo: '자녀운, 후배 육성 및 내가 낳는 창작물/프로젝트',
    archetypeEn: 'Progeny, mentorship, and creative output/initiatives.',
  },
  재백궁: {
    nameHanja: '財帛宮',
    nameKo: '재백궁 (현금흐름·재테크)',
    nameEn: 'Wealth & Cash Flow Palace',
    archetypeKo: '돈을 버는 방식, 현금 유동성 관리 및 재정적 실리',
    archetypeEn: 'Earning style, liquidity management, and wealth monetization.',
  },
  질액궁: {
    nameHanja: '疾厄宮',
    nameKo: '질액궁 (건강·잠재스트레스)',
    nameEn: 'Health & Subconscious Palace',
    archetypeKo: '신체적 취약점, 내면의 숨겨진 스트레스 및 질병 방어',
    archetypeEn: 'Physical vitality, vulnerability, and subconscious stress points.',
  },
  천이궁: {
    nameHanja: '遷移宮',
    nameKo: '천이궁 (해외·대외활동)',
    nameEn: 'Travel & Global Mobility Palace',
    archetypeKo: '밖으로 나갔을 때의 운세, 해외 이동, 이직 및 사회적 평판',
    archetypeEn: 'External mobility, global expansion, and public projection.',
  },
  노복궁: {
    nameHanja: '奴僕宮',
    nameKo: '노복궁 (조직·고객·팔로워)',
    nameEn: 'Friends & Network Palace',
    archetypeKo: '부하직원, 고객군, 대중적 인기 및 커뮤니티 장악력',
    archetypeEn: 'User base, audience reception, and employee management.',
  },
  관록궁: {
    nameHanja: '官祿宮',
    nameKo: '관록궁 (커리어·사업운)',
    nameEn: 'Career & Authority Palace',
    archetypeKo: '직업적 성취, 승진, 사업의 지속 가능성 및 리더십',
    archetypeEn: 'Professional apex, executive career path, and enterprise stature.',
  },
  전택궁: {
    nameHanja: '田宅宮',
    nameKo: '전택궁 (부동산·안정자산)',
    nameEn: 'Property & Estate Palace',
    archetypeKo: '부동산 자산, 거주 환경 및 가문의 유산',
    archetypeEn: 'Real estate, permanent holdings, and family foundation.',
  },
  복덕궁: {
    nameHanja: '福德宮',
    nameKo: '복덕궁 (멘탈복·영성·행복)',
    nameEn: 'Karma & Spiritual Fulfillment Palace',
    archetypeKo: '정신적 만족도, 영적 직관, 스트레스 회복탄력성',
    archetypeEn: 'Inner peace, psychological resilience, and spiritual fortune.',
  },
  부모궁: {
    nameHanja: '父母宮',
    nameKo: '부모궁 (상사·국가기관)',
    nameEn: 'Parents & Institutional Sponsors Palace',
    archetypeKo: '부모님의 조력, 상사와의 관계, 정부/법적 인허가 운',
    archetypeEn: 'Institutional backing, governmental approvals, and elder allies.',
  },
};

export const ZIWEI_STARS_I18N: Record<string, { nameHanja: string; nameEn: string; archetypeKo: string }> = {
  자미: { nameHanja: '紫微', nameEn: 'Emperor Star (Zi Wei)', archetypeKo: '통솔력과 고결한 리더십의 황제성' },
  천기: { nameHanja: '天機', nameEn: 'Strategist Star (Tian Ji)', archetypeKo: '기획력과 데이터 두뇌의 책사성' },
  태양: { nameHanja: '太陽', nameEn: 'Sun Star (Tai Yang)', archetypeKo: '공공성과 열정적 추진력의 광명성' },
  무곡: { nameHanja: '武曲', nameEn: 'Finance General Star (Wu Qu)', archetypeKo: '강력한 실행력과 결단력의 재무성' },
  천동: { nameHanja: '天同', nameEn: 'Harmony Star (Tian Tong)', archetypeKo: '인화력과 감수성의 복덕성' },
  염정: { nameHanja: '廉貞', nameEn: 'Diplomat / Innovator (Lian Zhen)', archetypeKo: '정치력과 독창적 예술성의 승부사' },
  천부: { nameHanja: '天府', nameEn: 'Treasury Star (Tian Fu)', archetypeKo: '안정적 자산 관리와 포용력의 황후성' },
  태음: { nameHanja: '太陰', nameEn: 'Moon Star (Tai Yin)', archetypeKo: '섬세한 기획과 자산 축적의 감수성' },
  탐랑: { nameHanja: '貪狼', nameEn: 'Wolf of Ambition (Tan Lang)', archetypeKo: '욕망을 기회로 바꾸는 비즈니스 사교성' },
  거문: { nameHanja: '巨門', nameEn: 'Orator Star (Ju Men)', archetypeKo: '말과 글로 설득하는 논리적 스피치성' },
  천상: { nameHanja: '天相', nameEn: 'Prime Minister Star (Tian Xiang)', archetypeKo: '공정한 중재와 조력의 재상성' },
  천량: { nameHanja: '天梁', nameEn: 'Guardian Sage Star (Tian Liang)', archetypeKo: '위기를 해결하고 원칙을 지키는 멘토성' },
  칠살: { nameHanja: '七殺', nameEn: 'Vanguard Warrior (Qi Sha)', archetypeKo: '개척과 돌파의 단독 행동 장군성' },
  파군: { nameHanja: '破軍', nameEn: 'Disruptor Star (Po Jun)', archetypeKo: '기존 판을 엎고 새 판을 짜는 혁신성' },
};
