import { devLog } from '@/lib/dev-logger';

export interface SendSmsOracleMessageInput {
  to: string;
  text: string;
}

export interface SendSmsOracleMessageResult {
  provider: 'solapi';
  messageId: string | null;
}

interface SolapiMessageServiceInstance {
  send(message: {
    to: string;
    from: string;
    text: string;
  }): Promise<unknown>;
}

interface SolapiModuleShape {
  SolapiMessageService: new (
    apiKey: string,
    apiSecret: string
  ) => SolapiMessageServiceInstance;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function compactPhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

function toDomesticPhoneNumber(value: string): string {
  const normalized = compactPhoneNumber(value);

  if (normalized.startsWith('+82')) {
    return `0${normalized.slice(3)}`;
  }

  if (normalized.startsWith('82')) {
    return `0${normalized.slice(2)}`;
  }

  return normalized;
}

function getConfiguredFromNumber(): string {
  const fromNumber = process.env.SOLAPI_FROM_NUMBER?.trim();

  if (!fromNumber) {
    throw new Error('SOLAPI_FROM_NUMBER is not configured.');
  }

  return toDomesticPhoneNumber(fromNumber);
}

function getSolapiCredentials() {
  const apiKey = process.env.SOLAPI_API_KEY?.trim();
  const apiSecret = process.env.SOLAPI_API_SECRET?.trim();

  if (!apiKey || !apiSecret) {
    throw new Error('SOLAPI_API_KEY or SOLAPI_API_SECRET is not configured.');
  }

  return { apiKey, apiSecret };
}

function loadSolapiModule(): SolapiModuleShape {
  const runtimeRequire = Function('return require')() as (id: string) => unknown;
  const loadedModule = runtimeRequire('solapi');
  const record = asRecord(loadedModule);
  const service = record?.SolapiMessageService;

  if (typeof service !== 'function') {
    throw new Error('The `solapi` package is not available. Install it before enabling SMS delivery.');
  }

  return {
    SolapiMessageService: service as SolapiModuleShape['SolapiMessageService'],
  };
}

function extractMessageId(result: unknown): string | null {
  const record = asRecord(result);

  if (!record) {
    return null;
  }

  const directMessageId = record.messageId;
  if (typeof directMessageId === 'string' && directMessageId.trim()) {
    return directMessageId.trim();
  }

  const messageList = Array.isArray(record.messageList) ? record.messageList : [];
  const firstMessage = asRecord(messageList[0]);
  const nestedMessageId = firstMessage?.messageId;

  return typeof nestedMessageId === 'string' && nestedMessageId.trim()
    ? nestedMessageId.trim()
    : null;
}

export async function sendSmsOracleMessage(
  input: SendSmsOracleMessageInput
): Promise<SendSmsOracleMessageResult> {
  const { apiKey, apiSecret } = getSolapiCredentials();
  const fromNumber = getConfiguredFromNumber();
  const { SolapiMessageService } = loadSolapiModule();
  const messageService = new SolapiMessageService(apiKey, apiSecret);

  devLog.info('[SmsOracle] Sending SMS via Solapi', {
    to: input.to,
    length: input.text.length,
  });

  const result = await messageService.send({
    to: toDomesticPhoneNumber(input.to),
    from: fromNumber,
    text: input.text,
  });

  return {
    provider: 'solapi',
    messageId: extractMessageId(result),
  };
}
