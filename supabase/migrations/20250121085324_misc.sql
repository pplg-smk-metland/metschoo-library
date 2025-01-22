alter table "public"."wishlist" drop constraint "wishlist_id_key";

drop index if exists "public"."wishlist_id_key";

alter table "public"."peminjaman" drop constraint "peminjaman_no_isbn_fkey";

alter table "public"."peminjaman" drop constraint "peminjaman_user_id_fkey";

alter table "public"."pengguna" drop constraint "pengguna_role_id_fkey";

set check_function_bodies = off;

drop function public.check_out_users();

CREATE OR REPLACE FUNCTION public.check_out_users()
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$begin
with users_who_forgot_to_check_out as(
  select
        user_id::uuid,
        count(event) % 2 <> 0 as forgot
  from kunjungan
  where
        timestamp > (now() - interval '1 day')
  group by (user_id)
)
insert into kunjungan(user_id, event)
        select
        user_id::uuid,
        'check_out' as check_in
        from users_who_forgot_to_check_out
        where forgot = true
        returning forgot;
end;$function$
;


alter table "public"."peminjaman" add constraint "peminjaman_no_isbn_fkey" FOREIGN KEY (no_isbn) REFERENCES buku(no_isbn) ON UPDATE CASCADE not valid;

alter table "public"."peminjaman" validate constraint "peminjaman_no_isbn_fkey";

alter table "public"."peminjaman" add constraint "peminjaman_user_id_fkey" FOREIGN KEY (user_id) REFERENCES pengguna(user_id) ON UPDATE RESTRICT ON DELETE CASCADE not valid;

alter table "public"."peminjaman" validate constraint "peminjaman_user_id_fkey";

alter table "public"."pengguna" add constraint "pengguna_role_id_fkey" FOREIGN KEY (role_id) REFERENCES pengguna_roles(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."pengguna" validate constraint "pengguna_role_id_fkey";

