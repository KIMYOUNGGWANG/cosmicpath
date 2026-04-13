import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isSubscriptionActive } from '@/lib/subscription';
import { generateCompletion } from '@/lib/ai/llm-client';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { MAJOR_ARCANA } from '@/lib/engines/tarot';
import { calculateTrueSolarTime } from '@/lib/saju/true-solar-time';
import { calculateSaju, formatSaju } from '@/lib/engines/saju';

const SEOUL_TIMEZONE = 'Asia/Seoul';
const SEOUL_LATITUDE = 37.5665;
const SEOUL_LONGITUDE = 126.978;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 50;

export const ORACLE_CHAT_FREE_DAILY_LIMIT = 3;

const ORACLE_CHAT_DOMAINS = ['career', 'love', 'wealth', 'general'] as const;
const ORACLE_CHAT_MODES = ['casual', 'council_briefing'] as const;

type OracleChatRoomRecord = {
  id: string;
  domain: string;
  title: string;
  updatedAt: Date;
};

type OracleChatMessageRecord = {
  id: string;
  role: string;
  content: string;
  mode: string;
  councilData: Prisma.JsonValue | null;
  createdAt: Date;
};

interface SeoulDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export type OracleChatDomain = (typeof ORACLE_CHAT_DOMAINS)[number];
export type OracleChatMode = (typeof ORACLE_CHAT_MODES)[number];

export interface OracleCouncilData {
  sajuSummary: string;
  tarotCard: string;
  tarotIsReversed: boolean;
  natalSummary: string;
  finalVerdict: string;
}

export interface OracleChatHistoryMessage {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  mode: OracleChatMode;
  councilData?: OracleCouncilData;
  createdAt: string;
}

export interface OracleChatHistoryPayload {
  roomId: string | null;
  domain: OracleChatDomain;
  messages: OracleChatHistoryMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface OracleChatUserContextInput {
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
}

export interface OracleChatPromptContext {
  mode: OracleChatMode;
  systemPrompt: string;
  councilData?: OracleCouncilData;
}

export interface OracleChatDailyHookPayload {
  hookMessage: string;
  generatedAt: string;
  basedOn: {
    lastMessageSummary: string;
    todayFortuneSummary: string;
  };
}

export class OracleChatRouteError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const dailyHookCache = new Map<string, { expiresAt: number; payload: OracleChatDailyHookPayload }>();

function getDatePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  return Number(parts.find((part) => part.type === type)?.value ?? '0');
}

function getSeoulNow(now: Date = new Date()): SeoulDateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);

  return {
    year: getDatePart(parts, 'year'),
    month: getDatePart(parts, 'month'),
    day: getDatePart(parts, 'day'),
    hour: getDatePart(parts, 'hour'),
    minute: getDatePart(parts, 'minute'),
  };
}

