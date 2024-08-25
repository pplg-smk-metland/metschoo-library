import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// const peminjamanDataQuery = supabase
//   .from("peminjaman")
//   .select("*, pengguna(nama, kelas, jurusan), buku(*)")
// export type PeminjamanData = QueryData<typeof peminjamanDataQuery>

// export async function getPeminjamanData(): Promise<PeminjamanData> {
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
