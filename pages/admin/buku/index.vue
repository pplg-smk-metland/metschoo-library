<script setup lang="ts">
import type { Kategori } from "@/types"

import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Select from "primevue/select"
import PageHeader from "~/components/PageHeader.vue"

useHead({
  title: "Data Buku",
})

definePageMeta({
  layout: "admin",
})

const searchTerm = ref("")
const allCategories = ref<Kategori[]>([])

const categoryOptions = computed(() => {
  return [{ id: 0, kategori: "semua" }, ...allCategories.value]
})

const selectedCategory = ref<Kategori["id"] | null>(null)

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

const isLoading = ref(false)

const route = useRoute()

watch(
  () => route.query,
  async () => {
    const { term, category } = route.query

    searchResults.value = await searchBukus({
      searchTerm: term as string,
      category: Number(category),
    })
  }
)

onMounted(async () => {
  searchResults.value = await searchBukus({})
  allCategories.value = await getAllAvailableCategories()
})

async function handleSearchBuku() {
  await navigateTo({
    path: route.path,
    query: { term: searchTerm.value, category: selectedCategory.value },
  })
}
</script>

<template>
  <PageHeader heading="Data buku">
    <form class="w-full flex gap-4 items-center justify-end" @submit.prevent="handleSearchBuku">
      <InputText
        id="search-term"
        v-model="searchTerm"
        type="text"
        name="search-term"
        placeholder="cari judul buku..."
      />
      <Select
        v-model="selectedCategory"
        placeholder="pilih kategori"
        :options="categoryOptions"
        option-label="kategori"
        option-value="id"
        checkmark
        required
      />
      <CTA type="submit" label="Cari" class="px-6" />
    </form>
  </PageHeader>

  <section class="main-section">
    <LoadingSpinner v-if="isLoading" />

    <DataTable v-else :value="searchResults" scrollable paginator :rows="20">
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
      <Column field="tahun_terbit" header="Tahun Terbit" sortable />
      <Column field="kategori_buku.kategori" header="Kategori" sortable />

      <template #empty>Tidak ada buku ditemukan.</template>
      <template #footer>Menampilkan {{ searchResults.length }} buku.</template>
    </DataTable>
  </section>
</template>
