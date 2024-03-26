<script setup>
import { onMounted, ref } from "vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { supabase } from "@/lib/supabase"
import { useRoute } from "vue-router"

const isLoading = ref(false)

const buku = ref({})
const router = useRoute()

async function ambilBuku() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("buku")
      .select("*, kategori_buku(kategori)")
      .eq("no_isbn", router.params.isbn)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.trace(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  buku.value = await ambilBuku()
})
</script>

<template>
  <LoadingSpinner v-if="isLoading" />

  <div class="buku" v-else>
    <h2>{{ buku.judul }}</h2>
    <p>{{ buku.penulis }}</p>
    <p>{{ buku.penerbit }}</p>
    <p>{{ buku.tahun_terbit }} - {{ buku.alamat_terbit }}</p>
    <!-- <p>{{ buku.kategori_buku.kategori }}</p> -->
  </div>
</template>
