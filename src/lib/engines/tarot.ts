/**
 * 타로 카드 엔진
 * 22장 메이저 아르카나 기반
 */

// 메이저 아르카나 22장
export const MAJOR_ARCANA = [
    {
        id: 0,
        name: '바보',
        nameEn: 'The Fool',
        keywords: ['새로운 시작', '순수함', '모험', '자유'],
        upright: '새로운 여정의 시작, 무한한 가능성, 순수한 마음으로 도전',
        reversed: '무모함, 경솔함, 방향 상실',
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
    },
    {
        id: 1,
        name: '마법사',
        nameEn: 'The Magician',
        keywords: ['창조력', '의지력', '집중', '기술'],
        upright: '모든 자원을 활용할 능력, 창조적 힘, 확고한 의지',
        reversed: '속임수, 재능 낭비, 조작',
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
    },
    {
        id: 2,
        name: '여사제',
        nameEn: 'The High Priestess',
        keywords: ['직관', '비밀', '내면의 지혜', '신비'],
        upright: '직관을 신뢰하세요, 숨겨진 진실, 내면의 목소리',
        reversed: '직관 무시, 비밀 폭로, 표면적 판단',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg',
    },
    {
        id: 3,
        name: '여황제',
        nameEn: 'The Empress',
        keywords: ['풍요', '모성', '창조', '자연'],
        upright: '풍요로움, 양육과 돌봄, 창조적 표현',
        reversed: '의존성, 창조력 고갈, 과잉 보호',
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg',
    },
    {
        id: 4,
        name: '황제',
        nameEn: 'The Emperor',
        keywords: ['권위', '구조', '안정', '리더십'],
        upright: '질서와 구조, 안정된 기반, 리더십 발휘',
        reversed: '독재적 성향, 경직됨, 권위 남용',
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg',
    },
    {
        id: 5,
        name: '교황',
        nameEn: 'The Hierophant',
        keywords: ['전통', '지혜', '교육', '영적 안내'],
        upright: '전통적 가치, 영적 가르침, 멘토의 조언',
        reversed: '독단적 신념, 전통에 대한 반항, 나쁜 조언',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg',
    },
    {
        id: 6,
        name: '연인',
        nameEn: 'The Lovers',
        keywords: ['사랑', '조화', '선택', '관계'],
        upright: '진정한 사랑, 조화로운 관계, 중요한 선택',
        reversed: '불화, 잘못된 선택, 유혹',
        image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg',
    },
    {
        id: 7,
        name: '전차',
        nameEn: 'The Chariot',
        keywords: ['승리', '의지력', '결단', '전진'],
        upright: '장애물 극복, 승리, 강한 의지로 전진',
        reversed: '방향 상실, 공격성, 통제력 상실',
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
    },
    {
        id: 8,
        name: '힘',
        nameEn: 'Strength',
        keywords: ['용기', '인내', '내면의 힘', '자제력'],
        upright: '내면의 힘, 부드러운 용기, 인내와 자제',
        reversed: '자기 의심, 나약함, 공격성',
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
    },
    {
        id: 9,
        name: '은둔자',
        nameEn: 'The Hermit',
        keywords: ['성찰', '고독', '내면 탐색', '지혜'],
        upright: '내면의 탐색, 혼자만의 시간 필요, 지혜의 등불',
        reversed: '고립, 외로움에 대한 두려움, 은둔',
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg',
    },
    {
        id: 10,
        name: '운명의 수레바퀴',
        nameEn: 'Wheel of Fortune',
        keywords: ['변화', '운명', '순환', '기회'],
        upright: '운명의 전환점, 행운의 순환, 새로운 기회',
        reversed: '불운, 예상치 못한 변화, 저항',
        image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
    },
    {
        id: 11,
        name: '정의',
        nameEn: 'Justice',
        keywords: ['공정', '진실', '균형', '책임'],
        upright: '공정한 판결, 진실 직면, 책임감 있는 행동',
        reversed: '불공정, 부정직, 책임 회피',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg',
    },
    {
        id: 12,
        name: '매달린 사람',
        nameEn: 'The Hanged Man',
        keywords: ['희생', '관점 전환', '정지', '새로운 시각'],
        upright: '관점의 전환 필요, 일시적 정지, 희생을 통한 깨달음',
        reversed: '무의미한 희생, 저항, 우유부단',
        image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
    },
    {
        id: 13,
        name: '죽음',
        nameEn: 'Death',
        keywords: ['변화', '전환', '끝과 시작', '재탄생'],
        upright: '중요한 변화, 한 시대의 끝, 변환과 재생',
        reversed: '변화에 대한 저항, 정체, 두려움',
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg',
    },
    {
        id: 14,
        name: '절제',
        nameEn: 'Temperance',
        keywords: ['균형', '절제', '조화', '인내'],
        upright: '균형과 조화, 절제된 접근, 인내심',
        reversed: '불균형, 과도함, 조급함',
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg',
    },
    {
        id: 15,
        name: '악마',
        nameEn: 'The Devil',
        keywords: ['속박', '유혹', '중독', '물질주의'],
        upright: '속박에서 벗어나야 함, 유혹 경계, 그림자 직면',
        reversed: '해방, 속박에서의 자유, 새로운 시작',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg',
    },
    {
        id: 16,
        name: '탑',
        nameEn: 'The Tower',
        keywords: ['급격한 변화', '붕괴', '충격', '깨달음'],
        upright: '예상치 못한 변화, 기존 구조의 붕괴, 진실의 폭로',
        reversed: '변화 회피, 파국 지연, 내면의 변화',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
    },
    {
        id: 17,
        name: '별',
        nameEn: 'The Star',
        keywords: ['희망', '영감', '치유', '평화'],
        upright: '희망과 영감, 치유의 시간, 밝은 미래',
        reversed: '희망 상실, 절망, 영감 부재',
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg',
    },
    {
        id: 18,
        name: '달',
        nameEn: 'The Moon',
        keywords: ['환상', '직관', '불안', '무의식'],
        upright: '직관을 믿되 경계하세요, 숨겨진 것들, 환상과 현실',
        reversed: '두려움 극복, 혼란 해소, 진실 인식',
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg',
    },
    {
        id: 19,
        name: '태양',
        nameEn: 'The Sun',
        keywords: ['성공', '기쁨', '활력', '긍정'],
        upright: '성공과 달성, 기쁨과 행복, 긍정 에너지',
        reversed: '일시적 좌절, 과도한 낙관, 성공 지연',
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg',
    },
    {
        id: 20,
        name: '심판',
        nameEn: 'Judgement',
        keywords: ['부활', '갱신', '소명', '자각'],
        upright: '내면의 소명, 자기 평가, 새로운 시작을 위한 갱신',
        reversed: '자기 의심, 판단 회피, 후회에 갇힘',
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg',
    },
    {
        id: 21,
        name: '세계',
        nameEn: 'The World',
        keywords: ['완성', '성취', '통합', '여정의 끝'],
        upright: '목표 달성, 완성과 성취, 새로운 순환의 시작',
        reversed: '미완성, 지연, 목표 달성 실패',
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg',
    },
] as const;

