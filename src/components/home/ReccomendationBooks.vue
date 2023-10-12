<script setup>
import { ref, onMounted } from "vue"
import BookItem from "../BookItem.vue"
import { supabase } from "../../supabase/index.js"

const bukuRekomendasi = ref([])
const isLoading = ref(false)

async function ambilBukuBiasa() {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select(`*`)
      .eq("kategori", "paket")
      .limit(20)

    if (error) throw error
    bukuRekomendasi.value = data
  } catch (err) {
    alert(err.message)
  }
}

onMounted(async () => {
  isLoading.value = true
  await ambilBukuBiasa()
  isLoading.value = false
})
</script>

<template>
  <h2>Rekomendasi</h2>
  <ul class="book-list">
    <li v-if="isLoading">Memuat buku...</li>
    <li v-if="!isLoading && !bukuRekomendasi.length">Bukunya ga ada gaes</li>
    <BookItem v-for="buku in bukuRekomendasi" :key="buku.no_isbn" :buku="buku" />
  </ul>
</template>
