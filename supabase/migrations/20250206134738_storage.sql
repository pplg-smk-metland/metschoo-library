set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
    select string_to_array(name, '/') into _parts;
    select _parts[array_length(_parts,1)] into _filename;
    -- @todo return the last part instead of 2
    return split_part(_filename, '.', 2);
END
$function$
;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
END
$function$
;

grant delete on table "storage"."s3_multipart_uploads" to "postgres";

grant insert on table "storage"."s3_multipart_uploads" to "postgres";

grant references on table "storage"."s3_multipart_uploads" to "postgres";

grant select on table "storage"."s3_multipart_uploads" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads" to "postgres";

grant update on table "storage"."s3_multipart_uploads" to "postgres";

grant delete on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant insert on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant references on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant select on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant update on table "storage"."s3_multipart_uploads_parts" to "postgres";

create policy "Give all users access to all images in /public 18mjh_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'Buku'::text) AND (lower((storage.foldername(name))[1]) = 'public'::text)));


create policy "Give users authenticated access to folder 18mjh_0"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'Buku'::text) AND (auth.role() = 'authenticated'::text) AND (( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text)));


create policy "Give users authenticated access to folder 18mjh_1"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'Buku'::text) AND (auth.role() = 'authenticated'::text) AND (( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text)));


create policy "Give users authenticated access to folder 18mjh_2"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'Buku'::text) AND (auth.role() = 'authenticated'::text) AND (( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text)));


create policy "Give users authenticated access to folder 18mjh_3"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'Buku'::text) AND (auth.role() = 'authenticated'::text) AND (( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text)));
