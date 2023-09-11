<script setup>
import { ref, onMounted } from "vue"
import BookItem from "../BookItem.vue"
import { supabase } from "../../supabase/index.js"

const bukuKoleksi = ref([])
const isLoading = ref(false)

async function ambilBukuKoleksi() {
  try {
    const { data, error } = await supabase.from("buku_koleksi").select("*").limit(20)

    if (error) throw error
    bukuKoleksi.value = data
  } catch (err) {
    alert(err.message)
  }
}

onMounted(async () => {
  isLoading.value = true
  await ambilBukuKoleksi()
  isLoading.value = false
})
</script>

<template>
  <section class="book-list">
    <h2>Koleksi</h2>
    <BookItem v-for="buku in bukuKoleksi" :key="buku.isbn" :buku="buku" />
  </section>
</template>
