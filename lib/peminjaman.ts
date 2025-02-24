import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types.ts"
import type { PeminjamanData } from "@/pages/admin/index.vue"
import type { PeminjamanSearchArgs } from "~/types"

export async function getPeminjamanData(searchFor?: PeminjamanSearchArgs): Promise<PeminjamanData> {
  const supabase = useSupabaseClient<Database>()

  // inefficient multi-purpose query
  // TODO: refactor
  let query = supabase
    .from("peminjaman")
    .select(
      "*, peminjaman_detail(*, peminjaman_state(name)), pengguna!inner(user_id, nama, kelas, jurusan), buku!inner(*)"
    )
    .order("created_at", { referencedTable: "peminjaman_detail", ascending: false })

  if (searchFor) {
    const { peminjam, judul, tgl_pinjam, tenggat_waktu } = searchFor

    if (peminjam) {
      query = query.ilike("pengguna.nama", `%${peminjam}%`)
    }

    if (judul) {
      query = query.ilike("buku.judul", `%${judul}%`)
    }

    if (tgl_pinjam) {
      if (tgl_pinjam[0]) query = query.gte("tgl_pinjam", tgl_pinjam[0].toISOString())
      if (tgl_pinjam[1]) query = query.lte("tgl_pinjam", tgl_pinjam[1].toISOString())
    }

    if (tenggat_waktu) {
      if (tenggat_waktu[0]) query = query.gte("tenggat_waktu", tenggat_waktu[0].toISOString())
      if (tenggat_waktu[1]) query = query.lte("tenggat_waktu", tenggat_waktu[1].toISOString())
    }
  }

  try {
    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    console.log(error as PostgrestError)
    return []
  }
}
