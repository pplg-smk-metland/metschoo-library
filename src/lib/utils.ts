import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/auth"
import type { Buku, Kategori, Peminjaman } from "@/types"
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
  if (error) throw error
  return data
}

const booksQuery = supabase
  .from("buku")
  .select(`no_isbn, judul, penulis, tahun_terbit, kategori_id`)
  .limit(20)
export type Bukus = QueryData<typeof booksQuery>

export async function getBukus(typeId: Kategori["id"]) {
  const { data, error } = await booksQuery.eq("kategori_id", typeId)

  if (error) throw error
  return data
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

// cek data peminjaman paling baru.
// User bisa saja meminjam buku yang sama berulang kali
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
  tgl_kembali: Date
) {
  const dataPeminjaman = await getPeminjamanData(isbn)
  const { tenggat_waktu } = getNewestPeminjaman(dataPeminjaman)

  let state_id = 5
  if (new Date(tenggat_waktu) < tgl_kembali) state_id = 6

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
