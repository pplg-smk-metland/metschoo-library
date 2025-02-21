alter table "public"."peminjaman" drop constraint "peminjaman_no_isbn_fkey";

alter table "public"."wishlist" drop constraint "wishlist_no_isbn_fkey";

alter table "public"."buku" drop constraint "buku_pkey";

drop index if exists "public"."buku_pkey";

-- add id first, alter dependent objects then change 
-- references to no_isbn column to id instead

alter table "public"."buku" add column "id" uuid not null default gen_random_uuid();

drop view if exists "public"."actual_buku";
create or replace view "public"."actual_buku" as  
SELECT 
    b.id,
    b.slug,
    b.no_isbn,
    b.penulis,
    b.judul,
    b.penerbit,
    b.tahun_terbit,
    b.alamat_terbit,
    b.asal,
    b.image,
    b.kategori_id,
    b.jumlah_exspl,
    COALESCE(bb.count, (0)::bigint) AS jumlah_dipinjam,
    (COALESCE(b.jumlah_exspl, (0)::bigint) - COALESCE(bb.count, (0)::bigint)) AS jumlah_exspl_aktual
   FROM (buku b
     LEFT JOIN ( WITH latest_state AS (
                 SELECT DISTINCT ON (pd.peminjaman_id) pd.id,
                    pd.created_at,
                    pd.peminjaman_id,
                    pd.state_id
                   FROM peminjaman_detail pd
                  ORDER BY pd.peminjaman_id, pd.created_at DESC
                )
         SELECT p.id,
            count(p.id) AS count
           FROM (peminjaman p
             LEFT JOIN latest_state ls ON ((p.id = ls.peminjaman_id)))
          WHERE (ls.state_id = ANY (ARRAY[(1)::bigint, (2)::bigint]))
          GROUP BY p.id) bb ON ((bb.id = b.id)));

set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.dashboard_statistics()
 RETURNS record
 LANGUAGE plpgsql
AS $function$DECLARE result RECORD;
BEGIN
with pengguna_count_table as (
  select count(user_id) as pengguna_count, 1 as a from pengguna
),
buku_count_table as (
  select count(id) as buku_count, 1 as a from buku
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
      count(p.buku_id) as peminjaman_count
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

-- then we can drop no_isbn
alter table "public"."peminjaman" drop column "no_isbn";

alter table "public"."peminjaman" add column "buku_id" uuid not null;

-- buku can have no ISBN for some heinous reason 
alter table "public"."buku" alter column "no_isbn" set default '-'::text;

alter table "public"."wishlist" drop column "no_isbn";

alter table "public"."wishlist" add column "buku_id" uuid not null;

CREATE UNIQUE INDEX buku_pkey ON public.buku USING btree (id);

alter table "public"."buku" add constraint "buku_pkey" PRIMARY KEY using index "buku_pkey";

alter table "public"."peminjaman" add constraint "peminjaman_buku_id_fkey" FOREIGN KEY (buku_id) REFERENCES buku(id) ON UPDATE CASCADE not valid;

alter table "public"."peminjaman" validate constraint "peminjaman_buku_id_fkey";

alter table "public"."wishlist" add constraint "wishlist_buku_id_fkey" FOREIGN KEY (buku_id) REFERENCES buku(id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."wishlist" validate constraint "wishlist_buku_id_fkey";
