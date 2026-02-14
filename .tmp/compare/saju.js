"use strict";
/**
 * 사주(四柱) 계산 엔진
 * korean-lunar-calendar 라이브러리 기반 정확한 만세력 산출 (KARI 표준)
 *
 * 📚 데이터 기준: 사주명리학 시스템 지침 v1.0.3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WOLDEOK_GUIIN = exports.CHEONDEOK_GUIIN = exports.YANGIN = exports.JAESAL = exports.GEOBSAL = exports.YEOKMA = exports.DOHWA = exports.HWAGAE = exports.JANGSUNG_GUIIN = exports.HAKDANG_GUIIN = exports.MUNCHANG_GUIIN = exports.CHEONUL_GUIIN = exports.JOHU_TABLE = exports.ShinSalType = exports.MONTH_START_TERMS = exports.SOLAR_TERMS = exports.TEN_GOD_ENGLISH = exports.TEN_GOD_GROUPS = exports.TEN_GOD_MATRIX = exports.TEN_GODS = exports.VOID_TABLE = exports.BRANCH_BREAKS = exports.BRANCH_HARMS = exports.BRANCH_PUNISHMENTS = exports.BRANCH_DIRECTIONAL = exports.BRANCH_THREE_HARMONIES = exports.BRANCH_COMBINES = exports.BRANCH_CLASHES = exports.HIDDEN_STEM_WEIGHT = exports.HIDDEN_STEMS = exports.TWELVE_STAGE_NATURE = exports.TWELVE_STAGE_MATRIX = exports.TWELVE_STAGES = exports.BRANCH_ELEMENTS = exports.STEM_ELEMENTS = exports.ELEMENT_RELATIONS = exports.FIVE_ELEMENTS_HANJA = exports.FIVE_ELEMENTS = exports.EARTHLY_BRANCHES = exports.EARTHLY_BRANCHES_DATA = exports.HEAVENLY_STEMS = exports.HEAVENLY_STEMS_DATA = void 0;
exports.determineDaeunDirection = determineDaeunDirection;
exports.calculateDaeunStartAge = calculateDaeunStartAge;
exports.generateDaeunSequence = generateDaeunSequence;
exports.findCurrentDaeun = findCurrentDaeun;
exports.calculateDaeun = calculateDaeun;
exports.formatDaeun = formatDaeun;
exports.calculateShinSal = calculateShinSal;
exports.yearToGanji = yearToGanji;
exports.calculateSewoon = calculateSewoon;
exports.calculateMultiYearSewoon = calculateMultiYearSewoon;
exports.formatSewoon = formatSewoon;
exports.calculateWolwoon = calculateWolwoon;
exports.calculateYearlyWolwoon = calculateYearlyWolwoon;
exports.getWolwoonHighlights = getWolwoonHighlights;
exports.formatWolwoon = formatWolwoon;
exports.calculateTwelveStage = calculateTwelveStage;
exports.calculateAllTwelveStages = calculateAllTwelveStages;
exports.getHiddenStems = getHiddenStems;
exports.calculateAllHiddenStems = calculateAllHiddenStems;
exports.getTwelveStageStrength = getTwelveStageStrength;
exports.checkDeungryeong = checkDeungryeong;
exports.detectClash = detectClash;
exports.detectAllClashes = detectAllClashes;
exports.detectCombine = detectCombine;
exports.detectAllCombines = detectAllCombines;
exports.detectThreeHarmony = detectThreeHarmony;
exports.detectDirectional = detectDirectional;
exports.detectPunishments = detectPunishments;
exports.detectHarms = detectHarms;
exports.detectBreaks = detectBreaks;
exports.getVoidBranches = getVoidBranches;
exports.detectVoids = detectVoids;
exports.analyzeAllInteractions = analyzeAllInteractions;
exports.getMonthJeonggiTenGod = getMonthJeonggiTenGod;
exports.checkTouchu = checkTouchu;
exports.checkTongguen = checkTongguen;
exports.checkPurity = checkPurity;
exports.checkSpecialStructure = checkSpecialStructure;
exports.determineGyeokguk = determineGyeokguk;
exports.getGyeokgukDescription = getGyeokgukDescription;
exports.calculateBodyStrength = calculateBodyStrength;
exports.getJohuYongsin = getJohuYongsin;
exports.determineEnhancedYongsin = determineEnhancedYongsin;
exports.detectShinSal = detectShinSal;
exports.getShinSalSummary = getShinSalSummary;
exports.getTenGodGroup = getTenGodGroup;
exports.countTenGods = countTenGods;
exports.countTenGodGroups = countTenGodGroups;
exports.calculateSaju = calculateSaju;
exports.formatSaju = formatSaju;
exports.getYongsinRecommendation = getYongsinRecommendation;
exports.analyzeElementDistribution = analyzeElementDistribution;
exports.diagnoseElementBalance = diagnoseElementBalance;
const korean_lunar_calendar_1 = require("korean-lunar-calendar");
exports.HEAVENLY_STEMS_DATA = [
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
exports.HEAVENLY_STEMS = exports.HEAVENLY_STEMS_DATA.map(s => s.hangul);
exports.EARTHLY_BRANCHES_DATA = [
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
exports.EARTHLY_BRANCHES = exports.EARTHLY_BRANCHES_DATA.map(b => b.hangul);
// =====================================
// 오행 (五行) 확장
// =====================================
exports.FIVE_ELEMENTS = {
    wood: '목',
    fire: '화',
    earth: '토',
    metal: '금',
    water: '수',
};
exports.FIVE_ELEMENTS_HANJA = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
};
// 상생/상극 관계
exports.ELEMENT_RELATIONS = {
    generates: { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' },
    overcomes: { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' },
};
// 천간별 오행 (기존 호환성)
exports.STEM_ELEMENTS = {
    '갑': 'wood', '을': 'wood',
    '병': 'fire', '정': 'fire',
    '무': 'earth', '기': 'earth',
    '경': 'metal', '신': 'metal',
    '임': 'water', '계': 'water',
};
// 지지별 오행 (기존 호환성)
exports.BRANCH_ELEMENTS = {
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
exports.TWELVE_STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
exports.TWELVE_STAGE_MATRIX = {
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
exports.TWELVE_STAGE_NATURE = {
    '장생': 'strong', // 탄생, 시작
    '목욕': 'medium', // 성장 초기
    '관대': 'strong', // 성인, 관직
    '건록': 'strong', // 정점 직전, 녹봉
    '제왕': 'strong', // 최고점, 왕
    '쇠': 'medium', // 하강 시작
    '병': 'weak', // 쇠약
    '사': 'weak', // 죽음
    '묘': 'weak', // 무덤
    '절': 'weak', // 끊어짐
    '태': 'medium', // 잉태
    '양': 'medium', // 양육
};
exports.HIDDEN_STEMS = {
    '자': { yeogi: '임', jeonggi: '계' }, // 子: 壬(여기), 癸(정기)
    '축': { yeogi: '계', junggi: '신', jeonggi: '기' }, // 丑: 癸, 辛, 己
    '인': { yeogi: '무', junggi: '병', jeonggi: '갑' }, // 寅: 戊, 丙, 甲
    '묘': { yeogi: '갑', jeonggi: '을' }, // 卯: 甲(여기), 乙(정기)
    '진': { yeogi: '을', junggi: '계', jeonggi: '무' }, // 辰: 乙, 癸, 戊
    '사': { yeogi: '무', junggi: '경', jeonggi: '병' }, // 巳: 戊, 庚, 丙
    '오': { yeogi: '병', junggi: '기', jeonggi: '정' }, // 午: 丙, 己, 丁
    '미': { yeogi: '정', junggi: '을', jeonggi: '기' }, // 未: 丁, 乙, 己
    '신': { yeogi: '기', junggi: '임', jeonggi: '경' }, // 申: 己, 壬, 庚
    '유': { yeogi: '경', jeonggi: '신' }, // 酉: 庚(여기), 辛(정기)
    '술': { yeogi: '신', junggi: '정', jeonggi: '무' }, // 戌: 辛, 丁, 戊
    '해': { yeogi: '무', junggi: '갑', jeonggi: '임' }, // 亥: 戊, 甲, 壬
};
// 지장간 가중치 (일수 기반)
exports.HIDDEN_STEM_WEIGHT = {
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
exports.BRANCH_CLASHES = [
    ['자', '오'], // 子午沖
    ['축', '미'], // 丑未沖
    ['인', '신'], // 寅申沖
    ['묘', '유'], // 卯酉沖
    ['진', '술'], // 辰戌沖
    ['사', '해'], // 巳亥沖
];
// 육합(六合) - 6쌍, 친화 결합
exports.BRANCH_COMBINES = [
    { pair: ['자', '축'], element: 'earth' }, // 子丑合土
    { pair: ['인', '해'], element: 'wood' }, // 寅亥合木
    { pair: ['묘', '술'], element: 'fire' }, // 卯戌合火
    { pair: ['진', '유'], element: 'metal' }, // 辰酉合金
    { pair: ['사', '신'], element: 'water' }, // 巳申合水
    { pair: ['오', '미'], element: 'fire' }, // 午未合火/土
];
// 삼합(三合) - 4종, 강력한 오행 강화
exports.BRANCH_THREE_HARMONIES = [
    { trio: ['신', '자', '진'], element: 'water' }, // 申子辰 水局
    { trio: ['해', '묘', '미'], element: 'wood' }, // 亥卯未 木局
    { trio: ['인', '오', '술'], element: 'fire' }, // 寅午戌 火局
    { trio: ['사', '유', '축'], element: 'metal' }, // 巳酉丑 金局
];
// 방합/삼회(三會) - 계절방합
exports.BRANCH_DIRECTIONAL = [
    { trio: ['인', '묘', '진'], element: 'wood', season: '봄/동방' }, // 寅卯辰 木
    { trio: ['사', '오', '미'], element: 'fire', season: '여름/남방' }, // 巳午未 火
    { trio: ['신', '유', '술'], element: 'metal', season: '가을/서방' }, // 申酉戌 金
    { trio: ['해', '자', '축'], element: 'water', season: '겨울/북방' }, // 亥子丑 水
];
// 형(刑) - 상해/처벌
exports.BRANCH_PUNISHMENTS = [
    { type: '무례지형', members: ['자', '묘'] }, // 子卯刑 - 예의 없음
    { type: '지은지형', members: ['축', '술', '미'] }, // 丑戌未 삼형
    { type: '무은지형', members: ['인', '사', '신'] }, // 寅巳申 삼형
    { type: '자형', members: ['진', '진'] }, // 辰辰刑
    { type: '자형', members: ['오', '오'] }, // 午午刑
    { type: '자형', members: ['유', '유'] }, // 酉酉刑
    { type: '자형', members: ['해', '해'] }, // 亥亥刑
];
// 해(害) - 육합 방해
exports.BRANCH_HARMS = [
    ['자', '미'], // 子未害
    ['축', '오'], // 丑午害
    ['인', '사'], // 寅巳害
    ['묘', '진'], // 卯辰害
    ['신', '해'], // 申亥害
    ['유', '술'], // 酉戌害
];
// 파(破) - 내부 파괴
exports.BRANCH_BREAKS = [
    ['자', '유'], // 子酉破
    ['축', '진'], // 丑辰破
    ['인', '해'], // 寅亥破
    ['묘', '오'], // 卯午破
    ['사', '신'], // 巳申破
    ['미', '술'], // 未戌破  
];
// 공망(空亡) 테이블 - 60갑자 순별
exports.VOID_TABLE = {
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
// 십신 (十神) 정의
exports.TEN_GODS = {
    bijian: '비견', // 比肩 - 같은 오행, 같은 음양
    gepcae: '겁재', // 劫財 - 같은 오행, 다른 음양
    sikshin: '식신', // 食神 - 내가 생하는 오행, 같은 음양
    sanggwan: '상관', // 傷官 - 내가 생하는 오행, 다른 음양
    pyeonjae: '편재', // 偏財 - 내가 극하는 오행, 같은 음양
    jeongjae: '정재', // 正財 - 내가 극하는 오행, 다른 음양
    pyeongwan: '편관', // 偏官 (七殺) - 나를 극하는 오행, 같은 음양
    jeonggwan: '정관', // 正官 - 나를 극하는 오행, 다른 음양
    pyeonin: '편인', // 偏印 - 나를 생하는 오행, 같은 음양
    jeongin: '정인', // 正印 - 나를 생하는 오행, 다른 음양
};
// =====================================
// 십신 매핑 매트릭스 (10×10 완전 테이블)
// 행: 일간(日干), 열: 대상 천간 → 십신
// 사주명리학 시스템 지침 v1.0.3 기준
// =====================================
exports.TEN_GOD_MATRIX = {
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
exports.TEN_GOD_GROUPS = {
    companion: ['비견', '겁재'], // 비겁
    output: ['식신', '상관'], // 식상
    wealth: ['정재', '편재'], // 재성
    power: ['정관', '편관'], // 관성
    resource: ['정인', '편인'], // 인성
};
// 십신 영문명 매핑
exports.TEN_GOD_ENGLISH = {
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
// =====================================
// 대운 (大運) 계산 시스템
// 만세력 기준 정확한 대운 산출
// =====================================
// 24절기 태양 황경 테이블 (절입 기준)
exports.SOLAR_TERMS = [
    { name: '입춘', longitude: 315 }, // 인월 시작
    { name: '우수', longitude: 330 },
    { name: '경칩', longitude: 345 }, // 묘월 시작
    { name: '춘분', longitude: 0 },
    { name: '청명', longitude: 15 }, // 진월 시작
    { name: '곡우', longitude: 30 },
    { name: '입하', longitude: 45 }, // 사월 시작
    { name: '소만', longitude: 60 },
    { name: '망종', longitude: 75 }, // 오월 시작
    { name: '하지', longitude: 90 },
    { name: '소서', longitude: 105 }, // 미월 시작
    { name: '대서', longitude: 120 },
    { name: '입추', longitude: 135 }, // 신월 시작
    { name: '처서', longitude: 150 },
    { name: '백로', longitude: 165 }, // 유월 시작
    { name: '추분', longitude: 180 },
    { name: '한로', longitude: 195 }, // 술월 시작
    { name: '상강', longitude: 210 },
    { name: '입동', longitude: 225 }, // 해월 시작
    { name: '소설', longitude: 240 },
    { name: '대설', longitude: 255 }, // 자월 시작
    { name: '동지', longitude: 270 },
    { name: '소한', longitude: 285 }, // 축월 시작
    { name: '대한', longitude: 300 },
];
// 절입 절기 (월 시작 기준, 짝수 인덱스)
exports.MONTH_START_TERMS = [
    { name: '입춘', longitude: 315, monthBranch: '인' },
    { name: '경칩', longitude: 345, monthBranch: '묘' },
    { name: '청명', longitude: 15, monthBranch: '진' },
    { name: '입하', longitude: 45, monthBranch: '사' },
    { name: '망종', longitude: 75, monthBranch: '오' },
    { name: '소서', longitude: 105, monthBranch: '미' },
    { name: '입추', longitude: 135, monthBranch: '신' },
    { name: '백로', longitude: 165, monthBranch: '유' },
    { name: '한로', longitude: 195, monthBranch: '술' },
    { name: '입동', longitude: 225, monthBranch: '해' },
    { name: '대설', longitude: 255, monthBranch: '자' },
    { name: '소한', longitude: 285, monthBranch: '축' },
];
/**
 * 순행/역행 판정
 * 성별과 연간의 음양으로 대운 방향 결정
 */
