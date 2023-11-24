import { supabase } from "../supabase"
import { useAuthStore } from "../stores/auth"

export async function ambilGambarBukuDariISBN(isbn) {
  const cdnURL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Buku`

  try {
    const { data, error } = await supabase.storage
      .from("Buku")
      .list(`${isbn}/`, { limit: 1, offset: 0, search: isbn })
    if (error) throw error

    if (data.length) return `${cdnURL}/${isbn}/${data[0]?.name}`
    else return "../../assets/Image_not_available.png"
  } catch (err) {
    console.error(err.message)
  }
}

export async function pinjamBukuDariISBN(isbn) {
  const { error } = await supabase.from("peminjaman").insert({ no_isbn: isbn })
  if (error) throw error
}
