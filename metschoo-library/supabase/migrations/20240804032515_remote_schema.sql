drop policy "Enable all for admin" on "public"."wishlist";

create policy "Enable admin to do whatever"
on "public"."wishlist"
as permissive
for all
to authenticated
using ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text));



