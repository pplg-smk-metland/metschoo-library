<script setup lang="ts">
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import PageHeader from "~/components/PageHeader.vue"
import { FloatLabel, InputText, Toast } from "primevue"
import type { Database } from "~/types/database.types.ts"
import type { Kategori } from "~/types"

useHead({
  title: "Kategori buku",
})

definePageMeta({
  layout: "admin",
})

const categoryInput = ref("")
const isLoading = ref(false)
const toast = useToast()

const supabase = useSupabaseClient<Database>()

const addNewCategory = async () => {
  if (!categoryInput.value) {
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
    const newCategory = { kategori: categoryInput.value }
    const { data, error } = await supabase
      .from("kategori_buku")
      .insert(newCategory)
      .select()
      .single()

    if (error) throw error
    categories.value!.push(data)

    toast.add({
      severity: "success",
      summary: "Berhasil menambah kategori",
      detail: "Kategori berhasil ditambahkan",
      life: 3000,
    })

    categoryInput.value = ""
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

const deleteCategory = async (targetCategory: string) => {
  try {
    const { error } = await supabase.from("kategori_buku").delete().eq("kategori", targetCategory)

    if (error) throw error

    categories.value = categories.value!.filter(({ kategori }) => kategori != targetCategory)

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

const editCategoryState = ref({
  isEditing: false,
  targetCategoryId: 0,
})

// store selected category for editing
const selectedCategory = ref<Kategori>()

const initiateEditCategory = (targetCategoryId: number) => {
  editCategoryState.value = {
    targetCategoryId,
    isEditing: true,
  }

  if (!categories.value) return
  const target = categories.value.find(({ id }) => id === targetCategoryId)
  if (target) selectedCategory.value = Object.create(target)
}

const cancelEditCategory = () => {
  editCategoryState.value = { targetCategoryId: 0, isEditing: false }
}

const editCategory = async ({ kategori, id }: Kategori) => {
  try {
    const { error } = await supabase.from("kategori_buku").update({ kategori }).eq("id", id)
    if (error) throw error

    toast.add({
      severity: "success",
      summary: "sukses mengubah kategori",
      detail: `sukses mengubah kategori ${kategori}!`,
      life: 3000,
    })

    editCategoryState.value = { targetCategoryId: 0, isEditing: false }
  } catch (error) {
    console.error(error)

    toast.add({
      severity: "error",
      summary: "gagal mengubah kategori",
      detail: "ada kesalahan saatu menghapus kategori, silahkan coba lagi.",
      life: 3000,
    })
  }
}

const { data: categories } = useAsyncData(async () => {
  const categories = await getAllAvailableCategories()
  return categories
})
</script>

<template>
  <PageHeader heading="Data buku" />
  <section class="main-section">
    <form class="py-4 flex gap-4 justify-between" @submit.prevent="addNewCategory">
      <FloatLabel>
        <InputText v-model="categoryInput" input-id="nama-kategori" fluid required />
        <label for="nama-kategori">Nama Kategori</label>
      </FloatLabel>

      <CTA
        type="submit"
        :disabled="isLoading"
        :loading="isLoading"
        label="Tambah Kategori"
        fill
        class="ms-auto"
      />
    </form>

    <DataTable scroll-height="60vh" :rows="20" :value="categories" striped-rows>
      <template #header>
        <p>Menampilkan {{ categories?.length || 0 }} kategori.</p>
      </template>

      <Column field="kategori" header="Kategori">
        <template #body="{ data }: { data: Kategori }">
          <InputText
            v-show="editCategoryState.isEditing && editCategoryState.targetCategoryId === data.id"
            v-model="data.kategori"
            placeholder="nama kategori baru"
            required
          />

          <span v-show="editCategoryState.targetCategoryId !== data.id">{{ data.kategori }}</span>
        </template>
      </Column>

      <Column header="Aksi">
        <template #body="{ data }: { data: Kategori }">
          <div v-show="editCategoryState.targetCategoryId !== data.id" class="flex gap-4">
            <CTA label="Hapus" severity="danger" @click="deleteCategory(data.kategori)" />
            <CTA label="Edit" @click="initiateEditCategory(data.id)" />
          </div>

          <div
            v-show="editCategoryState.isEditing && editCategoryState.targetCategoryId === data.id"
            class="flex gap-4"
          >
            <CTA label="Batal" severity="danger" @click="cancelEditCategory()" />
            <CTA label="Simpan" @click="editCategory(data)" />
          </div>
        </template>
      </Column>

      <template #empty>Tidak ada kategori ditemukan.</template>
    </DataTable>
  </section>

  <Toast />
</template>
