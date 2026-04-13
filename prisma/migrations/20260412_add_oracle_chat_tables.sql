-- Grand Oracle Chat MVP
-- Add chat room, message, and daily quota tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "OracleChatRoom" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OracleChatRoom_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OracleChatRoom_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OracleChatMessage" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "roomId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "councilData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OracleChatMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OracleChatMessage_roomId_fkey"
        FOREIGN KEY ("roomId") REFERENCES "OracleChatRoom"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OracleChatQuota" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OracleChatQuota_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OracleChatQuota_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OracleChatRoom_userId_updatedAt_idx"
    ON "OracleChatRoom" ("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "OracleChatMessage_roomId_createdAt_idx"
    ON "OracleChatMessage" ("roomId", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "OracleChatQuota_userId_date_key"
    ON "OracleChatQuota" ("userId", "date");

CREATE INDEX IF NOT EXISTS "OracleChatQuota_userId_date_idx"
    ON "OracleChatQuota" ("userId", "date");
