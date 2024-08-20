import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import { supabase } from "./supabase"

const peminjamanDataQuery = supabase
  .from("peminjaman")
  .select("*, pengguna(nama, kelas, jurusan), buku(*)")
export type PeminjamanData = QueryData<typeof peminjamanDataQuery>

export async function getPeminjamanData(): Promise<PeminjamanData> {
  try {
    const { data, error } = await peminjamanDataQuery
    if (error) throw error
    return data
  } catch (error) {
    console.log(error as PostgrestError)
    return []
  }
}
