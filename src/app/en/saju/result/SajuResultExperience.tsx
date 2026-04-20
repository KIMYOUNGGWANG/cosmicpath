'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { SajuResultLoading } from './SajuResultLoading';
import { SajuResultDisplay } from './SajuResultDisplay';
import { SajuResultError } from './SajuResultError';

type ReadingState =
    | { status: 'loading' }
    | { status: 'generating'; phase: number; label: string }
    | { status: 'success'; readingId: string; reportData: Record<string, unknown> }
    | { status: 'error'; message: string };

const EN_LOADING_PHASES: Record<number, string> = {
    0: 'Aligning your birth coordinates...',
    1: 'Decoding the Four Pillars of Destiny...',
    2: 'Reading your 10-year Fortune Cycle...',
    3: 'Cross-referencing with Western Astrology...',
    4: 'Drawing your Tarot confirmation...',
    5: 'Calculating life area timings...',
    6: 'Composing your decisive verdict...',
    7: 'Finalizing your reading...',
    8: 'Almost ready...',
};

function SajuResultExperienceInner() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const readingId = searchParams.get('reading_id');

    const [state, setState] = useState<ReadingState>({ status: 'loading' });
    const hasStarted = useRef(false);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        void startReadingFlow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startReadingFlow = async () => {
        // Step 1: Verify payment if session_id present
        if (sessionId) {
            try {
                const verifyResponse = await fetch(`/api/payment?session_id=${sessionId}`);
                if (!verifyResponse.ok) {
                    setState({ status: 'error', message: 'Payment verification failed. Please contact support.' });
                    return;
                }
                const verifyData = await verifyResponse.json() as {
                    status: string;
                    reading_id?: string | null;
                };
                if (verifyData.status !== 'paid') {
                    setState({ status: 'error', message: 'Payment not confirmed. Please try again.' });
                    return;
                }
            } catch {
                setState({ status: 'error', message: 'Could not verify your payment. Please contact support.' });
                return;
            }
        }

        // Step 2: If we have a reading_id, just fetch it
        const targetReadingId = readingId ?? sessionStorage.getItem('saju_en_reading_id');
        if (targetReadingId) {
            await generateReading(targetReadingId);
            return;
        }

        // Step 3: Retrieve birth details from session (stored by landing page checkout)
        const birthDate = sessionStorage.getItem('saju_en_birth_date');
        if (!birthDate) {
            setState({
                status: 'error',
                message: 'Birth date not found. Please return to the reading page and try again.',
            });
            return;
        }

        await generateReading(null, birthDate);
    };

    const generateReading = async (existingReadingId: string | null, birthDate?: string) => {
        const TOTAL_PHASES = 8;
        let accumulatedReport: Record<string, unknown> = {};
        let currentReadingId = existingReadingId;

        for (let phase = 1; phase <= TOTAL_PHASES; phase++) {
            setState({
                status: 'generating',
                phase,
                label: EN_LOADING_PHASES[phase] ?? 'Processing...',
            });

            try {
                const response = await fetch('/api/reading', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        birthDate: birthDate ?? sessionStorage.getItem('saju_en_birth_date'),
                        birthTime: sessionStorage.getItem('saju_en_birth_time') ?? undefined,
                        language: 'en',
                        tier: 'premium',
                        phase,
                        previousReport: accumulatedReport,
                        readingId: currentReadingId ?? undefined,
                        source: 'us_obt',
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
                    setState({
                        status: 'error',
                        message: errorData.error ?? `Phase ${phase} failed. Please try again.`,
                    });
                    return;
                }

                const result = await response.json() as {
                    success: boolean;
                    report?: Record<string, unknown>;
                    metadata?: { readingId?: string };
                };

                if (!result.success || !result.report) {
                    setState({ status: 'error', message: `Reading phase ${phase} failed. Please try again.` });
                    return;
                }

                accumulatedReport = { ...accumulatedReport, ...result.report };

                if (result.metadata?.readingId && !currentReadingId) {
                    currentReadingId = result.metadata.readingId;
                    sessionStorage.setItem('saju_en_reading_id', currentReadingId);
                }
            } catch {
                setState({ status: 'error', message: 'The oracle encountered an error. Please try again.' });
                return;
            }
        }

        void trackClientGrowthEvent({
            event: 'report_complete',
            source: 'us_obt',
            language: 'en',
            readingId: currentReadingId ?? undefined,
            plan: 'premium_reading',
        });

        setState({
            status: 'success',
            readingId: currentReadingId ?? 'unknown',
            reportData: accumulatedReport,
        });
    };

    if (state.status === 'loading' || state.status === 'generating') {
        return (
            <SajuResultLoading
                phase={state.status === 'generating' ? state.phase : 0}
                label={state.status === 'generating' ? state.label : EN_LOADING_PHASES[0] ?? ''}
            />
        );
    }

    if (state.status === 'error') {
        return <SajuResultError message={state.message} />;
    }

    return (
        <SajuResultDisplay
            readingId={state.readingId}
            reportData={state.reportData}
        />
    );
}

export function SajuResultExperience() {
    return (
        <Suspense fallback={<SajuResultLoading phase={0} label="Opening your reading..." />}>
            <SajuResultExperienceInner />
        </Suspense>
    );
}
