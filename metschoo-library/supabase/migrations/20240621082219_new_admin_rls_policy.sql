--Found drop statements in schema diff. Please double check if these are expected:
drop policy if exists "Enable all for admin" on "public"."buku";
drop policy if exists "enable all for admin" on "public"."buku";
drop policy if exists "Enable all actions for admin" on "public"."kategori_buku";
drop policy if exists "Enable all for admin" on "public"."peminjaman";
drop policy if exists "Full access for admin" on "public"."pengguna";
drop policy if exists "Enable all for admin" on "public"."wishlist";

create policy "enable all for admin"
on "public"."buku"
as permissive
for all
to public
using (true)
with check ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text
)) ? 'super-admin'::text));


create policy "Enable all actions for admin"
on "public"."kategori_buku"
as permissive
for all
to authenticated
using (true);


create policy "Enable all for admin"
on "public"."peminjaman"
as permissive
for all
to authenticated
using (true)
with check ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text
)) ? 'super-admin'::text));


create policy "Full access for admin"
on "public"."pengguna"
as permissive
for all
to authenticated
using (true)
with check ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text
)) ? 'super-admin'::text));


create policy "Enable all for admin"
on "public"."wishlist"
as permissive
for all
to authenticated
using (true)
with check ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text
)) ? 'super-admin'::text));