function determineDaeunDirection(gender, yearStem) {
    // 양간: 갑(甲), 병(丙), 무(戊), 경(庚), 임(壬) - 짝수 인덱스
    const stemIdx = exports.HEAVENLY_STEMS.indexOf(yearStem);
    const isYangStem = stemIdx % 2 === 0;
    // 남자+양간 또는 여자+음간 = 순행
    // 남자+음간 또는 여자+양간 = 역행
    if (gender === 'male') {
        return isYangStem ? '순행' : '역행';
    }
    else {
        return isYangStem ? '역행' : '순행';
    }
}
/**
 * 특정 태양 황경에 도달하는 날짜 계산
 * 이분법을 사용하여 정확한 절기 시점 산출
 */
function findDateForSunLongitude(targetLong, startDate, direction) {
    // 시작점에서 direction 방향으로 탐색
    let currentDate = new Date(startDate);
    let previousDate = new Date(startDate);
    // 최대 400일 탐색 (1년 + 여유)
    for (let i = 0; i < 400; i++) {
        currentDate.setDate(currentDate.getDate() + direction);
        const sunLong = getSunLongitudeForDaeun(currentDate);
        // 목표 황경 통과 확인 (방향에 따라 다름)
        const prevLong = getSunLongitudeForDaeun(previousDate);
        // 360도 경계 처리
        let passed = false;
        if (direction === 1) {
            // 순행: 증가 방향
            if (targetLong >= 315 && targetLong <= 360) {
                // 입춘 등 315~360 범위
                passed = (prevLong < targetLong && sunLong >= targetLong) ||
                    (prevLong > 300 && sunLong < 60); // 360도 넘어감
            }
            else if (targetLong >= 0 && targetLong < 60) {
                // 0~60도 범위
                passed = (prevLong > 300 && sunLong >= targetLong && sunLong < 100) ||
                    (prevLong < targetLong && sunLong >= targetLong);
            }
            else {
                passed = prevLong < targetLong && sunLong >= targetLong;
            }
        }
        else {
            // 역행: 감소 방향
            if (targetLong >= 315 && targetLong <= 360) {
                passed = (prevLong > targetLong && sunLong <= targetLong) ||
                    (prevLong < 60 && sunLong > 300);
            }
            else if (targetLong >= 0 && targetLong < 60) {
                passed = (prevLong < 60 && prevLong >= targetLong && sunLong < targetLong) ||
                    (prevLong > 300 && sunLong <= targetLong);
            }
            else {
                passed = prevLong > targetLong && sunLong <= targetLong;
            }
        }
        if (passed) {
            return currentDate;
        }
        previousDate = new Date(currentDate);
    }
    return currentDate;
}
/**
 * 대운용 태양 황경 계산 (getSunLongitude와 동일하지만 export용)
 */
function getSunLongitudeForDaeun(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate() + (date.getHours() + date.getMinutes() / 60) / 24;
    let y = year;
    let m = month;
    if (m <= 2) {
        y -= 1;
        m += 12;
    }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
    const T = (jd - 2451545.0) / 36525;
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    L0 = L0 % 360;
    if (L0 < 0)
        L0 += 360;
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    M = M * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    let sunLongitude = L0 + C;
    sunLongitude = sunLongitude % 360;
    if (sunLongitude < 0)
        sunLongitude += 360;
    return sunLongitude;
}
/**
 * 생일로부터 다음/이전 절기까지 일수 계산
 * 대운 시작 나이 = 일수 / 3
 *
 * 순행: 생일 → 다음 절기까지의 일수
 * 역행: 생일 → 현재 월이 시작된 절기(이미 지난 절기)까지의 일수
 */
