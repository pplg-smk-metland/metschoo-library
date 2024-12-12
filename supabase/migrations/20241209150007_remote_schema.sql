alter table "public"."peminjaman" drop constraint "peminjaman_state_id_fkey";

alter table "public"."peminjaman" drop constraint "peminjaman_user_id_fkey";

drop view if exists "public"."peminjaman_history";

create table "public"."peminjaman_detail" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "peminjaman_id" uuid not null,
    "state_id" bigint not null
);


alter table "public"."peminjaman_detail" enable row level security;

alter table "public"."peminjaman" alter column "state_id" drop not null;

alter table "public"."peminjaman" alter column "tgl_pinjam" drop not null;

CREATE UNIQUE INDEX peminjaman_detail_pkey ON public.peminjaman_detail USING btree (id);

alter table "public"."peminjaman_detail" add constraint "peminjaman_detail_pkey" PRIMARY KEY using index "peminjaman_detail_pkey";

alter table "public"."peminjaman_detail" add constraint "peminjaman_detail_peminjaman_id_fkey" FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."peminjaman_detail" validate constraint "peminjaman_detail_peminjaman_id_fkey";

alter table "public"."peminjaman_detail" add constraint "peminjaman_detail_state_id_fkey" FOREIGN KEY (state_id) REFERENCES peminjaman_state(id) not valid;

alter table "public"."peminjaman_detail" validate constraint "peminjaman_detail_state_id_fkey";

alter table "public"."peminjaman" add constraint "peminjaman_user_id_fkey" FOREIGN KEY (user_id) REFERENCES pengguna(user_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."peminjaman" validate constraint "peminjaman_user_id_fkey";

grant delete on table "public"."peminjaman_detail" to "anon";

grant insert on table "public"."peminjaman_detail" to "anon";

grant references on table "public"."peminjaman_detail" to "anon";

grant select on table "public"."peminjaman_detail" to "anon";

grant trigger on table "public"."peminjaman_detail" to "anon";

grant truncate on table "public"."peminjaman_detail" to "anon";

grant update on table "public"."peminjaman_detail" to "anon";

grant delete on table "public"."peminjaman_detail" to "authenticated";

grant insert on table "public"."peminjaman_detail" to "authenticated";

grant references on table "public"."peminjaman_detail" to "authenticated";

grant select on table "public"."peminjaman_detail" to "authenticated";

grant trigger on table "public"."peminjaman_detail" to "authenticated";

grant truncate on table "public"."peminjaman_detail" to "authenticated";

grant update on table "public"."peminjaman_detail" to "authenticated";

grant delete on table "public"."peminjaman_detail" to "service_role";

grant insert on table "public"."peminjaman_detail" to "service_role";

grant references on table "public"."peminjaman_detail" to "service_role";

grant select on table "public"."peminjaman_detail" to "service_role";

grant trigger on table "public"."peminjaman_detail" to "service_role";

grant truncate on table "public"."peminjaman_detail" to "service_role";

grant update on table "public"."peminjaman_detail" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."peminjaman_detail"
as permissive
for insert
to authenticated
with check (true);


create policy "enable all for admin"
on "public"."peminjaman_detail"
as permissive
for all
to authenticated
using (true)
with check ((( SELECT ((auth.jwt() -> 'app_metadata'::text) -> 'role'::text)) ? 'super-admin'::text));


create policy "enable users to view their own data only"
on "public"."peminjaman_detail"
as permissive
for select
to authenticated
using (true);



