/**
 * 사주(四柱) 계산 엔진
 * korean-lunar-calendar 라이브러리 기반 정확한 만세력 산출 (KARI 표준)
 * 
 * 📚 데이터 기준: 사주명리학 시스템 지침 v1.0.3
 */

import KoreanLunarCalendar from 'korean-lunar-calendar';

// =====================================
// 천간 (天干) - 10개 완전 정규화 테이블
// =====================================
export interface StemData {
  index: number;
  hanja: string;
  hangul: string;
  english: string;
  element: keyof typeof FIVE_ELEMENTS;
  yinYang: '양' | '음';
}

export const HEAVENLY_STEMS_DATA: StemData[] = [
  { index: 0, hanja: '甲', hangul: '갑', english: 'Jia', element: 'wood', yinYang: '양' },
  { index: 1, hanja: '乙', hangul: '을', english: 'Yi', element: 'wood', yinYang: '음' },
  { index: 2, hanja: '丙', hangul: '병', english: 'Bing', element: 'fire', yinYang: '양' },
  { index: 3, hanja: '丁', hangul: '정', english: 'Ding', element: 'fire', yinYang: '음' },
  { index: 4, hanja: '戊', hangul: '무', english: 'Wu', element: 'earth', yinYang: '양' },
  { index: 5, hanja: '己', hangul: '기', english: 'Ji', element: 'earth', yinYang: '음' },
  { index: 6, hanja: '庚', hangul: '경', english: 'Geng', element: 'metal', yinYang: '양' },
  { index: 7, hanja: '辛', hangul: '신', english: 'Xin', element: 'metal', yinYang: '음' },
  { index: 8, hanja: '壬', hangul: '임', english: 'Ren', element: 'water', yinYang: '양' },
  { index: 9, hanja: '癸', hangul: '계', english: 'Gui', element: 'water', yinYang: '음' },
];

// 기존 호환성 유지
export const HEAVENLY_STEMS = HEAVENLY_STEMS_DATA.map(s => s.hangul) as unknown as readonly ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// =====================================
// 지지 (地支) - 12개 완전 정규화 테이블
// =====================================
export interface BranchData {
  index: number;
  hanja: string;
  hangul: string;
  english: string;
  element: keyof typeof FIVE_ELEMENTS;
  animal: string;
  animalEn: string;
}

export const EARTHLY_BRANCHES_DATA: BranchData[] = [
  { index: 0, hanja: '子', hangul: '자', english: 'Zi', element: 'water', animal: '쥐', animalEn: 'Rat' },
  { index: 1, hanja: '丑', hangul: '축', english: 'Chou', element: 'earth', animal: '소', animalEn: 'Ox' },
  { index: 2, hanja: '寅', hangul: '인', english: 'Yin', element: 'wood', animal: '호랑이', animalEn: 'Tiger' },
  { index: 3, hanja: '卯', hangul: '묘', english: 'Mao', element: 'wood', animal: '토끼', animalEn: 'Rabbit' },
  { index: 4, hanja: '辰', hangul: '진', english: 'Chen', element: 'earth', animal: '용', animalEn: 'Dragon' },
  { index: 5, hanja: '巳', hangul: '사', english: 'Si', element: 'fire', animal: '뱀', animalEn: 'Snake' },
  { index: 6, hanja: '午', hangul: '오', english: 'Wu', element: 'fire', animal: '말', animalEn: 'Horse' },
  { index: 7, hanja: '未', hangul: '미', english: 'Wei', element: 'earth', animal: '양', animalEn: 'Goat' },
  { index: 8, hanja: '申', hangul: '신', english: 'Shen', element: 'metal', animal: '원숭이', animalEn: 'Monkey' },
  { index: 9, hanja: '酉', hangul: '유', english: 'You', element: 'metal', animal: '닭', animalEn: 'Rooster' },
  { index: 10, hanja: '戌', hangul: '술', english: 'Xu', element: 'earth', animal: '개', animalEn: 'Dog' },
  { index: 11, hanja: '亥', hangul: '해', english: 'Hai', element: 'water', animal: '돼지', animalEn: 'Pig' },
];

// 기존 호환성 유지
export const EARTHLY_BRANCHES = EARTHLY_BRANCHES_DATA.map(b => b.hangul) as unknown as readonly ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// =====================================
// 오행 (五行) 확장
// =====================================
export const FIVE_ELEMENTS = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
} as const;

