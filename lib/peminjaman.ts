import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export async function getPeminjamanData() {
  const supabase = useSupabaseClient<Database>()
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("*, pengguna(nama, kelas, jurusan), buku(*)")

    if (error) throw error
    return data
  } catch (error) {
    console.log(error as PostgrestError)
    return []
  }
}
