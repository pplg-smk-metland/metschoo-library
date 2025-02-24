import { ref } from "vue"
import type { PostgrestError } from "@supabase/supabase-js"
import type { ActualBuku, Buku, PeminjamanDetail, PeminjamanState } from "@/types"
import type { Database } from "~/types/database.types"
import type { FileUploadSelectEvent } from "primevue"

/**
 * Returns a blank Buku ref.
 */
export function useBuku() {
  const buku = ref<Buku | null>({
    id: "",
    slug: "",
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
 * @param {Buku['id']} id - id of book
 * @returns {Promise<PeminjamanState>} state of peminjaman
 */
export async function usePeminjamanState(
  { id: buku_id, jumlah_exspl_aktual }: ActualBuku,
  peminjaman_detail?: PeminjamanDetail
): Promise<PeminjamanState> {
  const borrowableStateIds = [3, 5, 6, 7]

  if (!peminjaman_detail) {
    const supabase = useSupabaseClient<Database>()

    const peminjamanQuery = supabase
      .from("peminjaman_detail")
      .select("peminjaman_id, peminjaman(buku_id), state_id")
      .eq("peminjaman.buku_id", buku_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const { data, error } = await peminjamanQuery

    // PGRST116 == empty
    if ((error && error.code === "PGRST116") || !data) {
      return {
        isBorrowable: jumlah_exspl_aktual > 0,
        isCancellable: false,
        isReturnable: false,
      }
    }

    if (error) {
      return {
        isBorrowable: false,
        isCancellable: false,
        isReturnable: false,
      }
    }

    return {
      id: data.peminjaman_id,
      isBorrowable: borrowableStateIds.includes(data.state_id) && jumlah_exspl_aktual > 0,
      isCancellable: data.state_id === 1,
      isReturnable: data.state_id === 2,
    }
  }

  const { state_id, peminjaman_id: id } = peminjaman_detail
  return {
    id,
    isBorrowable: borrowableStateIds.includes(state_id) && jumlah_exspl_aktual > 0,
    isCancellable: state_id === 1,
    isReturnable: state_id === 2,
  }
}

export async function useCheckWishlist(buku_id: Buku["id"]): Promise<boolean> {
  const supabase = useSupabaseClient<Database>()

  try {
    const { count, error } = await supabase
      .from("wishlist")
      .select("id", { count: "exact", head: true })
      .eq("buku_id", buku_id)

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

/**
 * returns a dot blinker for loading animations.
 * @param {string} text - the text to display when not in loading state
 * @param {string} loadingText - the text to display when in loading state
 *
 * @returns finalLoadingText
 * */
export function useLoadingText(
  isLoading: Ref<boolean>,
  text: MaybeRefOrGetter<string>,
  loadingText: MaybeRefOrGetter<string>
) {
  const processedLoadingText = toRef(loadingText)
  const processedText = toRef(text)
  const finalText = ref(processedText.value)
  const repeatAmount = ref(0)

  let intervalID: NodeJS.Timeout | undefined = undefined

  watch(isLoading, (newIsLoading) => {
    finalText.value = newIsLoading ? processedLoadingText.value : processedText.value

    if (newIsLoading) {
      intervalID = setInterval(() => {
        finalText.value = processedLoadingText.value + ".".repeat(repeatAmount.value)
        repeatAmount.value += 1
        if (repeatAmount.value > 3) repeatAmount.value = 0
      }, 500)
    } else {
      repeatAmount.value = 0
      clearInterval(intervalID)
      intervalID = undefined
    }
  })

  return { loadingText: finalText }
}
