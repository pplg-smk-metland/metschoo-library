DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns 
    WHERE table_name='buku' AND column_name='image'
  ) THEN
    alter table "public"."buku" add column "image" text;
  END IF;
END $$;
