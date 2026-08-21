-- SajuMind Tables and User Extension Migration
-- Idempotent SQL Migration

-- 1. Extend User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "birthDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "birthTime" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "birthCity" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dayMaster" TEXT;

-- 2. Create sajumind_checkins
CREATE TABLE IF NOT EXISTS "sajumind_checkins" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "guestId" TEXT,
  "emotion" TEXT NOT NULL,
  "tags" TEXT NOT NULL,
  "note" TEXT,
  "dayMaster" TEXT,
  "dailyPillar" TEXT,
  "aiFeedback" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sajumind_checkins_pkey" PRIMARY KEY ("id")
);

-- 3. Create sajumind_decisions
CREATE TABLE IF NOT EXISTS "sajumind_decisions" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "guestId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sajuSnapshot" TEXT,
  "outcomeNote" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "decidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sajumind_decisions_pkey" PRIMARY KEY ("id")
);

-- 4. Create sajumind_reports
CREATE TABLE IF NOT EXISTS "sajumind_reports" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "guestId" TEXT,
  "type" TEXT NOT NULL DEFAULT 'weekly',
  "content" TEXT NOT NULL,
  "dominantMood" TEXT,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sajumind_reports_pkey" PRIMARY KEY ("id")
);

-- 5. Foreign Keys
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sajumind_checkins_userId_fkey') THEN
    ALTER TABLE "sajumind_checkins" ADD CONSTRAINT "sajumind_checkins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sajumind_decisions_userId_fkey') THEN
    ALTER TABLE "sajumind_decisions" ADD CONSTRAINT "sajumind_decisions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sajumind_reports_userId_fkey') THEN
    ALTER TABLE "sajumind_reports" ADD CONSTRAINT "sajumind_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS "sajumind_checkins_userId_createdAt_idx" ON "sajumind_checkins"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "sajumind_checkins_guestId_createdAt_idx" ON "sajumind_checkins"("guestId", "createdAt");

CREATE INDEX IF NOT EXISTS "sajumind_decisions_userId_createdAt_idx" ON "sajumind_decisions"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "sajumind_decisions_guestId_createdAt_idx" ON "sajumind_decisions"("guestId", "createdAt");

CREATE INDEX IF NOT EXISTS "sajumind_reports_userId_createdAt_idx" ON "sajumind_reports"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "sajumind_reports_guestId_createdAt_idx" ON "sajumind_reports"("guestId", "createdAt");
