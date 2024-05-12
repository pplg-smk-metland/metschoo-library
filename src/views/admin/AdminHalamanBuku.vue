<script setup lang="ts">
import { onMounted, ref } from "vue"
import { StorageError } from "@supabase/storage-js"
import { supabase } from "@/lib/supabase"
import { getAllAvailableCategories } from "@/lib/utils"
import { useDialog } from "@/lib/composables"
import { useRoute, useRouter } from "vue-router"
import type { Kategori } from "@/types"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import CTA from "@/components/CTA.vue"
import TheDialog from "@/components/TheDialog.vue"

const isLoading = ref(false)

const availableCategories = ref<Kategori[] | null>([])
const route = useRoute()
const router = useRouter()
const currentRoute = useRoute()

const isbn = currentRoute.params.isbn
const bukuQuery = supabase
  .from("buku")
  .select("*, kategori_buku(kategori)")
  .eq("no_isbn", isbn)
  .single()

const { dialog } = useDialog()
const { dialog: errDialog } = useDialog()

type Buku = QueryData<typeof bukuQuery>
const buku = ref<Buku | null>(null)

async function ambilBuku(): Promise<Buku | null> {
  try {
    isLoading.value = true
    const { data, error } = await bukuQuery
    if (error) throw error
    return data
  } catch (err) {
    console.trace((err as PostgrestError).message)
    errDialog.value.open(`Buku dengan ISBN ${isbn} tidak ditemukan.`)
    return null
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  buku.value = await ambilBuku()
  availableCategories.value = await getAllAvailableCategories()
})

async function editBook() {
  try {
    const { error } = await supabase
      .from("buku")
      .update({
        ...buku.value,
      })
      .eq("no_isbn", route.params.isbn)
    if (error) throw error
  } catch (err) {
    console.trace((err as PostgrestError).message)
  }
}

async function deleteBook(isbn: string) {
  isLoading.value = true
  try {
    const { error } = await supabase.from("buku").delete().eq("no_isbn", isbn)
    if (error) throw error

    const response = await supabase.storage.from("Buku").remove([`${isbn}/${isbn}`])
    if (response.error) throw response.error
    if (error) throw error
    dialog.value.open("Buku sukses dihapus.")
  } catch (err) {
    if (err instanceof StorageError) {
      errDialog.value.open(
        "Kesalahan terjadi saat menghapus gambar sampul buku. Silahkan coba lagi dalam beberapa saat."
      )
      console.trace(err.message)
    }

    errDialog.value.open("Kesalahan terjadi saat menghapus data buku. Silahkan coba lagi.")
    console.trace(err as PostgrestError)
  } finally {
    isLoading.value = false
  }
}

const formIsVisible = ref(false)

function toggleFormVisibility() {
  formIsVisible.value = !formIsVisible.value
}
</script>

<template>
  <LoadingSpinner v-if="isLoading" />

  <header v-if="!buku">
    <h1>Ada yang salah!</h1>
    <p>Silahkan coba lagi dalam beberapa saat.</p>
  </header>

  <div v-else class="wrapper">
    <article v-if="!formIsVisible" class="buku">
      <routerLink :to="{ name: 'admin' }"> Kembali </routerLink>

      <h1>{{ buku.judul }} - {{ buku.jumlah_exspl }}</h1>
      <p>{{ buku.penulis }}</p>
      <p>{{ buku.asal }}</p>
      <p>{{ buku.penerbit }}</p>
      <p>{{ buku.tahun_terbit }} - {{ buku.alamat_terbit }}</p>
      <p>{{ buku.kategori_buku?.kategori }}</p>
    </article>

    <article v-else>
      <h1>Edit</h1>
      <CTA @click="toggleFormVisibility"> Go back </CTA>

      <form class="buku-edit" @submit.prevent="editBook">
        <label for="buku-judul">Judul</label>
        <input id="buku-judul" v-model="buku.judul" type="text" name="buku-judul" required />
        <label for="buku-asal">Asal</label>
        <input id="buku-asal" v-model="buku.asal" type="text" name="buku-asal" required />
        <label for="buku-penulis">ISBN</label>
        <input id="buku-isbn" v-model="buku.no_isbn" type="text" name="buku-isbn" required />
        <label for="buku-penulis">Penulis</label>
        <input id="buku-penulis" v-model="buku.penulis" type="text" name="buku-penulis" required />
        <label for="buku-penerbit">Penerbit</label>
        <input
          id="buku-penerbit"
          v-model="buku.penerbit"
          type="text"
          name="buku-penerbit"
          required
        />
        <label for="buku-tahun-terbit">Tahun terbit</label>
        <input
          id="buku-tahun-terbit"
          v-model="buku.tahun_terbit"
          type="text"
          name="buku-tahun-terbit"
          required
        />
        <label for="buku-alamat-terbit">Alamat terbit</label>
        <input
          id="buku-alamat-terbit"
          v-model="buku.alamat_terbit"
          type="text"
          name="buku-alamat-terbit"
          required
        />
        <label for="buku-jumlah">Jumlah</label>
        <input
          id="buku-jumlah"
          v-model="buku.jumlah_exspl"
          type="number"
          name="buku-jumlah"
          min="0"
          max="10000"
          required
        />
        <label for="buku-kategori">Kategori</label>
        <select id="buku-kategori" v-model="buku.kategori_id" name="buku-kategori" required>
          <option value="" disabled>Please select one</option>
          <option v-for="category in availableCategories" :key="category.id" :value="category.id">
            {{ category.id }} - {{ category.kategori }}
          </option>
        </select>

        <CTA>Save changes</CTA>
      </form>
    </article>

    <div class="button-container">
      <CTA danger @click="deleteBook(buku.no_isbn)"> Delete </CTA>
      <CTA v-show="!formIsVisible" @click="toggleFormVisibility"> Edit </CTA>
    </div>
  </div>

  <TheDialog :is-open="errDialog.isOpen" @dialog-close="router.push({ name: 'admin-data-buku' })">
    <h2>Ada kesalahan!</h2>
    <p>
      {{ errDialog.message }}
    </p>
  </TheDialog>
  <TheDialog :is-open="dialog.isOpen" @dialog-close="router.push({ name: 'admin-data-buku' })">
    <h2>Sukses!</h2>
    <p>
      {{ dialog.message }}
    </p>
  </TheDialog>
</template>

<style scoped>
.buku-edit {
  padding-block: 1rem;
}

.buku-edit button {
  margin-block: 1rem;
}
</style>
