import type { Buku, Kategori, Peminjaman } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "~/types/supabase"

/**
 * get a single buku by its isbn.
 * @param {Buku['no_isbn']} isbn - isbn
 * @returns Buku
 */
export async function getBuku(isbn: Buku["no_isbn"]) {
  const supabase = useSupabaseClient<Database>()
  const { data, error } = await supabase
    .from("buku")
    .select("*")
    .eq("no_isbn", isbn)
    .limit(1)
    .single()

  if (error) throw error
  return data
}

/**
 * Get multiple bukus.
 */
export async function getBukus(typeId?: Kategori["id"]) {
  const supabase = useSupabaseClient<Database>()
  let query = supabase.from("buku").select(`*`).limit(20)

  if (typeId) {
    query = query.eq("kategori_id", typeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getBukuImage(isbn: Buku["no_isbn"]) {
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient<Database>()
  // TODO: store cover array in localStorage
  // TODO: also implement expiry time (24 hours or so)
  // TODO: if null or expired, get from storage
  const cdnURL = `${config.public.supabase.url}/storage/v1/object/public/Buku`

  const { data, error } = await supabase.storage
    .from("Buku")
    .list(`public/`, { limit: 1, search: isbn })
  if (error) throw error
  if (data.length) return `${cdnURL}/public/${data[0].name}`
  return "assets/Image_not_available.png"
}

/**
 * borrow a buku.
 */
export async function borrowBuku(no_isbn: Buku["no_isbn"], tenggat_waktu: Date) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("peminjaman").insert({
    no_isbn,
    tgl_pinjam: new Date().toISOString(),
    tenggat_waktu: tenggat_waktu.toISOString(),
  })
  if (error) throw error
}

export async function cancelBorrowBuku(id: Peminjaman["id"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase
    .from("peminjaman")
    .update({
      state_id: 6,
    })
    .eq("id", id)

  if (error) throw error
}

/**
 * return a buku.
 */
export async function returnBuku(id: Peminjaman["id"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("peminjaman").update({ state_id: 4 }).eq("id", id)
  if (error) throw error
}

/**
 * confirm that a buku was borrowed.
 */
export async function confirmBorrowBuku(id: Peminjaman["id"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("peminjaman").update({ state_id: 2 }).eq("id", id)
  if (error) throw error
}

/**
 * confirm that a buku has been returned.
 */
export async function confirmReturnBuku(
  { id, tenggat_waktu }: Peminjaman,
  { jumlah_exspl, no_isbn }: Buku,
  tgl_kembali: Date
) {
  const supabase = useSupabaseClient<Database>()
  let state_id = 5
  if (new Date(tenggat_waktu) < new Date(tgl_kembali)) state_id = 6

  const { error } = await supabase
    .from("peminjaman")
    .update({ state_id, tgl_kembali: tgl_kembali.toISOString() })
    .eq("id", id)
  if (error) throw error

  const { error: updateError } = await supabase
    .from("buku")
    .update({ jumlah_exspl: jumlah_exspl + 1 })
    .eq("no_isbn", no_isbn)
  if (updateError) throw error
}

/**
 * Gets all available categories.
 */
export async function getAllAvailableCategories() {
  const supabase = useSupabaseClient<Database>()
  try {
    const { data, error } = await supabase.from("kategori_buku").select("id, kategori")
    if (error) throw error
    return data
  } catch (err) {
    console.trace((err as PostgrestError).message)
    return []
  }
}

/**
 * wrapper of `Intl.DateTimeFormat` to format dates
 * */
export function formatDate(date: Date, opts?: Intl.DateTimeFormatOptions) {
  if (!opts) {
    opts = {
      dateStyle: "long",
    }
  }
  return new Intl.DateTimeFormat("id-ID", opts).format(date)
}
