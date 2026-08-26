import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { generateCompletion } from '@/lib/ai/llm-client';
import { calculateDailyForecast, calculateDayMaster, type DayMaster } from '@/lib/daily-forecast';
import { devLog } from '@/lib/dev-logger';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { calculateSaju, formatSaju } from '@/lib/engines/saju';
import { prisma } from '@/lib/prisma';
import { sendSmsOracleMessage } from '@/lib/sms-oracle-gateway';
import { isSubscriptionActive } from '@/lib/subscription';

const SEOUL_TIMEZONE = 'Asia/Seoul';
const SEOUL_LATITUDE = 37.5665;
const SEOUL_LONGITUDE = 126.978;

export const SMS_ORACLE_DAILY_REPLY_LIMIT = 3;
const SMS_ORACLE_OTP_TTL_MS = 1000 * 60 * 10;
const SMS_ORACLE_OTP_MAX_ATTEMPTS = 5;

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

interface JsonRecord {
  [key: string]: unknown;
}

interface SmsOracleBirthContext {
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
}

interface SmsOracleSubscriberRecord {
  id: string;
  userId: string;
  phoneNumber: string;
  isVerified: boolean;
  isActive: boolean;
  user: {
    subscriptionStatus: string;
    subscriptionExpiresAt: Date | null;
    email: string | null;
  };
}

interface SmsOracleRecentMessage {
  direction: string;
  content: string;
  createdAt: Date;
}

interface SmsOracleTodayContext {
  dateKey: string;
  dayMaster: string | null;
  forecastSummary: string;
  sajuSummary: string;
  astrologySummary: string;
  tarotSummary: string;
}

export interface SmsOracleInboundWebhookPayload {
  from: string;
  to: string;
  content: string;
  receivedAt: string;
}

export interface SmsOracleDailyHookSummary {
  dispatched: number;
  failed: number;
  skipped: number;
}

export function isSmsOracleInboundEnabled(): boolean {
  return process.env.SMS_ORACLE_INBOUND_ENABLED?.trim() === 'true';
}

function getVerificationIdentifier(phoneNumber: string): string {
  return `sms-oracle:${phoneNumber}`;
}

