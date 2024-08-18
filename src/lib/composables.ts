import type { Buku, PeminjamanState } from "@/types"
import { ref } from "vue"
import { supabase } from "./supabase"

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
  })

  return { buku }
}

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

export async function usePeminjamanState(isbn: Buku["no_isbn"]): Promise<PeminjamanState> {
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
      isReturnable: false,
    }
  }

  const borrowableConditions = ["borrow cancelled", "return confirmed", "return late"]
  const isBorrowable = borrowableConditions.includes(data.peminjaman_state.name)
  const isReturnable = data.peminjaman_state.name === "borrow confirmed"

  return {
    id: data.id,
    isBorrowable,
    isReturnable,
  }
}
