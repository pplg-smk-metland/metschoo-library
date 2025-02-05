<script setup lang="ts">
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Select from "primevue/select"
import { InputText } from "primevue"
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

const { data: searchResults, status } = await useAsyncData(async () => await searchBukus({}))

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
        v-model="searchFor.judul"
        input-id="search-term"
        name="search-term"
        placeholder="Judul buku"
      />

      <label for="search-isbn" class="sr-only">ISBN</label>
      <InputText v-model="searchFor.no_isbn" input-id="search-isbn" placeholder="ISBN" />

      <label for="search-category" class="sr-only">Kategori</label>
      <Select
        v-model="searchFor.kategori"
        input-id="search-category"
        placeholder="pilih kategori"
        :options="categoriesOptions"
        option-label="kategori"
        option-value="id"
        checkmark
        required
      />
      <CTA fill type="submit" label="Cari" class="px-6 ms-auto" />
    </form>

    <LoadingSpinner v-if="status === 'pending'" />

    <DataTable
      v-else
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
