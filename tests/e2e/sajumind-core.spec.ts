import { test, expect } from '@playwright/test';

test.describe('SajuMind Core API and Flow Contracts', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });
  test('POST /api/sajumind/chart returns Day Master and Five Elements', async ({ request }) => {
    const res = await request.post('/api/sajumind/chart', {
      data: {
        name: 'Alex',
        birthDate: '1992-08-24',
        birthTime: '08:30',
        birthCity: 'New York',
        timezone: 'America/New_York',
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.profile).toBeDefined();
    expect(data.profile.dayMaster).toBeDefined();
    expect(data.profile.dayMaster.englishName.length).toBeGreaterThan(3);
    expect(data.profile.dayMaster.element).toBeDefined();
    expect(data.profile.elementPercentages).toBeDefined();
    expect(data.profile.fourPillars.year).toBeDefined();
    expect(data.profile.fourPillars.day).toBeDefined();
  });

  test('POST /api/sajumind/checkin generates instant AI insight under 80 words', async ({ request }) => {
    const res = await request.post('/api/sajumind/checkin', {
      data: {
        emotion: 'Overthinking',
        tags: ['work', 'decision'],
        note: 'Feeling stuck on whether to accept new contract.',
        userProfile: {
          name: 'Alex',
          birthDate: '1992-08-24',
          birthTime: '08:30',
          birthCity: 'New York',
          timezone: 'America/New_York',
        },
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.checkIn).toBeDefined();
    expect(data.checkIn.dailyTransit).toBeDefined();
    expect(data.checkIn.aiFeedback).toBeDefined();
    expect(data.checkIn.aiFeedback.observation.length).toBeGreaterThan(5);
    expect(data.checkIn.aiFeedback.patternConnection.length).toBeGreaterThan(5);
    expect(data.checkIn.aiFeedback.smallAction.length).toBeGreaterThan(5);
  });

  test('GET /api/sajumind/report/weekly generates weekly synthesis', async ({ request }) => {
    const res = await request.get(
      '/api/sajumind/report/weekly?birthDate=1992-08-24&birthTime=08:30&name=Alex'
    );

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.report).toBeDefined();
    expect(data.report.dominantEmotion).toBeDefined();
    expect(data.report.aiWeeklyInsight.fullReport.length).toBeGreaterThan(20);
  });

  test('POST & GET /api/sajumind/decisions tracks decision timing', async ({ request }) => {
    const createRes = await request.post('/api/sajumind/decisions', {
      data: {
        title: 'Decided to decline remote offer',
        description: 'Need more time to focus on local growth.',
        dayMasterHangul: '갑',
      },
    });

    expect(createRes.ok()).toBeTruthy();
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.decision.sajuTimingSnapshot.timingScore).toBeGreaterThan(0);

    const listRes = await request.get('/api/sajumind/decisions');
    expect(listRes.ok()).toBeTruthy();
    const listData = await listRes.json();
    expect(listData.success).toBe(true);
    expect(Array.isArray(listData.decisions)).toBe(true);
  });
});
