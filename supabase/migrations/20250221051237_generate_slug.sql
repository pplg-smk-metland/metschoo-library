alter table "public"."buku" drop constraint "buku_no_isbn_key";

drop index if exists "public"."buku_no_isbn_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  NEW.slug := CONCAT(slugify(NEW.judul), '-' || NEW.id);
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.slugify(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
SELECT lower(regexp_replace($1, '[^a-zA-Z0-9]+', '-', 'g'))
$function$
;

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

create policy "Enable delete for admin"
on "public"."buku"
as permissive
for delete
to authenticated
using (( SELECT is_super_admin() AS is_super_admin));


CREATE TRIGGER set_buku_slug BEFORE INSERT OR UPDATE ON public.buku FOR EACH ROW EXECUTE FUNCTION set_slug();
