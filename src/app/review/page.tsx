import type { Metadata } from 'next';

import { DecisionReviewExperience } from './DecisionReviewExperience';

export const metadata: Metadata = {
    title: 'Decision Review | CosmicPath',
    description: 'Compare a saved decision with what actually happened after seven days.',
    robots: { index: false, follow: false },
};

export default function DecisionReviewPage() {
    return <DecisionReviewExperience />;
}