export const FIVE_ELEMENTS_HANJA: Record<keyof typeof FIVE_ELEMENTS, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// 상생/상극 관계
export const ELEMENT_RELATIONS = {
  generates: { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' },
  overcomes: { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' },
} as const;

// 천간별 오행 (기존 호환성)
const STEM_ELEMENTS: Record<string, keyof typeof FIVE_ELEMENTS> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water',
};

// 지지별 오행 (기존 호환성)
const BRANCH_ELEMENTS: Record<string, keyof typeof FIVE_ELEMENTS> = {
  '인': 'wood', '묘': 'wood',
  '사': 'fire', '오': 'fire',
  '진': 'earth', '술': 'earth', '축': 'earth', '미': 'earth',
  '신': 'metal', '유': 'metal',
  '해': 'water', '자': 'water',
};

// =====================================
// 12운성 (十二運星) 완전 테이블
// 행: 일간(日干), 열: 지지 → 12운성
// 사주명리학 시스템 지침 v1.0.3 기준
// =====================================
export const TWELVE_STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'] as const;
export type TwelveStageType = typeof TWELVE_STAGES[number];

export const TWELVE_STAGE_MATRIX: Record<string, Record<string, TwelveStageType>> = {
  // 일간 갑(甲) 기준 - 양목(陽木)
  '갑': {
    '자': '목욕', '축': '관대', '인': '건록', '묘': '제왕', '진': '쇠', '사': '병',
    '오': '사', '미': '묘', '신': '절', '유': '태', '술': '양', '해': '장생'
  },
  // 일간 을(乙) 기준 - 음목(陰木)
  '을': {
    '자': '병', '축': '쇠', '인': '제왕', '묘': '건록', '진': '관대', '사': '목욕',
    '오': '장생', '미': '양', '신': '태', '유': '절', '술': '묘', '해': '사'
  },
  // 일간 병(丙) 기준 - 양화(陽火)
  '병': {
    '자': '태', '축': '양', '인': '장생', '묘': '목욕', '진': '관대', '사': '건록',
    '오': '제왕', '미': '쇠', '신': '병', '유': '사', '술': '묘', '해': '절'
  },
  // 일간 정(丁) 기준 - 음화(陰火)
  '정': {
    '자': '절', '축': '묘', '인': '사', '묘': '병', '진': '쇠', '사': '제왕',
    '오': '건록', '미': '관대', '신': '목욕', '유': '장생', '술': '양', '해': '태'
  },
  // 일간 무(戊) 기준 - 양토(陽土) - 병(丙)과 동일
  '무': {
    '자': '태', '축': '양', '인': '장생', '묘': '목욕', '진': '관대', '사': '건록',
    '오': '제왕', '미': '쇠', '신': '병', '유': '사', '술': '묘', '해': '절'
  },
  // 일간 기(己) 기준 - 음토(陰土) - 정(丁)과 동일
  '기': {
    '자': '절', '축': '묘', '인': '사', '묘': '병', '진': '쇠', '사': '제왕',
    '오': '건록', '미': '관대', '신': '목욕', '유': '장생', '술': '양', '해': '태'
  },
  // 일간 경(庚) 기준 - 양금(陽金)
  '경': {
    '자': '사', '축': '묘', '인': '절', '묘': '태', '진': '양', '사': '장생',
    '오': '목욕', '미': '관대', '신': '건록', '유': '제왕', '술': '쇠', '해': '병'
  },
  // 일간 신(辛) 기준 - 음금(陰金)
  '신': {
    '자': '장생', '축': '양', '인': '태', '묘': '절', '진': '묘', '사': '사',
    '오': '병', '미': '쇠', '신': '제왕', '유': '건록', '술': '관대', '해': '목욕'
  },
  // 일간 임(壬) 기준 - 양수(陽水)
  '임': {
    '자': '제왕', '축': '쇠', '인': '병', '묘': '사', '진': '묘', '사': '절',
    '오': '태', '미': '양', '신': '장생', '유': '목욕', '술': '관대', '해': '건록'
  },
  // 일간 계(癸) 기준 - 음수(陰水)
  '계': {
    '자': '건록', '축': '관대', '인': '목욕', '묘': '장생', '진': '양', '사': '태',
    '오': '절', '미': '묘', '신': '사', '유': '병', '술': '쇠', '해': '제왕'
  }
};

// 12운성 성격 분류
export const TWELVE_STAGE_NATURE: Record<TwelveStageType, 'strong' | 'medium' | 'weak'> = {
  '장생': 'strong',   // 탄생, 시작
  '목욕': 'medium',   // 성장 초기
  '관대': 'strong',   // 성인, 관직
  '건록': 'strong',   // 정점 직전, 녹봉
  '제왕': 'strong',   // 최고점, 왕
  '쇠': 'medium',     // 하강 시작
  '병': 'weak',       // 쇠약
  '사': 'weak',       // 죽음
  '묘': 'weak',       // 무덤
  '절': 'weak',       // 끊어짐
  '태': 'medium',     // 잉태
  '양': 'medium',     // 양육
};

// =====================================
// 지장간 (支藏干) 완전 테이블
// 각 지지에 숨어있는 천간 (여기/중기/정기)
// 사주명리학 시스템 지침 v1.0.3 기준
// =====================================
export interface HiddenStem {
  yeogi?: string;    // 여기 (餘氣)
  junggi?: string;   // 중기 (中氣)
  jeonggi: string;   // 정기 (正氣) - 필수
}

export const HIDDEN_STEMS: Record<string, HiddenStem> = {
  '자': { yeogi: '임', jeonggi: '계' },                    // 子: 壬(여기), 癸(정기)
  '축': { yeogi: '계', junggi: '신', jeonggi: '기' },      // 丑: 癸, 辛, 己
  '인': { yeogi: '무', junggi: '병', jeonggi: '갑' },      // 寅: 戊, 丙, 甲
  '묘': { yeogi: '갑', jeonggi: '을' },                    // 卯: 甲(여기), 乙(정기)
  '진': { yeogi: '을', junggi: '계', jeonggi: '무' },      // 辰: 乙, 癸, 戊
  '사': { yeogi: '무', junggi: '경', jeonggi: '병' },      // 巳: 戊, 庚, 丙
  '오': { yeogi: '병', junggi: '기', jeonggi: '정' },      // 午: 丙, 己, 丁
  '미': { yeogi: '정', junggi: '을', jeonggi: '기' },      // 未: 丁, 乙, 己
  '신': { yeogi: '기', junggi: '임', jeonggi: '경' },      // 申: 己, 壬, 庚
  '유': { yeogi: '경', jeonggi: '신' },                    // 酉: 庚(여기), 辛(정기)
  '술': { yeogi: '신', junggi: '정', jeonggi: '무' },      // 戌: 辛, 丁, 戊
  '해': { yeogi: '무', junggi: '갑', jeonggi: '임' },      // 亥: 戊, 甲, 壬
};

// 지장간 가중치 (일수 기반)
export const HIDDEN_STEM_WEIGHT: Record<string, { yeogi?: number; junggi?: number; jeonggi: number }> = {
  '자': { yeogi: 10, jeonggi: 20 },
  '축': { yeogi: 9, junggi: 3, jeonggi: 18 },
  '인': { yeogi: 7, junggi: 7, jeonggi: 16 },
  '묘': { yeogi: 10, jeonggi: 20 },
  '진': { yeogi: 9, junggi: 3, jeonggi: 18 },
  '사': { yeogi: 7, junggi: 7, jeonggi: 16 },
  '오': { yeogi: 10, junggi: 9, jeonggi: 11 },
  '미': { yeogi: 9, junggi: 3, jeonggi: 18 },
  '신': { yeogi: 7, junggi: 7, jeonggi: 16 },
  '유': { yeogi: 10, jeonggi: 20 },
  '술': { yeogi: 9, junggi: 3, jeonggi: 18 },
  '해': { yeogi: 7, junggi: 7, jeonggi: 16 },
};

// =====================================
// 지지 상호작용 테이블 (Phase 3)
// 충/합/형/해/파 - 사주명리학 시스템 지침 v1.0.3 기준
// =====================================

// 충(沖) - 6쌍, 정반대 방향 충돌
export const BRANCH_CLASHES: [string, string][] = [
  ['자', '오'],  // 子午沖
  ['축', '미'],  // 丑未沖
  ['인', '신'],  // 寅申沖
  ['묘', '유'],  // 卯酉沖
  ['진', '술'],  // 辰戌沖
  ['사', '해'],  // 巳亥沖
];

// 육합(六合) - 6쌍, 친화 결합
export const BRANCH_COMBINES: { pair: [string, string]; element: keyof typeof FIVE_ELEMENTS }[] = [
  { pair: ['자', '축'], element: 'earth' },  // 子丑合土
  { pair: ['인', '해'], element: 'wood' },   // 寅亥合木
  { pair: ['묘', '술'], element: 'fire' },   // 卯戌合火
  { pair: ['진', '유'], element: 'metal' },  // 辰酉合金
  { pair: ['사', '신'], element: 'water' },  // 巳申合水
  { pair: ['오', '미'], element: 'fire' },   // 午未合火/土
];

// 삼합(三合) - 4종, 강력한 오행 강화
export const BRANCH_THREE_HARMONIES: { trio: [string, string, string]; element: keyof typeof FIVE_ELEMENTS }[] = [
  { trio: ['신', '자', '진'], element: 'water' },  // 申子辰 水局
  { trio: ['해', '묘', '미'], element: 'wood' },   // 亥卯未 木局
  { trio: ['인', '오', '술'], element: 'fire' },   // 寅午戌 火局
  { trio: ['사', '유', '축'], element: 'metal' },  // 巳酉丑 金局
];

// 방합/삼회(三會) - 계절방합
export const BRANCH_DIRECTIONAL: { trio: [string, string, string]; element: keyof typeof FIVE_ELEMENTS; season: string }[] = [
  { trio: ['인', '묘', '진'], element: 'wood', season: '봄/동방' },   // 寅卯辰 木
  { trio: ['사', '오', '미'], element: 'fire', season: '여름/남방' }, // 巳午未 火
  { trio: ['신', '유', '술'], element: 'metal', season: '가을/서방' },// 申酉戌 金
  { trio: ['해', '자', '축'], element: 'water', season: '겨울/북방' },// 亥子丑 水
];

// 형(刑) - 상해/처벌
export const BRANCH_PUNISHMENTS: { type: string; members: string[] }[] = [
  { type: '무례지형', members: ['자', '묘'] },           // 子卯刑 - 예의 없음
  { type: '지은지형', members: ['축', '술', '미'] },     // 丑戌未 삼형
  { type: '무은지형', members: ['인', '사', '신'] },     // 寅巳申 삼형
  { type: '자형', members: ['진', '진'] },               // 辰辰刑
  { type: '자형', members: ['오', '오'] },               // 午午刑
  { type: '자형', members: ['유', '유'] },               // 酉酉刑
  { type: '자형', members: ['해', '해'] },               // 亥亥刑
];

// 해(害) - 육합 방해
export const BRANCH_HARMS: [string, string][] = [
  ['자', '미'],  // 子未害
  ['축', '오'],  // 丑午害
  ['인', '사'],  // 寅巳害
  ['묘', '진'],  // 卯辰害
  ['신', '해'],  // 申亥害
  ['유', '술'],  // 酉戌害
];

// 파(破) - 내부 파괴
export const BRANCH_BREAKS: [string, string][] = [
  ['자', '유'],  // 子酉破
  ['축', '진'],  // 丑辰破
  ['인', '해'],  // 寅亥破
  ['묘', '오'],  // 卯午破
  ['사', '신'],  // 巳申破
  ['미', '술'],  // 未戌破  
];

// 공망(空亡) 테이블 - 60갑자 순별
export const VOID_TABLE: Record<string, [string, string]> = {
  // 갑자순 (1-10번): 술, 해 공망
  '갑자': ['술', '해'], '을축': ['술', '해'], '병인': ['술', '해'], '정묘': ['술', '해'], '무진': ['술', '해'],
  '기사': ['술', '해'], '경오': ['술', '해'], '신미': ['술', '해'], '임신': ['술', '해'], '계유': ['술', '해'],
  // 갑술순 (11-20번): 신, 유 공망
  '갑술': ['신', '유'], '을해': ['신', '유'], '병자': ['신', '유'], '정축': ['신', '유'], '무인': ['신', '유'],
  '기묘': ['신', '유'], '경진': ['신', '유'], '신사': ['신', '유'], '임오': ['신', '유'], '계미': ['신', '유'],
  // 갑신순 (21-30번): 오, 미 공망
  '갑신': ['오', '미'], '을유': ['오', '미'], '병술': ['오', '미'], '정해': ['오', '미'], '무자': ['오', '미'],
  '기축': ['오', '미'], '경인': ['오', '미'], '신묘': ['오', '미'], '임진': ['오', '미'], '계사': ['오', '미'],
  // 갑오순 (31-40번): 진, 사 공망
  '갑오': ['진', '사'], '을미': ['진', '사'], '병신': ['진', '사'], '정유': ['진', '사'], '무술': ['진', '사'],
  '기해': ['진', '사'], '경자': ['진', '사'], '신축': ['진', '사'], '임인': ['진', '사'], '계묘': ['진', '사'],
  // 갑진순 (41-50번): 인, 묘 공망
  '갑진': ['인', '묘'], '을사': ['인', '묘'], '병오': ['인', '묘'], '정미': ['인', '묘'], '무신': ['인', '묘'],
  '기유': ['인', '묘'], '경술': ['인', '묘'], '신해': ['인', '묘'], '임자': ['인', '묘'], '계축': ['인', '묘'],
  // 갑인순 (51-60번): 자, 축 공망
  '갑인': ['자', '축'], '을묘': ['자', '축'], '병진': ['자', '축'], '정사': ['자', '축'], '무오': ['자', '축'],
  '기미': ['자', '축'], '경신': ['자', '축'], '신유': ['자', '축'], '임술': ['자', '축'], '계해': ['자', '축'],
};

// 지지 상호작용 결과 인터페이스
export interface BranchInteraction {
  type: '충' | '합' | '삼합' | '방합' | '형' | '해' | '파';
  branches: string[];
  element?: keyof typeof FIVE_ELEMENTS;  // 합/삼합/방합의 경우
  description: string;
}

// 십신 (十神) 정의
export const TEN_GODS = {
  bijian: '비견',     // 比肩 - 같은 오행, 같은 음양
  gepcae: '겁재',     // 劫財 - 같은 오행, 다른 음양
  sikshin: '식신',    // 食神 - 내가 생하는 오행, 같은 음양
  sanggwan: '상관',   // 傷官 - 내가 생하는 오행, 다른 음양
  pyeonjae: '편재',   // 偏財 - 내가 극하는 오행, 같은 음양
  jeongjae: '정재',   // 正財 - 내가 극하는 오행, 다른 음양
  pyeongwan: '편관',  // 偏官 (七殺) - 나를 극하는 오행, 같은 음양
  jeonggwan: '정관',  // 正官 - 나를 극하는 오행, 다른 음양
  pyeonin: '편인',    // 偏印 - 나를 생하는 오행, 같은 음양
  jeongin: '정인',    // 正印 - 나를 생하는 오행, 다른 음양
} as const;

// =====================================
// 십신 매핑 매트릭스 (10×10 완전 테이블)
// 행: 일간(日干), 열: 대상 천간 → 십신
// 사주명리학 시스템 지침 v1.0.3 기준
// =====================================
export const TEN_GOD_MATRIX: Record<string, Record<string, string>> = {
  // 일간 갑(甲) 기준
  '갑': {
    '갑': '비견', '을': '겁재', '병': '식신', '정': '상관', '무': '편재',
    '기': '정재', '경': '편관', '신': '정관', '임': '편인', '계': '정인'
  },
  // 일간 을(乙) 기준
  '을': {
    '갑': '겁재', '을': '비견', '병': '상관', '정': '식신', '무': '정재',
    '기': '편재', '경': '정관', '신': '편관', '임': '정인', '계': '편인'
  },
  // 일간 병(丙) 기준
  '병': {
    '갑': '편인', '을': '정인', '병': '비견', '정': '겁재', '무': '식신',
    '기': '상관', '경': '편재', '신': '정재', '임': '편관', '계': '정관'
  },
  // 일간 정(丁) 기준
  '정': {
    '갑': '정인', '을': '편인', '병': '겁재', '정': '비견', '무': '상관',
    '기': '식신', '경': '정재', '신': '편재', '임': '정관', '계': '편관'
  },
  // 일간 무(戊) 기준
  '무': {
    '갑': '편관', '을': '정관', '병': '편인', '정': '정인', '무': '비견',
    '기': '겁재', '경': '식신', '신': '상관', '임': '편재', '계': '정재'
  },
  // 일간 기(己) 기준
  '기': {
    '갑': '정관', '을': '편관', '병': '정인', '정': '편인', '무': '겁재',
    '기': '비견', '경': '상관', '신': '식신', '임': '정재', '계': '편재'
  },
  // 일간 경(庚) 기준
  '경': {
    '갑': '편재', '을': '정재', '병': '편관', '정': '정관', '무': '편인',
    '기': '정인', '경': '비견', '신': '겁재', '임': '식신', '계': '상관'
  },
  // 일간 신(辛) 기준
  '신': {
    '갑': '정재', '을': '편재', '병': '정관', '정': '편관', '무': '정인',
    '기': '편인', '경': '겁재', '신': '비견', '임': '상관', '계': '식신'
  },
  // 일간 임(壬) 기준
  '임': {
    '갑': '식신', '을': '상관', '병': '편재', '정': '정재', '무': '편관',
    '기': '정관', '경': '편인', '신': '정인', '임': '비견', '계': '겁재'
  },
  // 일간 계(癸) 기준
  '계': {
    '갑': '상관', '을': '식신', '병': '정재', '정': '편재', '무': '정관',
    '기': '편관', '경': '정인', '신': '편인', '임': '겁재', '계': '비견'
  }
};

// 십신 그룹 분류
export const TEN_GOD_GROUPS = {
  companion: ['비견', '겁재'],     // 비겁
  output: ['식신', '상관'],        // 식상
  wealth: ['정재', '편재'],        // 재성
  power: ['정관', '편관'],         // 관성
  resource: ['정인', '편인'],      // 인성
} as const;

// 십신 영문명 매핑
export const TEN_GOD_ENGLISH: Record<string, string> = {
  '비견': 'Companion (Bijian)',
  '겁재': 'Rob Wealth (Geopjae)',
  '식신': 'Eating God (Sikshin)',
  '상관': 'Hurting Officer (Sanggwan)',
  '편재': 'Indirect Wealth (Pyeonjae)',
  '정재': 'Direct Wealth (Jeongjae)',
  '편관': 'Seven Killings (Pyeongwan)',
  '정관': 'Direct Officer (Jeonggwan)',
  '편인': 'Indirect Seal (Pyeonin)',
  '정인': 'Direct Seal (Jeongin)',
};

// 사주 결과 타입
export interface SajuResult {
  yeonPillar: { stem: string; branch: string; };
  monthPillar: { stem: string; branch: string; };
  dayPillar: { stem: string; branch: string; };
  hourPillar: { stem: string; branch: string; };
  dayMaster: string;  // 일간 (日干) - 자신을 나타냄
  elements: {
    stem: keyof typeof FIVE_ELEMENTS;
    branch: keyof typeof FIVE_ELEMENTS;
  }[];
  tenGods: Record<string, string>;
  // Phase 2: 12운성 추가
  twelveStages?: {
    year: TwelveStageType;
    month: TwelveStageType;
    day: TwelveStageType;
    hour: TwelveStageType;
  };
  // Phase 2: 지장간 추가
  hiddenStems?: {
    year: HiddenStem;
    month: HiddenStem;
    day: HiddenStem;
    hour: HiddenStem;
  };
  // Phase 3: 지지 상호작용 추가
  interactions?: {
    clashes: BranchInteraction[];      // 충
    combines: BranchInteraction[];     // 육합
    threeHarmonies: BranchInteraction[]; // 삼합
    directionals: BranchInteraction[];  // 방합
    punishments: BranchInteraction[];   // 형
    harms: BranchInteraction[];         // 해
    breaks: BranchInteraction[];        // 파
    voids: string[];                    // 공망 지지
  };
  // Phase 4: 격국 추가
  gyeokguk?: GyeokgukResult;
  // Phase 5: 용신 강화 추가
  enhancedYongsin?: EnhancedYongsinResult;
  // Phase 6: 신살 추가
  shinSal?: ShinSalResult;
  // 추가: 원본 간지 문자열 (검증용)
  rawGapja?: {
    year: string;
    month: string;
    day: string;
  };
}

// =====================================
// 12운성 / 지장간 계산 함수
// =====================================

/**
 * 12운성 계산
 * 일간을 기준으로 각 지지의 12운성을 판정
 */
export function calculateTwelveStage(dayMaster: string, branch: string): TwelveStageType {
  const matrix = TWELVE_STAGE_MATRIX[dayMaster];
  if (!matrix || !matrix[branch]) {
    console.warn(`Unknown day master or branch: ${dayMaster}, ${branch}`);
    return '쇠'; // 기본값
  }
  return matrix[branch];
}

/**
 * 사주 전체의 12운성 계산
 */
export function calculateAllTwelveStages(
  dayMaster: string,
  branches: { year: string; month: string; day: string; hour: string }
): { year: TwelveStageType; month: TwelveStageType; day: TwelveStageType; hour: TwelveStageType } {
  return {
    year: calculateTwelveStage(dayMaster, branches.year),
    month: calculateTwelveStage(dayMaster, branches.month),
    day: calculateTwelveStage(dayMaster, branches.day),
    hour: calculateTwelveStage(dayMaster, branches.hour),
  };
}

/**
 * 지장간 조회
 * 지지에 숨어있는 천간(여기/중기/정기) 반환
 */
export function getHiddenStems(branch: string): HiddenStem {
  const hidden = HIDDEN_STEMS[branch];
  if (!hidden) {
    console.warn(`Unknown branch for hidden stems: ${branch}`);
    return { jeonggi: '무' }; // 기본값
  }
  return hidden;
}

/**
 * 사주 전체의 지장간 계산
 */
export function calculateAllHiddenStems(
  branches: { year: string; month: string; day: string; hour: string }
): { year: HiddenStem; month: HiddenStem; day: HiddenStem; hour: HiddenStem } {
  return {
    year: getHiddenStems(branches.year),
    month: getHiddenStems(branches.month),
    day: getHiddenStems(branches.day),
    hour: getHiddenStems(branches.hour),
  };
}

/**
 * 12운성 강약 판정
 * 일간의 현재 상태가 강한지, 중간인지, 약한지 판정
 */
export function getTwelveStageStrength(stage: TwelveStageType): 'strong' | 'medium' | 'weak' {
  return TWELVE_STAGE_NATURE[stage];
}

/**
 * 득령(得令) 판정
 * 일간이 월지에서 왕성한 12운성(장생/관대/건록/제왕)을 얻었는지 확인
 */
export function checkDeungryeong(dayMaster: string, monthBranch: string): boolean {
  const stage = calculateTwelveStage(dayMaster, monthBranch);
  const strongStages: TwelveStageType[] = ['장생', '관대', '건록', '제왕'];
  return strongStages.includes(stage);
}

// =====================================
// 지지 상호작용 판정 함수 (Phase 3)
// =====================================

/**
 * 충(沖) 판정
 * 두 지지가 충 관계인지 확인
 */
export function detectClash(branch1: string, branch2: string): boolean {
  return BRANCH_CLASHES.some(([a, b]) =>
    (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
  );
}

/**
 * 사주 전체에서 충 찾기
 */
export function detectAllClashes(branches: string[]): BranchInteraction[] {
  const clashes: BranchInteraction[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (detectClash(branches[i], branches[j])) {
        clashes.push({
          type: '충',
          branches: [branches[i], branches[j]],
          description: `${branches[i]}${branches[j]}충`
        });
      }
    }
  }
  return clashes;
}

/**
 * 육합(六合) 판정
 */
export function detectCombine(branch1: string, branch2: string): { found: boolean; element?: keyof typeof FIVE_ELEMENTS } {
  const combine = BRANCH_COMBINES.find(({ pair }) =>
    (pair[0] === branch1 && pair[1] === branch2) || (pair[0] === branch2 && pair[1] === branch1)
  );
  return combine ? { found: true, element: combine.element } : { found: false };
}

/**
 * 사주 전체에서 육합 찾기
 */
export function detectAllCombines(branches: string[]): BranchInteraction[] {
  const combines: BranchInteraction[] = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const result = detectCombine(branches[i], branches[j]);
      if (result.found) {
        combines.push({
          type: '합',
          branches: [branches[i], branches[j]],
          element: result.element,
          description: `${branches[i]}${branches[j]}합${result.element ? FIVE_ELEMENTS[result.element] : ''}`
        });
      }
    }
  }
  return combines;
}

