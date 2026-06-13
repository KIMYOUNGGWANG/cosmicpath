import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';

type Surface = {
  readonly filePath: string;
  readonly description: string;
};

type PhraseRule = {
  readonly phrase: string;
  readonly reason: string;
};

const SURFACES = [
  { filePath: 'src/lib/ai/match-phase-prompts.ts', description: 'match phased prompt' },
  { filePath: 'src/lib/ai/match-prompt-builder.ts', description: 'match prompt builder' },
  { filePath: 'src/lib/ai/phase-prompts/phase5a.ts', description: 'premium date guidance prompt' },
  { filePath: 'src/lib/ai/phase-prompts/phase5b.ts', description: 'premium symbolic pattern prompt' },
  { filePath: 'src/lib/ai/prompt-chat-mode.ts', description: 'chat mode prompt protocol' },
  { filePath: 'src/lib/ai/oracle-personas.ts', description: 'oracle persona prompt profile' },
  { filePath: 'src/lib/ai/prompts/astro-rules.ts', description: 'astrology prompt rules' },
  { filePath: 'src/lib/ai/prompts/tarot-minor-arcana.ts', description: 'tarot minor arcana prompt data' },
  { filePath: 'src/app/en/saju/sections/SajuHero.tsx', description: 'English Saju hero copy' },
  { filePath: 'src/app/en/saju/sections/SajuWhyDifferent.tsx', description: 'English Saju differentiation copy' },
  { filePath: 'src/app/match/new/MatchNewClient.tsx', description: 'match intake hero copy' },
  { filePath: 'src/components/dashboard/GhostCard.tsx', description: 'shin-sal card copy' },
  { filePath: 'src/components/reading/premium-report.tsx', description: 'premium report teaser copy' },
  { filePath: 'src/components/reading/premium-report-sections.tsx', description: 'premium report section labels' },
  { filePath: 'src/components/reading/PrintLayout.tsx', description: 'print report labels' },
  { filePath: 'src/lib/ai/prompt-builder.ts', description: 'main oracle prompt builder' },
  { filePath: 'src/components/reading/verdict-report/hero-verdict-card.tsx', description: 'verdict hero card copy' },
  { filePath: 'src/components/reading/verdict-report/evidence-tabs.tsx', description: 'verdict report evidence tab copy' },
] as const satisfies readonly Surface[];

