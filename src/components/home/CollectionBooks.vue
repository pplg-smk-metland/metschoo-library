<script setup lang="ts">
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BookItem from "@/components/BookItem.vue"

const bukuKoleksi = ref([])
const isLoading = ref(false)

async function ambilBukuKoleksi() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("buku")
      .select(`no_isbn, judul, penulis, tahun_terbit, kategori_id`)
      .eq("kategori_id", 2)
      .limit(20)

    if (error) throw error
    return data
  } catch (err) {
    console.trace(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  bukuKoleksi.value = await ambilBukuKoleksi()
})
</script>

<template>
  <h2>Koleksi</h2>
  <ul class="book-list">
    <LoadingSpinner v-if="isLoading" />
    <li v-if="!isLoading && !bukuKoleksi.length">Bukunya ga ada gaes</li>
    <BookItem v-else v-for="buku in bukuKoleksi" :key="buku.isbn" :buku="buku" />
  </ul>
</template>
