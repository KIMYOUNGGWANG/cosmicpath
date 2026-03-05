-- CosmicPath v2.0 - Subscription columns for users table
-- Compatible with both public.users and public."User"

DO $$
DECLARE
    target_table text;
    status_constraint_name text;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'users'
    ) THEN
        target_table := 'public.users';
        status_constraint_name := 'users_subscription_status_check';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'User'
    ) THEN
        target_table := 'public."User"';
        status_constraint_name := 'user_subscription_status_check';
    ELSE
        RAISE EXCEPTION 'Target users table not found. Expected public.users or public."User".';
    END IF;

    EXECUTE format(
        'ALTER TABLE %s ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT ''free''',
        target_table
    );
    EXECUTE format(
        'ALTER TABLE %s ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz',
        target_table
    );
    EXECUTE format(
        'ALTER TABLE %s ADD COLUMN IF NOT EXISTS stripe_customer_id text',
        target_table
    );
    EXECUTE format(
        'ALTER TABLE %s ADD COLUMN IF NOT EXISTS stripe_subscription_id text',
        target_table
    );

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = status_constraint_name
    ) THEN
        EXECUTE format(
            'ALTER TABLE %s ADD CONSTRAINT %I CHECK (subscription_status IN (''free'', ''pro'', ''couple''))',
            target_table,
            status_constraint_name
        );
    END IF;

    EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_id_uidx ON %s (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL',
        target_table
    );
    EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_subscription_id_uidx ON %s (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL',
        target_table
    );
END $$;
