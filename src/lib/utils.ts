import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/auth"
import type { PostgrestError } from "@supabase/supabase-js"

export async function ambilGambarBukuDariISBN(isbn: string) {
  // TODO: store cover array in localStorage
  // TODO: also implement expiry time (24 hours or so)
  // TODO: if null or expired, get from storage

  try {
    const cdnURL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Buku`

    const { data, error } = await supabase.storage
      .from("Buku")
      .list(`public/`, { limit: 1, search: isbn })
    if (error) throw error
    if (data.length) return `${cdnURL}/public/${data[0].name}`
    return "../../assets/Image_not_available.png"
  } catch (err) {
    console.error((err as PostgrestError).message)
    return "../../assets/Image_not_available.png"
  }
}

export async function pinjamBukuDariISBN(isbn: string, jumlah_exspl: number) {
  const authStore = useAuthStore()
  const { error } = await supabase
    .from("peminjaman")
    .insert({ user_id: authStore.session!.user.id, no_isbn: isbn })
  if (error) throw error

  const { error: updateError } = await supabase
    .from("buku")
    .update({ jumlah_exspl: jumlah_exspl - 1 })
    .eq("no_isbn", isbn)
  if (updateError) throw error
}

export async function kembalikanBukuDariISBN(isbn: string, jumlah_exspl: number) {
  const { error } = await supabase
    .from("peminjaman")
    .update({ sudah_dikembalikan: true, tgl_kembali: new Date().toISOString() })
    .eq("no_isbn", isbn)
  if (error) throw error

  const { error: updateError } = await supabase
    .from("buku")
    .update({ jumlah_exspl: jumlah_exspl - 1 })
    .eq("no_isbn", isbn)
  if (updateError) throw error
}

export async function getAllAvailableCategories() {
  try {
    const { data, error } = await supabase.from("kategori_buku").select("id, kategori")
    if (error) throw error
    return data
  } catch (err) {
    console.trace((err as PostgrestError).message)
    return null
  }
}
