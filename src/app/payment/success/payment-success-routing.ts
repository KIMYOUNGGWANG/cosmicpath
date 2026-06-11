import type { SupportedLanguage } from '@/lib/language-preference';

type StartReturnSource = 'next_move_report_mvp_v1' | 'decision_timing_rebuild_v1';

interface BuildPaidReturnPathInput {
    readonly readingId?: string | null;
    readonly source?: string;
    readonly language: SupportedLanguage;
}

export function isStartReturnSource(source: string | undefined): source is StartReturnSource {
    return source === 'next_move_report_mvp_v1' || source === 'decision_timing_rebuild_v1';
}

export function buildPaidReturnPath({
    readingId,
    source,
    language,
}: BuildPaidReturnPathInput): string {
    const params = new URLSearchParams({ paid: 'true' });

    if (readingId) params.set('reading_id', readingId);
    if (isStartReturnSource(source)) params.set('entry', source);
    params.set('lang', language);

    return `/start?${params.toString()}`;
}
