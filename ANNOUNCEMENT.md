# Announcement

Selamat pagi/siang/sore/malam buat temen-temen semua,

Aplikasi Metschoo Library sekarang sudah masuk dalam tahap alpha testing.
Temen-temen yang ingin menguji aplikasinya bisa melakukannya dengan dua cara:

1. paling mudah dan cepat, langsung menuju ke
   `https://metschoo-lib-preview.netlify.app`: Dengan metode ini kamu langsung
   berinteraksi dengan data yang sudah dihosting di Supabase. tapi perlu dicatat
   bahwa buku yang dipinjam ga akan langsung diapprove untuk keperluan testing.
2. Pengembangan lokal dengan CLI supabase atau instance Supabase yang dihosting:
   kamu bisa menjalankan aplikasi [dengan CLI Supabase](https://supabase.com/docs/guides/cli/local-development)
   (membutuhkan Docker) atau buat projek supabase sendiri dengan skema yang
   identik dengan Metschoo Library. [Lihat DEVELOPMENT](DEVELOPMENT.md) untuk
   mempelajari lebih lanjut.

Kalau ada temen-temen yang ingin menguji beberapa fitur boleh banget:

**auth**

- ~verifikasi email (untuk sementara tidak dulu karena masalah terkait SMTP)~
- ~ganti password (untuk sementara tidak dulu karena alasan yang sama)~
- log in
- log out

**wishlist**

- tambah buku
- hapus buku

_peminjaman_

- pinjam buku
- batalkan peminjaman buku
- konfirmasi buku (admin)
- kembalikan buku
- konfirmasi pengembalian buku (admin)

- riwayat peminjaman

**search**

- mencari buku

Nanti bisa buat issue di repo Github aplikasi ini
(https://github.com/pplg-smk-metland/metschoo-library) dengan template yang
tersedia ya. Kalau ga ada akun Github juga gapapa, bisa kontak gua secara
langsung biar dicatat kalau kamu berkontribusi menguji sebuah fitur (dan
menemukan bug kalau ada).
