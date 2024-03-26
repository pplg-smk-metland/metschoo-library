<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"

const daftarBuku = ref([])

async function ambilBuku() {
  const { data, error } = await supabase
    .from("buku")
    .select(`no_isbn, judul, penulis, kategori_buku(kategori)`)
    .limit(20)
  if (error) throw error
  return data
}

onMounted(async () => {
  daftarBuku.value = await ambilBuku()
})
</script>

<template>
  <h1>Data buku</h1>

  <ul>
    <li v-for="buku in daftarBuku" :key="buku.no_isbn">
      <routerLink :to="`/admin/buku/${buku.no_isbn}`">
        <p>{{ buku.judul }}</p>
        <p>{{ buku.penulis }}</p>
        <p>{{ buku.kategori_buku.kategori }}</p>
      </routerLink>
    </li>
  </ul>
</template>