/**
 * 삼합(三合) 판정
 * 세 지지가 모두 있거나 반합(2개)인 경우도 체크
 */
export function detectThreeHarmony(branches: string[]): BranchInteraction[] {
  const results: BranchInteraction[] = [];

  for (const { trio, element } of BRANCH_THREE_HARMONIES) {
    const present = trio.filter(b => branches.includes(b));

    if (present.length === 3) {
      // 완전 삼합
      results.push({
        type: '삼합',
        branches: present,
        element,
        description: `${present.join('')} ${FIVE_ELEMENTS[element]}국 (완전삼합)`
      });
    } else if (present.length === 2) {
      // 반합 (중심 지지 포함 여부 확인)
      const center = trio[1]; // 중심 지지
      if (present.includes(center)) {
        results.push({
          type: '삼합',
          branches: present,
          element,
          description: `${present.join('')} ${FIVE_ELEMENTS[element]}국 (반합)`
        });
      }
    }
  }

  return results;
}

/**
 * 방합/삼회(三會) 판정
 */
export function detectDirectional(branches: string[]): BranchInteraction[] {
  const results: BranchInteraction[] = [];

  for (const { trio, element, season } of BRANCH_DIRECTIONAL) {
    const present = trio.filter(b => branches.includes(b));

    if (present.length === 3) {
      results.push({
        type: '방합',
        branches: present,
        element,
        description: `${present.join('')} ${season} ${FIVE_ELEMENTS[element]}국`
      });
    }
  }

  return results;
}

