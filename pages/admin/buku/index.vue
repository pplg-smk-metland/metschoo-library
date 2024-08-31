<script setup lang="ts">
import type { Kategori } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"

import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Select from "primevue/select"
import type { Database } from "~/types/database.types.ts"
import PageHeader from "~/components/PageHeader.vue"

useHead({
  title: "Data Buku",
})

definePageMeta({
  layout: "admin",
})

const supabase = useSupabaseClient<Database>()

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
  <PageHeader heading="Data buku">
    <form
      @submit.prevent="
        async () => (searchResults = await searchBooks(searchTerm, selectedCategory))
      "
    >
      <InputText
        id="search-term"
        v-model="searchTerm"
        type="text"
        name="search-term"
        placeholder="cari judul buku..."
        required
      />
      <Select
        v-model="selectedCategory"
        placeholder="pilih kategori"
        :options="availableCategories"
        option-label="kategori"
        option-value="id"
        checkmark
      />
      <CTA type="submit" label="Cari" />
    </form>
  </PageHeader>

  <LoadingSpinner v-if="isLoading" />
  <DataTable v-else :value="searchResults" scrollable>
    <Column field="judul" header="Judul">
      <template #body="slotProps">
        <NuxtLink :to="`/admin/buku/${slotProps.data.no_isbn}`">
          {{ slotProps.data.judul }}
        </NuxtLink>
      </template>
    </Column>
    <Column field="no_isbn" header="ISBN" />
    <Column field="penulis" header="Penulis" />
    <Column field="penerbit" header="Penerbit" />
    <Column field="tahun_terbit" header="Tahun Terbit" />
    <Column field="kategori_buku.kategori" header="Kategori" />
    <template #empty>Tidak ada buku ditemukan.</template>
    <template #footer>Menampilkan {{ searchResults.length }} buku.</template>
  </DataTable>
</template>

<style scoped>
form {
  display: flex;
  gap: 1rem;
}

input {
  flex-grow: 1;
}
</style>
