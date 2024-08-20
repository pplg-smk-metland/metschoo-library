drop view if exists public.distinct_riwayat;

-- new
create or replace view public.distinct_riwayat with ("security_invoker" = 'on') as
  select distinct "peminjaman".state_id,
    "buku".*::"public"."buku" AS "buku"
  from (public."peminjaman"
    join public."buku"
      on ("peminjaman".no_isbn = "buku".no_isbn))
  where peminjaman.state_id = ANY(ARRAY[5, 6]) and (auth.uid() = peminjaman.user_id);
