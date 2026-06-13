import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const SUPPORTED_SCENARIOS = ['schedule', 'api', 'browser', 'all'] as const;
type Scenario = (typeof SUPPORTED_SCENARIOS)[number];

interface DefaultFollowUpJobForVerification {
  stage: string;
  scheduledFor: Date;
  metadata: {
    delayDays: number;
    feedbackEvent?: string;
    feedbackPrompt?: string;
    source: string;
    contactChannel: string;
    idempotencyKey: string;
    emailHash: string;
  };
}

interface FollowUpScheduleModule {
  DEFAULT_FOLLOW_UP_STAGES: string[];
  buildDefaultFollowUpJobs: (input: {
    readingId: string;
    email: string;
    fromDate: Date;
    source: string;
  }) => DefaultFollowUpJobForVerification[];
  buildFollowUpIdempotencyKey: (readingId: string, stage: string) => string;
  hashFollowUpEmail: (email: string) => string;
}

const followUpSchedulePath = '../src/lib/followup-schedule.ts';
const {
  DEFAULT_FOLLOW_UP_STAGES,
  buildDefaultFollowUpJobs,
  buildFollowUpIdempotencyKey,
  hashFollowUpEmail,
} = await import(followUpSchedulePath) as FollowUpScheduleModule;

class UnsupportedScenarioError extends Error {
  constructor(scenario: string) {
    super(`Unsupported follow-up loop scenario: ${scenario}`);
    this.name = 'UnsupportedScenarioError';
  }
}

function readProjectFile(path: string): string {
  return readFileSync(path, 'utf8');
}

function parseScenario(argv: readonly string[]): Scenario {
  const scenarioFlagIndex = argv.findIndex((value) => value === '--scenario');
  const scenario = scenarioFlagIndex === -1 ? 'all' : argv[scenarioFlagIndex + 1];
  if (!scenario || !isScenario(scenario)) throw new UnsupportedScenarioError(scenario ?? '<missing>');
  return scenario;
}

function isScenario(value: string): value is Scenario {
  return SUPPORTED_SCENARIOS.some((scenario) => scenario === value);
}

function assertScheduleContract(): void {
  const fromDate = new Date('2026-06-10T00:00:00.000Z');
  const jobs = buildDefaultFollowUpJobs({
    readingId: 'qa-next-move-reading',
    email: 'QA+FollowUp@Example.com',
    fromDate,
    source: 'payment_sync',
  });
  const d7Job = jobs.find((job) => job.stage === 'D7');
  assert.deepEqual(DEFAULT_FOLLOW_UP_STAGES, ['D2_DISCOUNT', 'D5_COSMIC_WINDOW', 'D7']);
  assert.equal(jobs.length, 3);
  assert.ok(d7Job, 'D7 follow-up should be scheduled');
  assert.equal(d7Job?.scheduledFor.toISOString(), '2026-06-17T00:00:00.000Z');
  assert.equal(d7Job?.metadata.delayDays, 7);
  assert.equal(d7Job?.metadata.feedbackEvent, 'followup_start');
  assert.equal(d7Job?.metadata.feedbackPrompt, 'seven_day_decision_checkin');
  assert.equal(d7Job?.metadata.source, 'payment_sync');
  assert.equal(d7Job?.metadata.contactChannel, 'email');
  assert.equal(
    d7Job?.metadata.idempotencyKey,
    buildFollowUpIdempotencyKey('qa-next-move-reading', 'D7')
  );
  assert.equal(d7Job?.metadata.emailHash, hashFollowUpEmail('qa+followup@example.com'));
  assert.equal(JSON.stringify(d7Job?.metadata).includes('@'), false);
  console.log('scenario=schedule');
  console.log(
    `seven_day_followup_schedule_contract D7 delayDays=7 idempotencyKey=${d7Job?.metadata.idempotencyKey} emailHash=${d7Job?.metadata.emailHash} feedbackEvent=followup_start source=payment_sync`
  );
}

