export type EnglishGuideAccent = 'gold' | 'indigo' | 'rose';

export interface EnglishGuideSection {
    title: string;
    body: string[];
    bullets?: string[];
}

export interface EnglishGuideFaq {
    question: string;
    answer: string;
}

export interface EnglishGuideFact {
    label: string;
    value: string;
}

export interface EnglishGuide {
    slug: string;
    eyebrow: string;
    title: string;
    description: string;
    seoDescription: string;
    readTime: string;
    accent: EnglishGuideAccent;
    heroNote: string;
    keywords: string[];
    quickFacts: EnglishGuideFact[];
    questionExamples: string[];
    sections: EnglishGuideSection[];
    faq: EnglishGuideFaq[];
    ctaTitle: string;
    ctaBody: string;
}

export const ENGLISH_GUIDES: EnglishGuide[] = [
    {
        slug: 'what-is-korean-saju',
        eyebrow: 'Entry Route 01',
        title: 'What Is Korean Saju?',
        description:
            'A fast primer on the Korean Four Pillars lens, what inputs it needs, and why it works better for real decisions than vague fate content.',
        seoDescription:
            'Understand what Korean saju is, what birth details it uses, and how CosmicPath turns it into a decision timing reading.',
        readTime: '4 min read',
        accent: 'gold',
        heroNote: 'Built for first-time readers who want clarity before belief.',
        keywords: ['Korean Saju', 'Four Pillars', 'decision timing', 'birth chart timing'],
        quickFacts: [
            { label: 'Best for', value: 'First-time readers who want one clear entry point' },
            { label: 'Input you need', value: 'Birth date, birth time if known, and one real question' },
            { label: 'What it reads', value: 'Timing, pressure, momentum, and action windows' },
        ],
        questionExamples: [
            'Should I reach out now, or does the timing look better if I wait a little longer?',
            'If I change jobs this quarter, does it look like expansion or unnecessary turbulence?',
            'What part of this money decision is solid, and what part is emotional overreach?',
        ],
        sections: [
            {
                title: 'Start with timing, not fate theater',
                body: [
                    'Korean saju is usually introduced as a birth-based system, but the useful part for modern users is not mystical theater. It is the timing lens.',
                    'Instead of asking for a generic personality reading, the better move is to bring one concrete decision. Saju becomes much sharper when it is used to read pressure, pacing, and the next move around a real choice.',
                ],
                bullets: [
                    'When to reach out in a relationship instead of forcing closure too early',
                    'Whether a career move is expansion, exhaustion, or a temporary escape',
                    'Whether a money decision strengthens flow or creates leakage',
                ],
            },
            {
                title: 'What makes Korean saju distinct',
                body: [
                    'Saju sits inside the broader Four Pillars family, but Korean practice carries its own tone, language, and everyday use cases. In Korea, people often use saju to read relationship rhythm, family dynamics, career pressure, and auspicious timing.',
                    'That means the category is not just abstract metaphysics. It is often treated like a decision support ritual around life transitions.',
                ],
                bullets: [
                    'The structure begins with birth year, month, day, and hour',
                    'Interpretation focuses on flow, imbalance, pressure, and useful timing',
                    'The Korean framing is often practical: when to move, pause, protect, or commit',
                ],
            },
            {
                title: 'How CosmicPath turns it into a usable reading',
                body: [
                    'CosmicPath does not ask you to decode technical jargon first. The flow begins with the domain and the question, then layers Korean saju under the reading and cross-checks it with tarot and astrology.',
                    'That is why the free result is structured around one action conclusion, one evidence summary, and one suggested follow-up question instead of a wall of symbolic language.',
                ],
                bullets: [
                    'Pick a domain before the birth details take over the experience',
                    'Open with one real decision question',
                    'Get a free first reading before choosing depth',
                ],
            },
            {
                title: 'What to ask in your first Korean saju reading',
                body: [
                    'The strongest first question is specific, emotionally real, and time-bound. Avoid asking for your entire destiny at once.',
                    'A good first reading feels like a strategic checkpoint, not a total life verdict.',
                ],
                bullets: [
                    'Should I move now, or wait for a stronger opening?',
                    'Is this relationship stabilizing, or am I reading hope into mixed signals?',
                    'Is this the season to expand, or to defend what I already have?',
                ],
            },
        ],
        faq: [
            {
                question: 'Do I need an exact birth time?',
                answer: 'No. Exact birth time sharpens timing, but the reading can still open with date-based structure and a real question.',
            },
            {
                question: 'Is Korean saju the same as a zodiac sign?',
                answer: 'No. Zodiac sign summaries are much broader. Saju uses a birth-time structure that is better suited to timing and pattern analysis.',
            },
            {
                question: 'Do I need to understand technical terms first?',
                answer: 'No. CosmicPath translates the reading into action, timing, and pressure before exposing deeper terminology.',
            },
        ],
        ctaTitle: 'Open your first Korean saju decision reading',
        ctaBody:
            'Bring one real decision. The first reading opens free, then you can go deeper only if the signal feels useful.',
    },
    {
        slug: 'korean-saju-vs-bazi',
        eyebrow: 'Entry Route 02',
        title: 'Korean Saju vs BaZi',
        description:
            'The practical overlap, the cultural difference, and why English-speaking users should search both terms when judging whether this category is for them.',
        seoDescription:
            'Learn how Korean saju relates to BaZi, where they overlap, and why CosmicPath uses Korean saju framing for decision timing.',
        readTime: '5 min read',
        accent: 'indigo',
        heroNote: 'Useful if you already know BaZi and want to understand the Korean layer.',
        keywords: ['Korean Saju vs BaZi', 'Four Pillars', 'BaZi guide', 'Saju meaning'],
        quickFacts: [
            { label: 'Shared root', value: 'Both belong to the Four Pillars family' },
            { label: 'Main difference', value: 'Korean saju adds a local interpretation layer and category language' },
            { label: 'Search tip', value: 'Use both “Saju” and “BaZi” when testing demand or learning the space' },
        ],
        questionExamples: [
            'If I already understand BaZi, what new angle does the Korean saju framing add?',
            'Why do English-speaking users find more information under BaZi than Saju?',
            'How should I explain CosmicPath without losing either the Korean identity or the familiar Four Pillars category?',
        ],
        sections: [
            {
                title: 'The overlap: both live inside the same family',
                body: [
                    'At the structural level, Korean saju and BaZi point to the same Four Pillars lineage. They both use birth-based temporal markers and read how those markers shape tendencies, pressure, and timing.',
                    'That is why an English-speaking user may understand the category faster when you mention BaZi alongside Korean saju.',
                ],
                bullets: [
                    'Both systems rely on birth date and time structure',
                    'Both are used to read pattern, element balance, and timing pressure',
                    'Both become more useful when attached to a live decision instead of abstract destiny talk',
                ],
            },
            {
                title: 'The difference: Korean saju is a cultural framing layer, not just a translation',
                body: [
                    'The Korean saju experience carries local language, local reading habits, and different emotional framing. In practice, it often feels closer to relationship rhythm, life timing, and social decision support than to a purely academic chart interpretation.',
                    'That difference matters because people are not only buying a calculation system. They are buying a way of understanding their situation.',
                ],
                bullets: [
                    'BaZi is the category many English-speaking users already recognize',
                    'Saju carries Korean usage, phrasing, and cultural trust cues',
                    'CosmicPath intentionally keeps the Korean identity instead of flattening it into generic “Asian astrology” language',
                ],
            },
            {
                title: 'Why this matters for acquisition',
                body: [
                    'If you only say “saju,” some English-speaking users may not know what family of system they are evaluating. If you only say “BaZi,” you lose the Korean identity that makes the product distinctive.',
                    'The strongest acquisition move is to bridge both: Korean Saju, a Four Pillars lens often compared with BaZi, used here for decision timing.',
                ],
                bullets: [
                    'Lead with Korean Saju for brand identity',
                    'Bridge with Four Pillars or BaZi for category comprehension',
                    'Translate the benefit into timing, risk, and next move rather than metaphysical jargon',
                ],
            },
            {
                title: 'How CosmicPath positions the bridge',
                body: [
                    'CosmicPath uses Korean saju as the owned lens, then translates it into clear decision timing output. That makes the experience readable even if the user enters through BaZi curiosity.',
                    'The product is not trying to replace every charting tool. It is trying to answer a narrower question: what should I do next, and when is the better window?',
                ],
                bullets: [
                    'Identity: Korean Saju',
                    'Category bridge: Four Pillars / BaZi',
                    'User promise: decision timing oracle',
                ],
            },
        ],
        faq: [
            {
                question: 'Is Korean saju just BaZi with a different name?',
                answer: 'Not exactly. They share a structural family, but Korean saju carries its own local interpretation habits and user expectations.',
            },
            {
                question: 'Which term should I use in English marketing copy?',
                answer: 'Lead with Korean Saju for distinctiveness, then bridge with Four Pillars or BaZi so the category becomes legible quickly.',
            },
            {
                question: 'Why not market this as generic astrology?',
                answer: 'Because generic astrology is broader and less distinctive. Korean saju gives the product a sharper identity and a more concrete story.',
            },
        ],
        ctaTitle: 'Use the category bridge, then test the real reading',
        ctaBody:
            'If you understand the BaZi connection, the next step is not more theory. It is running one real decision through the Korean saju path.',
    },
    {
        slug: 'decision-timing-reading',
        eyebrow: 'Entry Route 03',
        title: 'What Is a Decision Timing Reading?',
        description:
            'A guide to the kind of question CosmicPath is actually built for: move now, wait longer, protect yourself, or commit with better timing.',
        seoDescription:
            'See how CosmicPath turns Korean saju into a decision timing reading for relationships, career moves, money choices, and life transitions.',
        readTime: '4 min read',
        accent: 'rose',
        heroNote: 'The best path if you are less interested in astrology and more interested in what to do next.',
        keywords: ['decision timing reading', 'next move reading', 'relationship timing', 'career timing'],
        quickFacts: [
            { label: 'Best for', value: 'Questions about whether to move, wait, protect, or commit' },
            { label: 'Free result gives', value: 'Action conclusion, evidence summary, and follow-up prompt' },
            { label: 'Deep reading adds', value: 'Sharper timing, risk framing, and action guidance' },
        ],
        questionExamples: [
            'Should I text them first, or is the current window weak?',
            'Is this job move aligned with growth, or am I reacting to short-term discomfort?',
            'Should I push this investment now, or is caution the smarter move this month?',
        ],
        sections: [
            {
                title: 'A decision timing reading is not a yes or no machine',
                body: [
                    'The point is not to outsource your life to a single answer. The point is to see rhythm more clearly: where the pressure is, what window is opening, and what kind of move your situation can actually support.',
                    'That is why CosmicPath frames the reading around action, timing, and risk instead of around abstract destiny slogans.',
                ],
                bullets: [
                    'Move now',
                    'Wait for a stronger opening',
                    'Protect what you already have',
                    'Commit, but with a narrower scope',
                ],
            },
            {
                title: 'The strongest questions are concrete and alive',
                body: [
                    'The reading gets sharper when the question is specific enough to create tension. “What is my future?” is too broad. “Should I move on this relationship conversation now?” is much better.',
                    'Think of it like a strategic briefing: you want enough emotional truth to matter, but enough specificity to guide action.',
                ],
                bullets: [
                    'Name the domain first: relationship, career, money, health, or general',
                    'Write the live decision in one sentence',
                    'Keep the time horizon short enough to matter right now',
                ],
            },
            {
                title: 'What the free reading already gives you',
                body: [
                    'The first reading is designed to create an aha moment quickly. You get one action conclusion, one evidence summary, and one next question that opens the deeper path if you want it.',
                    'That structure matters because a first-time user does not need a textbook. They need a useful signal.',
                ],
                bullets: [
                    'Action conclusion: the clearest next move',
                    'Evidence summary: why the reading leans that way',
                    'Next question: the fastest route to deeper clarity',
                ],
            },
            {
                title: 'When the deeper reading becomes worth paying for',
                body: [
                    'Depth matters once the user already trusts the first signal. The paid layer should not feel like “more features.” It should feel like stronger evidence, sharper timing, and better action framing.',
                    'That is especially true for relationship timing, career transitions, and money decisions where small timing shifts can change the emotional cost of the move.',
                ],
                bullets: [
                    'Clearer timing windows',
                    'Risk language that separates pressure from momentum',
                    'More grounded next-step guidance after the first answer lands',
                ],
            },
        ],
        faq: [
            {
                question: 'Can a decision timing reading work without belief in astrology?',
                answer: 'Yes. The product is most useful when you treat it as a reflective timing lens around a real choice, not as a belief test.',
            },
            {
                question: 'What domains fit this best?',
                answer: 'Relationship timing, career transitions, money pressure, and major life pacing decisions are the strongest fits.',
            },
            {
                question: 'Why does the free reading stop after one clear answer?',
                answer: 'Because the first job is to prove signal quality quickly. Deeper layers only matter after that first answer earns trust.',
            },
        ],
        ctaTitle: 'Bring one real choice into the oracle',
        ctaBody:
            'If your question is concrete enough to create tension, the first Korean saju decision reading will usually tell you whether to move, wait, or narrow the risk.',
    },
];

export function getEnglishGuideBySlug(slug: string): EnglishGuide | undefined {
    return ENGLISH_GUIDES.find((guide) => guide.slug === slug);
}

export function getEnglishGuideSlugs(): string[] {
    return ENGLISH_GUIDES.map((guide) => guide.slug);
}
