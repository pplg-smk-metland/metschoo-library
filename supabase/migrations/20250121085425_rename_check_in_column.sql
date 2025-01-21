alter table "public"."kunjungan" drop column "check_in";

alter table "public"."kunjungan" add column "timestamp" timestamp with time zone not null default now();

alter table "public"."pengguna" add column "rfid" text;

