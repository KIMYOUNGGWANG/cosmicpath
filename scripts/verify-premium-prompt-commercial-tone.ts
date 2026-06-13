import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';

type PromptSurface = {
  readonly filePath: string;
  readonly description: string;
};

type PhraseRule = {
  readonly phrase: string;
  readonly reason: string;
};

const PROMPT_SURFACES = [
  { filePath: 'src/lib/ai/prompt-premium-schema.ts', description: 'premium report schema' },
  { filePath: 'src/lib/ai/phase-prompts/labels.ts', description: 'phase progress labels' },
  { filePath: 'src/lib/ai/phase-prompts/phase1.ts', description: 'phase 1 impression prompt' },
  { filePath: 'src/lib/ai/phase-prompts/phase4.ts', description: 'phase 4 life-area prompt' },
  { filePath: 'src/lib/ai/phase-prompts/phase5a.ts', description: 'phase 5A action prompt' },
  { filePath: 'src/lib/ai/phase-prompts/phase5b.ts', description: 'phase 5B final synthesis prompt' },
  { filePath: 'src/lib/ai/match-phase-prompts.ts', description: 'match phased prompt surface' },
  { filePath: 'src/lib/ai/match-prompt-builder.ts', description: 'match prompt builder surface' },
  { filePath: 'src/lib/ai/prompt-chat-mode.ts', description: 'chat mode prompt protocol' },
  { filePath: 'src/lib/ai/oracle-personas.ts', description: 'oracle persona prompt profile' },
  { filePath: 'src/lib/ai/prompt-builder.ts', description: 'main oracle prompt builder' },
  { filePath: 'src/lib/ai/prompts/tarot-minor-arcana.ts', description: 'tarot minor arcana prompt data' },
  { filePath: 'src/lib/ai/prompts/astro-rules.ts', description: 'astrology prompt rules' },
] as const satisfies readonly PromptSurface[];

const BANNED_PHRASES = [
  { phrase: '운명의 최종 판결', reason: 'frames the report as absolute fate instead of a decision note' },
  { phrase: '운명의 서사', reason: 'over-positions the product as fate theater' },
  { phrase: '소름 돋게', reason: 'optimizes for shock rather than trust' },
  { phrase: '압도적인 종합 요약', reason: 'encourages hype instead of useful density' },
  { phrase: '확정 판정', reason: 'pushes certainty beyond available evidence' },
  { phrase: '급격한 변화를 확신', reason: 'turns evidence into an absolute forecast' },
  { phrase: '운명적 이끌림', reason: 'over-mystifies relationship guidance' },
  { phrase: 'My Fatal Charm', reason: 'uses sensational self-branding' },
  { phrase: 'Turning Point (D-Day)', reason: 'presents timing as deterministic' },
  { phrase: 'D-Day', reason: 'presents timing as deterministic' },
  { phrase: '외모, 직업, 성씨, 만나는 장소', reason: 'invites fabricated identity details' },
  { phrase: 'Physical traits, profession, and where to meet them', reason: 'invites fabricated identity details' },
  { phrase: '나만의 치명적 매력', reason: 'uses sensational self-branding' },
  { phrase: '운명의 터닝 포인트', reason: 'presents timing as deterministic' },
  { phrase: '우주가 문을 열어주는 날', reason: 'uses ungrounded cosmic guarantee language' },
  { phrase: '절대 멈춰야 할 날', reason: 'overstates risk timing' },
  { phrase: '수확의 날', reason: 'over-promises financial timing' },
  { phrase: '전생 분석', reason: 'literal past-life framing weakens commercial trust' },
  { phrase: '전생의 테마', reason: 'literal past-life framing weakens commercial trust' },
  { phrase: '전생 테마', reason: 'literal past-life framing weakens commercial trust' },
  { phrase: 'Past Life Theme', reason: 'literal past-life framing weakens commercial trust' },
  { phrase: 'past life themes', reason: 'literal past-life framing weakens commercial trust' },
  { phrase: '해소해야 할 카르마', reason: 'karmic certainty can feel manipulative' },
  { phrase: 'Karma to Resolve', reason: 'karmic certainty can feel manipulative' },
  { phrase: '전생 연결점', reason: 'literal past-life framing weakens commercial trust' },
  { phrase: 'Recurring karmic patterns', reason: 'karmic certainty can feel manipulative' },
  { phrase: '영혼 미션', reason: 'overstates spiritual certainty' },
  { phrase: 'Soul Mission', reason: 'overstates spiritual certainty' },
  { phrase: '강한 어조', reason: 'optimizes forcefulness without evidence boundaries' },
  { phrase: 'Fate Architect', reason: 'positions the product as fate design instead of decision support' },
  { phrase: '계시(Revelation)', reason: 'frames analysis as revelation instead of evidence-bounded guidance' },
  { phrase: '운명의 해설자', reason: 'frames the guide as a fate interpreter instead of a decision analyst' },
  { phrase: '우주적 사건', reason: 'overstates relationship analysis as cosmic certainty' },
  { phrase: '운명을 개운', reason: 'promises fate alteration instead of practical decision support' },
  { phrase: '주간 의식', reason: 'adds ritual framing instead of repeatable actions' },
  { phrase: '코즈믹 시그니처', reason: 'keeps legacy mystical branding inside the relationship prompt' },
  { phrase: 'Facts of Destiny', reason: 'uses absolute destiny positioning instead of the Decision Note product frame' },
  { phrase: 'current axis of fate', reason: 'uses fate positioning where a decision axis is sufficient' },
  { phrase: '운명적 만남', reason: 'over-mystifies tarot relationship signals' },
  { phrase: '솔메이트 에너지', reason: 'overstates tarot relationship signals as soulmate certainty' },
  { phrase: '카르마, 비밀, 영성', reason: 'keeps astrology rules in mystical positioning instead of pattern and timing language' },
] as const satisfies readonly PhraseRule[];

const REQUIRED_MARKERS = [
  { phrase: '최종 3단 판정', reason: 'final verdict should stay anchored to the product promise' },
  { phrase: '3단 판정 서사', reason: 'phase labels should match the three-layer product' },
  { phrase: '근거가 약하면 조건과 재검토 경계', reason: 'phase 1 needs uncertainty handling' },
  { phrase: '검증 창', reason: 'date guidance should be framed as a review window' },
  { phrase: '전생을 사실처럼 단정하지 말고', reason: 'symbolic material needs a truth boundary' },
  { phrase: '반복 패턴', reason: 'spiritual sections should translate into observable patterns' },
] as const satisfies readonly PhraseRule[];

function readSurface({ filePath }: PromptSurface): string {
  assert.ok(existsSync(filePath), `Missing prompt surface: ${filePath}`);
  return readFileSync(filePath, 'utf8');
}

const surfaceTexts = PROMPT_SURFACES.map((surface) => ({
  ...surface,
  text: readSurface(surface),
}));

const violations = surfaceTexts.flatMap((surface) =>
  BANNED_PHRASES.filter((rule) => surface.text.includes(rule.phrase)).map((rule) =>
    `${surface.filePath}: banned phrase "${rule.phrase}" (${rule.reason})`,
  ),
);

const combinedPrompts = surfaceTexts.map((surface) => surface.text).join('\n');
const missingMarkers = REQUIRED_MARKERS
  .filter((rule) => !combinedPrompts.includes(rule.phrase))
  .map((rule) => `missing required marker "${rule.phrase}" (${rule.reason})`);

assert.deepEqual([...violations, ...missingMarkers], []);

console.log('premium_prompt_commercial_tone_verification passed');