function assertApiContract(): void {
  const followupRoute = readProjectFile('src/app/api/reading/followup/route.ts');
  const paymentRoute = readProjectFile('src/app/api/payment/route.ts');
  const scheduleRoute = readProjectFile('src/app/api/email/drip/schedule/route.ts');
  const followupJobs = readProjectFile('src/lib/followup-jobs.ts');
  const followupScheduling = readProjectFile('src/lib/followup-scheduling.ts');
  const followupSchedule = readProjectFile('src/lib/followup-schedule.ts');

  const authorizeIndex = followupRoute.indexOf('const { reading, isUnlimited } = await authorizeOracleAccess');
  const trackIndex = followupRoute.indexOf('await trackGrowthEvent({');
  assert.notEqual(authorizeIndex, -1, 'follow-up route should authorize access');
  assert.notEqual(trackIndex, -1, 'follow-up route should track first follow-up');
  assert.ok(authorizeIndex < trackIndex, 'authorization should happen before followup_start tracking');
  assert.ok(followupRoute.includes('isFirstFollowUp'));
  assert.ok(followupRoute.includes("event: 'followup_start'"));
  assert.ok(followupRoute.includes("channel: 'oracle_followup'"));

  assert.ok(scheduleRoute.includes('parseBearerToken'));
  assert.ok(scheduleRoute.includes('source: z.string().trim().min(1).max(64).optional()'));
  assert.ok(scheduleRoute.includes("source: parsed.source || 'manual_drip'"));

  assert.ok(paymentRoute.includes("source: checkoutSource || 'payment_sync'"));
  assert.match(paymentRoute, /scheduleDefaultFollowUps\(\{[\s\S]*readingId: result\.readingId[\s\S]*email: customerEmailForFollowUps[\s\S]*source: checkoutSource \|\| 'payment_sync'/);
  assert.ok(followupJobs.includes('@/lib/followup-scheduling'));
  assert.ok(followupScheduling.includes('buildDefaultFollowUpJobs'));
  assert.ok(followupSchedule.includes('idempotencyKey'));
  console.log('scenario=api');
  console.log('followup_api_access_and_metric_contract');
}

function assertBrowserContract(): void {
  const panel = readProjectFile('src/app/start/start-result-followup-panel.tsx');
  const relationship = readProjectFile('src/app/start/start-result-relationship.ts');
  const opsRunner = readProjectFile('src/app/api/ops/followups/run/route.ts');

  assert.ok(panel.includes('Detailed 3-Layer Decision Report'));
  assert.ok(panel.includes('상세 3단 판정 리포트'));
  assert.ok(panel.includes('7-day check-in'));
  assert.ok(panel.includes('7일 뒤 체크인 메일'));
  assert.ok(panel.includes("followUpDelayDays: 7"));
  assert.ok(panel.includes("followUpChannel: 'email_and_local_seed'"));
  assert.ok(panel.includes('next_move_report_decision_seed'));
  assert.equal(panel.includes('No SMS or email automation is enabled'), false);
  assert.equal(panel.includes('문자나 이메일 자동 발송은 아직 켜지지 않습니다'), false);
  assert.ok(relationship.includes('next_move_report_followup_seeded'));

  assert.ok(opsRunner.includes('parseBearerToken'));
  assert.ok(opsRunner.includes('dryRun'));
  assert.ok(opsRunner.includes('limit = Math.max(1, Math.min(1000'));
  console.log('scenario=browser');
  console.log('followup_panel_and_sync_contract');
}

function runScenario(scenario: Scenario): void {
  if (scenario === 'schedule' || scenario === 'all') assertScheduleContract();
  if (scenario === 'api' || scenario === 'all') assertApiContract();
  if (scenario === 'browser' || scenario === 'all') assertBrowserContract();
}

try {
  runScenario(parseScenario(process.argv.slice(2)));
  console.log('Follow-up loop verification passed');
} catch (error) {
  if (error instanceof UnsupportedScenarioError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