/**
 * 형(刑) 판정
 */
export function detectPunishments(branches: string[]): BranchInteraction[] {
  const results: BranchInteraction[] = [];

  for (const { type, members } of BRANCH_PUNISHMENTS) {
    if (type === '자형') {
      // 자형은 같은 지지가 2개 이상 있어야 함
      const target = members[0];
      const count = branches.filter(b => b === target).length;
      if (count >= 2) {
        results.push({
          type: '형',
          branches: [target, target],
          description: `${target}${target}형 (${type})`
        });
      }
    } else {
      // 이형/삼형은 members 중 2개 이상이 있어야 함
      const present = members.filter(b => branches.includes(b));
      if (present.length >= 2) {
        results.push({
          type: '형',
          branches: present,
          description: `${present.join('')}형 (${type})`
        });
      }
    }
  }

  return results;
}

/**
 * 해(害) 판정
 */
export function detectHarms(branches: string[]): BranchInteraction[] {
  const results: BranchInteraction[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const isHarm = BRANCH_HARMS.some(([a, b]) =>
        (a === branches[i] && b === branches[j]) || (a === branches[j] && b === branches[i])
      );
      if (isHarm) {
        results.push({
          type: '해',
          branches: [branches[i], branches[j]],
          description: `${branches[i]}${branches[j]}해`
        });
      }
    }
  }

  return results;
}

/**
 * 파(破) 판정
 */
export function detectBreaks(branches: string[]): BranchInteraction[] {
  const results: BranchInteraction[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const isBreak = BRANCH_BREAKS.some(([a, b]) =>
        (a === branches[i] && b === branches[j]) || (a === branches[j] && b === branches[i])
      );
      if (isBreak) {
        results.push({
          type: '파',
          branches: [branches[i], branches[j]],
          description: `${branches[i]}${branches[j]}파`
        });
      }
    }
  }

  return results;
}

/**
 * 공망(空亡) 판정
 * 일주를 기준으로 어떤 지지가 공망인지 확인
 */
export function getVoidBranches(dayStem: string, dayBranch: string): [string, string] {
  const dayPillar = dayStem + dayBranch;
  return VOID_TABLE[dayPillar] || ['미확정', '미확정'];
}

/**
 * 사주에서 공망에 해당하는 지지 찾기
 */
export function detectVoids(
  dayStem: string,
  dayBranch: string,
  branches: string[]
): string[] {
  const [void1, void2] = getVoidBranches(dayStem, dayBranch);
  return branches.filter(b => b === void1 || b === void2);
}

/**
 * 전체 지지 상호작용 분석
 */
export function analyzeAllInteractions(
  branches: string[],
  dayStem: string,
  dayBranch: string
): SajuResult['interactions'] {
  return {
    clashes: detectAllClashes(branches),
    combines: detectAllCombines(branches),
    threeHarmonies: detectThreeHarmony(branches),
    directionals: detectDirectional(branches),
    punishments: detectPunishments(branches),
    harms: detectHarms(branches),
    breaks: detectBreaks(branches),
    voids: detectVoids(dayStem, dayBranch, branches),
  };
}

// =====================================
// 격국 (格局) 판정 시스템 (Phase 4)
// 사주명리학 시스템 지침 v1.0.3 기준
// =====================================

// 격국 타입 정의
export type GyeokgukType =
  | '정관격'   // 正官格
  | '편관격'   // 偏官格 (七殺格)
  | '정재격'   // 正財格
  | '편재격'   // 偏財格
  | '정인격'   // 正印格
  | '편인격'   // 偏印格 (梟神格)
  | '식신격'   // 食神格
  | '상관격'   // 傷官格
  | '건록격'   // 建祿格
  | '양인격'   // 羊刃格
  | '보통격';  // 普通格 (격국 불성립)

// 격국 판정 결과
export interface GyeokgukResult {
  type: GyeokgukType;
  basis: string;           // 판정 근거
  monthJeonggi: string;    // 월지 정기
  monthTenGod: string;     // 월지 정기의 십신
  isTouchu: boolean;       // 투출 여부
  isTongguen: boolean;     // 통근 여부
  isPure: boolean;         // 청순 여부
  strength: 'strong' | 'medium' | 'weak';
}

/**
 * 월지 정기(正氣)로 격국 십신 판정
 * 격국은 월지 정기가 일간에 대해 어떤 십신인지로 결정
 */
export function getMonthJeonggiTenGod(dayMaster: string, monthBranch: string): string {
  const hidden = HIDDEN_STEMS[monthBranch];
  if (!hidden) return '알수없음';

  const jeonggi = hidden.jeonggi;
  const matrix = TEN_GOD_MATRIX[dayMaster];

  if (!matrix || !matrix[jeonggi]) return '알수없음';
  return matrix[jeonggi];
}

/**
 * 투출(透出) 확인
 * 월지 정기가 천간 4주 중 하나라도 나타났는지 확인
 */
export function checkTouchu(monthBranch: string, stems: string[]): boolean {
  const hidden = HIDDEN_STEMS[monthBranch];
  if (!hidden) return false;

  const jeonggi = hidden.jeonggi;
  return stems.includes(jeonggi);
}

/**
 * 통근(通根) 확인
 * 투출된 천간이 지지에 뿌리(같은 오행)가 있는지 확인
 */
export function checkTongguen(stem: string, branches: string[]): boolean {
  const stemElement = STEM_ELEMENTS[stem];
  if (!stemElement) return false;

  return branches.some(branch => {
    const branchElement = BRANCH_ELEMENTS[branch];
    return branchElement === stemElement;
  });
}

/**
 * 청순(淸純) 확인
 * 해당 십신이 혼잡 없이 주도적인지 확인
 * 특히 관살혼잡 체크
 */
export function checkPurity(
  gyeokTenGod: string,
  tenGods: Record<string, string>,
  dayMaster: string,
  stems: string[]
): boolean {
  // 관살혼잡 체크: 정관과 편관이 동시에 있으면 불순
  const tenGodValues = Object.values(tenGods);
  const hasJeonggwan = tenGodValues.includes('정관');
  const hasPyeongwan = tenGodValues.includes('편관');

  if ((gyeokTenGod === '정관' || gyeokTenGod === '편관') && hasJeonggwan && hasPyeongwan) {
    return false; // 관살혼잡
  }

  // 상관견관 체크: 상관격인데 정관이 있으면 불순
  if (gyeokTenGod === '상관' && hasJeonggwan) {
    return false; // 상관견관
  }

  return true;
}

/**
 * 건록/양인 특수격 판정
 * 월지가 일간의 건록 또는 제왕(양인)인 경우
 */
export function checkSpecialStructure(dayMaster: string, monthBranch: string): GyeokgukType | null {
  const stage = TWELVE_STAGE_MATRIX[dayMaster]?.[monthBranch];

  if (stage === '건록') {
    return '건록격';
  }

  if (stage === '제왕') {
    // 양인격은 양간(陽干)만 적용
    const isYangGan = ['갑', '병', '무', '경', '임'].includes(dayMaster);
    if (isYangGan) {
      return '양인격';
    }
  }

  return null;
}

/**
 * 격국 판정 메인 함수
 * 3문(三問) 절차: 투출 → 통근 → 청순
 */
export function determineGyeokguk(
  dayMaster: string,
  monthBranch: string,
  stems: string[],
  branches: string[],
  tenGods: Record<string, string>
): GyeokgukResult {
  // 1. 특수격(건록격/양인격) 우선 체크
  const specialGyeok = checkSpecialStructure(dayMaster, monthBranch);
  if (specialGyeok) {
    const stage = TWELVE_STAGE_MATRIX[dayMaster]?.[monthBranch] || '건록';
    return {
      type: specialGyeok,
      basis: `월지 ${monthBranch}가 일간 ${dayMaster}의 ${stage}지`,
      monthJeonggi: HIDDEN_STEMS[monthBranch]?.jeonggi || '',
      monthTenGod: '비견', // 건록/양인은 비겁 계열
      isTouchu: true,
      isTongguen: true,
      isPure: true,
      strength: 'strong'
    };
  }

  // 2. 월지 정기 -> 십신 판정
  const hidden = HIDDEN_STEMS[monthBranch];
  if (!hidden) {
    return {
      type: '보통격',
      basis: '월지 지장간 확인 불가',
      monthJeonggi: '',
      monthTenGod: '',
      isTouchu: false,
      isTongguen: false,
      isPure: false,
      strength: 'weak'
    };
  }

  const jeonggi = hidden.jeonggi;
  const monthTenGod = TEN_GOD_MATRIX[dayMaster]?.[jeonggi] || '알수없음';

  // 3. 1문: 투출(透出) 여부
  const isTouchu = checkTouchu(monthBranch, stems);

  // 4. 2문: 통근(通根) 여부
  const isTongguen = isTouchu ? checkTongguen(jeonggi, branches) : false;

  // 5. 3문: 청순(淸純) 여부
  const isPure = checkPurity(monthTenGod, tenGods, dayMaster, stems);

  // 6. 격국 결정
  let gyeokType: GyeokgukType = '보통격';
  let strength: 'strong' | 'medium' | 'weak' = 'weak';

  if (isTouchu && isTongguen && isPure) {
    // 완전 성립
    strength = 'strong';
  } else if (isTouchu || isTongguen) {
    // 부분 성립
    strength = 'medium';
  }

  // 십신에 따른 격국 명칭
  switch (monthTenGod) {
    case '정관': gyeokType = '정관격'; break;
    case '편관': gyeokType = '편관격'; break;
    case '정재': gyeokType = '정재격'; break;
    case '편재': gyeokType = '편재격'; break;
    case '정인': gyeokType = '정인격'; break;
    case '편인': gyeokType = '편인격'; break;
    case '식신': gyeokType = '식신격'; break;
    case '상관': gyeokType = '상관격'; break;
    case '비견':
    case '겁재':
      gyeokType = '건록격'; // 비겁은 건록격 계열
      break;
    default:
      gyeokType = '보통격';
  }

  // 불순한 경우 격국 약화
  if (!isPure && gyeokType !== '보통격') {
    strength = 'weak';
  }

  return {
    type: gyeokType,
    basis: `월지 ${monthBranch}의 정기 ${jeonggi}(${monthTenGod})`,
    monthJeonggi: jeonggi,
    monthTenGod,
    isTouchu,
    isTongguen,
    isPure,
    strength
  };
}

