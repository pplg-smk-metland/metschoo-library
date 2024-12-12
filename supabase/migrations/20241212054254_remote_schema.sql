drop policy "enable all for admin" on "public"."buku";

drop policy "Enable all actions for admin" on "public"."kategori_buku";

drop policy "Enable all for admin" on "public"."peminjaman";

drop policy "Enable update for users based on email" on "public"."peminjaman";

drop policy "enable all for admin" on "public"."peminjaman_detail";

drop policy "Allow all for admin" on "public"."pengguna_roles";

drop policy "Users can only read their own data" on "public"."peminjaman";

drop policy "enable users to view their own data only" on "public"."peminjaman_detail";

drop policy "Full access for admin" on "public"."pengguna";

drop policy "Users can insert their own profile." on "public"."pengguna";

drop policy "Users can update own profile." on "public"."pengguna";

drop policy "user can only access own profile" on "public"."pengguna";

drop policy "Enable admin to do whatever" on "public"."wishlist";

drop policy "Enable delete for users based on user_id" on "public"."wishlist";

drop policy "users can only read their own wishlist" on "public"."wishlist";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
    jwt_payload json;
begin
    -- Check if the role is 'super-admin'
    return ((select auth.jwt() as jwt)->'app_metadata'->'role') ? 'super-admin'::text;
end;
$function$
;

create policy "admin can insert new books"
on "public"."buku"
as permissive
for insert
to authenticated
with check (is_super_admin());


create policy "admin can update existing books"
on "public"."buku"
as permissive
for update
to authenticated
using (is_super_admin());


create policy "admin can create new categories"
on "public"."kategori_buku"
as permissive
for insert
to public
with check (is_super_admin());


create policy "admin can delete categories"
on "public"."kategori_buku"
as permissive
for delete
to public
using (is_super_admin());


create policy "admin can update categories"
on "public"."kategori_buku"
as permissive
for update
to public
using (is_super_admin());


create policy "admin can see all peminjaman data"
on "public"."peminjaman"
as permissive
for select
to authenticated
using (is_super_admin());


create policy "admin can update peminjaman data"
on "public"."peminjaman"
as permissive
for update
to authenticated
using (is_super_admin());


create policy "admin can see every history"
on "public"."peminjaman_detail"
as permissive
for select
to authenticated
using (is_super_admin());


create policy "admin can create new roles"
on "public"."pengguna_roles"
as permissive
for insert
to authenticated
with check (is_super_admin());


create policy "admin can delete roles"
on "public"."pengguna_roles"
as permissive
for delete
to authenticated
using (is_super_admin());


create policy "admin can update existing role"
on "public"."pengguna_roles"
as permissive
for update
to authenticated
using (is_super_admin());


create policy "Users can only read their own data"
on "public"."peminjaman"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "enable users to view their own data only"
on "public"."peminjaman_detail"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT p.id
   FROM peminjaman p
  WHERE ((p.id = peminjaman_detail.peminjaman_id) AND (p.user_id = ( SELECT auth.uid() AS uid)))
 LIMIT 1)));


create policy "Full access for admin"
on "public"."pengguna"
as permissive
for all
to authenticated
using ((((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) -> 'role'::text) ? 'super-admin'::text))
with check (true);


create policy "Users can insert their own profile."
on "public"."pengguna"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can update own profile."
on "public"."pengguna"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "user can only access own profile"
on "public"."pengguna"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable admin to do whatever"
on "public"."wishlist"
as permissive
for all
to authenticated
using ((((( SELECT auth.jwt() AS jwt) -> 'app_metadata'::text) -> 'role'::text) ? 'super-admin'::text));


create policy "Enable delete for users based on user_id"
on "public"."wishlist"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "users can only read their own wishlist"
on "public"."wishlist"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



