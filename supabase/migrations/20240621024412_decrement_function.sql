-- create default value pengguna 
alter table "public"."pengguna" alter column "nama" set default 'aaa'::text
;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.increment_jumlah_exspl()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update public.buku
  set jumlah_exspl = jumlah_exspl + 1
  where no_isbn=new.no_isbn;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_jumlah_exspl()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update public.buku
  set jumlah_exspl = jumlah_exspl - 1
  where no_isbn=new.no_isbn;
  return new;
end;
$function$
;

CREATE OR REPLACE TRIGGER on_peminjaman_returned 
AFTER UPDATE OF state_id ON public.peminjaman
FOR EACH ROW
WHEN ((new.state_id = 5))
EXECUTE FUNCTION increment_jumlah_exspl();
