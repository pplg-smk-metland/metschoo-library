<script setup lang="ts">
import type { Buku } from "@/types/"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import type { Database } from "~/types/database.types.ts"

useHead({
  title: "Wishlist",
})

definePageMeta({
  layout: "default",
})

const supabase = useSupabaseClient<Database>()

const wishlistQuery = supabase.from("wishlist").select("*, buku(*)")
type Wishlist = QueryData<typeof wishlistQuery>
const wishlist = ref<Wishlist>()

const isLoading = ref(false)
async function ambilWishlist() {
  try {
    isLoading.value = true
    const { data, error } = await wishlistQuery
    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
  } finally {
    isLoading.value = false
  }
}

const toast = useToast()

async function hapusBukuDariWishlist(buku: Buku) {
  try {
    await supabase.from("wishlist").delete().eq("no_isbn", buku.no_isbn)
    hapusBuku(buku)

    toast.add({
      severity: "success",
      summary: "Sukses!",
      detail: "sukses menghapus buku dari wishlist",
      life: 5000,
    })
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "gagal menghapus buku dari wishlist",
      life: 10000,
    })
  }
}

function hapusBuku(buku: Buku) {
  wishlist.value = wishlist.value?.filter(({ no_isbn }) => no_isbn !== buku.no_isbn)
}

onMounted(async () => {
  wishlist.value = await ambilWishlist()
})

const router = useRouter()
const user = useSupabaseUser()
</script>

<template>
  <div class="max-w-screen-2xl mx-auto">
    <h1>Wishlist</h1>
    <section v-if="!user" class="flex flex-col items-center justify-center h-80">
      <p>Kamu harus login dulu ya untuk menambahkan buku ke wishlist..</p>

      <div class="flex gap-4">
        <CTA label="Login" to="/login" fill />
        <CTA label="Kembali ke beranda" to="/" />
      </div>
    </section>

    <section v-else class="main-section">
      <LoadingSpinner v-if="isLoading" />
      <p v-if="!isLoading && !wishlist?.length">Kamu belum punya apa-apa dalam wishlist kamu.</p>
      <ul v-if="wishlist?.length" class="book-list">
        <WishlistBook
          v-for="wishlistItem in wishlist"
          :key="wishlistItem.id"
          :buku="wishlistItem.buku!"
          @pinjam-buku="router.push(`/buku/${wishlistItem.no_isbn}`)"
          @hapus-buku="hapusBukuDariWishlist(wishlistItem.buku!)"
        />
      </ul>
    </section>

    <Toast />
  </div>
</template>
