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

-- insert into public.pengguna(nama, email, role_id) values
-- ('admin', 'oranglain@gmail.com', '2');
--  
-- drop role if exists admin;
-- create role admin;
-- grant authenticated to admin;
-- update auth.users set role='admin' where email='oranglain@gmail.com';