const BANNED_PHRASES = [
  { phrase: 'Fate Architect', reason: 'positions the report as fate design' },
  { phrase: '계시(Revelation)', reason: 'frames analysis as revelation' },
  { phrase: '운명의 해설자', reason: 'frames the guide as a fate interpreter' },
  { phrase: '우주적 사건', reason: 'overstates relationship analysis' },
  { phrase: '운명을 개운', reason: 'promises fate alteration' },
  { phrase: '주간 의식', reason: 'adds ritual framing' },
  { phrase: '가슴을 울리는', reason: 'optimizes for emotional force' },
  { phrase: '인생 소설', reason: 'over-positions the product as fate theater' },
  { phrase: '코즈믹 시그니처', reason: 'keeps legacy mystical branding' },
  { phrase: 'Your birthdate carries a verdict', reason: 'turns birth data into a verdict' },
  { phrase: 'exactly what to do', reason: 'overclaims prescriptive certainty' },
  { phrase: 'fate science', reason: 'overstates doctrine as science' },
  { phrase: 'Saju decides', reason: 'overclaims deterministic authority' },
  { phrase: 'exact elemental forces', reason: 'overclaims precision' },
  { phrase: 'No vague archetypes', reason: 'paired with verdict copy' },
  { phrase: 'Just verdicts', reason: 'frames output as absolute verdicts' },
  { phrase: 'missing pieces of your destiny', reason: 'uses destiny FOMO' },
  { phrase: 'Past Life & Karma', reason: 'uses literal past-life framing' },
  { phrase: 'Inherited Patterns & Karmic Themes', reason: 'keeps karmic certainty in UI copy' },
  { phrase: '전생과 카르마', reason: 'uses literal past-life framing' },
  { phrase: '반복 패턴과 카르마', reason: 'keeps karmic certainty in UI copy' },
  { phrase: 'Past Life Pattern', reason: 'uses literal past-life framing' },
  { phrase: '전생 패턴', reason: 'uses literal past-life framing' },
  { phrase: '운명적 조화', reason: 'over-mystifies match intake' },
  { phrase: '치명적인 매력', reason: 'sensationalizes shin-sal copy' },
  { phrase: 'Fatal Attraction', reason: 'sensationalizes shin-sal copy' },
  { phrase: 'current axis of fate', reason: 'uses fate positioning' },
  { phrase: 'creative energy is at its peak', reason: 'uses generic horoscope language' },
  { phrase: 'season to plant seeds', reason: 'uses generic horoscope language' },
  { phrase: '운명적 만남', reason: 'over-mystifies tarot relationship signals' },
  { phrase: '솔메이트 에너지', reason: 'overstates tarot relationship signals' },
  { phrase: '카르마, 비밀, 영성', reason: 'keeps astrology rules in mystical positioning' },
  { phrase: 'Facts of Destiny', reason: 'uses absolute destiny positioning instead of source evidence framing' },
  { phrase: 'Destiny Moment', reason: 'uses destiny framing in the verdict hero' },
  { phrase: 'Trinity Cross-verified', reason: 'overstates interpretive agreement as verification' },
  { phrase: 'same verdict', reason: 'overstates interpretive convergence as one fixed verdict' },
  { phrase: 'same verdict?', reason: 'overstates interpretive convergence as one fixed verdict' },
  { phrase: 'revealed.', reason: 'uses revelation-style certainty in report copy' },
] as const satisfies readonly PhraseRule[];

const REQUIRED_MARKERS = [
  { phrase: 'Decision Note Relationship Analyst', reason: 'match prompt uses the decision-note role' },
  { phrase: '관계 신호 요약', reason: 'match prompt replaces mystical signature branding' },
  { phrase: 'Your birthdate can reveal a pattern', reason: 'Saju hero avoids deterministic verdict copy' },
  { phrase: 'Saju maps structure', reason: 'Saju page keeps the structure-first frame' },
  { phrase: 'Magnetic Appeal', reason: 'shin-sal copy avoids fatal-attraction language' },
  { phrase: 'Symbolic Pattern & Cycle', reason: 'report heading avoids literal past-life framing' },
  { phrase: 'Source Evidence', reason: 'main prompt builder avoids destiny-data naming' },
  { phrase: 'Decision Moment', reason: 'report hero avoids destiny-moment framing' },
  { phrase: '3-Layer Evidence Alignment', reason: 'report hero names evidence alignment without overclaiming verification' },
  { phrase: 'Why this decision note?', reason: 'evidence tabs avoid same-verdict framing' },
] as const satisfies readonly PhraseRule[];

function readSurface(surface: Surface): string {
  assert.ok(existsSync(surface.filePath), `Missing commercial-tone surface: ${surface.filePath}`);
  return readFileSync(surface.filePath, 'utf8');
}

const surfaceTexts = SURFACES.map((surface) => ({
  ...surface,
  text: readSurface(surface),
}));

const violations = surfaceTexts.flatMap((surface) =>
  BANNED_PHRASES.filter((rule) => surface.text.includes(rule.phrase)).map((rule) =>
    `${surface.filePath}: banned phrase "${rule.phrase}" (${rule.reason})`,
  ),
);

const combinedText = surfaceTexts.map((surface) => surface.text).join('\n');
const missingMarkers = REQUIRED_MARKERS
  .filter((rule) => !combinedText.includes(rule.phrase))
  .map((rule) => `missing required marker "${rule.phrase}" (${rule.reason})`);

assert.deepEqual([...violations, ...missingMarkers], []);

console.log('commercial_tone_sweep_verification passed');
