import type {
  ActualBuku,
  Buku,
  BukuSearchArgs,
  Kategori,
  KunjunganSearchArgs,
  Peminjaman,
} from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"
import type { PeminjamanData } from "~/pages/admin/index.vue"
import type { Database } from "~/types/database.types.ts"

class CostomError extends Error {
  constructor(massage: string) {
    super(massage)
    this.name = "CostomError"
  }
}

/**
 * insert new buku.
 * @param {Buku} buku - the buku you want to insert
 * @returns {Promise<PostgrestError | null>} error
 * */
export async function insertBookData(buku: Omit<Buku, "id">): Promise<PostgrestError | null> {
  const supabase = useSupabaseClient<Database>()

  const { error } = await supabase.from("buku").insert({ ...buku })
  return error
}

/**
 * get a single buku by its slug from the view.
 * @param {Buku['slug']} slug - slug of buku
 * @returns {Promise<ActualBuku>} Buku
 */
export async function getBuku(slug: Buku["slug"]): Promise<ActualBuku> {
  const supabase = useSupabaseClient<Database>()
  const { data, error } = await supabase
    .from("actual_buku")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .single()

  if (error) throw error
  return data as ActualBuku
}

/**
 * Get multiple bukus.
 * @param {number} typeId - (optional) type id of the bukus
 * @returns {Promise<Buku[]>} bukus
 */
