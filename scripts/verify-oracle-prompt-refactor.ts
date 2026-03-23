import { strict as assert } from 'node:assert';
import { buildChatSystemPrompt, buildChatUserPrompt } from '../src/lib/ai/prompt-builder';

function run() {
  const noFactsPrompt = buildChatSystemPrompt(
    {
      saju: '사주 요약 없음',
      astrology: '점성 요약 없음',
      tarot: [],
      name: '테스터',
    },
    'ko'
  );

  assert.match(noFactsPrompt, /제공된 문자 데이터만 인용/);
  assert.doesNotMatch(noFactsPrompt, /엔진 수치 최소 2개 인용/);
  assert.match(noFactsPrompt, /의료 진단, 투약 변경, 수술, 치료 중단 관련 질문/);
  assert.match(noFactsPrompt, /대화 이력과 현재 Facts가 충돌하면/);

  const factsPrompt = buildChatSystemPrompt(
    {
      saju: '사주 요약',
      astrology: '점성 요약',
      tarot: [{
        id: 17,
        name: '별',
        nameEn: 'The Star',
        keywords: ['희망'],
        interpretation: '희망이 살아납니다',
        isReversed: false,
        image: 'https://example.com/star.jpg',
      }],
      name: '테스터',
    },
    'ko',
    '## 📊 Facts of Destiny 데이터\n- 오행 점수: 목 25% | 화 15%'
  );

  assert.match(factsPrompt, /최소 2개 인용을 목표/);
  assert.match(factsPrompt, /Facts of Destiny 원본 데이터/);

  const userPrompt = buildChatUserPrompt('주식 풀매수 할까요?', 'User: 안녕하세요\nAssistant: 반갑습니다');
  assert.match(userPrompt, /<chat_history>/);
  assert.match(userPrompt, /Facts of Destiny 원본 데이터와 충돌하면 원본을 우선/);
  assert.match(userPrompt, /현재 질문: 주식 풀매수 할까요\?/);

  console.log('Oracle prompt verification passed');
}

run();