function calculateDaeunStartAge(birthDate, birthHour, direction, monthBranch) {
    const fullBirthDate = new Date(birthDate);
    fullBirthDate.setHours(birthHour);
    // 현재 월지에 해당하는 절기 찾기
    const currentTermIdx = exports.MONTH_START_TERMS.findIndex(t => t.monthBranch === monthBranch);
    if (currentTermIdx === -1) {
        console.warn(`Unknown month branch: ${monthBranch}`);
        return 3; // 기본값
    }
    // 목표 절기 결정
    let targetTermIdx;
    if (direction === '순행') {
        // 순행: 다음 월의 절입 절기까지
        targetTermIdx = (currentTermIdx + 1) % 12;
    }
    else {
        // 역행: 현재 월의 절입 절기까지 (이미 지난 절기)
        // 예: 미월(7월)이면 소서(미월 시작 절기)까지의 거리
        targetTermIdx = currentTermIdx;
    }
    const targetLongitude = exports.MONTH_START_TERMS[targetTermIdx].longitude;
    // 절기 날짜 찾기
    const searchDirection = direction === '순행' ? 1 : -1;
    const termDate = findDateForSunLongitude(targetLongitude, fullBirthDate, searchDirection);
    // 일수 계산
    const diffMs = Math.abs(termDate.getTime() - fullBirthDate.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // 3일 = 1년, 1일 = 4개월, 1시간 = 5일
    const startAge = diffDays / 3;
    return Math.round(startAge * 10) / 10; // 소수점 1자리
}
/**
 * 대운 간지 시퀀스 생성
 * 월주를 기준으로 순행/역행에 따라 10년 단위로 산출
 */
function generateDaeunSequence(monthStem, monthBranch, direction, startAge, dayMaster, count = 10) {
    var _a;
    const sequence = [];
    let stemIdx = exports.HEAVENLY_STEMS.indexOf(monthStem);
    let branchIdx = exports.EARTHLY_BRANCHES.indexOf(monthBranch);
    if (stemIdx === -1 || branchIdx === -1) {
        console.warn(`Invalid month pillar: ${monthStem}${monthBranch}`);
        return sequence;
    }
    for (let i = 0; i < count; i++) {
        // 방향에 따라 인덱스 이동
        if (direction === '순행') {
            stemIdx = (stemIdx + 1) % 10;
            branchIdx = (branchIdx + 1) % 12;
        }
        else {
            stemIdx = (stemIdx - 1 + 10) % 10;
            branchIdx = (branchIdx - 1 + 12) % 12;
        }
        const stem = exports.HEAVENLY_STEMS[stemIdx];
        const branch = exports.EARTHLY_BRANCHES[branchIdx];
        const pillarStartAge = Math.round(startAge) + (i * 10);
        const pillarEndAge = pillarStartAge + 9;
        // 일간 기준 십신 계산
        const tenGod = ((_a = exports.TEN_GOD_MATRIX[dayMaster]) === null || _a === void 0 ? void 0 : _a[stem]) || '알수없음';
        sequence.push({
            stem,
            branch,
            startAge: pillarStartAge,
            endAge: pillarEndAge,
            tenGod
        });
    }
    return sequence;
}
/**
 * 현재 나이에 해당하는 대운 찾기
 */
function findCurrentDaeun(sequence, currentAge) {
    return sequence.find(d => currentAge >= d.startAge && currentAge <= d.endAge);
}
/**
 * 대운 계산 메인 함수
 */
function calculateDaeun(birthDate, birthHour, gender, yearStem, monthStem, monthBranch, dayMaster, currentAge) {
    // 1. 순행/역행 판정
    const direction = determineDaeunDirection(gender, yearStem);
    // 2. 대운 시작 나이 계산
    const startAge = calculateDaeunStartAge(birthDate, birthHour, direction, monthBranch);
    // 3. 대운 시퀀스 생성 (10개)
    const sequence = generateDaeunSequence(monthStem, monthBranch, direction, startAge, dayMaster);
    // 4. 현재 대운 찾기
    const currentDaeun = currentAge !== undefined ? findCurrentDaeun(sequence, currentAge) : undefined;
    // 5. 판정 근거
    const stemIdx = exports.HEAVENLY_STEMS.indexOf(yearStem);
    const yinYangStr = stemIdx % 2 === 0 ? '양간' : '음간';
    const genderStr = gender === 'male' ? '남자' : '여자';
    return {
        direction,
        startAge,
        sequence,
        currentDaeun,
        basis: `${genderStr} + ${yearStem}(${yinYangStr}) = ${direction}`
    };
}
/**
 * 대운 정보를 문자열로 포맷
 */
function formatDaeun(daeun) {
    if (!daeun || !daeun.sequence.length)
        return '대운 정보 없음';
    const lines = [];
    lines.push(`대운 방향: ${daeun.direction} (${daeun.basis})`);
    lines.push(`대운 시작: ${daeun.startAge}세`);
    lines.push(`대운 흐름:`);
    daeun.sequence.forEach(d => {
        const current = daeun.currentDaeun === d ? ' ◀ 현재' : '';
        lines.push(`  ${d.startAge}~${d.endAge}세: ${d.stem}${d.branch} (${d.tenGod})${current}`);
    });
    return lines.join('\n');
}
// =====================================
// 신살 (神殺) 정밀 계산 엔진 (Authentic)
// 연해자평, 삼명통회 등 고전 명리학 기반
// =====================================
var ShinSalType;
(function (ShinSalType) {
    ShinSalType["CHEONEUL"] = "CHEONEUL";
    ShinSalType["MOONCHANG"] = "MOONCHANG";
    ShinSalType["HAKDANG"] = "HAKDANG";
    ShinSalType["JANGSUNG"] = "JANGSUNG";
    ShinSalType["CHEONDEOK"] = "CHEONDEOK";
    ShinSalType["WOLDEOK"] = "WOLDEOK";
    ShinSalType["BANAN"] = "BANAN";
    ShinSalType["DOHWA"] = "DOHWA";
    ShinSalType["HWAGAE"] = "HWAGAE";
    ShinSalType["YORKMA"] = "YORKMA";
    ShinSalType["YANGIN"] = "YANGIN";
    ShinSalType["GEOBSAL"] = "GEOBSAL";
    ShinSalType["JAESAL"] = "JAESAL";
    ShinSalType["BAEKHO"] = "BAEKHO";
    ShinSalType["GOEGANG"] = "GOEGANG";
    ShinSalType["GWIMUN"] = "GWIMUN";
    ShinSalType["HYEONCHIM"] = "HYEONCHIM";
    ShinSalType["CHEONMUN"] = "CHEONMUN";
    ShinSalType["JEONGROK"] = "JEONGROK";
    ShinSalType["WOLSAY"] = "WOLSAY";
    ShinSalType["CHEONSAL"] = "CHEONSAL";
    ShinSalType["JISAL"] = "JISAL";
    ShinSalType["MANGSIN"] = "MANGSIN";
    ShinSalType["YUKHAE"] = "YUKHAE"; // 육해살 (Yuk-hae)
})(ShinSalType || (exports.ShinSalType = ShinSalType = {}));
/**
 * 신살 계산 메인 함수
 * @param result 사주 결과 (SajuResult)
 */
function calculateShinSal(result) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const list = [];
    // 기준점 추출
    const yearBranch = ((_a = result.yeonPillar) === null || _a === void 0 ? void 0 : _a.branch) || ((_b = result.yearPillar) === null || _b === void 0 ? void 0 : _b.branch);
    const dayBranch = (_c = result.dayPillar) === null || _c === void 0 ? void 0 : _c.branch;
    const dayStem = (_d = result.dayPillar) === null || _d === void 0 ? void 0 : _d.stem;
    const monthBranch = (_e = result.monthPillar) === null || _e === void 0 ? void 0 : _e.branch; // Added for Cheondeok/Woldeok
    if (!yearBranch || !dayBranch || !dayStem)
        return [];
    const allBranches = [
        ((_f = result.yeonPillar) === null || _f === void 0 ? void 0 : _f.branch) || ((_g = result.yearPillar) === null || _g === void 0 ? void 0 : _g.branch),
        (_h = result.monthPillar) === null || _h === void 0 ? void 0 : _h.branch,
        (_j = result.dayPillar) === null || _j === void 0 ? void 0 : _j.branch,
        (_k = result.hourPillar) === null || _k === void 0 ? void 0 : _k.branch
    ].filter(Boolean);
    const allStems = [
        ((_l = result.yeonPillar) === null || _l === void 0 ? void 0 : _l.stem) || ((_m = result.yearPillar) === null || _m === void 0 ? void 0 : _m.stem),
        (_o = result.monthPillar) === null || _o === void 0 ? void 0 : _o.stem,
        (_p = result.dayPillar) === null || _p === void 0 ? void 0 : _p.stem,
        (_q = result.hourPillar) === null || _q === void 0 ? void 0 : _q.stem
    ].filter(Boolean);
    const myPillars = [
        result.yeonPillar, result.monthPillar, result.dayPillar, result.hourPillar
    ].filter(Boolean).map(p => (p.stem || '') + (p.branch || ''));
    // 12신살 맵핑 (겁재천지년월망장반역육화)
    const group12Map = {
        '목': ['신', '유', '술', '해', '자', '축', '인', '묘', '진', '사', '오', '미'],
        '화': ['해', '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술'],
        '금': ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'],
        '수': ['사', '오', '미', '신', '유', '술', '해', '자', '축', '인', '묘', '진']
    };
    const getSamHapGroup = (b) => {
        if (['인', '오', '술'].includes(b))
            return '화';
        if (['신', '자', '진'].includes(b))
            return '수';
        if (['사', '유', '축'].includes(b))
            return '금';
        if (['해', '묘', '미'].includes(b))
            return '목';
        return null;
    };
    const salTypes = [
        ShinSalType.GEOBSAL, ShinSalType.JAESAL, ShinSalType.CHEONSAL,
        ShinSalType.JISAL, ShinSalType.DOHWA, ShinSalType.WOLSAY,
        ShinSalType.MANGSIN, ShinSalType.JANGSUNG, ShinSalType.BANAN,
        ShinSalType.YORKMA, ShinSalType.YUKHAE, ShinSalType.HWAGAE
    ];
    const salNames = [
        '겁살 (Robbery Star)', '재살 (Disaster Star)', '천살 (Heavenly Curse)',
        '지살 (Earthly Foundation)', '도화살 (Peach Blossom)', '월살 (Creeper Star)',
        '망신살 (Public Shame)', '장성살 (General Star)', '반안살 (Road to Success)',
        '역마살 (Global Nomad)', '육해살 (Six Damages)', '화개살 (Artistic Talent)'
    ];
    const salDescs = [
        '강력한 경쟁심과 투쟁적 에너지', '위기를 기회로 바꾸는 영리한 지혜', '하늘의 엄중함과 정신적 성찰',
        '이동과 변화를 통한 새로운 기반', '사람을 홀리는 치명적인 매력', '어둠 속에 피어나는 고독한 지성',
        '드러내고 표현하며 얻는 명성과 실책', '조직의 중심에서 발휘하는 강력한 권위', '안전한 자리에 올라탄 순탄한 성공',
        '세상을 누비며 기회를 찾는 역동성', '빠른 순발력과 민감한 감수성', '깊은 예술성과 지성, 정신적 깊이'
    ];
    // 12신살 전수 조사 (년/일 기준 모두 반영)
    [yearBranch, dayBranch].forEach((basis, basisIdx) => {
        const group = getSamHapGroup(basis);
        if (!group)
            return;
        const map = group12Map[group];
        allBranches.forEach((target) => {
            const salIdx = map.indexOf(target);
            if (salIdx !== -1) {
                const type = salTypes[salIdx];
                // 중복 방지 (이미 같은 타입이 있으면 레벨만 보강하거나 스킵)
                if (!list.find(s => s.type === type)) {
                    list.push({
                        type,
                        name: salNames[salIdx],
                        description: salDescs[salIdx],
                        level: 60 + (basisIdx * 10) // 일지 기준에 조금 더 가중치
                    });
                }
            }
        });
    });
    // 2. 길신(Noble) 및 특수 신살
    // 2-1. 정록 (Jeong-rok) - 건록
    const luMap = {
        '갑': '인', '을': '묘', '병': '사', '정': '오', '무': '사',
        '기': '오', '경': '신', '신': '유', '임': '해', '계': '자'
    };
    if (allBranches.includes(luMap[dayStem])) {
        list.push({
            type: ShinSalType.JEONGROK,
            name: '정록 (Celestial Wage)',
            description: '하늘이 내린 안정적인 복록과 품격 있는 삶',
            level: 85
        });
    }
    // 2-2. 천을귀인
    const cheoneulMap = {
        '갑': ['축', '미'], '무': ['축', '미'], '경': ['축', '미'],
        '을': ['자', '신'], '기': ['자', '신'],
        '병': ['해', '유'], '정': ['해', '유'],
        '신': ['오', '인'],
        '임': ['사', '묘'], '계': ['사', '묘']
    };
    const teulTargets = cheoneulMap[dayStem] || [];
    const teulCount = allBranches.filter(b => teulTargets.includes(b)).length;
    if (teulCount > 0) {
        list.push({ type: ShinSalType.CHEONEUL, name: '천을귀인 (Guardian Angel)', description: '하늘이 내린 최고의 수호신. 위기에서 구원받음', level: 90 });
    }
    // 2-3. 학당/문창
    const hakMap = { '갑': '해', '을': '오', '병': '인', '정': '유', '무': '인', '기': '유', '경': '사', '신': '자', '임': '신', '계': '묘' };
    if (allBranches.includes(hakMap[dayStem])) {
        list.push({ type: ShinSalType.HAKDANG, name: '학당귀인 (Academy Noble)', description: '학문적 성취와 가르치는 재능이 뛰어난 지능', level: 80 });
    }
    const moonMap = { '갑': '사', '을': '오', '병': '신', '정': '유', '무': '신', '기': '유', '경': '해', '신': '자', '임': '인', '계': '묘' };
    if (allBranches.includes(moonMap[dayStem])) {
        list.push({ type: ShinSalType.MOONCHANG, name: '문창귀인 (Academic Star)', description: '깊은 지혜와 뛰어난 문장력으로 성공할 운명', level: 80 });
    }
    // 2-4. 천덕귀인 (Heavenly Virtue)
    const cheondeokMap = { '인': '정', '묘': '신', '진': '임', '사': '신', '오': '해', '미': '갑', '신': '계', '유': '인', '술': '병', '해': '을', '자': '사', '축': '경' };
    if (monthBranch && allStems.includes(cheondeokMap[monthBranch])) {
        list.push({ type: ShinSalType.CHEONDEOK, name: '천덕귀인 (Heavenly Virtue)', description: '하늘의 은덕으로 온갖 재앙을 물리치는 신성한 기운', level: 85 });
    }
    // 2-5. 월덕귀인 (Monthly Virtue)
    const woldeokBasis = { '인': '병', '오': '병', '술': '병', '신': '임', '자': '임', '진': '임', '사': '경', '유': '경', '축': '경', '해': '갑', '묘': '갑', '미': '갑' };
    if (monthBranch && allStems.includes(woldeokBasis[monthBranch])) {
        list.push({ type: ShinSalType.WOLDEOK, name: '월덕귀인 (Monthly Virtue)', description: '달의 기운으로 인덕이 따르고 도움을 받는 길운', level: 85 });
    }
    // 3. 흉살 및 강력한 살
    const yanginMap = { '갑': '묘', '병': '오', '무': '오', '경': '유', '임': '자' };
    if (allBranches.includes(yanginMap[dayStem])) {
        list.push({ type: ShinSalType.YANGIN, name: '양인살 (Charismatic Leader)', description: '압도적인 카리스마와 실행력을 가진 장군의 운명', level: 90 });
    }
    const baekhoPillars = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];
    const baekhoCount = myPillars.filter(p => baekhoPillars.includes(p)).length;
    if (baekhoCount > 0) {
        list.push({ type: ShinSalType.BAEKHO, name: '백호대살 (White Tiger)', description: '비범한 에너지와 폭발적인 기세를 가진 전문성', level: 85 });
    }
    const goegangPillars = ['무술', '경진', '경술', '임진', '임술', '무진'];
    const goegangCount = myPillars.filter(p => goegangPillars.includes(p)).length;
    if (goegangCount > 0) {
        list.push({ type: ShinSalType.GOEGANG, name: '괴강살 (Master Leader)', description: '대중을 압도하는 통솔력과 강력한 리더 기질', level: 85 });
    }
    const gwiMap = { '자': '유', '축': '오', '인': '미', '묘': '신', '진': '해', '사': '술', '유': '자', '오': '축', '미': '인', '신': '묘', '해': '진', '술': '사' };
    if (allBranches.includes(gwiMap[dayBranch])) {
        list.push({ type: ShinSalType.GWIMUN, name: '귀문관살 (Sixth Sense)', description: '예민한 직관력과 남다른 감수성, 천재적인 영감', level: 85 });
    }
    const needleChars = ['갑', '신', '묘', '오', '신']; // Note: '신' appears twice, but it's fine for checking presence
    const needleCount = [...allStems, ...allBranches].filter(c => needleChars.includes(c)).length;
    if (needleCount >= 2) {
        list.push({ type: ShinSalType.HYEONCHIM, name: '현침살 (Sharp Precision)', description: '바늘 끝처럼 예리한 분석력과 완벽한 전문성', level: 75 });
    }
    const checkCheonmun = allBranches.filter(b => ['술', '해'].includes(b)).length;
    if (checkCheonmun >= 1) {
        list.push({ type: ShinSalType.CHEONMUN, name: '천문성 (Healer)', description: '사람을 치유하고 살리는 활인업의 자비로운 기운', level: 70 + (checkCheonmun * 10) });
    }
    return list.sort((a, b) => b.level - a.level);
}
/**
 * 십신별 길흉 점수 (신강/신약에 따라 다름)
 */
