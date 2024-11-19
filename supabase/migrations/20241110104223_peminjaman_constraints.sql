alter table "public"."peminjaman"
drop constraint "peminjaman_no_isbn_fkey";

alter table "public"."peminjaman"
drop constraint "peminjaman_state_id_fkey";

alter table "public"."peminjaman"
drop constraint "peminjaman_user_id_fkey";

alter table "public"."peminjaman"
add constraint "peminjaman_no_isbn_fkey" 
FOREIGN KEY (no_isbn) REFERENCES buku(no_isbn)
ON UPDATE RESTRICT
ON DELETE RESTRICT not valid;

alter table "public"."peminjaman"
validate constraint "peminjaman_no_isbn_fkey";

alter table "public"."peminjaman"
add constraint "peminjaman_state_id_fkey" 
FOREIGN KEY (state_id) REFERENCES peminjaman_state(id)
ON UPDATE CASCADE
ON DELETE RESTRICT not valid;

alter table "public"."peminjaman"
validate constraint "peminjaman_state_id_fkey";

alter table "public"."peminjaman"
add constraint "peminjaman_user_id_fkey" 
FOREIGN KEY (user_id) REFERENCES pengguna(user_id)
ON UPDATE CASCADE
ON DELETE SET DEFAULT not valid;

alter table "public"."peminjaman"
validate constraint "peminjaman_user_id_fkey";
