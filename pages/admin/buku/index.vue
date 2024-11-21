<script setup lang="ts">
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Select from "primevue/select"
import PageHeader from "~/components/PageHeader.vue"
import type { BukuSearchArgs } from "~/types"

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

const { data: searchResults } = useAsyncData(async () => await searchBukus({}))

const searchFor = ref<BukuSearchArgs>({
  judul: "",
  no_isbn: "",
  kategori: 0,
})

const route = useRoute()

watch(
  () => route.query,
  async () => {
    const { judul, no_isbn, kategori } = route.query

    searchResults.value = await searchBukus({
      judul: judul as string,
      no_isbn: no_isbn as string,
      kategori: Number(kategori),
    })
  }
)

async function handleSearchBuku() {
  await navigateTo({
    path: route.path,
    // query: { term: searchTerm.value, category: selectedCategory.value },
    query: searchFor.value,
  })
}
</script>

<template>
  <PageHeader heading="Data buku" />

  <section class="main-section">
    <form class="w-full flex gap-4 items-center pb-4" @submit.prevent="handleSearchBuku">
      <label for="search-term" class="sr-only">Judul</label>
      <InputText
        input-id="search-term"
        v-model="searchFor.judul"
        name="search-term"
        placeholder="judul buku"
      />

      <label for="search-isbn" class="sr-only">ISBN</label>
      <InputText input-id="search-isbn" placeholder="ISBN" v-model="searchFor.no_isbn" />

      <label for="search-category" class="sr-only">Kategori</label>
      <Select
        input-id="search-category"
        v-model="searchFor.kategori"
        placeholder="pilih kategori"
        :options="categoriesOptions"
        option-label="kategori"
        option-value="id"
        checkmark
        required
      />
      <CTA fill type="submit" label="Cari" class="px-6 ms-auto" />
    </form>

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
          <NuxtLink
            :to="`/admin/buku/${slotProps.data.no_isbn}`"
            class="hover:underline inline-block max-w-72 overflow-hidden whitespace-nowrap text-ellipsis"
          >
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
