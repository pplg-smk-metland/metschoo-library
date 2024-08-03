<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { supabase } from "@/lib/supabase"
import { useDialog } from "@/lib/composables"
import { type Buku } from "@/types/index"
import { type PostgrestError, type QueryData } from "@supabase/supabase-js"

import BaseLayout from "@/layouts/BaseLayout.vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import WishlistBook from "@/components/wishlist/WishlistBook.vue"
import TheDialog from "@/components/TheDialog.vue"

const authStore = useAuthStore()

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

const { dialog } = useDialog()

async function hapusBukuDariWishlist(buku: Buku) {
  try {
    await supabase.from("wishlist").delete().eq("no_isbn", buku.no_isbn)
    hapusBuku(buku)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}

function hapusBuku(buku: Buku) {
  wishlist.value = wishlist.value?.filter(({ no_isbn }) => no_isbn !== buku.no_isbn)
  dialog.value.open(`menghapus buku ${buku.judul} dari wishlist...`)
}

onMounted(async () => {
  wishlist.value = await ambilWishlist()
})
</script>

<template>
  <BaseLayout>
    <h1>Wishlist</h1>
    <section v-if="!authStore.session">
      <p>Kamu harus login dlu ya untuk menambahkan buku ke wishlist</p>
      <p>
        <routerLink :to="{ name: 'home' }"> Kembali ke beranda </routerLink>
      </p>
    </section>

    <section v-else class="main-section">
      <LoadingSpinner v-if="isLoading" />
      <p v-if="!isLoading && !wishlist?.length">Kamu belum punya apa-apa dalam wishlist kamu.</p>
      <ul v-if="wishlist?.length" class="book-list">
        <WishlistBook
          v-for="wishlistItem in wishlist"
          :key="wishlistItem.id"
          :buku="wishlistItem.buku!"
          @pinjam-buku="$router.push(`/buku/${wishlistItem.no_isbn}`)"
          @hapus-buku="hapusBukuDariWishlist(wishlistItem.buku!)"
        />
      </ul>
    </section>

    <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
      <h2>Info!!!</h2>
      <p>{{ dialog.message }}</p>
    </TheDialog>
  </BaseLayout>
</template>
