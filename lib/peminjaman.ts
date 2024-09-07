import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types.ts"
import type { AdminPeminjamanData } from "@/pages/admin/index.vue"
import type { PeminjamanData } from "@/pages/profil/index.vue"

export async function getAdminPeminjamanData(): Promise<AdminPeminjamanData> {
  const supabase = useSupabaseClient<Database>()
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("*, peminjaman_state(name), pengguna(nama, kelas, jurusan), buku(*)")

    if (error) throw error
    return data as AdminPeminjamanData
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
