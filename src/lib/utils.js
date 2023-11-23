import { supabase } from "../supabase"
export async function ambilGambarBukuDariISBN(isbn) {
  const cdnURL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Buku`

  try {
    const { data, error } = await supabase.storage
      .from("Buku")
      .list(`${isbn}/`, { limit: 1, offset: 0, search: isbn })
    if (error) throw error

    return `${cdnURL}/${isbn}/${data[0]?.name}`
  } catch (err) {
    console.error(err.message)
  }
}

  return `${cdnURL}/${isbn}/${data[0]?.name}`
}
