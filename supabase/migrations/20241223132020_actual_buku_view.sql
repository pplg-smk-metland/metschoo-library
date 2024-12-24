drop trigger if exists "on_peminjaman_state_change" on "public"."peminjaman_detail";

drop function if exists "public"."update_buku_exspl"();

create or replace view "public"."actual_buku" as
SELECT b.no_isbn,
    b.penulis,
    b.judul,
    b.penerbit,
    b.tahun_terbit,
    b.alamat_terbit,
    b.asal,
    b.image,
    b.kategori_id,
    b.jumlah_exspl,
    coalesce(bb.count, 0) AS jumlah_dipinjam,
    (coalesce(b.jumlah_exspl, 0) - coalesce(bb.count, 0)) AS jumlah_exspl_aktual
   FROM (buku b
     LEFT JOIN ( WITH latest_state AS (
                 SELECT DISTINCT ON (pd.peminjaman_id) pd.id,
                    pd.created_at,
                    pd.peminjaman_id,
                    pd.state_id
                   FROM peminjaman_detail pd
                  ORDER BY pd.peminjaman_id, pd.created_at DESC
                )
         SELECT p.no_isbn,
            count(p.no_isbn) AS count
           FROM (peminjaman p
             LEFT JOIN latest_state ls ON ((p.id = ls.peminjaman_id)))
          WHERE (ls.state_id = ANY (ARRAY[(1)::bigint, (2)::bigint]))
          GROUP BY p.no_isbn) bb ON ((bb.no_isbn = b.no_isbn)));