/**
 * 격국 강도 설명
 */
export function getGyeokgukDescription(result: GyeokgukResult): string {
  if (result.strength === 'strong') {
    return `${result.type} 완전 성립 (투출+통근+청순)`;
  } else if (result.strength === 'medium') {
    return `${result.type} 부분 성립`;
  } else {
    return `${result.type} 약함 또는 불성립`;
  }
}

// =====================================
// 용신 (用神) 강화 시스템 (Phase 5)
// 3단계 알고리즘: 강약 → 격국 → 조후
// 사주명리학 시스템 지침 v1.0.3 기준
// =====================================

// 신강/신약 판정 결과
export type BodyStrength = '신강' | '신약' | '중화';

// 용신 결과
export interface EnhancedYongsinResult {
  primary: keyof typeof FIVE_ELEMENTS;      // 1순위 용신
  secondary: keyof typeof FIVE_ELEMENTS;    // 2순위 용신
  xiShin: (keyof typeof FIVE_ELEMENTS)[];   // 희신 (도움 오행)
  jiShin: (keyof typeof FIVE_ELEMENTS)[];   // 기신 (해로운 오행)
  bodyStrength: BodyStrength;               // 신강/신약/중화
  bodyScore: number;                        // 강약 점수 (0-100)
  basis: '강약' | '격국' | '조후';          // 주요 판정 기준
  reasoning: string;                        // 판정 근거 설명
  reasoning_en: string;
}

// 조후(調候) 테이블 - 월지별 환경
export const JOHU_TABLE: Record<string, { cold: number; hot: number; dry: number; wet: number }> = {
  '인': { cold: 0, hot: 1, dry: 0, wet: 1 },
  '묘': { cold: 0, hot: 1, dry: 0, wet: 1 },
  '진': { cold: 0, hot: 1, dry: 0, wet: 2 },
  '사': { cold: 0, hot: 2, dry: 1, wet: 0 },
  '오': { cold: 0, hot: 2, dry: 1, wet: 0 },
  '미': { cold: 0, hot: 1, dry: 0, wet: 2 },
  '신': { cold: 1, hot: 0, dry: 2, wet: 0 },
  '유': { cold: 1, hot: 0, dry: 2, wet: 0 },
  '술': { cold: 1, hot: 0, dry: 1, wet: 1 },
  '해': { cold: 2, hot: 0, dry: 0, wet: 2 },
  '자': { cold: 2, hot: 0, dry: 0, wet: 1 },
  '축': { cold: 2, hot: 0, dry: 0, wet: 2 },
};

/**
 * 신강/신약 판정
 * 일간의 강약을 점수로 산출 (0-100)
 */
export function calculateBodyStrength(
  dayMaster: string,
  monthBranch: string,
  twelveStages: { year: TwelveStageType; month: TwelveStageType; day: TwelveStageType; hour: TwelveStageType },
  tenGodGroups: Record<keyof typeof TEN_GOD_GROUPS, number>,
  elementDistribution: Record<keyof typeof FIVE_ELEMENTS, number>
): { strength: BodyStrength; score: number } {
  let score = 50; // 기본 중립

  // 1. 득령 (월지에서의 12운성)
  const monthStage = twelveStages.month;
  const strongStages: TwelveStageType[] = ['장생', '관대', '건록', '제왕'];
  const weakStages: TwelveStageType[] = ['병', '사', '묘', '절'];

  if (strongStages.includes(monthStage)) {
    score += 15; // 득령
  } else if (weakStages.includes(monthStage)) {
    score -= 10; // 실령
  }

  // 2. 득지 (지지 전체에서의 통근)
  const dayElement = STEM_ELEMENTS[dayMaster];
  const sameElementCount = elementDistribution[dayElement] || 0;
  score += sameElementCount * 5;

  // 3. 득세 (비겁/인성 세력)
  const supportCount = tenGodGroups.companion + tenGodGroups.resource;
  const drainCount = tenGodGroups.output + tenGodGroups.wealth + tenGodGroups.power;

  score += supportCount * 8;
  score -= drainCount * 5;

  // 4. 각 주의 12운성 평균
  const stagePower: Record<TwelveStageType, number> = {
    '장생': 8, '목욕': 5, '관대': 10, '건록': 12, '제왕': 15,
    '쇠': 3, '병': -3, '사': -6, '묘': -8, '절': -10, '태': 0, '양': 2
  };
  const avgStagePower = (
    stagePower[twelveStages.year] +
    stagePower[twelveStages.month] +
    stagePower[twelveStages.day] +
    stagePower[twelveStages.hour]
  ) / 4;
  score += avgStagePower;

  // 점수 범위 제한
  score = Math.max(0, Math.min(100, Math.round(score)));

  // 강약 판정
  let strength: BodyStrength;
  if (score >= 60) {
    strength = '신강';
  } else if (score <= 40) {
    strength = '신약';
  } else {
    strength = '중화';
  }

  return { strength, score };
}

/**
 * 조후(調候) 용신 산출
 * 계절에 따른 필요 오행 조정
 */
export function getJohuYongsin(monthBranch: string, dayElement: keyof typeof FIVE_ELEMENTS): keyof typeof FIVE_ELEMENTS | null {
  const env = JOHU_TABLE[monthBranch];
  if (!env) return null;

  // 겨울(寒) → 火 필요
  if (env.cold >= 2) {
    return 'fire';
  }
  // 여름(熱) → 水 필요
  if (env.hot >= 2) {
    return 'water';
  }
  // 건조(燥) → 水 필요
  if (env.dry >= 2) {
    return 'water';
  }
  // 습(濕) → 火/土 필요
  if (env.wet >= 2) {
    return 'fire';
  }

  return null;
}

/**
 * 용신 선정 3단계 알고리즘
 */
export function determineEnhancedYongsin(
  dayMaster: string,
  monthBranch: string,
  gyeokguk: GyeokgukResult,
  twelveStages: { year: TwelveStageType; month: TwelveStageType; day: TwelveStageType; hour: TwelveStageType },
  tenGodGroups: Record<keyof typeof TEN_GOD_GROUPS, number>,
  elementDistribution: Record<keyof typeof FIVE_ELEMENTS, number>
): EnhancedYongsinResult {
  const dayElement = STEM_ELEMENTS[dayMaster];
  const elementCycle: (keyof typeof FIVE_ELEMENTS)[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const dayIdx = elementCycle.indexOf(dayElement);

  // 1단계: 강약 기반 방향 결정
  const { strength: bodyStrength, score: bodyScore } = calculateBodyStrength(
    dayMaster, monthBranch, twelveStages, tenGodGroups, elementDistribution
  );

  // 오행별 점수 초기화
  const scores: Record<keyof typeof FIVE_ELEMENTS, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };

  // 오행 관계 테이블
  const generates: Record<keyof typeof FIVE_ELEMENTS, keyof typeof FIVE_ELEMENTS> = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
  };
  const generatedBy: Record<keyof typeof FIVE_ELEMENTS, keyof typeof FIVE_ELEMENTS> = {
    wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal'
  };
  const overcomes: Record<keyof typeof FIVE_ELEMENTS, keyof typeof FIVE_ELEMENTS> = {
    wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire'
  };
  const overcomedBy: Record<keyof typeof FIVE_ELEMENTS, keyof typeof FIVE_ELEMENTS> = {
    wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth'
  };

  let basis: '강약' | '격국' | '조후' = '강약';
  let reasoning = '';
  let reasoning_en = '';

  if (bodyStrength === '신약') {
    // 신약: 일간 강화 필요
    scores[dayElement] += 3;           // 동일 오행 (비겁)
    scores[generatedBy[dayElement]] += 2; // 생해주는 오행 (인성)
    reasoning = `신약(${bodyScore}점)으로 비겁/인성이 필요합니다.`;
    reasoning_en = `Body is weak (${bodyScore}). Companion/Resource elements are needed.`;
  } else if (bodyStrength === '신강') {
    // 신강: 설기 필요
    scores[generates[dayElement]] += 3;     // 설기 (식상)
    scores[overcomes[dayElement]] += 2;     // 극하는 오행 (재성)
    scores[overcomedBy[dayElement]] += 1;   // 극당하는 오행 (관성)
    reasoning = `신강(${bodyScore}점)으로 식상/재관 설기가 필요합니다.`;
    reasoning_en = `Body is strong (${bodyScore}). Output/Wealth/Power elements are needed for balance.`;
  } else {
    // 중화: 격국 보전
    basis = '격국';
    // 격국에 따른 용신
    switch (gyeokguk.type) {
      case '정관격':
      case '편관격':
        scores[generatedBy[dayElement]] += 2; // 인성 (관인상생)
        scores[overcomes[dayElement]] += 1;   // 재성 (재관쌍전)
        break;
      case '정재격':
      case '편재격':
        scores[generates[dayElement]] += 2;   // 식상 (식신생재)
        break;
      case '식신격':
        scores[overcomes[dayElement]] += 2;   // 재성 (식신생재)
        break;
      default:
        scores[generatedBy[dayElement]] += 1;
    }
    reasoning = `중화 상태로 격국(${gyeokguk.type}) 보전이 중요합니다.`;
    reasoning_en = `Body is balanced. Focus on preserving structure (${gyeokguk.type}).`;
  }

  // 2단계: 격국 보정
  const gyeokElement = STEM_ELEMENTS[gyeokguk.monthJeonggi];
  if (gyeokElement) {
    scores[gyeokElement] += 2;
    scores[generatedBy[gyeokElement]] += 1;
  }

  // 3단계: 조후 보정
  const johuElement = getJohuYongsin(monthBranch, dayElement);
  if (johuElement) {
    scores[johuElement] += 1.5;
    if (bodyStrength === '중화') {
      basis = '조후';
      reasoning += ` 조후(계절 균형)상 ${FIVE_ELEMENTS[johuElement]}도 유익합니다.`;
      reasoning_en += ` ${johuElement.charAt(0).toUpperCase() + johuElement.slice(1)} is also beneficial for seasonal balance.`;
    }
  }

  // 점수 정렬하여 1, 2순위 용신 결정
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([el]) => el as keyof typeof FIVE_ELEMENTS);

  const primary = sorted[0];
  const secondary = sorted[1];

  // 희신/기신 분류
  const xiShin: (keyof typeof FIVE_ELEMENTS)[] = [];
  const jiShin: (keyof typeof FIVE_ELEMENTS)[] = [];

  if (bodyStrength === '신약') {
    xiShin.push(dayElement, generatedBy[dayElement]);
    jiShin.push(overcomes[dayElement], overcomedBy[dayElement], generates[dayElement]);
  } else if (bodyStrength === '신강') {
    xiShin.push(generates[dayElement], overcomes[dayElement], overcomedBy[dayElement]);
    jiShin.push(dayElement, generatedBy[dayElement]);
  } else {
    xiShin.push(primary, secondary);
    jiShin.push(...elementCycle.filter(e => e !== primary && e !== secondary).slice(0, 2));
  }

  return {
    primary,
    secondary,
    xiShin: [...new Set(xiShin)],
    jiShin: [...new Set(jiShin)],
    bodyStrength,
    bodyScore,
    basis,
    reasoning,
    reasoning_en
  };
}

