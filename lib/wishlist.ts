import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku, Wishlist } from "~/types"
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

export async function deleteFromWishlist(id: Wishlist["id"]): Promise<Wishlist["id"]> {
  const supabase = useSupabaseClient<Database>()

  const { data, error } = await supabase
    .from("wishlist")
    .delete()
    .eq("id", id)
    .select("id")
    .single()

  if (error) throw error
  return data.id
}

export async function addToWishlist(buku_id: Buku["id"]) {
  const supabase = useSupabaseClient<Database>()
  const { error } = await supabase.from("wishlist").insert({ buku_id })

  if (error) throw error
}
