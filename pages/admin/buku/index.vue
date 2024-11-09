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

const { data: categories } = useAsyncData(async () => await getAllAvailableCategories())

const categoriesOptions = computed(() => {
  return [{ id: 0, kategori: "semua" }, ...(categories.value || [])]
})

const selectedCategory = ref<Kategori["id"] | null>(null)

const { data: searchResults } = useAsyncData(async () => await searchBukus({}))
const searchTerm = ref("")

const route = useRoute()

watch(
  () => route.query,
  async () => {
    const { term, category } = route.query
    searchTerm.value = term as string
    selectedCategory.value = Number(category)

    searchResults.value = await searchBukus({
      searchTerm: term as string,
      category: Number(category),
    })
  }
)

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
        :options="categoriesOptions"
        option-label="kategori"
        option-value="id"
        checkmark
        required
      />
      <CTA type="submit" label="Cari" class="px-6" />
    </form>
  </PageHeader>

  <section class="main-section">
    <DataTable
      :value="searchResults"
      scroll-height="60vh"
      scrollable
      paginator
      :rows="20"
      striped-rows
    >
      <template #header>
        <p>Menampilkan {{ searchResults?.length }} buku.</p>
      </template>

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
    </DataTable>
  </section>
</template>