// =====================================
// 신살 (神煞) 12종 판정 시스템 (Phase 6)
// 사주명리학 시스템 지침 v1.0.3 기준
// =====================================

// 신살 결과 인터페이스
export interface ShinSalResult {
  positive: { name: string; branch: string; description: string }[];
  negative: { name: string; branch: string; description: string }[];
  neutral: { name: string; branch: string; description: string }[];
}

// ============== 길신(吉神) TABLES ==============

// 천을귀인(天乙貴人) - 일간별 지지
export const CHEONUL_GUIIN: Record<string, string[]> = {
  '갑': ['축', '미'],
  '을': ['자', '신'],
  '병': ['해', '유'],
  '정': ['해', '유'],
  '무': ['축', '미'],
  '기': ['자', '신'],
  '경': ['축', '미'],
  '신': ['인', '오'],
  '임': ['묘', '사'],
  '계': ['묘', '사'],
};

// 문창귀인(文昌貴人) - 일간별 지지
export const MUNCHANG_GUIIN: Record<string, string> = {
  '갑': '사',
  '을': '오',
  '병': '신',
  '정': '유',
  '무': '신',
  '기': '유',
  '경': '해',
  '신': '자',
  '임': '인',
  '계': '묘',
};

// 학당귀인(學堂貴人) - 일간별 지지
export const HAKDANG_GUIIN: Record<string, string> = {
  '갑': '해',
  '을': '해',
  '병': '인',
  '정': '인',
  '무': '사',
  '기': '사',
  '경': '신',
  '신': '신',
  '임': '해',
  '계': '해',
};

// 장성귀인(將星貴人) - 연지/일지별
export const JANGSUNG_GUIIN: Record<string, string> = {
  '자': '자',
  '축': '유',
  '인': '오',
  '묘': '묘',
  '진': '자',
  '사': '유',
  '오': '오',
  '미': '묘',
  '신': '자',
  '유': '유',
  '술': '오',
  '해': '묘',
};

// 화개(華蓋) - 연지/일지별
export const HWAGAE: Record<string, string> = {
  '자': '진',
  '축': '축',
  '인': '술',
  '묘': '미',
  '진': '진',
  '사': '축',
  '오': '술',
  '미': '미',
  '신': '진',
  '유': '축',
  '술': '술',
  '해': '미',
};

// ============== 흉살(凶煞) TABLES ==============

// 도화(桃花) - 연지/일지별
export const DOHWA: Record<string, string> = {
  '자': '유',
  '축': '오',
  '인': '묘',
  '묘': '자',
  '진': '유',
  '사': '오',
  '오': '묘',
  '미': '자',
  '신': '유',
  '유': '오',
  '술': '묘',
  '해': '자',
};

// 역마(驛馬) - 연지/일지별
export const YEOKMA: Record<string, string> = {
  '자': '인',
  '축': '해',
  '인': '신',
  '묘': '사',
  '진': '인',
  '사': '해',
  '오': '신',
  '미': '사',
  '신': '인',
  '유': '해',
  '술': '신',
  '해': '사',
};

// 겁살(劫煞) - 연지별
export const GEOBSAL: Record<string, string> = {
  '자': '사',
  '축': '인',
  '인': '해',
  '묘': '신',
  '진': '사',
  '사': '인',
  '오': '해',
  '미': '신',
  '신': '사',
  '유': '인',
  '술': '해',
  '해': '신',
};

// 재살(災煞) - 연지별
export const JAESAL: Record<string, string> = {
  '자': '오',
  '축': '묘',
  '인': '자',
  '묘': '유',
  '진': '오',
  '사': '묘',
  '오': '자',
  '미': '유',
  '신': '오',
  '유': '묘',
  '술': '자',
  '해': '유',
};

// 양인(羊刃) - 일간별 지지
export const YANGIN: Record<string, string> = {
  '갑': '묘',
  '을': '진',
  '병': '오',
  '정': '미',
  '무': '오',
  '기': '미',
  '경': '유',
  '신': '술',
  '임': '자',
  '계': '축',
};

/**
 * 신살 12종 판정
 */
export function detectShinSal(
  dayMaster: string,
  yearBranch: string,
  dayBranch: string,
  branches: string[]
): ShinSalResult {
  const positive: ShinSalResult['positive'] = [];
  const negative: ShinSalResult['negative'] = [];
  const neutral: ShinSalResult['neutral'] = [];

  // === 길신 체크 ===

  // 1. 천을귀인
  const cheonul = CHEONUL_GUIIN[dayMaster] || [];
  branches.forEach(branch => {
    if (cheonul.includes(branch)) {
      positive.push({
        name: '천을귀인',
        branch,
        description: '귀인의 도움, 위기 시 구원'
      });
    }
  });

  // 2. 문창귀인
  const munchang = MUNCHANG_GUIIN[dayMaster];
  if (munchang && branches.includes(munchang)) {
    positive.push({
      name: '문창귀인',
      branch: munchang,
      description: '학문/문서 능력, 시험 운'
    });
  }

  // 3. 학당귀인
  const hakdang = HAKDANG_GUIIN[dayMaster];
  if (hakdang && branches.includes(hakdang)) {
    positive.push({
      name: '학당귀인',
      branch: hakdang,
      description: '학문 성취, 지혜'
    });
  }

  // 4. 장성귀인
  const jangsung = JANGSUNG_GUIIN[yearBranch];
  if (jangsung && branches.includes(jangsung)) {
    positive.push({
      name: '장성',
      branch: jangsung,
      description: '리더십, 권위'
    });
  }

  // 5. 화개
  const hwagae = HWAGAE[yearBranch];
  if (hwagae && branches.includes(hwagae)) {
    neutral.push({
      name: '화개',
      branch: hwagae,
      description: '예술/종교 감수성, 고독'
    });
  }

  // === 흉살 체크 ===

  // 6. 도화
  const dohwa = DOHWA[yearBranch] || DOHWA[dayBranch];
  if (dohwa && branches.includes(dohwa)) {
    neutral.push({
      name: '도화',
      branch: dohwa,
      description: '매력, 이성 인연 (과다 시 바람기)'
    });
  }

  // 7. 역마
  const yeokma = YEOKMA[yearBranch] || YEOKMA[dayBranch];
  if (yeokma && branches.includes(yeokma)) {
    neutral.push({
      name: '역마',
      branch: yeokma,
      description: '이동/변화 운, 활동성'
    });
  }

  // 8. 양인
  const yangin = YANGIN[dayMaster];
  if (yangin && branches.includes(yangin)) {
    negative.push({
      name: '양인',
      branch: yangin,
      description: '급한 성격, 상해 주의'
    });
  }

  // 9. 겁살
  const geobsal = GEOBSAL[yearBranch];
  if (geobsal && branches.includes(geobsal)) {
    negative.push({
      name: '겁살',
      branch: geobsal,
      description: '도난/사기 주의'
    });
  }

  // 10. 재살
  const jaesal = JAESAL[yearBranch];
  if (jaesal && branches.includes(jaesal)) {
    negative.push({
      name: '재살',
      branch: jaesal,
      description: '재난/사고 주의'
    });
  }

  return { positive, negative, neutral };
}

/**
 * 신살 요약 설명
 */
