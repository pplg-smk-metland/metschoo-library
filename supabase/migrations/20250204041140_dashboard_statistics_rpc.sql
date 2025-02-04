CREATE OR REPLACE FUNCTION public.dashboard_statistics()
 RETURNS record
 LANGUAGE plpgsql
AS $function$DECLARE result RECORD;
BEGIN
with pengguna_count_table as (
  select count(user_id) as pengguna_count, 1 as a from pengguna
),
buku_count_table as (
  select count(no_isbn) as buku_count, 1 as a from buku
),
peminjaman_count_table as (
  with latest_state as (
        select distinct
          on (pd.peminjaman_id) pd.id,
          pd.created_at,
          pd.peminjaman_id,
          pd.state_id
        from
          peminjaman_detail pd
        order by
          pd.peminjaman_id,
          pd.created_at desc
      )
    select
    1 as a,
      count(p.no_isbn) as peminjaman_count
    from
      peminjaman p
      left join latest_state ls on p.id = ls.peminjaman_id
    where
      ls.state_id = any (array[1::bigint, 2::bigint])
)
select pengguna_count, buku_count, peminjaman_count
from pengguna_count_table pe
inner join buku_count_table b on pe.a = b.a
inner join peminjaman_count_table pc on pc.a = b.a
into result;
return result;
END;$function$
;

create policy "Enable delete for admin"
on "public"."buku"
as permissive
for delete
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));
