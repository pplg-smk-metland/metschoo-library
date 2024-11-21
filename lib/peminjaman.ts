import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types.ts"
import type { PeminjamanData } from "@/pages/admin/index.vue"
import type { PeminjamanSearchArgs } from "~/types"

export async function getPeminjamanData(searchFor?: PeminjamanSearchArgs): Promise<PeminjamanData> {
  const supabase = useSupabaseClient<Database>()

  let query = supabase
    .from("peminjaman")
    .select("*, peminjaman_state(name), pengguna(nama, kelas, jurusan), buku(*)")

  if (searchFor) {
    const { peminjam, no_isbn, tgl_pinjam, tenggat_waktu } = searchFor

    if (peminjam) {
      query = query.ilike("pengguna.nama", `%${peminjam}%`)
    }

    if (no_isbn) {
      query = query.ilike("no_isbn", `%$${no_isbn}%`)
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