export function getShinSalSummary(result: ShinSalResult): string {
  const parts: string[] = [];

  if (result.positive.length > 0) {
    parts.push(`길신: ${result.positive.map(s => s.name).join(', ')}`);
  }
  if (result.negative.length > 0) {
    parts.push(`흉살: ${result.negative.map(s => s.name).join(', ')}`);
  }
  if (result.neutral.length > 0) {
    parts.push(`중성: ${result.neutral.map(s => s.name).join(', ')}`);
  }

  return parts.join(' | ') || '특별한 신살 없음';
}

function parseGapja(gapjaStr: string): { stem: string; branch: string } {
  // "정유년", "병오월", "임오일" 형태에서 앞 2글자만 추출
  const stem = gapjaStr.charAt(0);
  const branch = gapjaStr.charAt(1);
  return { stem, branch };
}

/**
 * 시주(時柱) 계산
 * 일간에 따라 시간의 천간이 결정됨
 */
function calculateHourPillar(
  hour: number,
  dayStem: string
): { stem: string; branch: string } {
  // 시지 결정 (2시간 단위)
  // 23-01시: 자, 01-03시: 축, ...
  const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2);

  // 일간에 따른 시간 천간 결정 (일상기시법)
  const dayStemIndex = (HEAVENLY_STEMS as readonly string[]).indexOf(dayStem);
  const hourStemStartMap: Record<number, number> = {
    0: 0, 5: 0,  // 갑/기일 -> 갑자시부터
    1: 2, 6: 2,  // 을/경일 -> 병자시부터
    2: 4, 7: 4,  // 병/신일 -> 무자시부터
    3: 6, 8: 6,  // 정/임일 -> 경자시부터
    4: 8, 9: 8,  // 무/계일 -> 임자시부터
  };

  const startStem = hourStemStartMap[dayStemIndex] || 0;
  const hourStemIndex = (startStem + hourBranchIndex) % 10;

  return {
    stem: HEAVENLY_STEMS[hourStemIndex],
    branch: EARTHLY_BRANCHES[hourBranchIndex],
  };
}

/**
 * 율리우스 날짜 및 태양 황경 계산 (Saju용)
 */
function getSunLongitude(birthDate: Date): number {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate() + (birthDate.getHours() + birthDate.getMinutes() / 60) / 24;

  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;

  const T = (jd - 2451545.0) / 36525;
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = L0 % 360;
  if (L0 < 0) L0 += 360;

  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);

  let sunLongitude = L0 + C;
  sunLongitude = sunLongitude % 360;
  if (sunLongitude < 0) sunLongitude += 360;
  return sunLongitude;
}

/**
 * 십신 계산 (매트릭스 기반)
 * 일간(日干)을 기준으로 다른 천간과의 관계를 10×10 매트릭스로 정확히 판정
 * 사주명리학 시스템 지침 v1.0.3 기준
 */
function calculateTenGods(dayMaster: string, stems: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const pillarNames = ['year', 'month', 'day', 'hour'];

  // 매트릭스가 없는 일간인 경우 폴백
  if (!TEN_GOD_MATRIX[dayMaster]) {
    console.warn(`Unknown day master: ${dayMaster}, using fallback`);
    return calculateTenGodsFallback(dayMaster, stems);
  }

  stems.forEach((stem, index) => {
    // 매트릭스에서 직접 조회
    const godName = TEN_GOD_MATRIX[dayMaster]?.[stem];

    if (godName) {
      result[pillarNames[index]] = godName;
    } else {
      // 알 수 없는 천간인 경우 폴백
      result[pillarNames[index]] = '알수없음';
    }
  });

  return result;
}

/**
 * 십신 계산 폴백 (오행 관계 기반)
 * 매트릭스 조회가 실패한 경우 사용
 */
function calculateTenGodsFallback(dayMaster: string, stems: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const dayElement = STEM_ELEMENTS[dayMaster];
  const dayYinYang = (HEAVENLY_STEMS as readonly string[]).indexOf(dayMaster) % 2;

  const elementCycle = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

  stems.forEach((stem, index) => {
    const stemElement = STEM_ELEMENTS[stem];
    const stemYinYang = (HEAVENLY_STEMS as readonly string[]).indexOf(stem) % 2;
    const sameYinYang = dayYinYang === stemYinYang;

    const dayIdx = elementCycle.indexOf(dayElement);
    const stemIdx = elementCycle.indexOf(stemElement);
    const diff = ((stemIdx - dayIdx) + 5) % 5;

    let godName: string;

    if (diff === 0) {
      godName = sameYinYang ? TEN_GODS.bijian : TEN_GODS.gepcae;
    } else if (diff === 1) {
      godName = sameYinYang ? TEN_GODS.sikshin : TEN_GODS.sanggwan;
    } else if (diff === 2) {
      godName = sameYinYang ? TEN_GODS.pyeonjae : TEN_GODS.jeongjae;
    } else if (diff === 3) {
      godName = sameYinYang ? TEN_GODS.pyeongwan : TEN_GODS.jeonggwan;
    } else {
      godName = sameYinYang ? TEN_GODS.pyeonin : TEN_GODS.jeongin;
    }

    const pillarNames = ['year', 'month', 'day', 'hour'];
    result[pillarNames[index]] = godName;
  });

  return result;
}

/**
 * 십신 그룹 판별
 * 주어진 십신이 어떤 그룹(비겁/식상/재성/관성/인성)에 속하는지 반환
 */
export function getTenGodGroup(tenGod: string): keyof typeof TEN_GOD_GROUPS | null {
  for (const [group, gods] of Object.entries(TEN_GOD_GROUPS)) {
    if ((gods as readonly string[]).includes(tenGod)) {
      return group as keyof typeof TEN_GOD_GROUPS;
    }
  }
  return null;
}

/**
 * 십신 카운트
 * 사주 전체에서 각 십신이 몇 개 있는지 계산
 */
export function countTenGods(tenGods: Record<string, string>): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.values(tenGods).forEach(god => {
    counts[god] = (counts[god] || 0) + 1;
  });
  return counts;
}

/**
 * 십신 그룹 카운트
 * 사주 전체에서 각 그룹별 십신 개수 계산
 */
export function countTenGodGroups(tenGods: Record<string, string>): Record<keyof typeof TEN_GOD_GROUPS, number> {
  const counts: Record<keyof typeof TEN_GOD_GROUPS, number> = {
    companion: 0,
    output: 0,
    wealth: 0,
    power: 0,
    resource: 0,
  };

  Object.values(tenGods).forEach(god => {
    const group = getTenGodGroup(god);
    if (group) {
      counts[group]++;
    }
  });

  return counts;
}

/**
 * 메인 사주 계산 함수
 * korean-lunar-calendar 라이브러리를 사용하여 KARI 표준 기반 정확한 간지 계산
 */
export function calculateSaju(
  birthDate: Date,
  birthHour: number = 12,
  birthMinute: number = 0,
  isLunar: boolean = false
): SajuResult {
  // 1. 한국 표준시(KST) 30분 보정 (동경 135도 -> 127.5도)
  // 실제 태양시 기준으로 만세력을 산출하기 위함
  const adjDate = new Date(birthDate);
  adjDate.setHours(birthHour, birthMinute);
  adjDate.setMinutes(adjDate.getMinutes() - 30);

  const year = adjDate.getFullYear();
  const month = adjDate.getMonth() + 1;
  const day = adjDate.getDate();
  const hour = adjDate.getHours();

  // 2. 조자시(朝子時) 처리: 밤 23시(보정 전 23:30)부터는 다음 날의 일진을 사용
  const isAfterZi = hour >= 23;
  const calendarDate = new Date(adjDate);
  if (isAfterZi) {
    calendarDate.setDate(calendarDate.getDate() + 1);
  }

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth() + 1;
  const calDay = calendarDate.getDate();

  // korean-lunar-calendar 인스턴스 생성
  const calendar = new KoreanLunarCalendar();

  let isValid = false;

  if (isLunar) {
    // 음력 -> 양력 변환
    isValid = calendar.setLunarDate(calYear, calMonth, calDay, false);
  } else {
    // 양력 날짜 설정
    isValid = calendar.setSolarDate(calYear, calMonth, calDay);
  }

  if (!isValid) {
    // 범위를 벗어난 경우 폴백 처리
    console.warn(`Date ${year}-${month}-${day} is out of calendar range, using fallback`);
    return calculateSajuFallback(birthDate, birthHour);
  }

  // 한국식 간지(GapJa) 가져오기 - 일주 계산용으로 주로 사용
  const koreanGapja = calendar.getKoreanGapja();

  // 태양 황경 기반 연주/월주 계산 (절기력 반영)
  const sunLong = getSunLongitude(adjDate);

  // 1. 연주 계산 (입춘 기준)
  let sajuYear = year;
  // 1월이나 2월인데 태양이 아직 입춘(315도)에 도달하지 않았으면 작년으로 침
  if (month <= 2 && sunLong < 315 && sunLong > 200) {
    sajuYear = year - 1;
  }
  const yearStemIdx = (sajuYear - 4) % 10;
  const yearBranchIdx = (sajuYear - 4) % 12;
  const yeonPillar = {
    stem: HEAVENLY_STEMS[(yearStemIdx + 10) % 10],
    branch: EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12],
  };

  // 2. 월주 계산 (절기 기준)
  // 315도(입춘)부터가 인(寅)월
  const monthBranchMap = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const shiftedLong = (sunLong - 315 + 360) % 360;
  const monthIdx = Math.floor(shiftedLong / 30);
  const monthBranch = monthBranchMap[monthIdx];

  // 월간 계산 (연주 천간 기반)
  const yStemIdx = (HEAVENLY_STEMS as readonly string[]).indexOf(yeonPillar.stem);
  const monthStemIdx = (yStemIdx * 2 + 2 + monthIdx) % 10;
  const monthPillar = {
    stem: HEAVENLY_STEMS[monthStemIdx],
    branch: monthBranch,
  };

  // 3. 일주 계산 (라이브러리 결과 사용 + 조자시 반영됨)
  const dayPillar = parseGapja(koreanGapja.day);

  // 시주는 보정된 시간(adjDate) 기반으로 계산
  const hourPillar = calculateHourPillar(hour, dayPillar.stem);

  // 일간 (Day Master)
  const dayMaster = dayPillar.stem;

  // 각 주의 오행
  const elements = [
    yeonPillar, monthPillar, dayPillar, hourPillar
  ].map(pillar => ({
    stem: STEM_ELEMENTS[pillar.stem],
    branch: BRANCH_ELEMENTS[pillar.branch],
  }));

  // 십신 계산
  const stems = [yeonPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const tenGods = calculateTenGods(dayMaster, stems);

  // Phase 2: 12운성 계산
  const branches = {
    year: yeonPillar.branch,
    month: monthPillar.branch,
    day: dayPillar.branch,
    hour: hourPillar.branch,
  };
  const twelveStages = calculateAllTwelveStages(dayMaster, branches);

  // Phase 2: 지장간 계산
  const hiddenStems = calculateAllHiddenStems(branches);

  // Phase 3: 지지 상호작용 계산
  const branchList = [yeonPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];
  const interactions = analyzeAllInteractions(branchList, dayPillar.stem, dayPillar.branch);

  // Phase 4: 격국 판정
  const gyeokguk = determineGyeokguk(dayMaster, monthPillar.branch, stems, branchList, tenGods);

  // Phase 5: 용신 강화
  const tenGodGroups = countTenGodGroups(tenGods);
  const elementDistribution = analyzeElementDistribution({
    yeonPillar, monthPillar, dayPillar, hourPillar,
    dayMaster, elements, tenGods
  });
  const enhancedYongsin = determineEnhancedYongsin(
    dayMaster, monthPillar.branch, gyeokguk, twelveStages, tenGodGroups, elementDistribution
  );

  // Phase 6: 신살 판정
  const shinSal = detectShinSal(dayMaster, yeonPillar.branch, dayPillar.branch, branchList);

  return {
    yeonPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    elements,
    tenGods,
    twelveStages,
    hiddenStems,
    interactions,
    gyeokguk,
    enhancedYongsin,
    shinSal,
    rawGapja: {
      year: `${yeonPillar.stem}${yeonPillar.branch}년`,
      month: `${monthPillar.stem}${monthPillar.branch}월`,
      day: koreanGapja.day,
    }
  };
}

