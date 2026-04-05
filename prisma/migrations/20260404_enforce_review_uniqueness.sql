-- CosmicPath stability hardening
-- Enforce one review per reading at the DB layer

DO $$
DECLARE
    review_table text;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'Review'
    ) THEN
        review_table := 'public."Review"';
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'review'
    ) THEN
        review_table := 'public.review';
    ELSE
        RAISE EXCEPTION 'Target review table not found. Expected public."Review" or public.review.';
    END IF;

    -- Preserve already-approved content first, then oldest review if duplicates exist.
    EXECUTE format(
        'WITH ranked AS (
            SELECT
                id,
                row_number() OVER (
                    PARTITION BY "readingId"
                    ORDER BY "isApproved" DESC, "createdAt" ASC, id ASC
                ) AS row_num
            FROM %s
            WHERE "readingId" IS NOT NULL
        )
        DELETE FROM %s target
        USING ranked
        WHERE target.id = ranked.id
          AND ranked.row_num > 1',
        review_table,
        review_table
    );

    EXECUTE format(
        'CREATE UNIQUE INDEX IF NOT EXISTS review_reading_id_uidx
         ON %s ("readingId")
         WHERE "readingId" IS NOT NULL',
        review_table
    );
END $$;
