<script setup>
import { onMounted, ref } from "vue"
import BaseLayout from "../layouts/BaseLayout.vue"
import WishlistBook from "../components/home/WishlistBook.vue"
import { useAuthStore } from "../stores/auth.js"
import { supabase } from "../supabase"

const authStore = useAuthStore()

const wishlist = ref([])

async function ambilWishlist() {
  try {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, buku(*)")
      .eq("user_id", authStore.session.user.id)
    if (error) throw error
    return data
  } catch (err) {
    console.error(err.message)
  }
}

onMounted(async () => {
  wishlist.value = await ambilWishlist()
})
</script>

<template>
  <BaseLayout>
    <h1>Wishlist</h1>
    <p v-if="authStore.session">
      Kamu sudah login tapi kami belom selesai buat aplikasinya sabar yah
    </p>
    <p v-else>Kamu harus login dlu</p>

    <ul>
      <li v-if="!wishlist.length">Kamu belum punya apa-apa dalam wishlist kamu.</li>
      <WishlistBook
        v-for="wishlistItem in wishlist"
        :key="wishlistItem.no_isbn"
        :buku="wishlistItem.buku"
      >
      </WishlistBook>
    </ul>
  </BaseLayout>
</template>
