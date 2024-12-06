DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    where table_name='pengguna' AND column_name='phone_no'
  ) THEN
    alter table "public"."pengguna" add column "phone_no" text;
  END IF;
END $$;
