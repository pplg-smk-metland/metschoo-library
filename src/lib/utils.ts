import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/auth"
import type { Buku, Peminjaman } from "@/types"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

export async function getBuku(isbn: Buku["no_isbn"]) {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select("*")
      .eq("no_isbn", isbn)
      .limit(1)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return null
  }
}

export async function ambilGambarBukuDariISBN(isbn: Buku["no_isbn"]) {
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
    return "assets/Image_not_available.png"
  } catch (err) {
    console.error((err as PostgrestError).message)
    return "assets/Image_not_available.png"
  }
}

const peminjamanQuery = supabase.from("peminjaman").select("tgl_pinjam, state_id, tenggat_waktu")
export type StatusPeminjaman = QueryData<typeof peminjamanQuery>

export async function getPeminjamanData(isbn: string) {
  try {
    const { data, error } = await peminjamanQuery.eq("no_isbn", isbn)
    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return []
  }
}

export function getNewestPeminjaman(statusPeminjaman: StatusPeminjaman) {
  if (!statusPeminjaman.length) return { state_id: 0, tenggat_waktu: 0 }

  return statusPeminjaman.reduce((initial, current) => {
    if (new Date(initial.tgl_pinjam).getTime() < new Date(current.tgl_pinjam).getTime()) {
      return current
    }
    return initial
  })
}

export async function pinjamBukuDariISBN(
  isbn: Buku["no_isbn"],
  jumlah_exspl: Buku["jumlah_exspl"],
  tenggat_waktu: Peminjaman["tenggat_waktu"]
) {
  const authStore = useAuthStore()
  const { error } = await supabase
    .from("peminjaman")
    .insert({ user_id: authStore.session!.user.id, no_isbn: isbn, tenggat_waktu })
  if (error) throw error

  const { error: updateError } = await supabase
    .from("buku")
    .update({ jumlah_exspl: jumlah_exspl - 1 })
    .eq("no_isbn", isbn)
  if (updateError) throw error
}

export async function kembalikanBukuDariISBN(
  isbn: Buku["no_isbn"],
  jumlah_exspl: Buku["jumlah_exspl"],
  tenggat_waktu: Peminjaman["tenggat_waktu"]
) {
  let state_id = 5
  if (tenggat_waktu < new Date().toISOString()) state_id = 6

  const { error } = await supabase
    .from("peminjaman")
    .update({ state_id, tgl_kembali: new Date().toISOString() })
    .eq("no_isbn", isbn)
  if (error) throw error

  const { error: updateError } = await supabase
    .from("buku")
    .update({ jumlah_exspl: jumlah_exspl + 1 })
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
    return []
  }
}
