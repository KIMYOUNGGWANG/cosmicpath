/**
 * 타로 카드 해석 규칙 (Tarot Interpretation Rules)
 * 
 * 가중치: 20% (현재 에너지, 심리)
 * 사용: AI 프롬프트에 컨텍스트로 주입
 */

export const TAROT_RULES = {
    version: '1.0.0',
    weight: 0.20,
    role: '현재 에너지, 심리 상태, 단기 흐름',

    // ============ 메이저 아르카나 (22장) ============
    majorArcana: {
        0: { name: '광대', english: 'The Fool', upright: '새 시작, 모험, 순수', reversed: '무모함, 미성숙' },
        1: { name: '마법사', english: 'The Magician', upright: '실현력, 집중, 창조', reversed: '속임, 재능 낭비' },
        2: { name: '여사제', english: 'High Priestess', upright: '직관, 내면 지혜', reversed: '억압된 감정' },
        3: { name: '여황제', english: 'The Empress', upright: '풍요, 창조, 모성', reversed: '과잉 의존' },
        4: { name: '황제', english: 'The Emperor', upright: '권위, 리더십, 안정', reversed: '독재, 경직' },
        5: { name: '교황', english: 'Hierophant', upright: '전통, 조언, 교육', reversed: '독단, 반항' },
        6: { name: '연인', english: 'The Lovers', upright: '사랑, 선택, 조화', reversed: '갈등, 불화' },
        7: { name: '전차', english: 'The Chariot', upright: '승리, 의지력, 돌파', reversed: '통제 상실' },
        8: { name: '힘', english: 'Strength', upright: '내적 힘, 용기, 인내', reversed: '자기 의심' },
        9: { name: '은둔자', english: 'The Hermit', upright: '성찰, 지혜 탐구', reversed: '고립, 외로움' },
        10: { name: '운명의 수레바퀴', english: 'Wheel of Fortune', upright: '변화, 행운, 전환점', reversed: '악운, 저항' },
        11: { name: '정의', english: 'Justice', upright: '공정, 균형, 결과', reversed: '불공정' },
        12: { name: '매달린 사람', english: 'Hanged Man', upright: '희생, 새 관점', reversed: '저항, 지연' },
        13: { name: '죽음', english: 'Death', upright: '변혁, 종결, 재생', reversed: '변화 거부' },
        14: { name: '절제', english: 'Temperance', upright: '조화, 균형, 인내', reversed: '극단, 불균형' },
        15: { name: '악마', english: 'The Devil', upright: '속박, 유혹, 집착', reversed: '해방, 자각' },
        16: { name: '탑', english: 'The Tower', upright: '붕괴, 급변, 깨달음', reversed: '파국 회피' },
        17: { name: '별', english: 'The Star', upright: '희망, 영감, 치유', reversed: '절망, 낙담' },
        18: { name: '달', english: 'The Moon', upright: '직관, 무의식, 혼란', reversed: '두려움, 환상' },
        19: { name: '태양', english: 'The Sun', upright: '성공, 기쁨, 활력', reversed: '우울, 지연' },
        20: { name: '심판', english: 'Judgement', upright: '각성, 재탄생, 소명', reversed: '자기 비판' },
        21: { name: '세계', english: 'The World', upright: '완성, 성취, 통합', reversed: '미완성, 정체' }
    },

    // ============ 슈트별 영역 ============
    suits: {
        Wands: { element: 'Fire', saju: '火', area: '열정, 행동, 커리어' },
        Cups: { element: 'Water', saju: '水', area: '감정, 관계, 사랑' },
        Swords: { element: 'Air', saju: '金', area: '사고, 갈등, 소통' },
        Pentacles: { element: 'Earth', saju: '土', area: '물질, 돈, 건강' }
    },

    // ============ 3장 스프레드 위치 ============
    positions: {
        1: { timeframe: '과거', question: '왜 이 상황이 생겼는가?' },
        2: { timeframe: '현재', question: '지금 무엇이 작용하는가?' },
        3: { timeframe: '미래', question: '어디로 향하고 있는가?' }
    },

    // ============ 흐름 패턴 ============
    narrativePatterns: {
        ascending: { cards: '부정 → 중립 → 긍정', message: '어려움 극복, 좋은 결과로' },
        descending: { cards: '긍정 → 중립 → 부정', message: '좋은 시작이지만 주의 필요' },
        steady: { cards: '동일 에너지 유지', message: '변화를 원하면 능동적 행동 필요' },
        reversal: { cards: '긍정 ↔ 부정 ↔ 긍정', message: '과정에서 시련이지만 극복 가능' }
    },

    // ============ 역방향 해석 규칙 ============
    reversalRules: {
        principle: '정방향 에너지의 과잉/부족/왜곡 또는 내면화',
        severity: {
            0: '순탄한 흐름',
            1: '특정 영역 주의',
            2: '내적 정리 필요',
            3: '큰 변화/재점검 필요'
        }
    },

    // ============ 해석 템플릿 ============
    interpretationTemplate: `
**뽑힌 카드**:
1. {card1} ({direction1}) - 과거/원인
2. {card2} ({direction2}) - 현재/과정
3. {card3} ({direction3}) - 미래/결과

**흐름 패턴**: {pattern}
{narrativeInterpretation}

**현재 에너지 요약**: {energySummary}
`
};

export default TAROT_RULES;
