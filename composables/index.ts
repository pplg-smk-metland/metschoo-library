import { ref } from "vue"
import type { PostgrestError } from "@supabase/supabase-js"
import type { Buku, PeminjamanState } from "@/types"
import type { Database } from "~/types/database.types"
import type { FileUploadSelectEvent } from "primevue"

/**
 * Returns a blank Buku ref.
 */
export function useBuku() {
  const buku = ref<Buku | null>({
    judul: "",
    no_isbn: "",
    penulis: "",
    penerbit: "",
    tahun_terbit: "",
    alamat_terbit: "",
    asal: "",
    jumlah_exspl: 0,
    kategori_id: 0,
    image: null,
  })

  return { buku }
}

/**
 * Returns a dialog controller. Only controls one dialog component
 * */
export function useDialog() {
  const dialog = ref({
    isOpen: false,
    message: "",

    /**
     * opens the dialog.
     * @param {string} message  message to be displayed in the dialog
     * */
    open(message: string) {
      this.isOpen = true
      this.message = message
    },

    /**
     * closes the dialog.
     * */
    close() {
      this.isOpen = false
      this.message = ""
    },
  })

  return { dialog }
}

/**
 * gets newest peminjaman and returns the state
 * @param {Buku['no_isbn']} isbn - isbn of book
 * @returns {Promise<PeminjamanState>} state of peminjaman
 */
export async function usePeminjamanState(isbn: Buku["no_isbn"]): Promise<PeminjamanState> {
  const supabase = useSupabaseClient<Database>()

  const peminjamanQuery = supabase
    .from("peminjaman")
    .select("id, no_isbn, tgl_pinjam, tgl_kembali, peminjaman_state(id, name)")
    .eq("no_isbn", isbn)
    .order("tgl_pinjam", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await peminjamanQuery
  if (error) {
    throw error
  }

  if (!data || !data.peminjaman_state) {
    return {
      isBorrowable: true,
      isCancellable: false,
      isReturnable: false,
    }
  }

  const borrowableConditions = ["borrow cancelled", "return confirmed", "return late"]
  const isBorrowable = borrowableConditions.includes(data.peminjaman_state.name)
  const isCancellable = data.peminjaman_state.name === "borrow pending"
  const isReturnable = data.peminjaman_state.name === "borrow confirmed"

  return {
    id: data.id,
    isBorrowable,
    isCancellable,
    isReturnable,
  }
}

export async function useCheckWishlist(isbn: Buku["no_isbn"]): Promise<boolean> {
  const supabase = useSupabaseClient<Database>()

  try {
    const { count, error } = await supabase
      .from("wishlist")
      .select("no_isbn", { count: "exact", head: true })
      .eq("no_isbn", isbn)

    if (error) throw error
    if (!count) return false

    return count !== null && count !== 0
  } catch (err) {
    console.trace(err as PostgrestError)
    return false
  }
}

export function usePreviewImage() {
  const previewURL = ref("")
  const newImage = ref<File>()

  function previewImage(e: FileUploadSelectEvent) {
    if (newImage.value) previewURL.value = URL.createObjectURL(newImage.value)
    newImage.value = e.files[0]
  }

  return { newImage, previewURL, previewImage }
}
