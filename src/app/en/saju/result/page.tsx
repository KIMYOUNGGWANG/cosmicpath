import type { Metadata } from 'next';
import { SajuResultExperience } from './SajuResultExperience';

export const metadata: Metadata = {
    title: 'Your Saju Destiny Reading | CosmicPath',
    description: 'Your Korean Saju destiny reading is ready. Discover your decisive verdict, timing insights, and personalized life guidance.',
    robots: { index: false, follow: false }, // Private reading page
};

export default function EnSajuResultPage() {
    return <SajuResultExperience />;
}
