create type "public"."request status" as enum ('processing', 'accepted', 'rejected');

create table "public"."book_requests" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid default auth.uid(),
    "title" text not null,
    "isbn" text not null,
    "is_accepted" "request status" default 'processing'::"request status",
    "category" text not null default ''''''::text
);

alter table "public"."book_requests" enable row level security;

CREATE UNIQUE INDEX book_requests_pkey ON public.book_requests USING btree (id);

alter table "public"."book_requests" add constraint "book_requests_pkey" PRIMARY KEY using index "book_requests_pkey";

alter table "public"."book_requests" add constraint "book_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES pengguna(user_id) not valid;

alter table "public"."book_requests" validate constraint "book_requests_user_id_fkey";

alter table "public"."wishlist" add constraint "wishlist_user_id_fkey" FOREIGN KEY (user_id) REFERENCES pengguna(user_id) ON UPDATE RESTRICT ON DELETE CASCADE not valid;

alter table "public"."wishlist" validate constraint "wishlist_user_id_fkey";

grant delete on table "public"."book_requests" to "anon";

grant insert on table "public"."book_requests" to "anon";

grant references on table "public"."book_requests" to "anon";

grant select on table "public"."book_requests" to "anon";

grant trigger on table "public"."book_requests" to "anon";

grant truncate on table "public"."book_requests" to "anon";

grant update on table "public"."book_requests" to "anon";

grant delete on table "public"."book_requests" to "authenticated";

grant insert on table "public"."book_requests" to "authenticated";

grant references on table "public"."book_requests" to "authenticated";

grant select on table "public"."book_requests" to "authenticated";

grant trigger on table "public"."book_requests" to "authenticated";

grant truncate on table "public"."book_requests" to "authenticated";

grant update on table "public"."book_requests" to "authenticated";

grant delete on table "public"."book_requests" to "service_role";

grant insert on table "public"."book_requests" to "service_role";

grant references on table "public"."book_requests" to "service_role";

grant select on table "public"."book_requests" to "service_role";

grant trigger on table "public"."book_requests" to "service_role";

grant truncate on table "public"."book_requests" to "service_role";

grant update on table "public"."book_requests" to "service_role";

create policy "Enable read access for all users"
on "public"."book_requests"
as permissive
for select
to public
using (true);


create policy "only user can request book"
on "public"."book_requests"
as permissive
for insert
to authenticated
with check (true);
