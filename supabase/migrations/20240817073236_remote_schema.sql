drop view if exists "public"."distinct_riwayat";

create or replace view "public"."peminjaman_history" as  SELECT peminjaman.tenggat_waktu,
    peminjaman.tgl_pinjam,
    peminjaman.tgl_kembali,
    peminjaman.state_id,
    peminjaman_state.name AS peminjaman_state,
    buku.*::buku AS buku
   FROM ((peminjaman
     JOIN buku ON ((peminjaman.no_isbn = buku.no_isbn)))
     JOIN peminjaman_state ON ((peminjaman.state_id = peminjaman_state.id)))
  WHERE ((peminjaman.state_id = ANY (ARRAY[5, 6])) AND (auth.uid() = peminjaman.user_id));



