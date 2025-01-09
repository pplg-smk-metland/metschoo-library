import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku } from "~/types"
import type { Database } from "~/types/database.types.ts"

export async function getWishlist() {
  const supabase = useSupabaseClient<Database>()

  const wishlistQuery = supabase.from("wishlist").select("*, buku(*)")
  try {
    const { data, error } = await wishlistQuery
    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return []
  }
}

export async function deleteFromWishlist(isbn: Buku["no_isbn"]): Promise<Buku["no_isbn"]> {
  const supabase = useSupabaseClient<Database>()

  const { data, error } = await supabase
    .from("wishlist")
    .delete()
    .eq("no_isbn", isbn)
    .select("no_isbn")
    .single()

  if (error) throw error
  return data.no_isbn
}

export async function addToWishlist(no_isbn: Buku["no_isbn"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("wishlist").insert({ no_isbn })

  if (error) throw error
}
