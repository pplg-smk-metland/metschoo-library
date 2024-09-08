import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types.ts"
import type { PeminjamanData } from "@/pages/admin/index.vue"

export async function getPeminjamanData(
  startDate?: Date | null,
  endDate?: Date | null
): Promise<PeminjamanData> {
  const supabase = useSupabaseClient<Database>()
  let query = supabase
    .from("peminjaman")
    .select("*, peminjaman_state(name), pengguna(nama, kelas, jurusan), buku(*)")

  if (startDate) {
    query = query.gte("tgl_pinjam", startDate.toISOString())
  }

  if (endDate) {
    query = query.lte("tgl_pinjam", endDate.toISOString())
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

export async function getPeminjamanData(): Promise<PeminjamanData> {
  const supabase = useSupabaseClient<Database>()

  const peminjamanQuery = supabase.from("peminjaman").select("*, buku(*)")
  const { data, error } = await peminjamanQuery

  if (error) throw error
  return data
}
