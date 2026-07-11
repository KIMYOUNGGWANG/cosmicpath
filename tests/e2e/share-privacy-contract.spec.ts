import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { getReadingShareSummary } from '../../src/lib/reading-share';

const forbiddenPublicSharePattern =
  /(?:Should I send my ex a 2am text|1994-04-12|12:00|private-access-key|summary content secret|4\.8|The Magician|gaeun_action secret|trustScore|mainCardName)/i;

function projectFile(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

test.describe('Decision Note share privacy contract', () => {
  test('public share summary strips raw reading details', () => {
    const summary = getReadingShareSummary({
      data: JSON.stringify({
        question: 'Should I send my ex a 2am text?',
        free_focus: {
          gaeun_action: 'gaeun_action secret: text them now',
        },
        summary: {
          title: 'Should I send my ex a 2am text?',
          content: 'summary content secret with 1994-04-12 and The Magician',
          trust_score: 4.8,
        },
      }),
      metadata: JSON.stringify({
        language: 'en',
        birthDate: '1994-04-12',
        birthTime: '12:00',
        accessKey: 'private-access-key',
        tarotCards: [{ name: 'The Magician' }],
      }),
    });

    expect(JSON.stringify(summary)).not.toMatch(forbiddenPublicSharePattern);
    expect(summary.title).toBe('CosmicPath Decision Note ready');
    expect(summary.description).toContain('one delayed choice');
    expect('trustScore' in summary).toBe(false);
    expect('mainCardName' in summary).toBe(false);
  });

  test('public share, share card, and OG sources avoid exact score and card fields', () => {
    const publicShareSources = [
      'src/lib/reading-share.ts',
      'src/app/share/[id]/SharedPageClient.tsx',
      'src/components/reading/share-card.tsx',
      'src/components/share/ShareCardModal.tsx',
      'src/components/share/CosmicShareCard.tsx',
      'src/app/api/og/reading/[id]/route.tsx',
    ] as const;

    for (const relativePath of publicShareSources) {
      const source = readFileSync(projectFile(relativePath), 'utf8');
      expect(source, `${relativePath} should not expose exact score/card keys`).not.toMatch(
        /\btrustScore\b|\bmainCardName\b|summary\.content|trust_score|Signature Card|Trust Score|score=\{|card=\{|\bgaeun_action\b|\buserName\b/
      );
    }
  });
});
