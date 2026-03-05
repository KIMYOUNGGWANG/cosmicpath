-- CosmicPath v2.0 - Referral program schema
-- Adds referral_code to users and creates referrals table

DO $$
DECLARE
    user_table text;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'users'
    ) THEN
        user_table := 'public.users';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'User'
    ) THEN
        user_table := 'public."User"';
    ELSE
        RAISE EXCEPTION 'Target users table not found. Expected public.users or public."User".';
    END IF;

    EXECUTE format(
        'ALTER TABLE %s ADD COLUMN IF NOT EXISTS referral_code text',
        user_table
    );

    EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_uidx ON %s (referral_code) WHERE referral_code IS NOT NULL',
        user_table
    );
END $$;

CREATE TABLE IF NOT EXISTS public.referrals (
    id text PRIMARY KEY,
    referral_code text NOT NULL,
    inviter_user_id text NOT NULL,
    invitee_user_id text NOT NULL,
    redeemed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals
    ADD COLUMN IF NOT EXISTS referral_code text,
    ADD COLUMN IF NOT EXISTS inviter_user_id text,
    ADD COLUMN IF NOT EXISTS invitee_user_id text,
    ADD COLUMN IF NOT EXISTS redeemed_at timestamptz,
    ADD COLUMN IF NOT EXISTS created_at timestamptz;

ALTER TABLE public.referrals
    ALTER COLUMN referral_code SET NOT NULL,
    ALTER COLUMN inviter_user_id SET NOT NULL,
    ALTER COLUMN invitee_user_id SET NOT NULL;

ALTER TABLE public.referrals
    ALTER COLUMN redeemed_at SET DEFAULT now(),
    ALTER COLUMN created_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS referrals_inviter_user_id_idx
    ON public.referrals (inviter_user_id);

CREATE INDEX IF NOT EXISTS referrals_referral_code_idx
    ON public.referrals (referral_code);

CREATE UNIQUE INDEX IF NOT EXISTS referrals_invitee_user_id_uidx
    ON public.referrals (invitee_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS referrals_referral_code_invitee_user_id_uidx
    ON public.referrals (referral_code, invitee_user_id);

DO $$
DECLARE
    user_table text;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'users'
    ) THEN
        user_table := 'public.users';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'User'
    ) THEN
        user_table := 'public."User"';
    ELSE
        RAISE EXCEPTION 'Target users table not found. Expected public.users or public."User".';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'referrals_inviter_user_id_fkey'
    ) THEN
        EXECUTE format(
            'ALTER TABLE public.referrals
             ADD CONSTRAINT referrals_inviter_user_id_fkey
             FOREIGN KEY (inviter_user_id) REFERENCES %s(id) ON DELETE CASCADE',
            user_table
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'referrals_invitee_user_id_fkey'
    ) THEN
        EXECUTE format(
            'ALTER TABLE public.referrals
             ADD CONSTRAINT referrals_invitee_user_id_fkey
             FOREIGN KEY (invitee_user_id) REFERENCES %s(id) ON DELETE CASCADE',
            user_table
        );
    END IF;
END $$;
