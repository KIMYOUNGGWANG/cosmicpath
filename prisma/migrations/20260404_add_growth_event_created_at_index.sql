-- CosmicPath stability hardening
-- Add a createdAt index for growth summary range scans

DO $$
DECLARE
    growth_event_table text;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'GrowthEvent'
    ) THEN
        growth_event_table := 'public."GrowthEvent"';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'growth_event'
    ) THEN
        growth_event_table := 'public.growth_event';
    ELSE
        RAISE EXCEPTION 'Target growth event table not found. Expected public."GrowthEvent" or public.growth_event.';
    END IF;

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS growth_event_created_at_idx ON %s ("createdAt")',
        growth_event_table
    );
END $$;
