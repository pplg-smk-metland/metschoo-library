<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"
import { getAllAvailableCategories } from "../../lib/utils"
import CTA from "@/components/CTA.vue"

const daftarBuku = ref([])

async function ambilBuku() {
  const { data, error } = await supabase
    .from("buku")
    .select(`no_isbn, judul, penulis, kategori_buku(kategori)`)
    .limit(20)
  if (error) throw error
  return data
}

const availableCategories = ref([])
const selectedCategory = ref(null)

async function searchBooks() {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select(`no_isbn, judul, penulis, kategori_buku(kategori)`)
      .textSearch("judul", searchTerm.value, { type: "websearch" })
      .eq("kategori_id", selectedCategory.value)
      .limit(30)
    if (error) throw error
    daftarBuku.value = data
  } catch (err) {
    console.trace(err.message)
  }
}

onMounted(async () => {
  daftarBuku.value = await ambilBuku()
  availableCategories.value = await getAllAvailableCategories()
})

const searchTerm = ref("")
</script>

<template>
  <h1>Data buku</h1>

  <form @submit.prevent="searchBooks">
    <input
      type="text"
      name="search-term"
      id="search-term"
      v-model="searchTerm"
      placeholder="search for book"
      required
    />
    <select name="search-category" id="search-category" v-model="selectedCategory" required>
      <option value="" disabled>Select one</option>
      <option v-for="category in availableCategories" :key="category.id" :value="category.id">
        {{ category.id }} - {{ category.kategori }}
      </option>
    </select>
    <CTA>Search</CTA>
  </form>

  <ul>
    <li v-if="!daftarBuku.length">No book found</li>
    <li v-for="buku in daftarBuku" :key="buku.no_isbn" v-else>
      <routerLink :to="`/admin/buku/${buku.no_isbn}`">
        <p>{{ buku.judul }}</p>
        <p>{{ buku.penulis }}</p>
        <p>{{ buku.kategori_buku.kategori }}</p>
      </routerLink>
    </li>
  </ul>
</template>
