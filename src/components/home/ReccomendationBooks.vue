<script setup>
import { ref, onMounted } from "vue"
import BookItem from "../BookItem.vue"
import { supabase } from "../../supabase/index.js"

const bukuRekomendasi = ref([])
const isLoading = ref(false)

async function ambilBukuBiasa() {
  const localBukuRekomendasi = JSON.parse(localStorage.getItem("bukuRekomendasi"))
  if (localBukuRekomendasi?.bukuRekomendasi && Date.now() - localBukuRekomendasi.date < 60000) {
    bukuRekomendasi.value = localBukuRekomendasi
    return
  }

  try {
    const { data, error } = await supabase
      .from("buku")
      .select(`*`)
      .eq("kategori", "paket")
      .limit(20)

    if (error) throw error
    localStorage.setItem(
      "bukuRekomendasi",
      JSON.stringify({
        date: Date.now(),
        bukuRekomendasi: data,
      })
    )
    return data
  } catch (err) {
    alert(err.message)
  }
}

onMounted(async () => {
  isLoading.value = true
  bukuRekomendasi.value = await ambilBukuBiasa()
  isLoading.value = false
})
</script>

<template>
  <h2>Rekomendasi</h2>
  <ul class="book-list">
    <li v-if="isLoading">Memuat buku...</li>
    <li v-if="!isLoading && bukuRekomendasi.length === 0">Bukunya ga ada gaes</li>
    <BookItem v-for="buku in bukuRekomendasi" :key="buku.no_isbn" :buku="buku" />
  </ul>
</template>
