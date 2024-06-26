<script setup lang="ts">
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"
import { getAllAvailableCategories } from "@/lib/utils"
import type { Kategori } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"

import CTA from "@/components/CTA.vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"

const searchTerm = ref("")
const availableCategories = ref<Kategori[]>([])
const selectedCategory = ref<Kategori["id"]>(1)

interface SearchResult {
  no_isbn: string
  judul: string
  penulis: string
  penerbit: string
  tahun_terbit: string
  kategori_buku: {
    kategori: string
  } | null
}
const searchResults = ref<SearchResult[] | never>([])

async function searchBukus() {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select(`no_isbn, judul, penulis, penerbit, tahun_terbit, kategori_buku(kategori)`)
      .limit(20)
    if (error) throw error
    return data
  } catch (error) {
    console.trace(error as PostgrestError)
    return []
  }
}

const isLoading = ref(false)
async function searchBooks(searchTerm: string, searchCategory: Kategori["id"]) {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("buku")
      .select(`no_isbn, judul, penulis, penerbit, tahun_terbit, kategori_buku(kategori)`)
      .textSearch("judul", searchTerm, { type: "websearch" })
      .eq("kategori_id", searchCategory)
      .limit(30)

    if (error) throw error
    return data
  } catch (err) {
    console.trace((err as PostgrestError).message)
    return []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  searchResults.value = await searchBukus()
  availableCategories.value = await getAllAvailableCategories()
})
</script>

<template>
  <h1>Data buku</h1>

  <form
    @submit.prevent="async () => (searchResults = await searchBooks(searchTerm, selectedCategory))"
  >
    <input
      id="search-term"
      v-model="searchTerm"
      type="text"
      name="search-term"
      placeholder="cari judul buku..."
      required
    />
    <select id="search-category" v-model="selectedCategory" name="search-category" required>
      <option value="" disabled>Pilih satu</option>
      <option v-for="category in availableCategories" :key="category.id" :value="category.id">
        {{ category.id }} - {{ category.kategori }}
      </option>
    </select>
    <CTA type="submit" label="Cari" />
  </form>

  <LoadingSpinner v-if="isLoading" />
  <DataTable :value="searchResults" scrollable v-else>
    <Column field="judul" header="Judul">
      <template #body="slotProps">
        <routerLink :to="{ name: 'admin-halaman-buku', params: { isbn: slotProps.data.no_isbn } }">
          {{ slotProps.data.judul }}
        </routerLink>
      </template>
    </Column>
    <Column field="no_isbn" header="ISBN"></Column>
    <Column field="penulis" header="Penulis"></Column>
    <Column field="penerbit" header="Penerbit"></Column>
    <Column field="tahun_terbit" header="Tahun Terbit"></Column>
    <Column field="kategori_buku.kategori" header="Kategori"></Column>
    <template #empty>Tidak ada buku ditemukan.</template>
    <template #footer>Menampilkan {{ searchResults.length }} buku.</template>
  </DataTable>
</template>

<style scoped>
form {
  display: flex;
  gap: 1rem;
}

#search-category {
  border-radius: 0.5rem;
}
</style>
