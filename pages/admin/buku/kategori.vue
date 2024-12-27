<script setup lang="ts">
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import PageHeader from "~/components/PageHeader.vue"
import { FloatLabel, InputText, Toast } from "primevue"
import type { Database } from "~/types/database.types.ts"

useHead({
  title: "Kategori buku",
})

definePageMeta({
  layout: "admin",
})
const kategoriInput = ref("")
const isLoading = ref(false)
const toast = useToast()

const supabase = useSupabaseClient<Database>()

const addNewCategory = async () => {
  if (!kategoriInput.value) {
    toast.add({
      severity: "error",
      summary: "Kategori tidak valid",
      detail: "Silakan masukkan nama kategori.",
      life: 3000,
    })
    return
  }
  isLoading.value = true
  try {
    const newCategory = { kategori: kategoriInput.value }
    const { data, error } = await supabase
      .from("kategori_buku")
      .insert(newCategory)
      .select()
      .single()

    if (error) throw error
    kategori.value!.push(data)
    toast.add({
      severity: "success",
      summary: "Berhasil menambah kategori",
      detail: "Kategori berhasil ditambahkan",
      life: 3000,
    })
    kategoriInput.value = ""
  } catch (error) {
    console.error(error)
    toast.add({
      severity: "error",
      summary: "Gagal menambah kategori",
      detail: "Ada kesalahan saat menambahkan kategori.",
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

const deleteCategory = async (targetKategori: string) => {
  try {
    const { error } = await supabase.from("kategori_buku").delete().eq("kategori", targetKategori)

    if (error) throw error

    kategori.value = kategori.value!.filter(({ kategori }) => kategori != targetKategori)

    toast.add({
      severity: "success",
      summary: "Kategori terhapus",
      detail: "Kategori berhasil dihapus.",
      life: 3000,
    })
  } catch (error) {
    console.error(error)
    toast.add({
      severity: "error",
      summary: "Gagal menghapus kategori",
      detail: "Ada kesalahan saat menghapus kategori.",
      life: 3000,
    })
  }
}

const { data: kategori } = useAsyncData(async () => {
  const categories = await getAllAvailableCategories()
  return categories
})
</script>

<template>
  <PageHeader heading="Data buku" />
  <section class="main-section">
    <form class="py-4 flex gap-4 justify-between" @submit.prevent="addNewCategory">
      <FloatLabel>
        <InputText v-model="kategoriInput" input-id="nama-kategori" fluid required />
        <label for="nama-kategori">Nama Kategori</label>
      </FloatLabel>
      <CTA
        type="submit"
        :disabled="isLoading"
        :loading="isLoading"
        label="Tambah Kategori"
        class="ms-auto"
      />
    </form>

    <DataTable scroll-height="60vh" :rows="20" :value="kategori" striped-rows>
      <template #header>
        <p>Menampilkan {{ kategori?.length || 0 }} kategori.</p>
      </template>
      <Column field="kategori" header="Kategori" />
      <Column header="Aksi">
        <template #body="slotProps">
          <CTA label="Hapus" @click="deleteCategory(slotProps.data.kategori)" />
        </template>
      </Column>

      <template #empty>Tidak ada kategori ditemukan.</template>
    </DataTable>
  </section>
  <Toast />
</template>