/**
 * 폴백 계산 (라이브러리 범위 밖의 날짜용)
 * 기존 알고리즘 사용
 */
function calculateSajuFallback(
  birthDate: Date,
  birthHour: number = 12,
  birthMinute: number = 0
): SajuResult {
  // 1. 한국 표준시(KST) 30분 보정
  const adjDate = new Date(birthDate);
  adjDate.setHours(birthHour, birthMinute);
  adjDate.setMinutes(adjDate.getMinutes() - 30);

  const year = adjDate.getFullYear();
  const month = adjDate.getMonth() + 1;
  const day = adjDate.getDate();
  const hour = adjDate.getHours();

  // 2. 조자시 처리
  const isAfterZi = hour >= 23;
  const targetDate = new Date(adjDate);
  if (isAfterZi) targetDate.setDate(targetDate.getDate() + 1);

  const sajuYear = targetDate.getFullYear();
  const sajuMonth = targetDate.getMonth() + 1;
  const sajuDay = targetDate.getDate();

  // 년주
  const yearStemIdx = (sajuYear - 4) % 10;
  const yearBranchIdx = (sajuYear - 4) % 12;
  const yeonPillar = {
    stem: HEAVENLY_STEMS[(yearStemIdx + 10) % 10],
    branch: EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12],
  };

  // 월주 (간략화)
  const monthBranchMap = [
    '축', '인', '묘', '진', '사', '오',
    '미', '신', '유', '술', '해', '자'
  ];
  const adjustedMonth = month - 1;
  const yeonStemIndex = (HEAVENLY_STEMS as readonly string[]).indexOf(yeonPillar.stem);
  const monthStemStartMap: Record<number, number> = {
    0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0,
  };
  const startStem = monthStemStartMap[yeonStemIndex] || 0;
  const monthStemIndex = (startStem + adjustedMonth) % 10;
  const monthPillar = {
    stem: HEAVENLY_STEMS[monthStemIndex],
    branch: monthBranchMap[adjustedMonth],
  };

  // 3. 일주 (율리우스일 기반 - 보정된 날짜 사용)
  const a = Math.floor((14 - sajuMonth) / 12);
  const y = sajuYear + 4800 - a;
  const m = sajuMonth + 12 * a - 3;
  const julianDay = sajuDay + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) +
    Math.floor(y / 400) - 32045;
  const baseJulianDay = 2415021;
  const dayDiff = julianDay - baseJulianDay;
  const dayStemIdx = ((dayDiff % 10) + 10) % 10;
  const dayBranchIdx = ((dayDiff % 12) + 12) % 12;
  const dayPillar = {
    stem: HEAVENLY_STEMS[dayStemIdx],
    branch: EARTHLY_BRANCHES[dayBranchIdx],
  };

  const hourPillar = calculateHourPillar(hour, dayPillar.stem);
  const dayMaster = dayPillar.stem;

  const elements = [
    yeonPillar, monthPillar, dayPillar, hourPillar
  ].map(pillar => ({
    stem: STEM_ELEMENTS[pillar.stem],
    branch: BRANCH_ELEMENTS[pillar.branch],
  }));

  const stems = [yeonPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const tenGods = calculateTenGods(dayMaster, stems);

  return {
    yeonPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    elements,
    tenGods,
  };
}

/**
 * 사주를 읽기 쉬운 문자열로 변환
 */
export function formatSaju(saju: SajuResult | string | null | undefined): string {
  if (!saju) return '사주 정보 없음';
  if (typeof saju === 'string') return saju;

  const { yeonPillar, monthPillar, dayPillar, hourPillar } = saju;

  if (!yeonPillar || !monthPillar || !dayPillar || !hourPillar) {
    return '사주 데이터 불완전';
  }

  return `${yeonPillar.stem}${yeonPillar.branch}년 ${monthPillar.stem}${monthPillar.branch}월 ${dayPillar.stem}${dayPillar.branch}일 ${hourPillar.stem}${hourPillar.branch}시`;
}

// =====================================
// 용신 (用神) 추천 로직 - 기본판
// =====================================

/**
 * 일간(일주의 천간)을 기준으로 기본 용신을 추천
 * 실제 명리학에서는 월령, 전체 오행 분포 등을 종합하지만
 * 이 버전은 간략화된 "조후용신" 개념에 기반합니다.
 */
export function getYongsinRecommendation(dayMaster: string, birthMonth: number): {
  yongsin: keyof typeof FIVE_ELEMENTS;
  reason: string;
  reasonEn: string;
} {
  const dayElement = STEM_ELEMENTS[dayMaster];

  // 조후용신: 계절에 따른 필요 오행
  // 겨울(11,12,1월): 火 필요 (추위 조절)
  // 여름(5,6,7월): 水 필요 (더위 조절)
  // 봄/가을: 일간에 따라 다름

  const isWinter = birthMonth >= 11 || birthMonth <= 1;
  const isSummer = birthMonth >= 5 && birthMonth <= 7;

  if (isWinter) {
    return {
      yongsin: 'fire',
      reason: `겨울에 태어나 조후(調候)상 火(화)가 필요합니다. 따뜻함이 삶에 활력을 줍니다.`,
      reasonEn: `Born in winter, Fire is needed for warmth and vitality.`,
    };
  }

  if (isSummer) {
    return {
      yongsin: 'water',
      reason: `여름에 태어나 조후(調候)상 水(수)가 필요합니다. 시원함이 마음을 안정시킵니다.`,
      reasonEn: `Born in summer, Water is needed for cooling and calmness.`,
    };
  }

  // 기본: 일간을 생해주는 오행이 용신
  const generatingElement = Object.entries(ELEMENT_RELATIONS.generates)
    .find(([_, generated]) => generated === dayElement)?.[0] as keyof typeof FIVE_ELEMENTS | undefined;

  return {
    yongsin: generatingElement || 'wood',
    reason: `일간 ${dayMaster}(${FIVE_ELEMENTS[dayElement]})을 생해주는 ${generatingElement ? FIVE_ELEMENTS[generatingElement] : '목'}이 용신입니다.`,
    reasonEn: `The element that generates your Day Master is your Yongsin.`,
  };
}

/**
 * 오행 분포 분석
 */
export function analyzeElementDistribution(saju: SajuResult): Record<keyof typeof FIVE_ELEMENTS, number> {
  const distribution: Record<keyof typeof FIVE_ELEMENTS, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };

  // 천간 4개
  [saju.yeonPillar.stem, saju.monthPillar.stem, saju.dayPillar.stem, saju.hourPillar.stem]
    .forEach(stem => {
      const element = STEM_ELEMENTS[stem];
      if (element) distribution[element]++;
    });

  // 지지 4개
  [saju.yeonPillar.branch, saju.monthPillar.branch, saju.dayPillar.branch, saju.hourPillar.branch]
    .forEach(branch => {
      const element = BRANCH_ELEMENTS[branch];
      if (element) distribution[element]++;
    });

  return distribution;
}

/**
 * 오행 과다/부족 진단
 */
export function diagnoseElementBalance(saju: SajuResult): {
  excessive: (keyof typeof FIVE_ELEMENTS)[];
  lacking: (keyof typeof FIVE_ELEMENTS)[];
  balanced: boolean;
} {
  const distribution = analyzeElementDistribution(saju);
  const values = Object.values(distribution);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const excessive = (Object.entries(distribution) as [keyof typeof FIVE_ELEMENTS, number][])
    .filter(([_, count]) => count >= 3)
    .map(([element]) => element);

  const lacking = (Object.entries(distribution) as [keyof typeof FIVE_ELEMENTS, number][])
    .filter(([_, count]) => count === 0)
    .map(([element]) => element);

  return {
    excessive,
    lacking,
    balanced: excessive.length === 0 && lacking.length === 0,
  };
}