const TEN_GOD_SCORE = {
    '비견': { STRONG: -1, WEAK: 2, BALANCED: 0 },
    '겁재': { STRONG: -3, WEAK: -2, BALANCED: -2 },
    '식신': { STRONG: 3, WEAK: 1, BALANCED: 2 },
    '상관': { STRONG: 1, WEAK: -1, BALANCED: 0 },
    '편재': { STRONG: 2, WEAK: -1, BALANCED: 1 },
    '정재': { STRONG: 2, WEAK: 0, BALANCED: 1 },
    '편관': { STRONG: 1, WEAK: -3, BALANCED: -1 },
    '정관': { STRONG: 2, WEAK: -1, BALANCED: 1 },
    '편인': { STRONG: -2, WEAK: -1, BALANCED: -1 },
    '정인': { STRONG: -1, WEAK: 2, BALANCED: 1 },
};
/**
 * 12운성별 점수 (신강/신약에 따라 다름)
 */
const TWELVE_STAGE_SCORE = {
    '장생': { STRONG: 1, WEAK: 2, BALANCED: 1 },
    '목욕': { STRONG: 0, WEAK: 0, BALANCED: 0 },
    '관대': { STRONG: 1, WEAK: 2, BALANCED: 1 },
    '건록': { STRONG: 0, WEAK: 3, BALANCED: 2 },
    '제왕': { STRONG: -2, WEAK: 3, BALANCED: 1 },
    '쇠': { STRONG: 1, WEAK: -1, BALANCED: 0 },
    '병': { STRONG: 2, WEAK: -2, BALANCED: -1 },
    '사': { STRONG: 2, WEAK: -3, BALANCED: -1 },
    '묘': { STRONG: 2, WEAK: -3, BALANCED: -2 },
    '절': { STRONG: 2, WEAK: -4, BALANCED: -2 },
    '태': { STRONG: 0, WEAK: 0, BALANCED: 0 },
    '양': { STRONG: 0, WEAK: 1, BALANCED: 0 },
};
/**
 * 연도 → 간지 변환
 */
function yearToGanji(year) {
    const diff = year - 1984; // 1984년 = 갑자년
    const stemIdx = ((diff % 10) + 10) % 10;
    const branchIdx = ((diff % 12) + 12) % 12;
    return {
        stem: exports.HEAVENLY_STEMS[stemIdx],
        branch: exports.EARTHLY_BRANCHES[branchIdx]
    };
}
/**
 * 세운과 원국/대운의 상호작용 체크
 */
function checkSewoonInteractions(sewoonBranch, dayBranch, daewoonBranch, natalBranches) {
    // 충 체크
    const clashWithDayBranch = exports.BRANCH_CLASHES.some(([a, b]) => (a === sewoonBranch && b === dayBranch) || (b === sewoonBranch && a === dayBranch));
    const clashWithDaewoon = daewoonBranch
        ? exports.BRANCH_CLASHES.some(([a, b]) => (a === sewoonBranch && b === daewoonBranch) || (b === sewoonBranch && a === daewoonBranch))
        : false;
    // 육합 체크
    const combineWithDayBranch = exports.BRANCH_COMBINES.some(c => (c.pair[0] === sewoonBranch && c.pair[1] === dayBranch) ||
        (c.pair[1] === sewoonBranch && c.pair[0] === dayBranch));
    // 삼합 체크 (원국 + 세운)
    let threeHarmony;
    if (natalBranches) {
        const allBranches = [...natalBranches, sewoonBranch];
        for (const th of exports.BRANCH_THREE_HARMONIES) {
            const matches = th.trio.filter(t => allBranches.includes(t));
            if (matches.length === 3) {
                threeHarmony = { formed: true, element: th.element };
                break;
            }
        }
    }
    // 형 체크
    const punishmentPresent = exports.BRANCH_PUNISHMENTS.some(set => {
        const branches = [sewoonBranch, dayBranch];
        return set.members.every(m => branches.includes(m));
    });
    // 해 체크
    const harmPresent = exports.BRANCH_HARMS.some(([a, b]) => (a === sewoonBranch && b === dayBranch) || (b === sewoonBranch && a === dayBranch));
    return {
        clashWithDayBranch,
        clashWithDaewoon,
        combineWithDayBranch,
        threeHarmony,
        punishmentPresent,
        harmPresent
    };
}
/**
 * 세운 길흉 스코어 계산
 */
function calculateSewoonScore(tenGod, twelveStage, interactions, bodyStrength) {
    var _a;
    let score = 0;
    // 1. 십신 점수
    const strengthKey = (bodyStrength === '신강' || bodyStrength === '중화신강') ? 'STRONG' :
        (bodyStrength === '신약' || bodyStrength === '중화신약') ? 'WEAK' : 'BALANCED';
    const tenGodScore = TEN_GOD_SCORE[tenGod];
    if (tenGodScore) {
        score += tenGodScore[strengthKey];
    }
    // 2. 12운성 점수
    const stageScore = TWELVE_STAGE_SCORE[twelveStage];
    if (stageScore) {
        score += stageScore[strengthKey];
    }
    // 3. 상호작용 점수
    if (interactions.clashWithDayBranch)
        score -= 4; // 일지충 = 변동/사고
    if (interactions.clashWithDaewoon)
        score -= 5; // 운충운 = 극흉
    if (interactions.combineWithDayBranch)
        score += 2; // 육합 = 길
    if ((_a = interactions.threeHarmony) === null || _a === void 0 ? void 0 : _a.formed)
        score += 2; // 삼합 = 길
    if (interactions.punishmentPresent)
        score -= 2; // 형 = 흉
    if (interactions.harmPresent)
        score -= 1; // 해 = 소흉
    // 점수 범위 제한
    return Math.max(-10, Math.min(10, score));
}
/**
 * 점수 → 등급 변환
 */
function getGradeFromScore(score) {
    if (score >= 5)
        return '대길';
    if (score >= 2)
        return '길';
    if (score >= -1)
        return '중립';
    if (score >= -4)
        return '소흉';
    return '흉';
}
/**
 * 세운 요약 문장 생성
 */
function generateSewoonSummary(year, tenGod, interactions, grade) {
    const parts = [];
    // 기본 십신 설명
    const tenGodDescriptions = {
        '비견': '자립심과 경쟁심이 강해지는 해',
        '겁재': '경쟁과 재물 변동에 주의가 필요한 해',
        '식신': '표현력과 복록이 늘어나는 해',
        '상관': '재능 발휘와 언변에 신경 써야 할 해',
        '편재': '사업과 투자 기회가 생기는 해',
        '정재': '안정적인 재물 관리가 중요한 해',
        '편관': '압박과 도전이 있는 해',
        '정관': '명예와 승진 운이 있는 해',
        '편인': '비정통적 학문과 변화의 해',
        '정인': '학업과 자격 취득에 좋은 해',
    };
    parts.push(tenGodDescriptions[tenGod] || `${tenGod}의 영향을 받는 해`);
    // 특별 상호작용 경고
    if (interactions.clashWithDaewoon) {
        parts.push('⚠️ 운충운(運沖運): 대운과 세운이 충돌하여 특히 주의가 필요');
    }
    if (interactions.clashWithDayBranch) {
        parts.push('⚠️ 일지충: 배우자/거주지 변동 가능성');
    }
    if (interactions.combineWithDayBranch) {
        parts.push('✨ 일지와 합: 협력과 조화의 기운');
    }
    return `${year}년 (${grade}): ${parts.join('. ')}.`;
}
/**
 * 세운 계산 메인 함수
 */
