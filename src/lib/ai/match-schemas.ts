
import { z } from 'zod';

// ========== Phase 1: Core Compatibility Snapshot ==========
export const MatchPhase1Schema = z.object({
    cosmicSignature: z.object({
        title: z.string().describe("Poetic title for the pair (e.g., 'Dance of Fire and Wind')"),
        archetype: z.string().describe("English archetype name (e.g., 'The Adventurers')"),
        emoji: z.string().describe("Two representative emojis"),
        oneLiner: z.string().describe("Powerful catchphrase (max 60 chars)")
    }),
    overallScore: z.object({
        total: z.number().min(0).max(100),
        chemistry: z.number().min(0).max(100),
        stability: z.number().min(0).max(100),
        growth: z.number().min(0).max(100),
        passion: z.number().min(0).max(100)
    }),
    quickInsights: z.array(z.object({
        icon: z.string(),
        label: z.string(),
        value: z.string(),
        sentiment: z.enum(['positive', 'neutral', 'caution'])
    })).describe("6-8 key insights"),
    energyMatch: z.object({
        hostElement: z.string(),
        guestElement: z.string(),
        interaction: z.string(),
        description: z.string().describe("150 chars description of elemental interaction")
    }),
    firstImpression: z.string().describe("Vivid and poetic prediction of first meeting/impression (min 200 chars)")
});

// ========== Phase 2: Relationship Dynamics ==========
export const MatchPhase2Schema = z.object({
    emotionalRadar: z.object({
        communication: z.number().min(0).max(100),
        trust: z.number().min(0).max(100),
        intimacy: z.number().min(0).max(100),
        support: z.number().min(0).max(100),
        fun: z.number().min(0).max(100),
        conflict: z.number().min(0).max(100)
    }),
    communicationStyle: z.object({
        hostStyle: z.string().describe("Host's communication style (50 chars)"),
        guestStyle: z.string().describe("Guest's communication style (50 chars)"),
        compatibility: z.string().describe("How they interact (100 chars)"),
        tip: z.string().describe("Practical and insightful tip (max 80 chars)")
    }),
    conflictPattern: z.object({
        triggerTopics: z.array(z.string()).describe("3 topics that trigger conflict"),
        hostReaction: z.string().describe("Host's reaction (50 chars)"),
        guestReaction: z.string().describe("Guest's reaction (50 chars)"),
        resolution: z.string().describe("Deeply insightful and practical resolution method (min 150 chars)")
    }),
    dailyLifeCards: z.array(z.object({
        area: z.string(),
        score: z.number(),
        insight: z.string().describe("80 chars insight")
    })).describe("5 daily life areas"),
    intimacyProfile: z.object({
        physicalScore: z.number(),
        emotionalScore: z.number(),
        intellectualScore: z.number(),
        summary: z.string().describe("Crucial summary of their intimacy and energetic bond (min 200 chars)")
    })
});

// ========== Phase 3: Cosmic Synchronization (Wealth & Success) ==========
export const MatchPhase3Schema = z.object({
    prosperitySync: z.object({
        score: z.number().min(0).max(100),
        wealthStyle: z.string().describe("How they handle money together (80 chars)"),
        prosperityTip: z.string().describe("Practical wealth-building advice (80 chars)")
    }),
    careerSynergy: z.object({
        compatibility: z.number().min(0).max(100),
        businessPotential: z.string().describe("Potential as business partners (80 chars)"),
        synergyBasis: z.string().describe("Saju/Astro basis for career synergy (50 chars)")
    }),
    socialMirror: z.object({
        publicImage: z.string().describe("How the world sees them as a couple (80 chars)"),
        socialStrengths: z.array(z.string()).describe("3 social strengths"),
        socialAura: z.string().describe("Their combined energetic presence (50 chars)")
    }),
    householdHarmony: z.object({
        managementStyle: z.string().describe("Domestic roles and management (80 chars)"),
        potentialConflict: z.string().describe("Financial/Home conflict area (50 chars)"),
        harmonyKey: z.string().describe("Key to a peaceful household (50 chars)")
    })
});

// ========== Phase 4: Destiny Timeline ==========
export const MatchPhase4Schema = z.object({
    destinyNarrative: z.object({
        pastLifeHint: z.string().describe("Soul-deep past life connection (100 chars)"),
        presentMission: z.string().describe("Shared mission in this lifetime (100 chars)"),
        futurePotential: z.string().describe("Highest manifestation of the union (100 chars)")
    }),
    timelineForecasts: z.array(z.object({
        period: z.string().describe("e.g., 'Coming Spring', 'Final Quarter'"),
        title: z.string(),
        prediction: z.string().describe("Deep predictive insight (150 chars)"),
        keyEvent: z.string().describe("Specific milestone event (50 chars)"),
        advice: z.string().describe("Strategic advice (50 chars)"),
        riskLevel: z.enum(['low', 'medium', 'high'])
    })).describe("6 detailed cosmic forecasts"),
    majorTurningPoints: z.array(z.object({
        year: z.string(),
        event: z.string().describe("Defining life event"),
        importance: z.enum(['milestone', 'challenge', 'opportunity'])
    })).describe("3 pivotal turning points"),
    longevityScore: z.object({
        score: z.number(),
        factors: z.array(z.string()).describe("3 eternal binding factors"),
        risks: z.array(z.string()).describe("2 significant risks to permanence")
    })
});

// ========== Phase 5: Action Blueprint ==========
export const MatchPhase5Schema = z.object({
    strengths: z.array(z.object({
        title: z.string(),
        icon: z.string(),
        shortDesc: z.string().describe("Poetic description of strength (80 chars). Use single quotes only, no inner double quotes."),
        basis: z.string().describe("Source of power (50 chars)")
    })).describe("Exactly 5 core strengths"),
    challenges: z.array(z.object({
        title: z.string(),
        icon: z.string(),
        shortDesc: z.string().describe("Necessary trials to overcome (80 chars). Use single quotes only."),
        solution: z.string().describe("Alchemical solution (80 chars). Use single quotes only.")
    })).describe("Exactly 5 core challenges"),
    weeklyRituals: z.array(z.object({
        day: z.string(),
        activity: z.string().describe("Mystical bonding activity (50 chars)"),
        benefit: z.string().describe("Positive energetic shift (30 chars)")
    })).describe("3 sacred weekly rituals"),
    doAndDont: z.object({
        do: z.array(z.string()).describe("5 actions that empower the bond (30 chars each)"),
        dont: z.array(z.string()).describe("5 actions that weaken the bond (30 chars each)")
    }),
    luckyElements: z.object({
        colors: z.array(z.string()).describe("2 harmonizing colors"),
        numbers: z.array(z.number()).describe("3 auspicious numbers"),
        direction: z.string().describe("Favorable cardinal direction"),
        season: z.string().describe("Peak season of power")
    }),
    finalBlessing: z.string().describe("Ultimate blessing from the Oracle (250-400 chars). STRICT: Use single quotes (') only. No inner double quotes. No raw newlines.")
});