function getVerificationAttemptIdentifier(phoneNumber: string): string {
  return `sms-oracle-attempt:${phoneNumber}`;
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function parseJsonRecord(value?: string | null): JsonRecord | null {
  if (!value) {
    return null;
  }

  try {
    return asRecord(JSON.parse(value));
  } catch {
    return null;
  }
}

function getString(record: JsonRecord | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function compactPhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

export function normalizePhoneNumberToE164(value: string): string | null {
  const normalized = compactPhoneNumber(value);

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('+82')) {
    return normalized;
  }

  if (normalized.startsWith('82')) {
    return `+${normalized}`;
  }

  if (normalized.startsWith('0')) {
    return `+82${normalized.slice(1)}`;
  }

  return normalized.startsWith('+') ? normalized : null;
}

function truncateText(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength - 1).trim()}…`;
}

function hashText(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): number {
  return Number(parts.find((part) => part.type === type)?.value ?? '0');
}

function getSeoulDateKey(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = getDatePart(parts, 'year');
  const month = getDatePart(parts, 'month');
  const day = getDatePart(parts, 'day');

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getSeoulDayDate(value: string = getSeoulDateKey()): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function parseBirthTime(value?: string): { hour: number; minute: number } {
  if (!value) {
    return { hour: 12, minute: 0 };
  }

  const [hour, minute] = value.split(':').map((part) => Number(part));

  return {
    hour: Number.isFinite(hour) ? hour : 12,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function getCurrentAstrologySummary(now: Date = new Date()): string {
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
  const localDate = new Date(
    getDatePart(parts, 'year'),
    getDatePart(parts, 'month') - 1,
    getDatePart(parts, 'day'),
    getDatePart(parts, 'hour'),
    getDatePart(parts, 'minute')
  );
  const reading = calculateAstrology(localDate, '12:00', SEOUL_LATITUDE, SEOUL_LONGITUDE, 9);
  const sun = ZODIAC_SIGNS[reading.sunSign]?.name ?? '미상';
  const moon = ZODIAC_SIGNS[reading.moonSign]?.name ?? '미상';
  const ascendant = ZODIAC_SIGNS[reading.ascendant]?.name ?? '미상';

  return `태양 ${sun}, 달 ${moon}, 상승궁 ${ascendant} 흐름이라 감정보다 타이밍 판단이 중요합니다.`;
}

function buildEnergySummary(seed: string): string {
  const energyKeywords = [
    '새로운 출발과 창조적 돌파', '내적 중심과 지혜로운 인내', '풍요와 확장적 결실', '리더십과 질서 확립',
    '원칙 수호와 멘토십', '가치관 일치와 핵심 선택', '목표를 향한 과감한 돌진', '용기와 내면의 힘',
    '성찰과 독립적 탐색', '운명적 전환점과 기회의 창', '균형과 공정한 조율', '새로운 관점과 성장',
  ];
  const interpretation = energyKeywords[hashText(seed) % energyKeywords.length];
  return `에너지 신호: ${interpretation}`;
}

function buildForecastSummary(birthDate: string, targetDate: string): {
  dayMaster: string;
  summary: string;
} {
  const dayMaster = calculateDayMaster(birthDate);
  const forecast = calculateDailyForecast(dayMaster, targetDate);

  return {
    dayMaster: dayMasterLabel[dayMaster],
    summary: `오늘 운세는 ${forecast.keyword} 흐름입니다. ${truncateText(forecast.advice, 70)}`,
  };
}

function buildSajuSummary(context: SmsOracleBirthContext | null): string {
  if (!context?.birthDate) {
    return '출생 정보가 없어 사주 정밀 축은 생략하고 최근 고민 맥락 중심으로 답합니다.';
  }

  const { hour, minute } = parseBirthTime(context.birthTime);
  const saju = calculateSaju(new Date(context.birthDate), hour, minute);
  const formatted = formatSaju(saju);
  const birthPlace = context.birthPlace ? `, 출생지 ${context.birthPlace}` : '';

  return `사주 기준축은 ${formatted}${birthPlace} 입니다.`;
}

function buildRecentMessageSummary(messages: SmsOracleRecentMessage[]): string {
  if (!messages.length) {
    return '이전 문자 맥락 없음';
  }

  return messages
    .map((message) => {
      const direction = message.direction === 'inbound' ? '사용자' : '오라클';
      return `${direction}: ${truncateText(message.content, 80)}`;
    })
    .join('\n');
}

function buildQuotaExceededMessage(): string {
  return '오늘의 오라클 상담이 마감되었습니다. (3/3) 내일 아침 다시 찾아올게요.';
}

function buildSubscriptionRequiredMessage(): string {
  return 'SMS Daily Signal 이용을 위해서는 활성 구독이 필요합니다. CosmicPath에서 구독 상태를 확인해주세요.';
}

function buildInactiveSubscriberMessage(): string {
  return 'SMS Daily Signal이 아직 활성화되지 않았습니다. CosmicPath에서 번호 인증을 완료해주세요.';
}

function getSmsOracleWebhookSecret(): string | null {
  return (
    process.env.SOLAPI_WEBHOOK_SECRET?.trim() ??
    process.env.SMS_ORACLE_WEBHOOK_SECRET?.trim() ??
    null
  );
}

export function verifySmsOracleWebhookSecret(receivedHash: string | null): boolean {
  const secret = getSmsOracleWebhookSecret();

  if (!secret || !receivedHash) {
    return false;
  }

  const expectedHash = createHash('sha1').update(secret).digest('hex');
  const expectedBuffer = Buffer.from(expectedHash);
  const receivedBuffer = Buffer.from(receivedHash.trim());

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function hasSmsOracleWebhookSecret(): boolean {
  return Boolean(getSmsOracleWebhookSecret());
}

export async function hasSmsOracleMembershipAccess(userId: string): Promise<boolean> {
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

async function getLatestBirthContext(userId: string): Promise<SmsOracleBirthContext | null> {
  const latestReading = await prisma.readingResult.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { metadata: true },
  });

  const metadata = parseJsonRecord(latestReading?.metadata);
  const readingData = asRecord(metadata?.readingData);
  const birthDate = getString(readingData, 'birthDate');

  if (!birthDate) {
    return null;
  }

  return {
    birthDate,
    ...(getString(readingData, 'birthTime')
      ? { birthTime: getString(readingData, 'birthTime') ?? undefined }
      : {}),
    ...(getString(readingData, 'cityName') || getString(readingData, 'birthPlace')
      ? {
          birthPlace:
            getString(readingData, 'cityName') ?? getString(readingData, 'birthPlace') ?? undefined,
        }
      : {}),
  };
}

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function clearVerificationArtifacts(phoneNumber: string): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: {
        in: [
          getVerificationIdentifier(phoneNumber),
          getVerificationAttemptIdentifier(phoneNumber),
        ],
      },
    },
  });
}

async function getVerificationAttemptCount(phoneNumber: string): Promise<number> {
  return prisma.verificationToken.count({
    where: {
      identifier: getVerificationAttemptIdentifier(phoneNumber),
      expires: {
        gt: new Date(),
      },
    },
  });
}

async function recordFailedVerificationAttempt(phoneNumber: string): Promise<void> {
  await prisma.verificationToken.create({
    data: {
      identifier: getVerificationAttemptIdentifier(phoneNumber),
      token: randomUUID(),
      expires: new Date(Date.now() + SMS_ORACLE_OTP_TTL_MS),
    },
  });
}

export async function registerSmsOraclePhone(input: {
  userId: string;
  phoneNumber: string;
}): Promise<void> {
  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + SMS_ORACLE_OTP_TTL_MS);

  await prisma.smsOracleSubscriber.upsert({
    where: {
      userId: input.userId,
    },
    create: {
      userId: input.userId,
      phoneNumber: input.phoneNumber,
      isVerified: false,
      isActive: true,
    },
    update: {
      phoneNumber: input.phoneNumber,
      isVerified: false,
      isActive: true,
    },
  });

  await clearVerificationArtifacts(input.phoneNumber);
  await prisma.verificationToken.create({
    data: {
      identifier: getVerificationIdentifier(input.phoneNumber),
      token: otpCode,
      expires: expiresAt,
    },
  });
  await sendSmsOracleMessage({
    to: input.phoneNumber,
    text: `[CosmicPath] 인증번호 ${otpCode} 를 입력하면 Daily Signal 연결이 완료됩니다.`,
  });
}

export async function verifySmsOraclePhone(input: {
  userId: string;
  phoneNumber: string;
  code: string;
}): Promise<boolean> {
  const attemptCount = await getVerificationAttemptCount(input.phoneNumber);
  if (attemptCount >= SMS_ORACLE_OTP_MAX_ATTEMPTS) {
    return false;
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: getVerificationIdentifier(input.phoneNumber),
      token: input.code,
    },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    await recordFailedVerificationAttempt(input.phoneNumber);
    return false;
  }

  const subscriber = await prisma.smsOracleSubscriber.findUnique({
    where: {
      userId: input.userId,
    },
    select: {
      id: true,
      phoneNumber: true,
    },
  });

  if (!subscriber || subscriber.phoneNumber !== input.phoneNumber) {
    await recordFailedVerificationAttempt(input.phoneNumber);
    return false;
  }

  await prisma.$transaction([
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: getVerificationIdentifier(input.phoneNumber),
          token: input.code,
        },
      },
    }),
    prisma.verificationToken.deleteMany({
      where: {
        identifier: getVerificationAttemptIdentifier(input.phoneNumber),
      },
    }),
    prisma.smsOracleSubscriber.update({
      where: {
        userId: input.userId,
      },
      data: {
        isVerified: true,
        isActive: true,
      },
    }),
  ]);

  return true;
}

async function getSubscriberByPhoneNumber(
  phoneNumber: string
): Promise<SmsOracleSubscriberRecord | null> {
  return prisma.smsOracleSubscriber.findUnique({
    where: { phoneNumber },
    select: {
      id: true,
      userId: true,
      phoneNumber: true,
      isVerified: true,
      isActive: true,
      user: {
        select: {
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
          email: true,
        },
      },
    },
  });
}

async function getRecentMessages(subscriberId: string): Promise<SmsOracleRecentMessage[]> {
  return prisma.smsOracleMessage.findMany({
    where: { subscriberId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 3,
    select: {
      direction: true,
      content: true,
      createdAt: true,
    },
  });
}

async function saveMessage(
  subscriberId: string,
  direction: 'inbound' | 'outbound',
  content: string,
  createdAt?: Date
): Promise<void> {
  await prisma.smsOracleMessage.create({
    data: {
      subscriberId,
      direction,
      content,
      ...(createdAt ? { createdAt } : {}),
    },
  });
}

async function sendAndSaveMessage(
  subscriberId: string,
  to: string,
  content: string,
  createdAt?: Date
): Promise<void> {
  await sendSmsOracleMessage({
    to,
    text: content,
  });
  await saveMessage(subscriberId, 'outbound', content, createdAt);
}

async function getQuotaStatus(
  subscriberId: string,
  dateKey: string
): Promise<{ used: number; remaining: number }> {
  const quota = await prisma.smsOracleQuota.findUnique({
    where: {
      subscriberId_date: {
        subscriberId,
        date: getSeoulDayDate(dateKey),
      },
    },
    select: {
      replyCount: true,
    },
  });
  const used = quota?.replyCount ?? 0;

  return {
    used,
    remaining: Math.max(0, SMS_ORACLE_DAILY_REPLY_LIMIT - used),
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

async function consumeReplyQuota(subscriberId: string, dateKey: string): Promise<void> {
  const date = getSeoulDayDate(dateKey);

  const tryIncrement = async () => {
    const result = await prisma.smsOracleQuota.updateMany({
      where: {
        subscriberId,
        date,
        replyCount: {
          lt: SMS_ORACLE_DAILY_REPLY_LIMIT,
        },
      },
      data: {
        replyCount: {
          increment: 1,
        },
      },
    });

    return result.count === 1;
  };

  if (await tryIncrement()) {
    return;
  }

  try {
    await prisma.smsOracleQuota.create({
      data: {
        subscriberId,
        date,
        replyCount: 1,
      },
    });
    return;
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }
  }

  if (await tryIncrement()) {
    return;
  }

  throw new Error('SMS_ORACLE_DAILY_LIMIT');
}

async function wasDailyHookAlreadySent(subscriberId: string, dateKey: string): Promise<boolean> {
  const quota = await prisma.smsOracleQuota.findUnique({
    where: {
      subscriberId_date: {
        subscriberId,
        date: getSeoulDayDate(dateKey),
      },
    },
    select: {
      dailyHookSentAt: true,
    },
  });

  return Boolean(quota?.dailyHookSentAt);
}

async function markDailyHookSent(subscriberId: string, dateKey: string): Promise<void> {
  await prisma.smsOracleQuota.upsert({
    where: {
      subscriberId_date: {
        subscriberId,
        date: getSeoulDayDate(dateKey),
      },
    },
    create: {
      subscriberId,
      date: getSeoulDayDate(dateKey),
      replyCount: 0,
      dailyHookSentAt: new Date(),
    },
    update: {
      dailyHookSentAt: new Date(),
    },
  });
}

function buildTodayContext(
  birthContext: SmsOracleBirthContext | null,
  seed: string,
  dateKey: string
): SmsOracleTodayContext {
  const forecast = birthContext?.birthDate
    ? buildForecastSummary(birthContext.birthDate, dateKey)
    : null;

  return {
    dateKey,
    dayMaster: forecast?.dayMaster ?? null,
    forecastSummary:
      forecast?.summary ?? '출생 정보가 없어 오늘은 최근 고민과 현재 하늘 흐름 중심으로 읽습니다.',
    sajuSummary: buildSajuSummary(birthContext),
    astrologySummary: getCurrentAstrologySummary(),
    tarotSummary: buildEnergySummary(seed),
  };
}

async function generateInboundReply(input: {
  subscriber: SmsOracleSubscriberRecord;
  content: string;
  dateKey: string;
  birthContext: SmsOracleBirthContext | null;
  recentMessages: SmsOracleRecentMessage[];
}): Promise<string> {
  const todayContext = buildTodayContext(
    input.birthContext,
    `${input.subscriber.id}:${input.content}:${input.dateKey}`,
    input.dateKey
  );
  const systemPrompt = [
    '당신은 CosmicPath의 SMS Oracle입니다.',
    '반드시 한국어 평문으로만 답하고, 마크다운/불릿/이모지를 쓰지 마세요.',
    '문자 답장은 2~4문장, 280자 이내로 유지하세요.',
    '따뜻하지만 회피하지 말고, 사용자가 지금 무엇을 먼저 해야 하는지 한 걸음은 분명히 제안하세요.',
    '자해, 타해, 극단적 절망 신호가 보이면 운세 해석보다 즉시 주변 사람과 전문기관 도움 요청을 우선 권하세요.',
    `오늘 날짜: ${todayContext.dateKey}`,
    `사주 축: ${todayContext.sajuSummary}`,
    `오늘 운세: ${todayContext.forecastSummary}`,
    `현재 하늘: ${todayContext.astrologySummary}`,
    `타로: ${todayContext.tarotSummary}`,
    `최근 문자 맥락:\n${buildRecentMessageSummary(input.recentMessages)}`,
  ].join('\n');

  try {
    const response = await generateCompletion(systemPrompt, input.content, 'free');
    return truncateText(response.content.replace(/\s+/g, ' ').trim(), 280);
  } catch (error) {
    devLog.error('[SmsOracle] Failed to generate inbound reply', error);
    const prefix = todayContext.dayMaster
      ? `${todayContext.dayMaster} 일간 기준으로 오늘은 속도보다 정리가 우선입니다.`
      : '오늘은 답을 서두르기보다 핵심 한 가지를 먼저 정리하는 편이 좋습니다.';

    return truncateText(
      `${prefix} 지금 고민의 중심 문장을 한 줄로 다시 붙잡고, 가장 먼저 확인해야 할 사람이나 일정 하나만 정하세요. 흐름은 밤보다 오후에 더 또렷해집니다.`,
      280
    );
  }
}

async function generateDailyHookMessage(input: {
  subscriber: SmsOracleSubscriberRecord;
  dateKey: string;
  birthContext: SmsOracleBirthContext | null;
  recentMessages: SmsOracleRecentMessage[];
}): Promise<string> {
  const lastInbound = input.recentMessages.find((message) => message.direction === 'inbound');
  const todayContext = buildTodayContext(
    input.birthContext,
    `${input.subscriber.id}:${input.dateKey}:daily-hook`,
    input.dateKey
  );
  const userLabel = input.subscriber.user.email?.split('@')[0] ?? '오늘의 당신';
  const systemPrompt = [
    '당신은 CosmicPath SMS Oracle의 데일리 훅 작성자입니다.',
    '한국어 한 문장만 출력하세요.',
    '90자 이내로 유지하고, 최근 고민과 오늘의 흐름을 연결해 먼저 말을 거세요.',
    `사용자 표시 이름: ${userLabel}`,
    `최근 고민: ${lastInbound ? truncateText(lastInbound.content, 80) : '아직 없음'}`,
    `오늘 운세: ${todayContext.forecastSummary}`,
    `현재 하늘: ${todayContext.astrologySummary}`,
  ].join('\n');

  try {
    const response = await generateCompletion(systemPrompt, '오늘 아침 먼저 보낼 한 문장을 작성하세요.', 'free');
    return truncateText(response.content.replace(/\s+/g, ' ').trim(), 90);
  } catch (error) {
    devLog.error('[SmsOracle] Failed to generate daily hook', error);
    const recentTopic = lastInbound ? `"${truncateText(lastInbound.content, 22)}"` : '어제 마음에 남은 고민';
    return truncateText(
      `${recentTopic}을 오늘 흐름에 맞춰 다시 보면 결론이 더 선명해질 수 있어요. CosmicPath에서 오늘 신호를 확인해보세요.`,
      90
    );
  }
}

function hasActiveSmsOracleAccess(subscriber: SmsOracleSubscriberRecord): boolean {
  if (!subscriber.isActive || !subscriber.isVerified) {
    return false;
  }

  return isSubscriptionActive(
    subscriber.user.subscriptionStatus,
    subscriber.user.subscriptionExpiresAt
  );
}

export async function processSmsOracleInbound(
  payload: SmsOracleInboundWebhookPayload
): Promise<void> {
  if (!isSmsOracleInboundEnabled()) {
    devLog.warn('[SmsOracle] Ignoring inbound webhook because inbound mode is disabled.');
    return;
  }

  const from = normalizePhoneNumberToE164(payload.from);
  const content = truncateText(payload.content, 1000);

  if (!from) {
    devLog.error('[SmsOracle] Invalid inbound phone number', payload.from);
    return;
  }

  const subscriber = await getSubscriberByPhoneNumber(from);

  if (!subscriber) {
    await sendSmsOracleMessage({
      to: from,
      text: buildSubscriptionRequiredMessage(),
    });
    return;
  }

  const receivedAt = new Date(payload.receivedAt);
  const messageCreatedAt = Number.isNaN(receivedAt.getTime()) ? new Date() : receivedAt;
  await saveMessage(subscriber.id, 'inbound', content, messageCreatedAt);

  if (!subscriber.isActive || !subscriber.isVerified) {
    await sendAndSaveMessage(subscriber.id, subscriber.phoneNumber, buildInactiveSubscriberMessage());
    return;
  }

  if (!hasActiveSmsOracleAccess(subscriber)) {
    await sendAndSaveMessage(subscriber.id, subscriber.phoneNumber, buildSubscriptionRequiredMessage());
    return;
  }

  const dateKey = getSeoulDateKey(messageCreatedAt);
  const quota = await getQuotaStatus(subscriber.id, dateKey);

  if (quota.remaining <= 0) {
    await sendAndSaveMessage(subscriber.id, subscriber.phoneNumber, buildQuotaExceededMessage());
    return;
  }

  const [birthContext, recentMessages] = await Promise.all([
    getLatestBirthContext(subscriber.userId),
    getRecentMessages(subscriber.id),
  ]);
  const reply = await generateInboundReply({
    subscriber,
    content,
    dateKey,
    birthContext,
    recentMessages,
  });

  await sendSmsOracleMessage({
    to: subscriber.phoneNumber,
    text: reply,
  });
  await Promise.all([
    consumeReplyQuota(subscriber.id, dateKey),
    saveMessage(subscriber.id, 'outbound', reply),
  ]);
}

export async function runSmsOracleDailyHook(input?: {
  targetDate?: string;
}): Promise<SmsOracleDailyHookSummary> {
  const dateKey = input?.targetDate ?? getSeoulDateKey();
  const subscribers = await prisma.smsOracleSubscriber.findMany({
    where: {
      isActive: true,
      isVerified: true,
    },
    select: {
      id: true,
      userId: true,
      phoneNumber: true,
      isVerified: true,
      isActive: true,
      user: {
        select: {
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
          email: true,
        },
      },
    },
  });
  const summary: SmsOracleDailyHookSummary = {
    dispatched: 0,
    failed: 0,
    skipped: 0,
  };

  for (const subscriber of subscribers) {
    if (!hasActiveSmsOracleAccess(subscriber)) {
      continue;
    }

    if (await wasDailyHookAlreadySent(subscriber.id, dateKey)) {
      summary.skipped += 1;
      continue;
    }

    try {
      const [birthContext, recentMessages] = await Promise.all([
        getLatestBirthContext(subscriber.userId),
        getRecentMessages(subscriber.id),
      ]);
      const hookMessage = await generateDailyHookMessage({
        subscriber,
        dateKey,
        birthContext,
        recentMessages,
      });

      await sendSmsOracleMessage({
        to: subscriber.phoneNumber,
        text: hookMessage,
      });
      await Promise.all([
        markDailyHookSent(subscriber.id, dateKey),
        saveMessage(subscriber.id, 'outbound', hookMessage),
      ]);
      summary.dispatched += 1;
    } catch (error) {
      summary.failed += 1;
      devLog.error('[SmsOracle] Daily hook failed', {
        subscriberId: subscriber.id,
        error,
      });
    }
  }

  return summary;
}
