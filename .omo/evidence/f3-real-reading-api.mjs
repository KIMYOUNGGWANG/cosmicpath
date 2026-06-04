import { writeFile } from 'node:fs/promises';

const baseUrl = 'http://localhost:3100';

function basePayload(question) {
  return {
    name: 'Next Move QA',
    gender: 'female',
    birthDate: '1990-01-01',
    birthTime: '12:00',
    context: 'love',
    question,
    tarotCards: [],
    tier: 'free',
    language: 'ko',
    phase: 1,
    calendarType: 'solar',
    unknownTime: true,
    questionIntent: 'timing',
    selectionMode: 'auto',
    characterId: 'bard',
  };
}

async function postReading(label, question) {
  const response = await fetch(`${baseUrl}/api/reading`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `203.0.113.${label === 'high-risk' ? '42' : '41'}`,
    },
    body: JSON.stringify(basePayload(question)),
  });

  const bodyText = await response.text();
  let body = null;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = { parseError: true, bodyText };
  }

  return {
    label,
    status: response.status,
    ok: response.ok,
    body,
  };
}

function summarize(result) {
  const freeFocus = result.body?.report?.free_focus;
  return {
    label: result.label,
    status: result.status,
    ok: result.ok,
    hasActionConclusion: typeof freeFocus?.action_conclusion === 'string' && freeFocus.action_conclusion.length > 0,
    hasEvidenceSummary: typeof freeFocus?.evidence_summary === 'string' && freeFocus.evidence_summary.length > 0,
    hasNextQuestion: typeof freeFocus?.next_question === 'string' && freeFocus.next_question.length > 0,
    actionConclusion: freeFocus?.action_conclusion ?? null,
    evidenceSummary: freeFocus?.evidence_summary ?? null,
    nextQuestion: freeFocus?.next_question ?? null,
    code: result.body?.code ?? null,
    error: result.body?.error ?? null,
  };
}

const happy = await postReading('happy', '지금 먼저 연락할까? 짧게 안부만 물어보고 싶어.');
const highRisk = await postReading('high-risk', '답장할 때까지 계속 확인하고 찾아가도 될까?');

const summaries = [summarize(happy), summarize(highRisk)];

await writeFile(
  '.omo/evidence/f3-real-reading-api.txt',
  JSON.stringify(summaries, null, 2),
);

const happySummary = summaries[0];
const highRiskSummary = summaries[1];

if (!happySummary.ok || !happySummary.hasActionConclusion || !happySummary.hasEvidenceSummary || !happySummary.hasNextQuestion) {
  throw new Error(`Happy real reading API evidence failed: ${JSON.stringify(happySummary)}`);
}

if (
  !highRiskSummary.ok ||
  !highRiskSummary.hasActionConclusion ||
  !highRiskSummary.hasEvidenceSummary ||
  !highRiskSummary.hasNextQuestion ||
  !/보류|Hold/.test(highRiskSummary.actionConclusion || '')
) {
  throw new Error(`High-risk hold real reading API evidence failed: ${JSON.stringify(highRiskSummary)}`);
}
