import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDailyForecast, calculateDayMaster, type DayMaster } from '@/lib/daily-forecast';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isSubscriptionActive } from '@/lib/subscription';

interface DailyFortuneResponse {
    date: string;
    dayMaster: string;
    overallLuck: number;
    summary: string;
    luckyColor: string;
    luckyNumber: number;
    luckyDirection: string;
    areas: {
        love: number;
        money: number;
        career: number;
        health: number;
    };
    advice: string;
    cachedUntil: string;
    isPremium?: boolean;
}

const querySchema = z.object({
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    birthtime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    gender: z.enum(['M', 'F']).optional(),
});

const dailyFortuneCache = new Map<string, { expiresAt: number; data: DailyFortuneResponse }>();
const PRIVATE_CACHE_CONTROL = 'private, no-store, max-age=0';

const dayMasterLabel: Record<DayMaster, string> = {
    jia: '갑(甲)',
    yi: '을(乙)',
    bing: '병(丙)',
    ding: '정(丁)',
    wu: '무(戊)',
    ji: '기(己)',
    geng: '경(庚)',
    xin: '신(辛)',
    ren: '임(壬)',
    gui: '계(癸)',
};

function toYmd(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function getNextMidnight(date: Date): Date {
    const next = new Date(date);
    next.setHours(24, 0, 0, 0);
    return next;
}

function hashCode(input: string): number {
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
}

function clampScore(value: number): number {
    return Math.max(0, Math.min(100, value));
}

function errorResponse(code: number, message: string, details?: string) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details ? { details } : {}),
            },
        },
        { status: code }
    );
}

function buildSummary(overallLuck: number): string {
    if (overallLuck >= 85) {
        return '기회의 문이 크게 열리는 날입니다. 중요한 연락과 결정이 기대 이상으로 순조롭게 흘러갑니다.';
    }
    if (overallLuck >= 70) {
        return '안정적인 상승 흐름입니다. 작은 루틴을 지키면 사랑과 일 모두 균형 있게 좋아집니다.';
    }
    if (overallLuck >= 55) {
        return '무난하지만 선택이 결과를 가르는 날입니다. 서두르지 말고 우선순위를 명확히 잡으세요.';
    }
    return '에너지가 흔들릴 수 있는 날입니다. 지출과 감정 반응을 줄이고 휴식에 집중하면 반전이 가능합니다.';
}

function buildAdvice(seed: number, isPremium: boolean): string {
    const baseAdvicePool = [
        '오전에는 계획, 오후에는 실행에 집중하세요. 작은 완료 경험이 오늘의 흐름을 바꿉니다.',
        '관계에서는 설명보다 경청이 더 큰 힘을 발휘합니다. 답을 늦추면 오해를 줄일 수 있습니다.',
        '금전 운은 분할 결제와 예산 상한 설정이 핵심입니다. 즉흥 소비만 막아도 흐름이 좋아집니다.',
        '커리어에서는 혼자 처리하려 하지 말고 도움을 먼저 요청하세요. 협업이 지연을 줄입니다.',
        '컨디션 관리는 수면과 수분이 우선입니다. 저녁 일정은 가볍게 유지하는 편이 유리합니다.',
    ];
    const baseAdvice = baseAdvicePool[seed % baseAdvicePool.length];

    if (!isPremium) {
        return baseAdvice;
    }

    const premiumInsightPool = [
        '프리미엄 인사이트: 오전 10시~정오 사이에 핵심 결정을 잡으면 성과 전환율이 가장 높게 나타납니다.',
        '프리미엄 인사이트: 오늘은 인간관계 운의 변동성이 낮아, 중요한 대화나 화해 시도에 유리합니다.',
        '프리미엄 인사이트: 소비보다 자산 정리(구독/고정비 점검)에 집중하면 이번 주 재물 흐름이 개선됩니다.',
        '프리미엄 인사이트: 커리어 운은 단독 실행보다 피드백 루프를 빠르게 돌릴 때 상승 폭이 커집니다.',
    ];

    return `${baseAdvice} ${premiumInsightPool[seed % premiumInsightPool.length]}`;
}

function buildAreas(base: number, seed: number) {
    const offset = (step: number) => ((seed >> step) % 15) - 7;
    return {
        love: clampScore(base + offset(0)),
        money: clampScore(base + offset(2)),
        career: clampScore(base + offset(4)),
        health: clampScore(base + offset(6)),
    };
}

async function resolvePremiumStatusForRequest(): Promise<boolean> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return false;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus: true,
            subscriptionExpiresAt: true,
        },
    });

    if (!user) {
        return false;
    }

    return isSubscriptionActive(user.subscriptionStatus, user.subscriptionExpiresAt);
}

export async function GET(request: NextRequest) {
    const rawQuery = {
        birthday: request.nextUrl.searchParams.get('birthday') ?? '',
        birthtime: request.nextUrl.searchParams.get('birthtime') ?? undefined,
        gender: (request.nextUrl.searchParams.get('gender') ?? undefined) as 'M' | 'F' | undefined,
    };

    const parsed = querySchema.safeParse(rawQuery);
    if (!parsed.success) {
        return errorResponse(400, 'Bad Request', parsed.error.message);
    }

    const now = new Date();
    const today = toYmd(now);
    const midnight = getNextMidnight(now);
    const isPremium = await resolvePremiumStatusForRequest();

    const fortuneKey = [
        today,
        parsed.data.birthday,
        parsed.data.birthtime ?? '',
        parsed.data.gender ?? '',
    ].join('|');

    const cacheKey = `${fortuneKey}|${isPremium ? 'premium' : 'free'}`;

    const cached = dailyFortuneCache.get(cacheKey);
    if (cached && cached.expiresAt > now.getTime()) {
        return NextResponse.json(cached.data, {
            headers: {
                'Cache-Control': PRIVATE_CACHE_CONTROL,
            },
        });
    }

    const dayMaster = calculateDayMaster(parsed.data.birthday);
    const base = calculateDailyForecast(dayMaster, today);
    const seed = hashCode(fortuneKey);

    const overallLuck = clampScore(
        base.score +
        (parsed.data.birthtime ? 2 : 0) +
        (parsed.data.gender === 'F' ? 1 : 0) -
        (seed % 3)
    );

    const response: DailyFortuneResponse = {
        date: today,
        dayMaster: dayMasterLabel[dayMaster],
        overallLuck,
        summary: buildSummary(overallLuck),
        luckyColor: base.luckyColor,
        luckyNumber: (seed % 9) + 1,
        luckyDirection: base.luckyDirection,
        areas: buildAreas(overallLuck, seed),
        advice: buildAdvice(seed, isPremium),
        cachedUntil: midnight.toISOString(),
        isPremium,
    };

    dailyFortuneCache.set(cacheKey, {
        data: response,
        expiresAt: midnight.getTime(),
    });

    return NextResponse.json(response, {
        headers: {
            'Cache-Control': PRIVATE_CACHE_CONTROL,
        },
    });
}