function calculateSewoon(year, dayMaster, dayBranch, bodyStrength, daewoonBranch, natalBranches) {
    var _a;
    // 1. 연도 → 간지 변환
    const { stem, branch } = yearToGanji(year);
    // 2. 일간 기준 십신 계산
    const tenGod = ((_a = exports.TEN_GOD_MATRIX[dayMaster]) === null || _a === void 0 ? void 0 : _a[stem]) || '비견';
    // 3. 일간 기준 12운성 계산
    const twelveStage = calculateTwelveStage(dayMaster, branch);
    // 4. 원국/대운과 상호작용 체크
    const interactions = checkSewoonInteractions(branch, dayBranch, daewoonBranch, natalBranches);
    // 5. 길흉 스코어 계산
    const score = calculateSewoonScore(tenGod, twelveStage, interactions, bodyStrength);
    const grade = getGradeFromScore(score);
    // 6. 요약 생성
    const summary = generateSewoonSummary(year, tenGod, interactions, grade);
    return {
        year,
        stem,
        branch,
        tenGod,
        twelveStage,
        interactions,
        score,
        grade,
        summary
    };
}
/**
 * 다중 연도 세운 계산 (예: 2026~2030년)
 */
function calculateMultiYearSewoon(startYear, endYear, dayMaster, dayBranch, bodyStrength, daewoonBranch, natalBranches) {
    const results = [];
    for (let year = startYear; year <= endYear; year++) {
        results.push(calculateSewoon(year, dayMaster, dayBranch, bodyStrength, daewoonBranch, natalBranches));
    }
    return results;
}
/**
 * 세운 정보를 문자열로 포맷
 */
function formatSewoon(sewoon) {
    const lines = [];
    lines.push(`${sewoon.year}년 세운: ${sewoon.stem}${sewoon.branch}`);
    lines.push(`십신: ${sewoon.tenGod} | 12운성: ${sewoon.twelveStage}`);
    lines.push(`길흉: ${sewoon.grade} (${sewoon.score > 0 ? '+' : ''}${sewoon.score}점)`);
    lines.push(sewoon.summary);
    return lines.join('\n');
}
/**
 * 월 → 월지 변환
 * 절입 기준 음력 월지
 */
const MONTH_TO_BRANCH = [
    '축', // 1월 (대한~입춘 전) - 축월
    '인', // 2월 (입춘~경칩 전) - 인월
    '묘', // 3월 (경칩~청명 전) - 묘월
    '진', // 4월 (청명~입하 전) - 진월
    '사', // 5월 (입하~망종 전) - 사월
    '오', // 6월 (망종~소서 전) - 오월
    '미', // 7월 (소서~입추 전) - 미월
    '신', // 8월 (입추~백로 전) - 신월
    '유', // 9월 (백로~한로 전) - 유월
    '술', // 10월 (한로~입동 전) - 술월
    '해', // 11월 (입동~대설 전) - 해월
    '자', // 12월 (대설~소한 전) - 자월
];
/**
 * 연간 + 월 → 월간 변환 (연상기월법)
 */
function getMonthStem(yearStem, monthIdx) {
    // 연상기월법: 연간에 따라 정월(인월)의 천간이 정해짐
    // 갑기년 → 병인월 시작 (병=2)
    // 을경년 → 무인월 시작 (무=4)
    // 병신년 → 경인월 시작 (경=6)
    // 정임년 → 임인월 시작 (임=8)
    // 무계년 → 갑인월 시작 (갑=0)
    var _a;
    const yearStemStartMap = {
        '갑': 2, '기': 2, // 갑기 → 병(2)
        '을': 4, '경': 4, // 을경 → 무(4)
        '병': 6, '신': 6, // 병신 → 경(6)
        '정': 8, '임': 8, // 정임 → 임(8)
        '무': 0, '계': 0, // 무계 → 갑(0)
    };
    const startStemIdx = (_a = yearStemStartMap[yearStem]) !== null && _a !== void 0 ? _a : 0;
    // monthIdx: 0=1월(축), 1=2월(인)...
    // 인월(2월, idx=1)이 시작점
    const offset = (monthIdx + 11) % 12; // 인월 기준으로 조정
    const stemIdx = (startStemIdx + offset) % 10;
    return exports.HEAVENLY_STEMS[stemIdx];
}
/**
 * 월운 점수 계산
 */
function calculateWolwoonScore(tenGod, twelveStage, bodyStrength, clashWithSewoon) {
    var _a, _b, _c, _d;
    const strengthKey = (bodyStrength === '신강' || bodyStrength === '중화신강') ? 'STRONG' :
        (bodyStrength === '신약' || bodyStrength === '중화신약') ? 'WEAK' : 'BALANCED';
    let score = 0;
    // 십신 점수 (세운의 절반 정도 영향)
    const tenGodScore = (_b = (_a = TEN_GOD_SCORE[tenGod]) === null || _a === void 0 ? void 0 : _a[strengthKey]) !== null && _b !== void 0 ? _b : 0;
    score += Math.round(tenGodScore * 0.5);
    // 12운성 점수 (세운의 절반 정도 영향)
    const stageScore = (_d = (_c = TWELVE_STAGE_SCORE[twelveStage]) === null || _c === void 0 ? void 0 : _c[strengthKey]) !== null && _d !== void 0 ? _d : 0;
    score += Math.round(stageScore * 0.5);
    // 세운과 충 시 감점
    if (clashWithSewoon) {
        score -= 2;
    }
    return Math.max(-5, Math.min(5, score));
}
/**
 * 월운 등급 결정
 */
function getWolwoonGrade(score) {
    if (score >= 4)
        return '대길';
    if (score >= 2)
        return '길';
    if (score >= -1)
        return '중립';
    if (score >= -3)
        return '소흉';
    return '흉';
}
/**
 * 단일 월운 계산
 */
function calculateWolwoon(year, month, dayMaster, bodyStrength, sewoonBranch) {
    var _a;
    // 연도 간지
    const { stem: yearStem } = yearToGanji(year);
    // 월 간지
    const monthIdx = month - 1; // 0-indexed
    const branch = MONTH_TO_BRANCH[monthIdx];
    const stem = getMonthStem(yearStem, monthIdx);
    // 십신 계산
    const tenGod = ((_a = exports.TEN_GOD_MATRIX[dayMaster]) === null || _a === void 0 ? void 0 : _a[stem]) || '비견';
    // 12운성 계산
    const twelveStage = calculateTwelveStage(dayMaster, branch);
    // 세운과 충 확인
    const clashWithSewoon = exports.BRANCH_CLASHES.some(([a, b]) => (a === branch && b === sewoonBranch) || (b === branch && a === sewoonBranch));
    // 점수 계산
    const score = calculateWolwoonScore(tenGod, twelveStage, bodyStrength, clashWithSewoon);
    const grade = getWolwoonGrade(score);
    // 요약 생성
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    let summary = `${monthNames[monthIdx]} (${stem}${branch}): ${tenGod}운, ${twelveStage}`;
    if (clashWithSewoon) {
        summary += ' ⚠️세운충';
    }
    return {
        year,
        month,
        stem,
        branch,
        tenGod,
        twelveStage,
        score,
        grade,
        clashWithSewoon,
        summary
    };
}
/**
 * 연간 12개월 월운 계산
 */
function calculateYearlyWolwoon(year, dayMaster, bodyStrength) {
    const { branch: sewoonBranch } = yearToGanji(year);
    const results = [];
    for (let month = 1; month <= 12; month++) {
        results.push(calculateWolwoon(year, month, dayMaster, bodyStrength, sewoonBranch));
    }
    return results;
}
/**
 * 월운 하이라이트 추출 (길/흉 상위 3개월)
 */
function getWolwoonHighlights(wolwoons) {
    const sorted = [...wolwoons].sort((a, b) => b.score - a.score);
    return {
        bestMonths: sorted.slice(0, 3),
        worstMonths: sorted.slice(-3).reverse()
    };
}
/**
 * 월운 포맷 (한 줄 요약)
 */
function formatWolwoon(wolwoon) {
    const icon = wolwoon.grade === '대길' ? '🌟' :
        wolwoon.grade === '길' ? '✨' :
            wolwoon.grade === '흉' ? '⚠️' :
                wolwoon.grade === '소흉' ? '⚡' : '○';
    return `${icon} ${wolwoon.month}월: ${wolwoon.tenGod} (${wolwoon.grade})`;
}
// =====================================
// 12운성 / 지장간 계산 함수
// =====================================
/**
 * 12운성 계산
 * 일간을 기준으로 각 지지의 12운성을 판정
 */
function calculateTwelveStage(dayMaster, branch) {
    const matrix = exports.TWELVE_STAGE_MATRIX[dayMaster];
    if (!matrix || !matrix[branch]) {
        console.warn(`Unknown day master or branch: ${dayMaster}, ${branch}`);
        return '쇠'; // 기본값
    }
    return matrix[branch];
}
/**
 * 사주 전체의 12운성 계산
 */
