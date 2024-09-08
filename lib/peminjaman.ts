import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types.ts"
import type { AdminPeminjamanData } from "@/pages/admin/index.vue"
import type { PeminjamanData } from "@/pages/profil/index.vue"

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
    return data as AdminPeminjamanData
  } catch (error) {
    console.log(error as PostgrestError)
    return []
  }
}
