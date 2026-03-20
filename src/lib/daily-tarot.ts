export interface DailyTarotResponse {
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

interface TarotCardDefinition {
    cardIndex: number;
    cardName: string;
    cardNameKo: string;
    keywordKo: string;
    uprightMeaning: string;
    reversedMeaning: string;
    premiumAdvice: string;
}

interface MinorSuitDefinition {
    name: string;
    nameKo: string;
    keywordKo: string;
    uprightTone: string;
    reversedTone: string;
    premiumFocus: string;
}

interface MinorRankDefinition {
    name: string;
    nameKo: string;
    keywordKo: string;
    uprightMeaning: string;
    reversedMeaning: string;
    premiumAdvice: string;
}

const MAJOR_ARCANA: TarotCardDefinition[] = [
    {
        cardIndex: 0,
        cardName: 'The Fool',
        cardNameKo: '바보',
        keywordKo: '새로운 시작, 모험, 순수함',
        uprightMeaning: '새 흐름이 열리는 날입니다. 계산보다 용기가 앞설 때 기회가 따라옵니다.',
        reversedMeaning: '즉흥성이 커질 수 있습니다. 설렘보다 준비를 먼저 점검해야 흔들림을 줄일 수 있습니다.',
        premiumAdvice: '처음 시작하는 일은 오전 안에 가볍게 착수하고, 큰 약속은 체크리스트를 만든 뒤 확정하세요.',
    },
    {
        cardIndex: 1,
        cardName: 'The Magician',
        cardNameKo: '마법사',
        keywordKo: '집중, 실행력, 창조력',
        uprightMeaning: '손에 쥔 자원을 잘 엮으면 기대 이상의 결과를 만들 수 있는 날입니다.',
        reversedMeaning: '집중력이 흩어질 수 있습니다. 보여주기식 움직임보다 실제 완료에 힘을 모으세요.',
        premiumAdvice: '오늘은 하나의 핵심 목표만 정하고, 메시지 전달이나 제안은 짧고 명확하게 정리하는 편이 유리합니다.',
    },
    {
        cardIndex: 2,
        cardName: 'The High Priestess',
        cardNameKo: '여사제',
        keywordKo: '직관, 내면, 비밀',
        uprightMeaning: '겉으로 드러난 정보보다 미묘한 분위기와 직감을 믿어야 하는 날입니다.',
        reversedMeaning: '감이 흔들리기 쉽습니다. 억측으로 결론내리지 말고 조금 더 관찰하세요.',
        premiumAdvice: '답을 바로 내지 말고, 중요한 대화는 저녁 전에 한 번 더 정리한 뒤 반응하는 편이 좋습니다.',
    },
    {
        cardIndex: 3,
        cardName: 'The Empress',
        cardNameKo: '여황제',
        keywordKo: '풍요, 돌봄, 매력',
        uprightMeaning: '사람과 아이디어를 편안하게 성장시키는 흐름이 강한 날입니다.',
        reversedMeaning: '과한 배려나 감정 소모가 생길 수 있습니다. 에너지 경계를 분명히 하세요.',
        premiumAdvice: '브랜딩, 관계 관리, 셀프케어에 투자한 시간이 바로 만족감과 성과로 이어질 가능성이 큽니다.',
    },
    {
        cardIndex: 4,
        cardName: 'The Emperor',
        cardNameKo: '황제',
        keywordKo: '질서, 리더십, 안정',
        uprightMeaning: '주도권을 잡고 구조를 정리할수록 하루가 안정적으로 풀립니다.',
        reversedMeaning: '통제 욕구가 강해질 수 있습니다. 완벽보다 유연한 기준이 필요합니다.',
        premiumAdvice: '회의나 일정은 먼저 우선순위를 선포하고, 숫자와 기준을 함께 제시하면 설득력이 올라갑니다.',
    },
    {
        cardIndex: 5,
        cardName: 'The Hierophant',
        cardNameKo: '교황',
        keywordKo: '전통, 배움, 조언',
        uprightMeaning: '검증된 방식과 조언이 도움이 되는 날입니다. 익숙한 질서 안에서 답이 보입니다.',
        reversedMeaning: '남의 기준에 갇히기 쉽습니다. 관성적 선택은 한 번 더 의심해보세요.',
        premiumAdvice: '멘토, 선배, 데이터처럼 이미 검증된 기준을 빌리면 시행착오를 크게 줄일 수 있습니다.',
    },
    {
        cardIndex: 6,
        cardName: 'The Lovers',
        cardNameKo: '연인',
        keywordKo: '선택, 관계, 조화',
        uprightMeaning: '관계와 선택의 질이 하루의 방향을 정합니다. 마음이 맞는 연결이 힘이 됩니다.',
        reversedMeaning: '감정과 판단이 엇갈릴 수 있습니다. 서두른 약속은 부담으로 돌아올 수 있습니다.',
        premiumAdvice: '협업과 연애 모두 대화의 톤을 부드럽게 유지하고, 중요한 선택은 가치 기준을 먼저 적어두세요.',
    },
    {
        cardIndex: 7,
        cardName: 'The Chariot',
        cardNameKo: '전차',
        keywordKo: '전진, 의지, 돌파',
        uprightMeaning: '밀고 나갈 힘이 강한 날입니다. 주저하던 일에 속도를 붙일 수 있습니다.',
        reversedMeaning: '과속하거나 방향을 잃기 쉽습니다. 추진력과 통제력을 같이 챙기세요.',
        premiumAdvice: '오늘은 오후 초반에 핵심 실행을 몰아치고, 감정이 올라올 때는 속도를 줄이는 것이 좋습니다.',
    },
    {
        cardIndex: 8,
        cardName: 'Strength',
        cardNameKo: '힘',
        keywordKo: '인내, 부드러운 강함, 자제',
        uprightMeaning: '세게 밀기보다 부드럽게 버티는 힘이 통하는 날입니다.',
        reversedMeaning: '자기 의심이나 피로가 커질 수 있습니다. 스스로를 몰아붙이지 마세요.',
        premiumAdvice: '강한 설득보다 차분한 태도가 효과적입니다. 반복되는 갈등은 한 템포 쉬고 답하는 편이 낫습니다.',
    },
    {
        cardIndex: 9,
        cardName: 'The Hermit',
        cardNameKo: '은둔자',
        keywordKo: '성찰, 거리두기, 지혜',
        uprightMeaning: '혼자 정리하는 시간이 오히려 정확한 판단을 도와주는 날입니다.',
        reversedMeaning: '고립감이 커질 수 있습니다. 필요한 연결까지 끊어내지 않도록 주의하세요.',
        premiumAdvice: '일정 사이에 짧은 고독 시간을 확보하세요. 생각을 글로 적으면 답이 더 빨리 선명해집니다.',
    },
    {
        cardIndex: 10,
        cardName: 'Wheel of Fortune',
        cardNameKo: '운명의 수레바퀴',
        keywordKo: '전환점, 기회, 순환',
        uprightMeaning: '예상 밖 흐름이 좋은 방향으로 돌아설 수 있는 날입니다.',
        reversedMeaning: '변수에 흔들리기 쉬운 날입니다. 운에만 기대지 말고 대비책을 두세요.',
        premiumAdvice: '일정 변경이나 우연한 제안이 오면 바로 닫지 말고, 오늘 안에 시험해볼 수 있는 작은 실험으로 바꿔보세요.',
    },
    {
        cardIndex: 11,
        cardName: 'Justice',
        cardNameKo: '정의',
        keywordKo: '균형, 책임, 명확성',
        uprightMeaning: '공정하고 분명한 태도가 신뢰를 만드는 날입니다.',
        reversedMeaning: '감정적 판단이 손해로 이어질 수 있습니다. 근거 없는 확신을 경계하세요.',
        premiumAdvice: '계약, 약속, 금전 관련 결정은 기록을 남기고 기준을 수치화하면 훨씬 안정적입니다.',
    },
    {
        cardIndex: 12,
        cardName: 'The Hanged Man',
        cardNameKo: '매달린 사람',
        keywordKo: '멈춤, 관점 전환, 유예',
        uprightMeaning: '멈춤이 손실이 아니라 재정렬의 기회가 되는 날입니다.',
        reversedMeaning: '지체가 길어질 수 있습니다. 미루는 이유를 분명히 해야 합니다.',
        premiumAdvice: '정체된 일은 억지로 밀지 말고, 보는 관점을 바꾸거나 순서를 뒤집어 접근해보세요.',
    },
    {
        cardIndex: 13,
        cardName: 'Death',
        cardNameKo: '죽음',
        keywordKo: '종료, 전환, 재시작',
        uprightMeaning: '낡은 흐름을 정리할수록 새로운 공간이 생기는 날입니다.',
        reversedMeaning: '끝내야 할 것을 붙잡기 쉽습니다. 미련이 성장을 늦출 수 있습니다.',
        premiumAdvice: '비효율적인 루틴, 관계, 비용을 하나 정리하세요. 비우는 결정이 가장 큰 수익이 될 수 있습니다.',
    },
    {
        cardIndex: 14,
        cardName: 'Temperance',
        cardNameKo: '절제',
        keywordKo: '조화, 절제, 균형',
        uprightMeaning: '극단보다 중간 지점을 잡을 때 가장 좋은 결과가 나오는 날입니다.',
        reversedMeaning: '과하거나 모자란 움직임이 생기기 쉽습니다. 리듬을 조절하세요.',
        premiumAdvice: '오늘은 속도보다 페이스 관리가 중요합니다. 일과 휴식을 섞어야 집중력이 오래 갑니다.',
    },
    {
        cardIndex: 15,
        cardName: 'The Devil',
        cardNameKo: '악마',
        keywordKo: '집착, 유혹, 속박',
        uprightMeaning: '반복되는 집착이나 유혹이 드러나는 날입니다. 패턴을 의식해야 합니다.',
        reversedMeaning: '묶여 있던 흐름에서 빠져나올 실마리가 보입니다.',
        premiumAdvice: '소비, 연락, 집착하는 루틴 중 하나에 상한선을 두세요. 의식적인 제한이 해방으로 이어집니다.',
    },
    {
        cardIndex: 16,
        cardName: 'The Tower',
        cardNameKo: '탑',
        keywordKo: '붕괴, 충격, 진실',
        uprightMeaning: '예상치 못한 깨달음이나 구조 변화가 찾아올 수 있는 날입니다.',
        reversedMeaning: '변화를 미루다가 더 큰 피로가 쌓일 수 있습니다.',
        premiumAdvice: '틀어진 계획이 생기면 방어보다 재설계를 우선하세요. 빨리 인정할수록 손실이 줄어듭니다.',
    },
    {
        cardIndex: 17,
        cardName: 'The Star',
        cardNameKo: '별',
        keywordKo: '희망, 치유, 영감',
        uprightMeaning: '마음이 밝아지고 멀리 보이는 날입니다. 회복과 영감이 함께 옵니다.',
        reversedMeaning: '희망이 흐려질 수 있습니다. 결과보다 작은 회복 신호를 먼저 보세요.',
        premiumAdvice: '콘텐츠, 브랜딩, 창작, 인간관계 회복에 좋은 날입니다. 오늘 떠오른 아이디어는 바로 저장해두세요.',
    },
    {
        cardIndex: 18,
        cardName: 'The Moon',
        cardNameKo: '달',
        keywordKo: '직관, 불안, 무의식',
        uprightMeaning: '분위기와 감정이 크게 작용하는 날입니다. 직감은 중요하지만 검증도 필요합니다.',
        reversedMeaning: '혼란이 조금씩 걷히는 흐름입니다. 불안을 언어화하면 힘이 빠집니다.',
        premiumAdvice: '애매한 제안은 오늘 확답하지 마세요. 기록과 수치를 다시 확인한 뒤 답하는 편이 좋습니다.',
    },
    {
        cardIndex: 19,
        cardName: 'The Sun',
        cardNameKo: '태양',
        keywordKo: '기쁨, 성공, 활력',
        uprightMeaning: '자신감과 가시적 성과가 함께 들어오는 밝은 날입니다.',
        reversedMeaning: '좋은 흐름은 있지만 과신하면 놓치는 부분이 생길 수 있습니다.',
        premiumAdvice: '대외 노출, 발표, 제안, 만남에 유리합니다. 오늘의 낙관은 실제 행동으로 연결할 때 더 빛납니다.',
    },
    {
        cardIndex: 20,
        cardName: 'Judgement',
        cardNameKo: '심판',
        keywordKo: '각성, 결단, 부름',
        uprightMeaning: '미뤄둔 결정을 다시 마주하게 되는 날입니다. 분명한 선택이 필요합니다.',
        reversedMeaning: '후회와 자기검열이 발목을 잡을 수 있습니다. 지나친 자책은 멈추세요.',
        premiumAdvice: '중요한 결론은 오늘 안에 초안을 내리세요. 완벽하지 않아도 방향을 정해야 다음 흐름이 열립니다.',
    },
    {
        cardIndex: 21,
        cardName: 'The World',
        cardNameKo: '세계',
        keywordKo: '완성, 성취, 통합',
        uprightMeaning: '하나의 흐름이 잘 마무리되며 다음 단계로 넘어갈 준비가 되는 날입니다.',
        reversedMeaning: '마무리 직전의 느슨함이 생기기 쉽습니다. 마지막 정리를 놓치지 마세요.',
        premiumAdvice: '끝내야 할 목록을 점검하고, 공개 가능한 결과물은 오늘 마감하는 편이 좋습니다.',
    },
];

const MINOR_SUITS: MinorSuitDefinition[] = [
    {
        name: 'Wands',
        nameKo: '지팡이',
        keywordKo: '행동, 추진력, 열정',
        uprightTone: '주도적으로 밀어붙이는 힘이 살아납니다.',
        reversedTone: '의욕은 있지만 방향이 분산되기 쉽습니다.',
        premiumFocus: '실행 우선순위를 한 줄로 정리하면 성과가 빨라집니다.',
    },
    {
        name: 'Cups',
        nameKo: '컵',
        keywordKo: '감정, 관계, 공감',
        uprightTone: '감정 교류와 연결이 부드럽게 흐릅니다.',
        reversedTone: '감정 기복이 판단을 흐릴 수 있습니다.',
        premiumFocus: '대화는 타이밍과 톤을 먼저 조절하는 편이 유리합니다.',
    },
    {
        name: 'Swords',
        nameKo: '검',
        keywordKo: '판단, 대화, 결단',
        uprightTone: '머리가 맑아지고 선택의 기준이 분명해집니다.',
        reversedTone: '예민함과 과한 분석이 피로를 키울 수 있습니다.',
        premiumFocus: '중요한 결정은 글로 정리할수록 흔들림이 줄어듭니다.',
    },
    {
        name: 'Pentacles',
        nameKo: '펜타클',
        keywordKo: '재물, 실무, 안정',
        uprightTone: '현실 감각과 실속 있는 선택이 빛을 발합니다.',
        reversedTone: '지출과 피로 관리가 느슨해질 수 있습니다.',
        premiumFocus: '돈과 시간 사용처를 점검하면 바로 효율이 살아납니다.',
    },
];

const MINOR_RANKS: MinorRankDefinition[] = [
    {
        name: 'Ace',
        nameKo: '에이스',
        keywordKo: '시작, 씨앗, 가능성',
        uprightMeaning: '작지만 선명한 출발점이 생깁니다.',
        reversedMeaning: '좋은 기회가 보여도 실행이 늦어질 수 있습니다.',
        premiumAdvice: '오늘 생긴 아이디어는 작게라도 바로 시작해야 흐름이 붙습니다.',
    },
    {
        name: 'Two',
        nameKo: '투',
        keywordKo: '균형, 선택, 조율',
        uprightMeaning: '둘 사이의 균형을 잡는 감각이 중요합니다.',
        reversedMeaning: '선택을 미루면 에너지가 분산될 수 있습니다.',
        premiumAdvice: '병행 작업은 두 개까지만 유지하고, 하나는 과감히 나중으로 미루세요.',
    },
    {
        name: 'Three',
        nameKo: '쓰리',
        keywordKo: '확장, 협업, 표현',
        uprightMeaning: '함께 움직일 때 결과가 더 커지는 날입니다.',
        reversedMeaning: '의견 차이로 속도가 늦어질 수 있습니다.',
        premiumAdvice: '혼자 완벽히 끝내려 하지 말고, 중간 공유로 피드백을 먼저 받아두세요.',
    },
    {
        name: 'Four',
        nameKo: '포',
        keywordKo: '안정, 휴식, 구조',
        uprightMeaning: '기반을 단단히 하는 정리의 힘이 큽니다.',
        reversedMeaning: '정체감이나 답답함이 쌓일 수 있습니다.',
        premiumAdvice: '새 일보다 지금 가진 구조를 다듬는 편이 더 큰 이득입니다.',
    },
    {
        name: 'Five',
        nameKo: '파이브',
        keywordKo: '긴장, 경쟁, 변화 압박',
        uprightMeaning: '불편한 자극이 성장을 밀어내는 날입니다.',
        reversedMeaning: '갈등을 피하려다 핵심을 놓칠 수 있습니다.',
        premiumAdvice: '감정 반응보다 사실관계를 먼저 정리하면 손해를 줄일 수 있습니다.',
    },
    {
        name: 'Six',
        nameKo: '식스',
        keywordKo: '회복, 이동, 조화',
        uprightMeaning: '흐름이 한층 가벼워지고 균형을 되찾기 쉽습니다.',
        reversedMeaning: '과거 패턴이 다시 발목을 잡을 수 있습니다.',
        premiumAdvice: '오늘은 복잡한 일보다 회복과 정리 루틴을 끼워 넣는 것이 장기적으로 이롭습니다.',
    },
    {
        name: 'Seven',
        nameKo: '세븐',
        keywordKo: '점검, 전략, 재평가',
        uprightMeaning: '속도보다 전략이 더 중요한 날입니다.',
        reversedMeaning: '의심이 과해져 타이밍을 놓치기 쉽습니다.',
        premiumAdvice: '중요한 선택은 바로 반응하지 말고, 비교 기준 세 개를 적은 뒤 판단하세요.',
    },
    {
        name: 'Eight',
        nameKo: '에이트',
        keywordKo: '집중, 흐름, 반복',
        uprightMeaning: '집중력을 붙이면 결과가 빠르게 쌓입니다.',
        reversedMeaning: '과로와 루틴 피로가 누적될 수 있습니다.',
        premiumAdvice: '알림을 줄이고 한 블록 집중 시간을 확보하면 하루 생산성이 크게 달라집니다.',
    },
    {
        name: 'Nine',
        nameKo: '나인',
        keywordKo: '마무리, 숙련, 경계',
        uprightMeaning: '거의 완성 단계에 가까워지는 날입니다.',
        reversedMeaning: '끝을 앞두고 불안이 커질 수 있습니다.',
        premiumAdvice: '새 일보다 마감과 검수에 집중하세요. 마지막 10%가 성과를 좌우합니다.',
    },
    {
        name: 'Ten',
        nameKo: '텐',
        keywordKo: '완결, 부담, 수확',
        uprightMeaning: '하나의 사이클이 끝나며 결과가 드러나는 날입니다.',
        reversedMeaning: '부담을 혼자 끌어안고 있을 수 있습니다.',
        premiumAdvice: '정리할 일과 넘길 일을 구분하세요. 전부 직접 처리하려는 태도는 손해입니다.',
    },
    {
        name: 'Page',
        nameKo: '페이지',
        keywordKo: '탐색, 호기심, 신호',
        uprightMeaning: '배우고 시험해보는 태도가 행운을 부릅니다.',
        reversedMeaning: '미숙함이나 산만함이 드러날 수 있습니다.',
        premiumAdvice: '정보를 수집하되 바로 작은 실험으로 연결해야 배움이 실제 자산이 됩니다.',
    },
    {
        name: 'Knight',
        nameKo: '나이트',
        keywordKo: '추진, 이동, 액션',
        uprightMeaning: '빠른 전개와 행동력이 강조되는 날입니다.',
        reversedMeaning: '성급함이 실수로 이어질 수 있습니다.',
        premiumAdvice: '오늘의 추진력은 좋지만, 일정 사이에 점검 포인트를 넣어야 방향을 잃지 않습니다.',
    },
    {
        name: 'Queen',
        nameKo: '퀸',
        keywordKo: '관리, 성숙, 조율',
        uprightMeaning: '섬세한 운영과 감각적 판단이 강점으로 작동합니다.',
        reversedMeaning: '예민함이나 감정 소모가 커질 수 있습니다.',
        premiumAdvice: '다른 사람을 챙기기 전에 자신의 기준과 컨디션을 먼저 안정시키는 것이 우선입니다.',
    },
    {
        name: 'King',
        nameKo: '킹',
        keywordKo: '주도권, 완성도, 통솔',
        uprightMeaning: '전체 판을 읽고 정리하는 힘이 강한 날입니다.',
        reversedMeaning: '고집과 과통제가 마찰을 만들 수 있습니다.',
        premiumAdvice: '결정은 짧고 명확하게 내리되, 실행 방식은 팀과 상황에 맞게 유연하게 열어두세요.',
    },
];

function buildMinorArcana(): TarotCardDefinition[] {
    return MINOR_SUITS.flatMap((suit, suitIndex) =>
        MINOR_RANKS.map((rank, rankIndex) => ({
            cardIndex: 22 + suitIndex * MINOR_RANKS.length + rankIndex,
            cardName: `${rank.name} of ${suit.name}`,
            cardNameKo: `${suit.nameKo} ${rank.nameKo}`,
            keywordKo: `${suit.keywordKo}, ${rank.keywordKo}`,
            uprightMeaning: `${rank.uprightMeaning} ${suit.uprightTone}`,
            reversedMeaning: `${rank.reversedMeaning} ${suit.reversedTone}`,
            premiumAdvice: `${rank.premiumAdvice} ${suit.premiumFocus}`,
        }))
    );
}

export const DAILY_TAROT_DECK: TarotCardDefinition[] = [
    ...MAJOR_ARCANA,
    ...buildMinorArcana(),
];

function hashCode(input: string): number {
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
}

export function buildDailyTarotSeed(birthday: string, date: string): number {
    return hashCode(`${date}|${birthday}|daily-tarot`);
}

export function getDailyTarotReading(
    birthday: string,
    date: string,
    isPremium: boolean
): DailyTarotResponse {
    const seed = buildDailyTarotSeed(birthday, date);
    const card = DAILY_TAROT_DECK[seed % DAILY_TAROT_DECK.length];
    const isReversed = ((seed >> 3) & 1) === 1;

    return {
        date,
        cardIndex: card.cardIndex,
        cardName: card.cardName,
        cardNameKo: card.cardNameKo,
        isReversed,
        keywordKo: card.keywordKo,
        meaning: isReversed ? card.reversedMeaning : card.uprightMeaning,
        advice: isPremium
            ? card.premiumAdvice
            : '구독자 전용 행동 가이드는 CosmicPath Pro에서 확인할 수 있습니다.',
        isPremium,
    };
}