function calculateAllTwelveStages(dayMaster, branches) {
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
function getHiddenStems(branch) {
    const hidden = exports.HIDDEN_STEMS[branch];
    if (!hidden) {
        console.warn(`Unknown branch for hidden stems: ${branch}`);
        return { jeonggi: '무' }; // 기본값
    }
    return hidden;
}
/**
 * 사주 전체의 지장간 계산
 */
function calculateAllHiddenStems(branches) {
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
function getTwelveStageStrength(stage) {
    return exports.TWELVE_STAGE_NATURE[stage];
}
/**
 * 득령(得令) 판정
 * 일간이 월지에서 왕성한 12운성(장생/관대/건록/제왕)을 얻었는지 확인
 */
function checkDeungryeong(dayMaster, monthBranch) {
    const stage = calculateTwelveStage(dayMaster, monthBranch);
    const strongStages = ['장생', '관대', '건록', '제왕'];
    return strongStages.includes(stage);
}
// =====================================
// 지지 상호작용 판정 함수 (Phase 3)
// =====================================
/**
 * 충(沖) 판정
 * 두 지지가 충 관계인지 확인
 */
function detectClash(branch1, branch2) {
    return exports.BRANCH_CLASHES.some(([a, b]) => (a === branch1 && b === branch2) || (a === branch2 && b === branch1));
}
/**
 * 사주 전체에서 충 찾기
 */
function detectAllClashes(branches) {
    const clashes = [];
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
function detectCombine(branch1, branch2) {
    const combine = exports.BRANCH_COMBINES.find(({ pair }) => (pair[0] === branch1 && pair[1] === branch2) || (pair[0] === branch2 && pair[1] === branch1));
    return combine ? { found: true, element: combine.element } : { found: false };
}
/**
 * 사주 전체에서 육합 찾기
 */
function detectAllCombines(branches) {
    const combines = [];
    for (let i = 0; i < branches.length; i++) {
        for (let j = i + 1; j < branches.length; j++) {
            const result = detectCombine(branches[i], branches[j]);
            if (result.found) {
                combines.push({
                    type: '합',
                    branches: [branches[i], branches[j]],
                    element: result.element,
                    description: `${branches[i]}${branches[j]}합${result.element ? exports.FIVE_ELEMENTS[result.element] : ''}`
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
function detectThreeHarmony(branches) {
    const results = [];
    for (const { trio, element } of exports.BRANCH_THREE_HARMONIES) {
        const present = trio.filter(b => branches.includes(b));
        if (present.length === 3) {
            // 완전 삼합
            results.push({
                type: '삼합',
                branches: present,
                element,
                description: `${present.join('')} ${exports.FIVE_ELEMENTS[element]}국 (완전삼합)`
            });
        }
        else if (present.length === 2) {
            // 반합 (중심 지지 포함 여부 확인)
            const center = trio[1]; // 중심 지지
            if (present.includes(center)) {
                results.push({
                    type: '삼합',
                    branches: present,
                    element,
                    description: `${present.join('')} ${exports.FIVE_ELEMENTS[element]}국 (반합)`
                });
            }
        }
    }
    return results;
}
/**
 * 방합/삼회(三會) 판정
 */
function detectDirectional(branches) {
    const results = [];
    for (const { trio, element, season } of exports.BRANCH_DIRECTIONAL) {
        const present = trio.filter(b => branches.includes(b));
        if (present.length === 3) {
            results.push({
                type: '방합',
                branches: present,
                element,
                description: `${present.join('')} ${season} ${exports.FIVE_ELEMENTS[element]}국`
            });
        }
    }
    return results;
}
/**
 * 형(刑) 판정
 */
function detectPunishments(branches) {
    const results = [];
    for (const { type, members } of exports.BRANCH_PUNISHMENTS) {
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
        }
        else {
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
function detectHarms(branches) {
    const results = [];
    for (let i = 0; i < branches.length; i++) {
        for (let j = i + 1; j < branches.length; j++) {
            const isHarm = exports.BRANCH_HARMS.some(([a, b]) => (a === branches[i] && b === branches[j]) || (a === branches[j] && b === branches[i]));
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
function detectBreaks(branches) {
    const results = [];
    for (let i = 0; i < branches.length; i++) {
        for (let j = i + 1; j < branches.length; j++) {
            const isBreak = exports.BRANCH_BREAKS.some(([a, b]) => (a === branches[i] && b === branches[j]) || (a === branches[j] && b === branches[i]));
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
function getVoidBranches(dayStem, dayBranch) {
    const dayPillar = dayStem + dayBranch;
    return exports.VOID_TABLE[dayPillar] || ['미확정', '미확정'];
}
/**
 * 사주에서 공망에 해당하는 지지 찾기
 */
function detectVoids(dayStem, dayBranch, branches) {
    const [void1, void2] = getVoidBranches(dayStem, dayBranch);
    return branches.filter(b => b === void1 || b === void2);
}
/**
 * 전체 지지 상호작용 분석
 */
function analyzeAllInteractions(branches, dayStem, dayBranch) {
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
/**
 * 월지 정기(正氣)로 격국 십신 판정
 * 격국은 월지 정기가 일간에 대해 어떤 십신인지로 결정
 */
function getMonthJeonggiTenGod(dayMaster, monthBranch) {
    const hidden = exports.HIDDEN_STEMS[monthBranch];
    if (!hidden)
        return '알수없음';
    const jeonggi = hidden.jeonggi;
    const matrix = exports.TEN_GOD_MATRIX[dayMaster];
    if (!matrix || !matrix[jeonggi])
        return '알수없음';
    return matrix[jeonggi];
}
/**
 * 투출(透出) 확인
 * 월지 정기가 천간 4주 중 하나라도 나타났는지 확인
 */
function checkTouchu(monthBranch, stems) {
    const hidden = exports.HIDDEN_STEMS[monthBranch];
    if (!hidden)
        return false;
    const jeonggi = hidden.jeonggi;
    return stems.includes(jeonggi);
}
/**
 * 통근(通根) 확인
 * 투출된 천간이 지지에 뿌리(같은 오행)가 있는지 확인
 */
function checkTongguen(stem, branches) {
    const stemElement = exports.STEM_ELEMENTS[stem];
    if (!stemElement)
        return false;
    return branches.some(branch => {
        const branchElement = exports.BRANCH_ELEMENTS[branch];
        return branchElement === stemElement;
    });
}
/**
 * 청순(淸純) 확인
 * 해당 십신이 혼잡 없이 주도적인지 확인
 * 특히 관살혼잡 체크
 */
function checkPurity(gyeokTenGod, tenGods, dayMaster, stems) {
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
function checkSpecialStructure(dayMaster, monthBranch) {
    var _a;
    const stage = (_a = exports.TWELVE_STAGE_MATRIX[dayMaster]) === null || _a === void 0 ? void 0 : _a[monthBranch];
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
function determineGyeokguk(dayMaster, monthBranch, stems, branches, tenGods) {
    var _a, _b, _c;
    // 1. 특수격(건록격/양인격) 우선 체크
    const specialGyeok = checkSpecialStructure(dayMaster, monthBranch);
    if (specialGyeok) {
        const stage = ((_a = exports.TWELVE_STAGE_MATRIX[dayMaster]) === null || _a === void 0 ? void 0 : _a[monthBranch]) || '건록';
        return {
            type: specialGyeok,
            basis: `월지 ${monthBranch}가 일간 ${dayMaster}의 ${stage}지`,
            monthJeonggi: ((_b = exports.HIDDEN_STEMS[monthBranch]) === null || _b === void 0 ? void 0 : _b.jeonggi) || '',
            monthTenGod: '비견', // 건록/양인은 비겁 계열
            isTouchu: true,
            isTongguen: true,
            isPure: true,
            strength: 'strong'
        };
    }
    // 2. 월지 정기 -> 십신 판정
    const hidden = exports.HIDDEN_STEMS[monthBranch];
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
    const monthTenGod = ((_c = exports.TEN_GOD_MATRIX[dayMaster]) === null || _c === void 0 ? void 0 : _c[jeonggi]) || '알수없음';
    // 3. 1문: 투출(透出) 여부
    const isTouchu = checkTouchu(monthBranch, stems);
    // 4. 2문: 통근(通根) 여부
    const isTongguen = isTouchu ? checkTongguen(jeonggi, branches) : false;
    // 5. 3문: 청순(淸純) 여부
    const isPure = checkPurity(monthTenGod, tenGods, dayMaster, stems);
    // 6. 격국 결정
    let gyeokType = '보통격';
    let strength = 'weak';
    if (isTouchu && isTongguen && isPure) {
        // 완전 성립
        strength = 'strong';
    }
    else if (isTouchu || isTongguen) {
        // 부분 성립
        strength = 'medium';
    }
    // 십신에 따른 격국 명칭
    switch (monthTenGod) {
        case '정관':
            gyeokType = '정관격';
            break;
        case '편관':
            gyeokType = '편관격';
            break;
        case '정재':
            gyeokType = '정재격';
            break;
        case '편재':
            gyeokType = '편재격';
            break;
        case '정인':
            gyeokType = '정인격';
            break;
        case '편인':
            gyeokType = '편인격';
            break;
        case '식신':
            gyeokType = '식신격';
            break;
        case '상관':
            gyeokType = '상관격';
            break;
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
function getGyeokgukDescription(result) {
    if (result.strength === 'strong') {
        return `${result.type} 완전 성립 (투출+통근+청순)`;
    }
    else if (result.strength === 'medium') {
        return `${result.type} 부분 성립`;
    }
    else {
        return `${result.type} 약함 또는 불성립`;
    }
}
// 조후(調候) 테이블 - 월지별 환경
exports.JOHU_TABLE = {
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
 * 신강/신약 판정 (프스텔러 기준 4요소 분석)
 * 득령(得令) / 득지(得地) / 득시(得時) / 득세(得勢)
 */
function calculateBodyStrength(dayMaster, monthBranch, twelveStages, tenGodGroups, elementDistribution) {
    var _a;
    const dayElement = exports.STEM_ELEMENTS[dayMaster];
    // 1. 득령 (得令): 월지 정기가 일간과 동일 오행이거나 일간을 생해주는가?
    // 즉, 월지 정기 = 비겁 또는 인성 관계
    const monthJeonggi = (_a = exports.HIDDEN_STEMS[monthBranch]) === null || _a === void 0 ? void 0 : _a.jeonggi;
    const monthJeonggiElement = monthJeonggi ? exports.STEM_ELEMENTS[monthJeonggi] : null;
    // 오행 생극 관계: A가 B를 생한다 (A → B)
    const generatesMap = {
        'wood': 'fire', 'fire': 'earth', 'earth': 'metal', 'metal': 'water', 'water': 'wood'
    };
    // 득령: 월지정기가 일간과 같거나(비겁), 일간을 생해주는(인성) 경우
    const isSameElement = monthJeonggiElement === dayElement;
    const generatesDay = generatesMap[monthJeonggiElement] === dayElement;
    const deukryung = isSameElement || generatesDay;
    // 2. 득지 (得地): 일지에서 12운성이 왕성한가? (건록, 제왕, 관대, 장생)
    const strongStages = ['장생', '관대', '건록', '제왕'];
    const deukji = strongStages.includes(twelveStages.day);
    // 3. 득시 (得時): 시주에서 12운성이 왕성한가? (장생/관대/건록/제왕)
    // 시주 12운성으로만 판단 (비겁/인성 개수는 득세에서 처리)
    const deuksi = strongStages.includes(twelveStages.hour);
    // 4. 득세 (得勢): 전체적으로 비겁+인성이 식상+재성+관성보다 많은가?
    const supportCount = tenGodGroups.companion + tenGodGroups.resource;
    const drainCount = tenGodGroups.output + tenGodGroups.wealth + tenGodGroups.power;
    const deukse = supportCount >= drainCount;
    // 점수 계산
    let score = 50;
    if (deukryung)
        score += 12;
    else
        score -= 8;
    if (deukji)
        score += 10;
    else
        score -= 5;
    if (deuksi)
        score += 5;
    else
        score -= 3;
    if (deukse)
        score += 8;
    else
        score -= 6;
    // 동일 오행 통근 보너스
    const sameElementCount = elementDistribution[dayElement] || 0;
    score += sameElementCount * 3;
    // 점수 범위 제한
    score = Math.max(0, Math.min(100, Math.round(score)));
    // 요소 개수로 강약 판정 (프스텔러 스타일)
    const factorCount = [deukryung, deukji, deuksi, deukse].filter(Boolean).length;
    let strength;
    if (factorCount >= 3) {
        strength = '신강';
    }
    else if (factorCount <= 1) {
        strength = '신약';
    }
    else {
        // 2개일 때: 득령 여부로 세분화
        if (deukryung) {
            strength = '중화신강';
        }
        else {
            strength = '중화신약';
        }
    }
    return {
        strength,
        score,
        factors: { deukryung, deukji, deuksi, deukse }
    };
}
/**
 * 조후(調候) 용신 산출
 * 계절에 따른 필요 오행 조정
 */
function getJohuYongsin(monthBranch, dayElement) {
    const env = exports.JOHU_TABLE[monthBranch];
    if (!env)
        return null;
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
function determineEnhancedYongsin(dayMaster, monthBranch, gyeokguk, twelveStages, tenGodGroups, elementDistribution) {
    const dayElement = exports.STEM_ELEMENTS[dayMaster];
    const elementCycle = ['wood', 'fire', 'earth', 'metal', 'water'];
    const dayIdx = elementCycle.indexOf(dayElement);
    // 1단계: 강약 기반 방향 결정
    const { strength: bodyStrength, score: bodyScore } = calculateBodyStrength(dayMaster, monthBranch, twelveStages, tenGodGroups, elementDistribution);
    // 오행별 점수 초기화
    const scores = {
        wood: 0, fire: 0, earth: 0, metal: 0, water: 0
    };
    // 오행 관계 테이블
    const generates = {
        wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
    };
    const generatedBy = {
        wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal'
    };
    const overcomes = {
        wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire'
    };
    const overcomedBy = {
        wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth'
    };
    let basis = '강약';
    let reasoning = '';
    let reasoning_en = '';
    // 억부용신 우선 (프스텔러 스타일)
    if (bodyStrength === '신약' || bodyStrength === '중화신약') {
        // 신약/중화신약: 일간 강화 필요 (억부용신)
        scores[dayElement] += 4; // 동일 오행 (비겁) - 우선순위
        scores[generatedBy[dayElement]] += 2; // 생해주는 오행 (인성)
        reasoning = bodyStrength === '중화신약'
            ? `중화신약으로 비겁(${exports.FIVE_ELEMENTS[dayElement]})이 필요합니다. (억부용신)`
            : `신약(${bodyScore}점)으로 비겁/인성이 필요합니다.`;
        reasoning_en = `Body is ${bodyStrength}. Companion/Resource elements are needed.`;
    }
    else if (bodyStrength === '신강') {
        // 신강: 설기 필요
        scores[generates[dayElement]] += 3; // 설기 (식상)
        scores[overcomes[dayElement]] += 2; // 극하는 오행 (재성)
        scores[overcomedBy[dayElement]] += 1; // 극당하는 오행 (관성)
        reasoning = `신강(${bodyScore}점)으로 식상/재관 설기가 필요합니다.`;
        reasoning_en = `Body is strong (${bodyScore}). Output/Wealth/Power elements are needed for balance.`;
    }
    else if (bodyStrength === '중화신강') {
        // 중화신강: 격국 보전 우선, 약간의 설기
        basis = '격국';
        scores[generates[dayElement]] += 2; // 식상
        scores[overcomes[dayElement]] += 1; // 재성
        reasoning = `중화신강으로 격국(${gyeokguk.type}) 보전이 중요합니다.`;
        reasoning_en = `Body is balanced-strong. Focus on preserving structure.`;
    }
    else {
        // 중화: 격국 보전
        basis = '격국';
        // 격국에 따른 용신
        switch (gyeokguk.type) {
            case '정관격':
            case '편관격':
                scores[generatedBy[dayElement]] += 2; // 인성 (관인상생)
                scores[overcomes[dayElement]] += 1; // 재성 (재관쌍전)
                break;
            case '정재격':
            case '편재격':
                scores[generates[dayElement]] += 2; // 식상 (식신생재)
                break;
            case '식신격':
                scores[overcomes[dayElement]] += 2; // 재성 (식신생재)
                break;
            default:
                scores[generatedBy[dayElement]] += 1;
        }
        reasoning = `중화 상태로 격국(${gyeokguk.type}) 보전이 중요합니다.`;
        reasoning_en = `Body is balanced. Focus on preserving structure (${gyeokguk.type}).`;
    }
    // 2단계: 격국 보정
    const gyeokElement = exports.STEM_ELEMENTS[gyeokguk.monthJeonggi];
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
            reasoning += ` 조후(계절 균형)상 ${exports.FIVE_ELEMENTS[johuElement]}도 유익합니다.`;
            reasoning_en += ` ${johuElement.charAt(0).toUpperCase() + johuElement.slice(1)} is also beneficial for seasonal balance.`;
        }
    }
    // 점수 정렬하여 1, 2순위 용신 결정
    const sorted = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([el]) => el);
    const primary = sorted[0];
    const secondary = sorted[1];
    // 희신/기신 분류
    const xiShin = [];
    const jiShin = [];
    if (bodyStrength === '신약') {
        xiShin.push(dayElement, generatedBy[dayElement]);
        jiShin.push(overcomes[dayElement], overcomedBy[dayElement], generates[dayElement]);
    }
    else if (bodyStrength === '신강') {
        xiShin.push(generates[dayElement], overcomes[dayElement], overcomedBy[dayElement]);
        jiShin.push(dayElement, generatedBy[dayElement]);
    }
    else {
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
// ============== 길신(吉神) TABLES ==============
// 천을귀인(天乙貴人) - 일간별 지지
exports.CHEONUL_GUIIN = {
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
exports.MUNCHANG_GUIIN = {
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
exports.HAKDANG_GUIIN = {
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
exports.JANGSUNG_GUIIN = {
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
exports.HWAGAE = {
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
exports.DOHWA = {
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
exports.YEOKMA = {
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
exports.GEOBSAL = {
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
exports.JAESAL = {
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
exports.YANGIN = {
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
// 천덕귀인(天德貴人) - 월지별
exports.CHEONDEOK_GUIIN = {
    '인': '정', // 인월 → 정
    '묘': '신', // 묘월 → 신
    '진': '임', // 진월 → 임
    '사': '신', // 사월 → 신
    '오': '해', // 오월 → 해
    '미': '갑', // 미월 → 갑
    '신': '계', // 신월 → 계
    '유': '인', // 유월 → 인
    '술': '병', // 술월 → 병
    '해': '을', // 해월 → 을
    '자': '사', // 자월 → 사
    '축': '경', // 축월 → 경
};
// 월덕귀인(月德貴人) - 월지별
exports.WOLDEOK_GUIIN = {
    '인': '병', // 인오술 → 병
    '오': '병',
    '술': '병',
    '사': '경', // 사유축 → 경
    '유': '경',
    '축': '경',
    '신': '임', // 신자진 → 임
    '자': '임',
    '진': '임',
    '해': '갑', // 해묘미 → 갑
    '묘': '갑',
    '미': '갑',
};
/**
 * 신살 12종 판정
 */
function detectShinSal(dayMaster, yearBranch, monthBranch, // 월지 추가 (천덕/월덕 귀인용)
dayBranch, branches, stems = [] // 천간 리스트 (천덕 귀인용)
) {
    const positive = [];
    const negative = [];
    const neutral = [];
    // === 길신 체크 ===
    // 1. 천을귀인
    const cheonul = exports.CHEONUL_GUIIN[dayMaster] || [];
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
    const munchang = exports.MUNCHANG_GUIIN[dayMaster];
    if (munchang && branches.includes(munchang)) {
        positive.push({
            name: '문창귀인',
            branch: munchang,
            description: '학문/문서 능력, 시험 운'
        });
    }
    // 3. 학당귀인
    const hakdang = exports.HAKDANG_GUIIN[dayMaster];
    if (hakdang && branches.includes(hakdang)) {
        positive.push({
            name: '학당귀인',
            branch: hakdang,
            description: '학문 성취, 지혜'
        });
    }
    // 4. 장성귀인
    const jangsung = exports.JANGSUNG_GUIIN[yearBranch];
    if (jangsung && branches.includes(jangsung)) {
        positive.push({
            name: '장성',
            branch: jangsung,
            description: '리더십, 권위'
        });
    }
    // 5. 천덕귀인
    const cheondeok = exports.CHEONDEOK_GUIIN[monthBranch];
    if (cheondeok && stems.includes(cheondeok)) {
        positive.push({
            name: '천덕귀인',
            branch: monthBranch,
            description: '재앙 해소, 흉액 소멸'
        });
    }
    // 6. 월덕귀인
    const woldeok = exports.WOLDEOK_GUIIN[monthBranch];
    if (woldeok && stems.includes(woldeok)) {
        positive.push({
            name: '월덕귀인',
            branch: monthBranch,
            description: '재앙 구제, 복록 증가'
        });
    }
    // 7. 화개
    const hwagae = exports.HWAGAE[yearBranch];
    if (hwagae && branches.includes(hwagae)) {
        neutral.push({
            name: '화개',
            branch: hwagae,
            description: '예술/종교 감수성, 고독'
        });
    }
    // === 흉살 체크 ===
    // 6. 도화
    const dohwa = exports.DOHWA[yearBranch] || exports.DOHWA[dayBranch];
    if (dohwa && branches.includes(dohwa)) {
        neutral.push({
            name: '도화',
            branch: dohwa,
            description: '매력, 이성 인연 (과다 시 바람기)'
        });
    }
    // 7. 역마
    const yeokma = exports.YEOKMA[yearBranch] || exports.YEOKMA[dayBranch];
    if (yeokma && branches.includes(yeokma)) {
        neutral.push({
            name: '역마',
            branch: yeokma,
            description: '이동/변화 운, 활동성'
        });
    }
    // 8. 양인
    const yangin = exports.YANGIN[dayMaster];
    if (yangin && branches.includes(yangin)) {
        negative.push({
            name: '양인',
            branch: yangin,
            description: '급한 성격, 상해 주의'
        });
    }
    // 9. 겁살
    const geobsal = exports.GEOBSAL[yearBranch];
    if (geobsal && branches.includes(geobsal)) {
        negative.push({
            name: '겁살',
            branch: geobsal,
            description: '도난/사기 주의'
        });
    }
    // 10. 재살
    const jaesal = exports.JAESAL[yearBranch];
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
function getShinSalSummary(result) {
    const parts = [];
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
function parseGapja(gapjaStr) {
    // "정유년", "병오월", "임오일" 형태에서 앞 2글자만 추출
    const stem = gapjaStr.charAt(0);
    const branch = gapjaStr.charAt(1);
    return { stem, branch };
}
/**
 * 시주(時柱) 계산
 * 일간에 따라 시간의 천간이 결정됨
 */
function calculateHourPillar(hour, dayStem) {
    // 시지 결정 (2시간 단위)
    // 23-01시: 자, 01-03시: 축, ...
    const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2);
    // 일간에 따른 시간 천간 결정 (일상기시법)
    const dayStemIndex = exports.HEAVENLY_STEMS.indexOf(dayStem);
    const hourStemStartMap = {
        0: 0, 5: 0, // 갑/기일 -> 갑자시부터
        1: 2, 6: 2, // 을/경일 -> 병자시부터
        2: 4, 7: 4, // 병/신일 -> 무자시부터
        3: 6, 8: 6, // 정/임일 -> 경자시부터
        4: 8, 9: 8, // 무/계일 -> 임자시부터
    };
    const startStem = hourStemStartMap[dayStemIndex] || 0;
    const hourStemIndex = (startStem + hourBranchIndex) % 10;
    return {
        stem: exports.HEAVENLY_STEMS[hourStemIndex],
        branch: exports.EARTHLY_BRANCHES[hourBranchIndex],
    };
}
/**
 * 율리우스 날짜 및 태양 황경 계산 (Saju용)
 */
function getSunLongitude(birthDate) {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate() + (birthDate.getHours() + birthDate.getMinutes() / 60) / 24;
    let y = year;
    let m = month;
    if (m <= 2) {
        y -= 1;
        m += 12;
    }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
    const T = (jd - 2451545.0) / 36525;
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    L0 = L0 % 360;
    if (L0 < 0)
        L0 += 360;
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    M = M * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    let sunLongitude = L0 + C;
    sunLongitude = sunLongitude % 360;
    if (sunLongitude < 0)
        sunLongitude += 360;
    return sunLongitude;
}
/**
 * 십신 계산 (매트릭스 기반)
 * 일간(日干)을 기준으로 다른 천간과의 관계를 10×10 매트릭스로 정확히 판정
 * 사주명리학 시스템 지침 v1.0.3 기준
 */
function calculateTenGods(dayMaster, stems) {
    const result = {};
    const pillarNames = ['year', 'month', 'day', 'hour'];
    // 매트릭스가 없는 일간인 경우 폴백
    if (!exports.TEN_GOD_MATRIX[dayMaster]) {
        console.warn(`Unknown day master: ${dayMaster}, using fallback`);
        return calculateTenGodsFallback(dayMaster, stems);
    }
    stems.forEach((stem, index) => {
        var _a;
        // 매트릭스에서 직접 조회
        const godName = (_a = exports.TEN_GOD_MATRIX[dayMaster]) === null || _a === void 0 ? void 0 : _a[stem];
        if (godName) {
            result[pillarNames[index]] = godName;
        }
        else {
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
function calculateTenGodsFallback(dayMaster, stems) {
    const result = {};
    const dayElement = exports.STEM_ELEMENTS[dayMaster];
    const dayYinYang = exports.HEAVENLY_STEMS.indexOf(dayMaster) % 2;
    const elementCycle = ['wood', 'fire', 'earth', 'metal', 'water'];
    stems.forEach((stem, index) => {
        const stemElement = exports.STEM_ELEMENTS[stem];
        const stemYinYang = exports.HEAVENLY_STEMS.indexOf(stem) % 2;
        const sameYinYang = dayYinYang === stemYinYang;
        const dayIdx = elementCycle.indexOf(dayElement);
        const stemIdx = elementCycle.indexOf(stemElement);
        const diff = ((stemIdx - dayIdx) + 5) % 5;
        let godName;
        if (diff === 0) {
            godName = sameYinYang ? exports.TEN_GODS.bijian : exports.TEN_GODS.gepcae;
        }
        else if (diff === 1) {
            godName = sameYinYang ? exports.TEN_GODS.sikshin : exports.TEN_GODS.sanggwan;
        }
        else if (diff === 2) {
            godName = sameYinYang ? exports.TEN_GODS.pyeonjae : exports.TEN_GODS.jeongjae;
        }
        else if (diff === 3) {
            godName = sameYinYang ? exports.TEN_GODS.pyeongwan : exports.TEN_GODS.jeonggwan;
        }
        else {
            godName = sameYinYang ? exports.TEN_GODS.pyeonin : exports.TEN_GODS.jeongin;
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
function getTenGodGroup(tenGod) {
    for (const [group, gods] of Object.entries(exports.TEN_GOD_GROUPS)) {
        if (gods.includes(tenGod)) {
            return group;
        }
    }
    return null;
}
/**
 * 십신 카운트
 * 사주 전체에서 각 십신이 몇 개 있는지 계산
 */
function countTenGods(tenGods) {
    const counts = {};
    Object.values(tenGods).forEach(god => {
        counts[god] = (counts[god] || 0) + 1;
    });
    return counts;
}
/**
 * 십신 그룹 카운트
 * 사주 전체에서 각 그룹별 십신 개수 계산
 */
function countTenGodGroups(tenGods) {
    const counts = {
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
 * @param longitude - 출생지 경도 (기본값: 서울 126.9780)
 */
function calculateSaju(birthDate, birthHour = 12, birthMinute = 0, isLunar = false, gender = 'male', longitude = 126.9780 // 서울 기본값
) {
    var _a;
    // 1. 경도 기반 시간 보정 (지역시 → 진태양시)
    // KST는 동경 135도 기준, 출생지 경도와의 차이 × 4분/도
    const timeCorrectionMinutes = Math.round((135 - longitude) * 4);
    const adjDate = new Date(birthDate);
    adjDate.setHours(birthHour, birthMinute);
    adjDate.setMinutes(adjDate.getMinutes() - timeCorrectionMinutes);
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
    const calendar = new korean_lunar_calendar_1.default();
    let isValid = false;
    if (isLunar) {
        // 음력 -> 양력 변환
        isValid = calendar.setLunarDate(calYear, calMonth, calDay, false);
    }
    else {
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
        stem: exports.HEAVENLY_STEMS[(yearStemIdx + 10) % 10],
        branch: exports.EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12],
    };
    // 2. 월주 계산 (절기 기준)
    // 315도(입춘)부터가 인(寅)월
    const monthBranchMap = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
    const shiftedLong = (sunLong - 315 + 360) % 360;
    const monthIdx = Math.floor(shiftedLong / 30);
    const monthBranch = monthBranchMap[monthIdx];
    // 월간 계산 (연주 천간 기반)
    const yStemIdx = exports.HEAVENLY_STEMS.indexOf(yeonPillar.stem);
    const monthStemIdx = (yStemIdx * 2 + 2 + monthIdx) % 10;
    const monthPillar = {
        stem: exports.HEAVENLY_STEMS[monthStemIdx],
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
        stem: exports.STEM_ELEMENTS[pillar.stem],
        branch: exports.BRANCH_ELEMENTS[pillar.branch],
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
    const enhancedYongsin = determineEnhancedYongsin(dayMaster, monthPillar.branch, gyeokguk, twelveStages, tenGodGroups, elementDistribution);
    // Phase 6: 신살 판정
    const shinSal = detectShinSal(dayMaster, yeonPillar.branch, monthPillar.branch, dayPillar.branch, branchList, stems);
    // Phase 7: 대운 계산
    const currentYear = new Date().getFullYear();
    const birthYear = birthDate.getFullYear();
    const currentAge = currentYear - birthYear + 1; // 한국식 나이
    const daeun = calculateDaeun(birthDate, birthHour, gender, yeonPillar.stem, monthPillar.stem, monthPillar.branch, dayMaster, currentAge);
    // Phase 8: 세운 계산
    const bodyStrength = (enhancedYongsin === null || enhancedYongsin === void 0 ? void 0 : enhancedYongsin.bodyStrength) || '중화';
    const daewoonBranch = (_a = daeun === null || daeun === void 0 ? void 0 : daeun.currentDaeun) === null || _a === void 0 ? void 0 : _a.branch;
    const natalBranchList = [yeonPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];
    // 올해 세운
    const sewoon = calculateSewoon(currentYear, dayMaster, dayPillar.branch, bodyStrength, daewoonBranch, natalBranchList);
    // 향후 5년 세운
    const sewoonMultiYear = calculateMultiYearSewoon(currentYear, currentYear + 4, dayMaster, dayPillar.branch, bodyStrength, daewoonBranch, natalBranchList);
    // 올해 12개월 월운
    const wolwoon = calculateYearlyWolwoon(currentYear, dayMaster, bodyStrength);
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
        },
        daeun,
        sewoon,
        sewoonMultiYear,
        wolwoon
    };
}
/**
 * 폴백 계산 (라이브러리 범위 밖의 날짜용)
 * 기존 알고리즘 사용
 */
function calculateSajuFallback(birthDate, birthHour = 12, birthMinute = 0) {
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
    if (isAfterZi)
        targetDate.setDate(targetDate.getDate() + 1);
    const sajuYear = targetDate.getFullYear();
    const sajuMonth = targetDate.getMonth() + 1;
    const sajuDay = targetDate.getDate();
    // 년주
    const yearStemIdx = (sajuYear - 4) % 10;
    const yearBranchIdx = (sajuYear - 4) % 12;
    const yeonPillar = {
        stem: exports.HEAVENLY_STEMS[(yearStemIdx + 10) % 10],
        branch: exports.EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12],
    };
    // 월주 (간략화)
    const monthBranchMap = [
        '축', '인', '묘', '진', '사', '오',
        '미', '신', '유', '술', '해', '자'
    ];
    const adjustedMonth = month - 1;
    const yeonStemIndex = exports.HEAVENLY_STEMS.indexOf(yeonPillar.stem);
    const monthStemStartMap = {
        0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0,
    };
    const startStem = monthStemStartMap[yeonStemIndex] || 0;
    const monthStemIndex = (startStem + adjustedMonth) % 10;
    const monthPillar = {
        stem: exports.HEAVENLY_STEMS[monthStemIndex],
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
        stem: exports.HEAVENLY_STEMS[dayStemIdx],
        branch: exports.EARTHLY_BRANCHES[dayBranchIdx],
    };
    const hourPillar = calculateHourPillar(hour, dayPillar.stem);
    const dayMaster = dayPillar.stem;
    const elements = [
        yeonPillar, monthPillar, dayPillar, hourPillar
    ].map(pillar => ({
        stem: exports.STEM_ELEMENTS[pillar.stem],
        branch: exports.BRANCH_ELEMENTS[pillar.branch],
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
function formatSaju(saju) {
    if (!saju)
        return '사주 정보 없음';
    if (typeof saju === 'string')
        return saju;
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
function getYongsinRecommendation(dayMaster, birthMonth) {
    var _a;
    const dayElement = exports.STEM_ELEMENTS[dayMaster];
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
    const generatingElement = (_a = Object.entries(exports.ELEMENT_RELATIONS.generates)
        .find(([_, generated]) => generated === dayElement)) === null || _a === void 0 ? void 0 : _a[0];
    return {
        yongsin: generatingElement || 'wood',
        reason: `일간 ${dayMaster}(${exports.FIVE_ELEMENTS[dayElement]})을 생해주는 ${generatingElement ? exports.FIVE_ELEMENTS[generatingElement] : '목'}이 용신입니다.`,
        reasonEn: `The element that generates your Day Master is your Yongsin.`,
    };
}
/**
 * 오행 분포 분석
 */
function analyzeElementDistribution(saju) {
    const distribution = {
        wood: 0, fire: 0, earth: 0, metal: 0, water: 0
    };
    // 천간 4개
    [saju.yeonPillar.stem, saju.monthPillar.stem, saju.dayPillar.stem, saju.hourPillar.stem]
        .forEach(stem => {
        const element = exports.STEM_ELEMENTS[stem];
        if (element)
            distribution[element]++;
    });
    // 지지 4개
    [saju.yeonPillar.branch, saju.monthPillar.branch, saju.dayPillar.branch, saju.hourPillar.branch]
        .forEach(branch => {
        const element = exports.BRANCH_ELEMENTS[branch];
        if (element)
            distribution[element]++;
    });
    return distribution;
}
/**
 * 오행 과다/부족 진단
 */
function diagnoseElementBalance(saju) {
    const distribution = analyzeElementDistribution(saju);
    const values = Object.values(distribution);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const excessive = Object.entries(distribution)
        .filter(([_, count]) => count >= 3)
        .map(([element]) => element);
    const lacking = Object.entries(distribution)
        .filter(([_, count]) => count === 0)
        .map(([element]) => element);
    return {
        excessive,
        lacking,
        balanced: excessive.length === 0 && lacking.length === 0,
    };
}
