<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"

import LoadingSpinner from "../LoadingSpinner.vue"
import BookItem from "@/components/BookItem.vue"

const bukuRekomendasi = ref([])
const isLoading = ref(false)

async function ambilBukuBiasa() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("buku")
      .select(`*`)
      .eq("kategori", "paket")
      .limit(20)

    if (error) throw error
    return data
  } catch (err) {
    alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  bukuRekomendasi.value = await ambilBukuBiasa()
})
</script>

<template>
  <h2>Rekomendasi</h2>
  <ul class="book-list">
    <LoadingSpinner v-if="isLoading" />
    <li v-if="!isLoading && bukuRekomendasi.length === 0">Bukunya ga ada gaes</li>
    <BookItem v-else v-for="buku in bukuRekomendasi" :key="buku.no_isbn" :buku="buku" />
  </ul>
</template>