// 타로 결과 타입
export interface TarotCard {
    id: number;
    name: string;
    nameEn: string;
    keywords: readonly string[];
    interpretation: string;
    isReversed: boolean;
    image: string; // 이미지 URL 추가
}

export interface TarotResult {
    cards: TarotCard[];
    spread: string;
    context: string;
}

/**
 * 암호학적으로 안전한 랜덤 숫자 생성
 */
function secureRandom(max: number): number {
    // globalThis.crypto는 Node.js 19+ 및 모든 현대 브라우저에서 지원
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return array[0] % max;
}

/**
 * Fisher-Yates 셔플 알고리즘 (보안 랜덤 사용)
 */
function secureShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = secureRandom(i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 타로 카드 뽑기
 */
export function drawCards(
    count: number = 1,
    allowReversed: boolean = true
): TarotCard[] {
    // 모든 카드 ID 생성
    const cardIds = Array.from({ length: MAJOR_ARCANA.length }, (_, i) => i);

    // 셔플
    const shuffled = secureShuffle(cardIds);

    // 필요한 만큼 카드 선택
    const selectedIds = shuffled.slice(0, count);

    return selectedIds.map(id => {
        const card = MAJOR_ARCANA[id];
        const isReversed = allowReversed && secureRandom(2) === 1;

        return {
            id: card.id,
            name: card.name,
            nameEn: card.nameEn,
            keywords: card.keywords,
            interpretation: isReversed ? card.reversed : card.upright,
            isReversed,
            image: card.image,
        };
    });
}

/**
 * 사용자 터치 기반 카드 선택 (웹 인터랙션용)
 */
export function selectCardByIndex(
    index: number,
    allowReversed: boolean = true
): TarotCard {
    const card = MAJOR_ARCANA[index];
    const isReversed = allowReversed && secureRandom(2) === 1;

    return {
        id: card.id,
        name: card.name,
        nameEn: card.nameEn,
        keywords: card.keywords,
        interpretation: isReversed ? card.reversed : card.upright,
        isReversed,
        image: card.image,
    };
}

/**
 * 스프레드별 카드 뽑기
 */
export function drawSpread(
    spread: 'single' | 'three' | 'celtic' = 'single',
    context: string = 'general'
): TarotResult {
    const spreadConfig: Record<string, number> = {
        single: 1,
        three: 3, // 과거-현재-미래
        celtic: 10, // 켈틱 크로스 (풀 스프레드)
    };

    const count = spreadConfig[spread] || 1;
    const cards = drawCards(count);

    return {
        cards,
        spread,
        context,
    };
}

/**
 * 타로 결과를 읽기 쉬운 문자열로 변환
 */
export function formatTarot(result: TarotResult): string {
    const cardDescriptions = result.cards.map((card, index) => {
        const direction = card.isReversed ? '(역방향)' : '(정방향)';
        return `${index + 1}. ${card.name} ${direction}`;
    }).join(', ');

    return `스프레드: ${result.spread}, 카드: ${cardDescriptions}`;
}

/**
 * 카드 상세 정보 반환
 */
export function getCardDetails(cardId: number): typeof MAJOR_ARCANA[number] | null {
    return MAJOR_ARCANA.find(c => c.id === cardId) || null;
}

/**
 * 모든 카드 목록 반환 (UI 렌더링용)
 */
export function getAllCards(): typeof MAJOR_ARCANA {
    return MAJOR_ARCANA;
}
