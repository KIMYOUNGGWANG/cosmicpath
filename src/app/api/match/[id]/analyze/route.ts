/**
 * Match AI Analysis API (v2.0 - Phase-based)
 * POST /api/match/[id]/analyze
 * Generates AI-powered compatibility analysis in 4 phases for unlocked sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSaju } from '@/lib/engines/saju';
import { calculateAstrology } from '@/lib/engines/astrology';
import { generateStructuredReport } from '@/lib/ai/llm-client';
import {
    getMatchPhaseSystemPrompt,
    getMatchPhaseUserPrompt,
    MatchPhase1Result,
    MatchPhase2Result,
    MatchPhase3Result,
    MatchPhase4Result,
    MatchPhase5Result,
    MatchFullAnalysis,
} from '@/lib/ai/match-phase-prompts';
import {
    MatchPhase1Schema,
    MatchPhase2Schema,
    MatchPhase3Schema,
    MatchPhase4Schema,
    MatchPhase5Schema
} from '@/lib/ai/match-schemas';

// Convert new Phase format to legacy AIAnalysis format for backward compatibility
function convertToLegacyFormat(fullAnalysis: Partial<MatchFullAnalysis>) {
    const p1 = fullAnalysis.phase1;
    const p2 = fullAnalysis.phase2;
    const p3 = fullAnalysis.phase3;
    const p4 = fullAnalysis.phase4;
    const p5 = fullAnalysis.phase5;

    return {
        energyAnalysis: {
            title: '⚡ 에너지 역학 분석',
            content: [
                p1?.energyMatch?.description || '',
                p1?.firstImpression || '',
            ].filter(Boolean).join('\n\n'),
            highlights: (p1?.quickInsights || []).map(i => `${i.icon} ${i.label}: ${i.value}`),
        },
        emotionalCompatibility: {
            title: '💗 감정적 호환성',
            content: [
                p2?.communicationStyle?.compatibility || '',
                p2?.conflictPattern?.resolution || '',
                p2?.intimacyProfile?.summary || '',
            ].filter(Boolean).join('\n\n'),
            chemistryLevel: (p1?.overallScore?.chemistry || 50) >= 70 ? 'high'
                : (p1?.overallScore?.chemistry || 50) >= 50 ? 'medium' : 'low',
        },
        longTermOutlook: {
            title: '📈 장기 전망 및 시너지',
            content: [
                p3?.prosperitySync?.wealthStyle ? `💰 재물 합: ${p3.prosperitySync.wealthStyle}` : '',
                p3?.careerSynergy?.businessPotential ? `💼 커리어 시너지: ${p3.careerSynergy.businessPotential}` : '',
                p4?.destinyNarrative?.presentMission || '',
                p4?.destinyNarrative?.futurePotential || '',
            ].filter(Boolean).join('\n\n'),
            timeline: (p4?.timelineForecasts || []).map(t => ({
                period: t.period,
                prediction: t.prediction,
            })),
        },
        strengths: (p5?.strengths || []).map(s => ({
            title: s.title,
            description: `${s.shortDesc} (${s.basis})`,
        })),
        challenges: (p5?.challenges || []).map(c => ({
            title: c.title,
            description: `${c.shortDesc}\n해결책: ${c.solution}`,
        })),
        advice: {
            summary: p5?.finalBlessing || '',
            actionItems: p5?.doAndDont?.do?.slice(0, 5) || [],
        },
        // New rich data for enhanced UI
        _cosmicSignature: p1?.cosmicSignature,
        _overallScore: p1?.overallScore,
        _quickInsights: p1?.quickInsights,
        _emotionalRadar: p2?.emotionalRadar,
        _dailyLifeCards: p2?.dailyLifeCards,
        _prosperitySync: p3?.prosperitySync,
        _careerSynergy: p3?.careerSynergy,
        _socialMirror: p3?.socialMirror,
        _timelineForecasts: p4?.timelineForecasts,
        _turningPoints: p4?.majorTurningPoints,
        _longevityScore: p4?.longevityScore,
        _weeklyRituals: p5?.weeklyRituals,
        _doAndDont: p5?.doAndDont,
        _luckyElements: p5?.luckyElements,
    };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Parse request body for phase parameter
        let requestedPhase: number | undefined;
        try {
            const body = await request.json();
            requestedPhase = body.phase;
        } catch {
            // No body, run all phases
        }

        // 1. Fetch and validate session
        const session = await prisma.matchSession.findUnique({
            where: { id },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Match session not found' },
                { status: 404 }
            );
        }

        if (!session.isUnlocked) {
            return NextResponse.json(
                { error: 'Session not unlocked. Please complete payment first.' },
                { status: 403 }
            );
        }

        if (!session.guestName || !session.guestBirth) {
            return NextResponse.json(
                { error: 'Guest has not joined yet' },
                { status: 400 }
            );
        }

        // 2. Check if AI analysis already exists
        let existingMetadata: any = null;
        try {
            existingMetadata = session.metadata ? JSON.parse(session.metadata) : null;
        } catch {
            existingMetadata = null;
        }

        // If full analysis exists and no specific phase requested, return cached
        // Fix: Only return cached if it's COMPLETE (has phase 5). otherwise continue generation.
        const isComplete = existingMetadata?.fullAnalysis?.phase5;

        if (isComplete && !requestedPhase) {
            return NextResponse.json({
                success: true,
                cached: true,
                analysis: convertToLegacyFormat(existingMetadata.fullAnalysis),
                fullAnalysis: existingMetadata.fullAnalysis,
                phase: 5,
                totalPhases: 5,
            });
        }

        // 3. Calculate Saju and Astrology for both people
        const hostBirth = new Date(session.hostBirth);
        const guestBirth = new Date(session.guestBirth);
        const hostTime = '12:00';
        const guestTime = '12:00';

        const [hostHours, hostMinutes] = hostTime.split(':').map(Number);
        const [guestHours, guestMinutes] = guestTime.split(':').map(Number);

        // Fix: DB stores birth date as UTC midnight (e.g., 1998-05-18T00:00:00Z).
        // converting to new Date() in local timezone (e.g., -07:00) shifts it to previous day (17th).
        // We must construct the date using UTC components to ensure it remains the correct calendar date in local time context.
        const hostBirthDate = new Date(session.hostBirth);
        const guestBirthDate = new Date(session.guestBirth);

        const hostSajuDate = new Date(
            hostBirthDate.getUTCFullYear(),
            hostBirthDate.getUTCMonth(),
            hostBirthDate.getUTCDate(),
            hostHours,
            hostMinutes
        );

        const guestSajuDate = new Date(
            guestBirthDate.getUTCFullYear(),
            guestBirthDate.getUTCMonth(),
            guestBirthDate.getUTCDate(),
            guestHours,
            guestMinutes
        );

        // Run Saju and Astrology calculations in parallel
        const [hostSaju, guestSaju, hostAstrology, guestAstrology] = await Promise.all([
            Promise.resolve(calculateSaju(hostSajuDate, hostHours, hostMinutes, false, 'male')),
            Promise.resolve(calculateSaju(guestSajuDate, guestHours, guestMinutes, false, 'female')),
            Promise.resolve(calculateAstrology(hostBirth, hostTime)),
            Promise.resolve(calculateAstrology(guestBirth, guestTime))
        ]);




        // 4. Get basic scores from existing metadata
        const basicScores = {
            overall: session.score || 50,
            saju: existingMetadata?.sajuScore || 50,
            astro: existingMetadata?.astroScore || 50,
            numerology: existingMetadata?.numScore || 50,
        };

        // 5. Determine which phases to run
        const previousPhases: Partial<MatchFullAnalysis> = existingMetadata?.fullAnalysis || {};
        const startPhase = requestedPhase || 1;
        const endPhase = requestedPhase || 5;

        let fullAnalysis: Partial<MatchFullAnalysis> = { ...previousPhases };

        // 6. Run phases
        for (let phase = startPhase; phase <= endPhase; phase++) {
            // Skip if already exists
            const phaseKey = `phase${phase}` as keyof MatchFullAnalysis;
            if (fullAnalysis[phaseKey] && !requestedPhase) {
                console.log(`[Match Analyze] Phase ${phase} already exists, skipping`);
                continue;
            }

            console.log(`[Match Analyze] Running Phase ${phase}...`);

            const systemPrompt = getMatchPhaseSystemPrompt(phase, 'ko');
            const userPrompt = getMatchPhaseUserPrompt(
                phase,
                session.hostName,
                session.guestName,
                hostSaju,
                guestSaju,
                hostAstrology,
                guestAstrology,
                basicScores,
                fullAnalysis,
                'ko'
            );

            try {
                let phaseResult;

                switch (phase) {
                    case 1:
                        phaseResult = await generateStructuredReport<MatchPhase1Result>(
                            systemPrompt,
                            userPrompt,
                            'basic',
                            MatchPhase1Schema
                        );
                        fullAnalysis.phase1 = phaseResult;
                        break;
                    case 2:
                        phaseResult = await generateStructuredReport<MatchPhase2Result>(
                            systemPrompt,
                            userPrompt,
                            'basic',
                            MatchPhase2Schema
                        );
                        fullAnalysis.phase2 = phaseResult;
                        break;
                    case 3:
                        phaseResult = await generateStructuredReport<MatchPhase3Result>(
                            systemPrompt,
                            userPrompt,
                            'basic',
                            MatchPhase3Schema
                        );
                        fullAnalysis.phase3 = phaseResult;
                        break;
                    case 4:
                        phaseResult = await generateStructuredReport<MatchPhase4Result>(
                            systemPrompt,
                            userPrompt,
                            'basic',
                            MatchPhase4Schema
                        );
                        fullAnalysis.phase4 = phaseResult;
                        break;
                    case 5:
                        phaseResult = await generateStructuredReport<MatchPhase5Result>(
                            systemPrompt,
                            userPrompt,
                            'basic',
                            MatchPhase5Schema
                        );
                        fullAnalysis.phase5 = phaseResult;
                        break;
                }

                console.log(`[Match Analyze] Phase ${phase} complete`);

                // Save progress after each phase
                const updatedMetadata = {
                    ...existingMetadata,
                    fullAnalysis,
                    lastPhase: phase,
                    aiGeneratedAt: new Date().toISOString(),
                };

                await prisma.matchSession.update({
                    where: { id },
                    data: {
                        metadata: JSON.stringify(updatedMetadata),
                    },
                });

            } catch (phaseError: any) {
                console.error(`[Match Analyze] Phase ${phase} Error:`, phaseError);

                // Fix: Return partial success if we have at least Phase 1
                if (fullAnalysis.phase1) {
                    const legacyAnalysis = convertToLegacyFormat(fullAnalysis);
                    return NextResponse.json({
                        success: true,
                        cached: false,
                        isPartial: true, // Frontend can use this to show "Analyzing..." indicator
                        error: `Phase ${phase} failed: ${phaseError.message}`,
                        analysis: legacyAnalysis,
                        fullAnalysis: fullAnalysis,
                        phase: phase - 1, // Return last successful phase
                        totalPhases: 5,
                    });
                }

                return NextResponse.json({
                    success: false,
                    error: `Phase ${phase} generation failed: ${phaseError.message}`,
                    partialAnalysis: fullAnalysis,
                    failedPhase: phase,
                }, { status: 500 });
            }
        }

        // 7. Convert to legacy format for backward compatibility with existing UI
        const legacyAnalysis = convertToLegacyFormat(fullAnalysis);

        // 8. Return complete analysis
        return NextResponse.json({
            success: true,
            cached: false,
            analysis: legacyAnalysis, // Legacy format for existing UI
            fullAnalysis: fullAnalysis, // New format for future UI
            phase: endPhase,
            totalPhases: 5,
        });

    } catch (error: any) {
        console.error('[Match Analyze] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate analysis: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}

// GET - Check analysis status
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await prisma.matchSession.findUnique({
            where: { id },
            select: { metadata: true, isUnlocked: true },
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        let analysisStatus = {
            isUnlocked: session.isUnlocked,
            hasPhase1: false,
            hasPhase2: false,
            hasPhase3: false,
            hasPhase4: false,
            hasPhase5: false,
            isComplete: false,
            lastPhase: 0,
        };

        if (session.metadata) {
            try {
                const meta = JSON.parse(session.metadata);
                if (meta.fullAnalysis) {
                    analysisStatus.hasPhase1 = !!meta.fullAnalysis.phase1;
                    analysisStatus.hasPhase2 = !!meta.fullAnalysis.phase2;
                    analysisStatus.hasPhase3 = !!meta.fullAnalysis.phase3;
                    analysisStatus.hasPhase4 = !!meta.fullAnalysis.phase4;
                    analysisStatus.hasPhase5 = !!meta.fullAnalysis.phase5;
                    analysisStatus.isComplete = analysisStatus.hasPhase1 && analysisStatus.hasPhase2 &&
                        analysisStatus.hasPhase3 && analysisStatus.hasPhase4 && analysisStatus.hasPhase5;
                    analysisStatus.lastPhase = meta.lastPhase || 0;
                }
            } catch { }
        }

        return NextResponse.json(analysisStatus);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
    }
}
