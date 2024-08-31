insert into public.kategori_buku (kategori) values
('paket'),
('koleksi');

insert into public.peminjaman_state (name) values
('borrow pending'),
('borrow confirmed'),
('borrow cancelled'),
('return pending'),
('return confirmed'),
('return late'),
('return cancelled');

insert into public.pengguna_roles (name) values
('user'),
('admin');

