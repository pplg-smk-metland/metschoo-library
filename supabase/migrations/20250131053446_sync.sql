-- add unique constraint on pengguna.rfid column
CREATE UNIQUE INDEX pengguna_rfid_key ON public.pengguna USING btree (rfid);

alter table "public"."pengguna" add constraint "pengguna_rfid_key" UNIQUE using index "pengguna_rfid_key";

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

create policy "admin can update request status"
on "public"."book_requests"
as permissive
for update
to authenticated
using (is_super_admin());
