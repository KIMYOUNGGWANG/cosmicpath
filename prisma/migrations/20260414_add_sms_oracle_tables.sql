-- SMS Oracle MVP Step 1
-- Add subscriber, message, and daily quota tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "SmsOracleSubscriber" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsOracleSubscriber_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SmsOracleSubscriber_userId_key" UNIQUE ("userId"),
    CONSTRAINT "SmsOracleSubscriber_phoneNumber_key" UNIQUE ("phoneNumber"),
    CONSTRAINT "SmsOracleSubscriber_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SmsOracleMessage" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "subscriberId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsOracleMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SmsOracleMessage_subscriberId_fkey"
        FOREIGN KEY ("subscriberId") REFERENCES "SmsOracleSubscriber"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SmsOracleQuota" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "subscriberId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "dailyHookSentAt" TIMESTAMP(3),

    CONSTRAINT "SmsOracleQuota_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SmsOracleQuota_subscriberId_fkey"
        FOREIGN KEY ("subscriberId") REFERENCES "SmsOracleSubscriber"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SmsOracleMessage_subscriberId_createdAt_idx"
    ON "SmsOracleMessage" ("subscriberId", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "SmsOracleQuota_subscriberId_date_key"
    ON "SmsOracleQuota" ("subscriberId", "date");

CREATE INDEX IF NOT EXISTS "SmsOracleQuota_subscriberId_date_idx"
    ON "SmsOracleQuota" ("subscriberId", "date");
