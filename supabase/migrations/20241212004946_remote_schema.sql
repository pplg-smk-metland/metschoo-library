drop trigger if exists "on_peminjaman_cancelled" on "public"."peminjaman";

drop trigger if exists "on_peminjaman_inserted" on "public"."peminjaman";

drop trigger if exists "on_peminjaman_returned" on "public"."peminjaman";

drop function if exists "public"."decrement_jumlah_exspl"();

drop function if exists "public"."increment_jumlah_exspl"();

alter table "public"."peminjaman" drop column "tgl_kembali";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_buku_exspl()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  -- Define a CTE to get the relevant no_isbn
  WITH latest_peminjaman AS (
    select b.no_isbn,
    pd.state_id
    from peminjaman p
    left join buku b
      on p.no_isbn = b.no_isbn
    left join peminjaman_detail pd
      on pd.peminjaman_id = p.id
    where p.id = NEW.peminjaman_id
    order BY pd.created_at desc
    limit 1
  )
  -- Use the CTE to update the buku table
  UPDATE public.buku
  SET jumlah_exspl = 
    CASE 
      WHEN (select state_id in (1, 3) from latest_peminjaman) THEN jumlah_exspl - 1
      WHEN (select state_id in (5, 6, 7) from latest_peminjaman) THEN jumlah_exspl + 1
      ELSE jumlah_exspl
    END
  WHERE no_isbn = (select no_isbn from latest_peminjaman);

  RETURN NEW;
END;$function$
;

create policy "user role can update (for jumlah_exspl)"
on "public"."buku"
as permissive
for update
to authenticated
using (true);


CREATE TRIGGER on_peminjaman_state_change AFTER INSERT ON public.peminjaman_detail FOR EACH ROW EXECUTE FUNCTION update_buku_exspl();


