import type { Database } from "@/types/database.types"
import type { PostgrestError } from "@supabase/supabase-js"
import type { BookRequest, Pengguna, RequestData } from "~/types"

export async function getRequests() {
  const supabase = useSupabaseClient<Database>()
  const query = supabase.from("book_requests").select("*, pengguna(user_id, nama, email)")

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getUserRequest(id: Pengguna["user_id"]) {
  const supabase = useSupabaseClient<Database>()

  const { data, error } = await supabase
    .from("book_requests")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if ((error as PostgrestError).code === "PGRST116") return false
  }
  return data
}

export async function insertRequest(requestData: RequestData) {
  const supabase = useSupabaseClient<Database>()

  try {
    const { error } = await supabase.from("book_requests").insert({
      title: requestData.title,
      isbn: requestData.isbn,
      category: requestData.category,
    })

    if (error) throw error
  } catch (error) {
    console.log(error)
  }
}

export async function processRequest(
  id: BookRequest["id"],
  is_accepted: Exclude<BookRequest["is_accepted"], "processing">
) {
  const supabase = useSupabaseClient<Database>()

  const { error } = await supabase.from("book_requests").update({ is_accepted }).eq("id", id)

  if (error) throw error
}
