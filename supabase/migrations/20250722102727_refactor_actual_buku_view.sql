-- recreates actual_buku view
-- the previous version has wrong logic for computing actual buku amount 
drop view if exists actual_buku;

create view actual_buku as (
with borrowed_books as (
  -- latest_state grabs the latest state of all peminjaman entries
  with latest_state as (
    select distinct on (pd.peminjaman_id) pd.id,
      pd.created_at,
      pd.peminjaman_id,
      pd.state_id
    from peminjaman_detail pd
    order by pd.peminjaman_id, pd.created_at desc
  ) select
  p.id,
  p.buku_id,
  -- count of how many are currently borrowed (either pending or confirmed, see below where statement)
  count(p.id) as count
  from peminjaman p
  left join latest_state ls
    on ((p.id = ls.peminjaman_id))
    -- select only bukus that are either `borrow pending` or `return confirmed`
  where
    ls.state_id = any (array[1, 2])
  group by p.id
) select
  b.id,
  b.slug,
  b.no_isbn,
  b.penulis,
  b.penerbit,
  b.tahun_terbit,
  b.asal,
  b.jumlah_exspl,
  coalesce(counts.borrowed_count, 0) as jumlah_dipinjam,
  coalesce(b.jumlah_exspl - counts.borrowed_count, 0) as jumlah_exspl_aktual
from buku b
left join (
  select
  bb.buku_id,
  count(*) as borrowed_count
  from borrowed_books bb
  group by bb.buku_id
) counts on b.id = counts.buku_id
);
