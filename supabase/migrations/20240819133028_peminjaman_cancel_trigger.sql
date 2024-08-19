CREATE OR REPLACE TRIGGER on_peminjaman_cancelled 
AFTER UPDATE OF state_id ON public.peminjaman
FOR EACH ROW
WHEN ((new.state_id = 6))
EXECUTE FUNCTION increment_jumlah_exspl();
