alter table "public"."pengguna" drop constraint "profiles_username_key";

drop index if exists "public"."profiles_username_key";

create policy "authenticated users can see if they can borrow"
on "public"."peminjaman_state"
as permissive
for select
to authenticated
using (true);


create policy "Allow all for admin"
on "public"."pengguna_roles"
as permissive
for all
to authenticated
using (true)
with check ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text));


create policy "Allow users to read roles"
on "public"."pengguna_roles"
as permissive
for select
to authenticated
using (true);



