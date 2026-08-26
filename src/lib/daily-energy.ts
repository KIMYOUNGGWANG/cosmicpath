export interface DailyEnergyResponse {
    date: string;
    cardIndex: number;
    cardName: string;
    cardNameKo: string;
    isReversed: boolean;
    keywordKo: string;
    meaning: string;
    advice: string;
    isPremium: boolean;
}

export type DailyTarotResponse = DailyEnergyResponse;

const CELESTIAL_ENERGIES = [
    { name: 'Creation & Initiative', nameKo: '창조와 결단', keyword: '새로운 출발', meaning: '자신의 주도권을 잡고 첫 발걸음을 떼기에 이상적인 기운입니다.', advice: '미루던 결정 중 가장 중요한 하나를 오늘 실행에 옮기세요.' },
    { name: 'Wisdom & Inner Calm', nameKo: '지혜와 내적 평온', keyword: '직관과 통찰', meaning: '외부의 소음보다 내면의 소리에 집중할 때 명확한 답이 드러납니다.', advice: '감정적인 반응을 늦추고 한 박자 쉬어가는 지혜를 발휘하세요.' },
    { name: 'Abundance & Fruitful Flow', nameKo: '풍요와 확장', keyword: '결실과 번영', meaning: '그동안 뿌려놓은 노력들이 가시적인 성과로 연결되는 흐름입니다.', advice: '주변과의 협력을 통해 시너지를 극대화하십시오.' },
    { name: 'Structure & Execution', nameKo: '구조와 실행력', keyword: '질서와 원칙', meaning: '기준을 명확히 하고 체계적으로 업무와 일상을 정돈하기 좋은 날입니다.', advice: '우선순위를 재정비하고 불필요한 낭비를 제거하세요.' },
    { name: 'Insight & Transformation', nameKo: '통찰과 도약', keyword: '전환점', meaning: '기존의 틀을 깨고 새로운 관점을 장착하는 전환의 시간입니다.', advice: '과거의 방식에 얽매이지 말고 유연하게 대처하세요.' },
    { name: 'Alignment & Balance', nameKo: '정렬과 균형', keyword: '공정한 조율', meaning: '감정과 이성, 일과 휴식의 황금비율을 맞추는 최적의 상태입니다.', advice: '무리한 확장보다는 현재의 내실을 다지는 데 집중하세요.' },
    { name: 'Courage & Breakthrough', nameKo: '용기와 돌파', keyword: '과감한 추진', meaning: '장애물을 정면 돌파할 수 있는 강력한 추진력이 공급됩니다.', advice: '자신감을 갖고 핵심 목표에 모든 에너지를 쏟으세요.' },
];

export function getDailyTarotReading(birthday: string, dateStr: string, isPremium: boolean): DailyEnergyResponse {
    const seed = `${birthday}:${dateStr}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % CELESTIAL_ENERGIES.length;
    const energy = CELESTIAL_ENERGIES[index];

    return {
        date: dateStr,
        cardIndex: index + 1,
        cardName: energy.name,
        cardNameKo: energy.nameKo,
        isReversed: false,
        keywordKo: energy.keyword,
        meaning: energy.meaning,
        advice: energy.advice,
        isPremium,
    };
}
