alter table "public"."buku" add column "slug" text not null default '-'::text;

CREATE UNIQUE INDEX buku_slug_key ON public.buku USING btree (slug);

alter table "public"."buku" add constraint "buku_slug_key" UNIQUE using index "buku_slug_key";