export async function getBukus(typeId?: Kategori["id"]): Promise<Buku[]> {
  const supabase = useSupabaseClient<Database>()
  let query = supabase.from("buku").select(`*`).limit(20)

  if (typeId) {
    query = query.eq("kategori_id", typeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getDashboardStatistics() {
  const supabase = useSupabaseClient<Database>()

  const { data, error } = await supabase.rpc("dashboard_statistics")
  if (error) throw error

  return data
}

/**
 * search bukus.
 * Both searchTerm and category is optional so when both isn't needed you need
 * to pass an empty obj
 */
export async function searchBukus(searchFor?: BukuSearchArgs) {
  const supabase = useSupabaseClient<Database>()

  let query = supabase
    .from("buku")
    .select(`no_isbn, slug, judul, penulis, penerbit, tahun_terbit, kategori_buku(kategori)`)

  if (searchFor) {
    const { judul, no_isbn, kategori } = searchFor
    if (judul) {
      query = query.textSearch("judul", judul, { type: "websearch" })
    }

    if (no_isbn) {
      query = query.ilike("no_isbn", `%${no_isbn}%`)
    }

    if (kategori) {
      query = query.eq("kategori_id", kategori)
    }
  }

  try {
    const { data, error } = await query.limit(100)
    if (error) throw error
    return data
  } catch (error) {
    console.trace(error as PostgrestError)
    return []
  }
}

/**
 * get the valid path of a buku's image.
 * meant to be directly used on the HTML image element
 *
 * @param {Buku['image']} image - image property of buku
 * @returns {Promise<string>} path
 * */
export function getBukuImage(image?: Buku["image"]): string {
  const config = useRuntimeConfig()
  if (!image) return "/assets/Image_not_available.png"
  return `${config.public.supabase.url}/storage/v1/object/public/Buku/${image}`
}

/**
 * borrow a buku.
 *
 * @param {Buku['id']} buku_id - id of buku
 * @param {Date} tenggat_waktu - when to return the buku
 */
export async function borrowBuku(
  buku_id: Buku["id"],
  tenggat_waktu: Date
): Promise<Peminjaman["id"]> {
  const supabase = useSupabaseClient<Database>()

  const { data: buku, error: bukuError } = await supabase
    .from("actual_buku")
    .select("jumlah_exspl_aktual")
    .eq("id", buku_id)
    .single()

  if (bukuError) throw bukuError

  if (buku?.jumlah_exspl_aktual === 0) {
    throw new CostomError("tidak bisa minjam buku, karena buku sudah habis")
  }

  const { data: peminjaman, error } = await supabase
    .from("peminjaman")
    .insert({
      buku_id,
      tenggat_waktu: tenggat_waktu.toISOString(),
    })
    .select()
    .single()
  if (error) throw error

  const { error: detailError } = await supabase.from("peminjaman_detail").insert({
    peminjaman_id: peminjaman.id,
    state_id: 1,
  })

  if (detailError) throw detailError
  return peminjaman.id
}

/**
 * cancel borrowing of a buku.
 *
 * @param {Peminjaman['id']} id - id of peminjaman
 * */
export async function cancelBorrowBuku(id: Peminjaman["id"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("peminjaman_detail").insert({
    peminjaman_id: id,
    state_id: 3,
  })

  if (error) throw error
}

/**
 * return a buku.
 *
 * @param {Peminjaman['id']} id - id of peminjaman
 */
export async function returnBuku(id: Peminjaman["id"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("peminjaman_detail").insert({
    peminjaman_id: id,
    state_id: 4,
  })

  if (error) throw error
}

/**
 * confirm that a buku was borrowed.
 *
 * @param {Peminjaman['id']} id - id of peminjaman
 */
export async function confirmBorrowBuku(id: Peminjaman["id"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("peminjaman_detail").insert({
    peminjaman_id: id,
    state_id: 2,
  })

  if (error) throw error
}

/**
 * confirm that a buku has been returned.
 * @param {Peminjaman} peminjaman
 * @param {Date} tgl_kembali
 */
export async function confirmReturnBuku({ id, tenggat_waktu }: Peminjaman, tgl_kembali: Date) {
  const supabase = useSupabaseClient<Database>()
  let state_id = 5

  const isLate = new Date(tenggat_waktu) < new Date(tgl_kembali)
  if (isLate) state_id = 6

  const { error } = await supabase.from("peminjaman_detail").insert({ state_id, peminjaman_id: id })
  if (error) throw error
}

/**
 * Gets all available categories.
 *
 * @returns {Promise<Kategori[]>} kategori
 */
export async function getAllAvailableCategories(): Promise<Kategori[]> {
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
 *
 * @param {Date} date - unformatted date
 * @param {Intl.DateTimeFormatOptions} opts - format options
 * @returns {string} formatted date string
 * */
export function formatDate(date: Date, opts?: Intl.DateTimeFormatOptions): string {
  if (!opts) {
    opts = {
      dateStyle: "long",
    }
  }
  return new Intl.DateTimeFormat("id-ID", opts).format(date)
}

export function slugify(input: string): string {
  return String(input)
    .trim()
    .toLowerCase()
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .split(" ", 8) // limit to 8 words, in normal cases
    .join("-")
    .replace(/[\s-]+/g, "-") // replace multiple spaces or hyphens with a single hyphen
}

/**
 * get date of peminjaman state changes
 * you can use it to get date of any peminjaman event
 *
 * @returns {string} formatted date string of peminjaman event date
 */
export function getPeminjamanStateDate(
  data: PeminjamanData[number],
  state_id: number,
  opts?: Intl.DateTimeFormatOptions
): string {
  const target = data.peminjaman_detail.find((data) => data.state_id === state_id)

  if (target === undefined) return "-"
  else return formatDate(new Date(target.created_at), opts)
}

export async function searchKunjungans({ timestamp_range }: KunjunganSearchArgs) {
  const supabase = useSupabaseClient()
  let query = supabase
    .from("kunjungan")
    .select("id, timestamp, event, pengguna(user_id, nama, kelas, jurusan)")
    .order("timestamp", { ascending: false })

  if (timestamp_range[0]) {
    query = query.gte("check_in", timestamp_range[0].toISOString())
  }
  if (timestamp_range[1]) {
    query = query.lte("check_in", new Date(timestamp_range[1].setHours(23, 59, 59)).toISOString())
  }

  const { data, error } = await query
  return { data, error }
}
