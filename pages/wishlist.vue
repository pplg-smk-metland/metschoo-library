<script setup lang="ts">
import type { Buku, Wishlist } from "@/types/"
import type { PostgrestError } from "@supabase/supabase-js"

import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import { deleteFromWishlist, getWishlist } from "~/lib/wishlist"

useHead({
  title: "Wishlist",
})

definePageMeta({
  layout: "default",
})

const { data: wishlist } = useAsyncData(async () => await getWishlist())

const toast = useToast()

async function handleDeleteFromWishlist(id: Wishlist["id"], judul: Buku["judul"]) {
  if (!wishlist.value) return

  try {
    const targetId = await deleteFromWishlist(id)

    // sync UI after deletion
    wishlist.value = wishlist.value.filter(({ id }) => id !== targetId)

    toast.add({
      severity: "success",
      summary: "Sukses!",
      detail: `sukses menghapus buku ${judul} dari wishlist`,
      life: 5000,
    })
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: `gagal menghapus buku ${judul} dari wishlist`,
      life: 10000,
    })
  }
}

const router = useRouter()
const user = useSupabaseUser()
</script>

<template>
  <div class="max-w-screen-2xl mx-auto">
    <h1>Wishlist</h1>
    <section v-if="!user" class="flex flex-col items-center justify-center h-80">
      <p>Kamu harus login dulu ya untuk menambahkan buku ke wishlist..</p>

      <div class="flex gap-4">
        <CTA label="Login" as="router-link" to="/login" fill />
        <CTA label="Kembali ke beranda" as="router-link" to="/" />
      </div>
    </section>

    <section v-else class="main-section">
      <p v-if="!wishlist || wishlist.length === 0">Kamu belum punya apa-apa dalam wishlist kamu.</p>
      <ul v-else class="book-list">
        <WishlistBook
          v-for="wishlistItem in wishlist"
          :key="wishlistItem.id"
          :buku="wishlistItem.buku!"
          @pinjam-buku="router.push(`/buku/${wishlistItem.buku_id}`)"
          @hapus-buku="handleDeleteFromWishlist(wishlistItem.id, wishlistItem.buku!.judul)"
        />
      </ul>
    </section>

    <Toast />
  </div>
</template>
