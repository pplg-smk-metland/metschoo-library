import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types.ts"
import type { AdminPeminjamanData as PeminjamanData } from "@/pages/admin/index.vue"

export async function getPeminjamanData(): Promise<PeminjamanData> {
  const supabase = useSupabaseClient<Database>()
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("*, pengguna(nama, kelas, jurusan), buku(*)")

    if (error) throw error
    return data as PeminjamanData
  } catch (error) {
    console.log(error as PostgrestError)
    return []
  }
}
