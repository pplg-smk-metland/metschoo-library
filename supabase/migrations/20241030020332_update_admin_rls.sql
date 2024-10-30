drop policy "Enable all for admin" on "public"."peminjaman";

drop policy "Full access for admin" on "public"."pengguna";

drop policy "Users can insert their own profile." on "public"."pengguna";

drop policy "Users can update own profile." on "public"."pengguna";

drop policy "user can only access own profile" on "public"."pengguna";

drop policy "Allow all for admin" on "public"."pengguna_roles";

create policy "Enable all for admin"
on "public"."peminjaman"
as permissive
for all
to authenticated
using ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text))
with check (true);


create policy "Full access for admin"
on "public"."pengguna"
as permissive
for all
to authenticated
using ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text))
with check (true);


create policy "Users can insert their own profile."
on "public"."pengguna"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can update own profile."
on "public"."pengguna"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "user can only access own profile"
on "public"."pengguna"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Allow all for admin"
on "public"."pengguna_roles"
as permissive
for all
to authenticated
using ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text))
with check (false);
