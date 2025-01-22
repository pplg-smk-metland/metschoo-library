import type { Database } from "@/types/database.types"
import type { Pengguna, RequestData } from "~/types"

export async function getRequests() {
  const supabase = useSupabaseClient<Database>()
  const query = supabase.from("book_requests").select()

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

  if (error) console.log(error)
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