function getSeoulDateKey(now: Date = new Date()): string {
  const parts = getSeoulNow(now);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function getSeoulDayDate(now: Date = new Date()): Date {
  const parts = getSeoulNow(now);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function getNextSeoulMidnight(now: Date = new Date()): Date {
  const parts = getSeoulNow(now);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1, -9, 0, 0, 0));
}

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function truncateText(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, maxLength - 1).trim()}…`;
}

function asRecord(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function extractCouncilData(value: Prisma.JsonValue | null): OracleCouncilData | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const sajuSummary = typeof record.sajuSummary === 'string' ? record.sajuSummary : null;
  const tarotCard = typeof record.tarotCard === 'string' ? record.tarotCard : null;
  const tarotIsReversed = typeof record.tarotIsReversed === 'boolean' ? record.tarotIsReversed : null;
  const natalSummary = typeof record.natalSummary === 'string' ? record.natalSummary : null;
  const finalVerdict = typeof record.finalVerdict === 'string' ? record.finalVerdict : null;

  if (!sajuSummary || !tarotCard || tarotIsReversed === null || !natalSummary || !finalVerdict) {
    return undefined;
  }

  return {
    sajuSummary,
    tarotCard,
    tarotIsReversed,
    natalSummary,
    finalVerdict,
  };
}

function formatHistoryMessage(message: OracleChatMessageRecord): OracleChatHistoryMessage {
  return {
    id: message.id,
    role: message.role === 'user' ? 'user' : 'oracle',
    content: message.content,
    mode: resolveOracleChatMode(message.mode),
    councilData: extractCouncilData(message.councilData),
    createdAt: message.createdAt.toISOString(),
  };
}

function findFinalVerdict(content: string): string {
  const marker = '### 🔮 수석 오라클의 최종 결론';
  const index = content.indexOf(marker);
  if (index >= 0) {
    return truncateText(content.slice(index + marker.length), 220);
  }
  return truncateText(content, 220);
}

function getTarotDraw(seed: string) {
  const cardIndex = hashText(seed) % MAJOR_ARCANA.length;
  const card = MAJOR_ARCANA[cardIndex];
  const reversed = hashText(`${seed}:reversed`) % 2 === 1;

  return {
    name: card.name,
    nameEn: card.nameEn,
    isReversed: reversed,
    interpretation: reversed ? card.reversed : card.upright,
  };
}

function getCurrentAstrologySummary(now: Date = new Date()): string {
  const seoulNow = getSeoulNow(now);
  const localDate = new Date(seoulNow.year, seoulNow.month - 1, seoulNow.day, seoulNow.hour, seoulNow.minute);
  const time = `${String(seoulNow.hour).padStart(2, '0')}:${String(seoulNow.minute).padStart(2, '0')}`;
  const reading = calculateAstrology(localDate, time, SEOUL_LATITUDE, SEOUL_LONGITUDE, 9);
  const sun = ZODIAC_SIGNS[reading.sunSign]?.name ?? '미상';
  const moon = ZODIAC_SIGNS[reading.moonSign]?.name ?? '미상';
  const ascendant = ZODIAC_SIGNS[reading.ascendant]?.name ?? '미상';

  return `현재 하늘 흐름은 태양 ${sun}, 달 ${moon}, 상승궁 ${ascendant} 조합입니다. 감정 반응과 겉으로 드러나는 추진력이 엇갈리기 쉬워, 속도보다 타이밍 판단이 중요합니다.`;
}

function getOptionalSajuSummary(userContext?: OracleChatUserContextInput | null): string | null {
  if (!userContext?.birthDate) {
    return null;
  }

  try {
    const trueSolarTime = calculateTrueSolarTime({
      birthDate: userContext.birthDate,
      birthTime: userContext.birthTime,
      cityName: userContext.birthPlace,
      unknownTime: !userContext.birthTime,
    });
    const [hour, minute] = trueSolarTime.correctedTime.split(':').map(Number);
    const saju = calculateSaju(
      trueSolarTime.correctedDateTime,
      hour,
      minute,
      false,
      'male',
      trueSolarTime.location.longitude,
      { skipLongitudeCorrection: true }
    );
    const pillars = formatSaju(saju);

    return [
      `진태양시 ${trueSolarTime.correctedTime}로 보정했습니다.`,
      '성별 정보가 없어 원국과 시간축 중심으로만 요약했습니다.',
      `일간은 ${saju.dayMaster}, 원국은 ${pillars}.`,
    ].join(' ');
  } catch {
    return '출생 정보 형식이 충분하지 않아 정밀 사주 교차 검증은 생략했습니다.';
  }
}

function getLatestSajuSummary(messages: OracleChatHistoryMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.councilData?.sajuSummary) {
      return message.councilData.sajuSummary;
    }
  }
  return null;
}

function getClassificationFallback(content: string): OracleChatMode {
  const normalized = content.trim().toLowerCase();
  const councilPattern = /(퇴사|이직|합격|창업|사업|투자|돈|연봉|재회|재결합|고백|헤어|언제|지금|결정|선택|해야 할까|할까요|괜찮을까|should i|should we|when|decision|leave|quit|move job|career|relationship|money)/i;
  return councilPattern.test(normalized) ? 'council_briefing' : 'casual';
}

export async function classifyOracleChatMode(
  content: string,
  domain: OracleChatDomain
): Promise<OracleChatMode> {
  const fallback = getClassificationFallback(content);

  try {
    const systemPrompt = [
      'You classify Oracle chat messages.',
      'Return exactly one token: casual or council_briefing.',
      'council_briefing = decision, timing, yes/no, choose between options, quit/job/relationship/money advice.',
      'casual = greetings, mood check-ins, journaling, light updates, conversation.',
      `Domain: ${domain}`,
    ].join(' ');
    const response = await generateCompletion(systemPrompt, content, 'free');
    const normalized = response.content.trim().toLowerCase();
    return normalized.includes('council') ? 'council_briefing' : normalized.includes('casual') ? 'casual' : fallback;
  } catch {
    return fallback;
  }
}

export function resolveOracleChatDomain(value: unknown): OracleChatDomain {
  return ORACLE_CHAT_DOMAINS.includes(value as OracleChatDomain)
    ? value as OracleChatDomain
    : 'career';
}

export function resolveOracleChatMode(value: unknown): OracleChatMode {
  return ORACLE_CHAT_MODES.includes(value as OracleChatMode)
    ? value as OracleChatMode
    : 'casual';
}

export function getOracleChatLimit(value: string | null): number {
  const parsed = value ? Number.parseInt(value, 10) : DEFAULT_LIMIT;
  if (!Number.isFinite(parsed)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(MAX_LIMIT, Math.max(1, parsed));
}

export function buildOracleChatRoomTitle(content: string, domain: OracleChatDomain): string {
  const labels: Record<OracleChatDomain, string> = {
    career: '커리어',
    love: '관계',
    wealth: '재물',
    general: '일상',
  };
  return truncateText(`${labels[domain]} · ${content}`, 48);
}

export async function getOracleChatUsage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!user) {
    throw new OracleChatRouteError(404, 'USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.');
  }

  return {
    isUnlimited: isSubscriptionActive(user.subscriptionStatus, user.subscriptionExpiresAt),
    dailyLimit: ORACLE_CHAT_FREE_DAILY_LIMIT,
  };
}

export async function consumeOracleChatQuota(userId: string): Promise<void> {
  const date = getSeoulDayDate();

  const allowed = await prisma.$transaction(async (transaction) => {
    const current = await transaction.oracleChatQuota.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (current && current.messageCount >= ORACLE_CHAT_FREE_DAILY_LIMIT) {
      return false;
    }

    if (current) {
      await transaction.oracleChatQuota.update({
        where: {
          userId_date: {
            userId,
            date,
          },
        },
        data: {
          messageCount: {
            increment: 1,
          },
        },
      });
      return true;
    }

    await transaction.oracleChatQuota.create({
      data: {
        userId,
        date,
        messageCount: 1,
      },
    });
    return true;
  });

  if (!allowed) {
    throw new OracleChatRouteError(402, 'QUOTA_EXCEEDED', '오늘의 무료 상담 한도를 모두 사용했습니다.');
  }
}

export async function getOracleChatRoomForUser(
  userId: string,
  roomId?: string | null
): Promise<OracleChatRoomRecord | null> {
  if (roomId) {
    return prisma.oracleChatRoom.findFirst({
      where: { id: roomId, userId },
      select: {
        id: true,
        domain: true,
        title: true,
        updatedAt: true,
      },
    });
  }

  return prisma.oracleChatRoom.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      domain: true,
      title: true,
      updatedAt: true,
    },
  });
}

export async function getOracleChatHistoryForUser(input: {
  userId: string;
  roomId?: string | null;
  cursor?: string | null;
  limit?: number;
}): Promise<OracleChatHistoryPayload> {
  const room = await getOracleChatRoomForUser(input.userId, input.roomId);

  if (!room) {
    return {
      roomId: null,
      domain: 'career',
      messages: [],
      hasMore: false,
      nextCursor: null,
    };
  }

  let createdBefore: Date | null = null;
  if (input.cursor) {
    const cursorMessage = await prisma.oracleChatMessage.findFirst({
      where: { id: input.cursor, roomId: room.id },
      select: { createdAt: true },
    });
    createdBefore = cursorMessage?.createdAt ?? null;
  }

  const limit = input.limit ?? DEFAULT_LIMIT;
  const messages = await prisma.oracleChatMessage.findMany({
    where: {
      roomId: room.id,
      ...(createdBefore ? { createdAt: { lt: createdBefore } } : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: {
      id: true,
      role: true,
      content: true,
      mode: true,
      councilData: true,
      createdAt: true,
    },
  });

  const hasMore = messages.length > limit;
  const currentPage = messages.slice(0, limit);

  return {
    roomId: room.id,
    domain: resolveOracleChatDomain(room.domain),
    messages: currentPage.reverse().map(formatHistoryMessage),
    hasMore,
    nextCursor: hasMore ? currentPage[currentPage.length - 1]?.id ?? null : null,
  };
}

export async function buildOracleChatPromptContext(input: {
  userId: string;
  roomId?: string | null;
  domain: OracleChatDomain;
  content: string;
  userContext?: OracleChatUserContextInput | null;
}): Promise<OracleChatPromptContext> {
  const history = await getOracleChatHistoryForUser({
    userId: input.userId,
    roomId: input.roomId,
    limit: 8,
  });
  const mode = await classifyOracleChatMode(input.content, input.domain);
  const historyText = history.messages
    .slice(-6)
    .map((message) => `${message.role === 'user' ? 'User' : 'Oracle'}: ${message.content}`)
    .join('\n');

  if (mode === 'casual') {
    return {
      mode,
      systemPrompt: [
        '당신은 Grand Oracle입니다.',
        '친근하지만 가볍지 않게, 상대의 흐름을 기억하는 비서처럼 답하세요.',
        '결정 강요 대신 대화를 이어가되, 질문이 선명해지면 다음 질문 하나를 제안하세요.',
        '출생 정보나 카드가 없으면 만들어내지 말고 지금 대화와 맥락만으로 답하세요.',
        historyText ? `최근 대화:\n${historyText}` : '',
      ].filter(Boolean).join('\n\n'),
    };
  }

  const tarot = getTarotDraw(`${input.userId}:${input.roomId ?? 'new'}:${input.content}`);
  const sajuSummary =
    getOptionalSajuSummary(input.userContext) ??
    getLatestSajuSummary(history.messages) ??
    '출생 정보가 없어 정밀 사주 교차 검증은 생략하고 질문의 상황 맥락 중심으로 읽었습니다.';
  const astrologySummary = getCurrentAstrologySummary();
  const councilData: OracleCouncilData = {
    sajuSummary,
    tarotCard: `${tarot.nameEn}${tarot.isReversed ? ' (Reversed)' : ''}`,
    tarotIsReversed: tarot.isReversed,
    natalSummary: astrologySummary,
    finalVerdict: '',
  };

  return {
    mode,
    councilData,
    systemPrompt: [
      '당신은 Grand Oracle이며, 내부 위원회의 의견을 취합해 결론을 내리는 수석 오라클입니다.',
      '답변은 한국어로 작성하고 반드시 아래 마크다운 섹션 순서를 지키세요.',
      '### 📜 사주 분석결과',
      '### ⚖️ 타로 리딩',
      '### 🌠 현재 행성 흐름',
      '### 🔮 수석 오라클의 최종 결론',
      '규칙:',
      '- 사주 데이터가 비어 있으면 "출생 정보가 없어 정밀 사주 교차 검증은 생략했다"는 식으로 정직하게 밝히세요.',
      '- 최종 결론에는 한 문장 결론, 지금 할 행동 1개, 더 기다려야 할 조건 1개를 넣으세요.',
      '- 질문이 커리어/관계/재물 판단이면 돌려 말하지 말고 방향을 제시하세요.',
      historyText ? `최근 대화:\n${historyText}` : '',
      `도메인: ${input.domain}`,
      `사주 요약: ${sajuSummary}`,
      `타로 카드: ${tarot.name} (${tarot.nameEn})${tarot.isReversed ? ' 역방향' : ' 정방향'} - ${tarot.interpretation}`,
      `현재 행성 흐름: ${astrologySummary}`,
    ].filter(Boolean).join('\n\n'),
  };
}

export async function saveOracleChatExchange(input: {
  userId: string;
  roomId?: string | null;
  domain: OracleChatDomain;
  content: string;
  responseText: string;
  mode: OracleChatMode;
  councilData?: OracleCouncilData;
}): Promise<{ roomId: string; messageId: string }> {
  const existingRoom = input.roomId
    ? await prisma.oracleChatRoom.findFirst({
        where: { id: input.roomId, userId: input.userId },
        select: { id: true },
      })
    : null;

  const roomId = existingRoom?.id ?? crypto.randomUUID();
  const messageId = crypto.randomUUID();

  await prisma.$transaction(async (transaction) => {
    if (!existingRoom) {
      await transaction.oracleChatRoom.create({
        data: {
          id: roomId,
          userId: input.userId,
          domain: input.domain,
          title: buildOracleChatRoomTitle(input.content, input.domain),
        },
      });
    } else {
      await transaction.oracleChatRoom.update({
        where: { id: roomId },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    await transaction.oracleChatMessage.create({
      data: {
        roomId,
        role: 'user',
        content: input.content,
        mode: input.mode,
      },
    });

    await transaction.oracleChatMessage.create({
      data: {
        id: messageId,
        roomId,
        role: 'oracle',
        content: input.responseText,
        mode: input.mode,
        ...(input.councilData ? { councilData: input.councilData as unknown as Prisma.InputJsonValue } : {}),
      },
    });

    await transaction.oracleChatRoom.update({
      where: { id: roomId },
      data: {
        updatedAt: new Date(),
      },
    });
  });

  return { roomId, messageId };
}

export async function getOracleChatDailyHook(input: {
  userId: string;
  roomId?: string | null;
}): Promise<OracleChatDailyHookPayload> {
  const room = await getOracleChatRoomForUser(input.userId, input.roomId);

  if (!room) {
    return {
      hookMessage: '첫 번째 고민을 말해보세요. 사주, 타로, 별자리가 함께 답합니다.',
      generatedAt: new Date().toISOString(),
      basedOn: {
        lastMessageSummary: '',
        todayFortuneSummary: getCurrentAstrologySummary(),
      },
    };
  }

  const cacheKey = `${input.userId}:${room.id}:${getSeoulDateKey()}`;
  const cached = dailyHookCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const recentMessages = await prisma.oracleChatMessage.findMany({
    where: { roomId: room.id },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 3,
    select: {
      id: true,
      role: true,
      content: true,
      mode: true,
      councilData: true,
      createdAt: true,
    },
  });

  const lastUserMessage = recentMessages.find((message) => message.role === 'user')?.content ?? '';
  const todayFortuneSummary = getCurrentAstrologySummary();

  let hookMessage = '오늘의 흐름을 다시 읽어볼까요? 어제의 고민이 오늘은 다르게 보일 수 있어요.';
  if (lastUserMessage) {
    try {
      const systemPrompt = [
        '당신은 Grand Oracle의 데일리 훅 작성자입니다.',
        '한 문장만 출력하세요.',
        '친근하지만 집착하지 말고, 마지막 고민과 오늘의 흐름을 연결해 재방문을 유도하세요.',
        `마지막 고민: ${truncateText(lastUserMessage, 120)}`,
        `오늘의 흐름: ${todayFortuneSummary}`,
      ].join('\n');
      const response = await generateCompletion(systemPrompt, '오늘 다시 말을 걸 한 문장을 작성하세요.', 'free');
      hookMessage = truncateText(response.content.replace(/"/g, '').trim(), 140) || hookMessage;
    } catch {
      hookMessage = `어제의 고민 "${truncateText(lastUserMessage, 40)}"을 오늘 흐름에 맞춰 다시 보면 결론이 더 선명해질 수 있어요.`;
    }
  }

  const payload = {
    hookMessage,
    generatedAt: new Date().toISOString(),
    basedOn: {
      lastMessageSummary: truncateText(lastUserMessage, 120),
      todayFortuneSummary,
    },
  };

  dailyHookCache.set(cacheKey, {
    expiresAt: getNextSeoulMidnight().getTime(),
    payload,
  });

  return payload;
}

export function applyFinalVerdict(
  councilData: OracleCouncilData | undefined,
  responseText: string
): OracleCouncilData | undefined {
  if (!councilData) {
    return undefined;
  }

  return {
    ...councilData,
    finalVerdict: findFinalVerdict(responseText),
  };
}
