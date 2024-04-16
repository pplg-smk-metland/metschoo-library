<script setup lang="ts">
import { onMounted, ref } from "vue"
import { StorageError } from "@supabase/storage-js"
import { supabase } from "../../lib/supabase"
import { getAllAvailableCategories } from "../../lib/utils"
import { useDialog } from "../../lib/composables"
import { useRoute, useRouter } from "vue-router"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import CTA from "@/components/CTA.vue"
import TheDialog from "../../components/TheDialog.vue"
import type { Kategori } from "@/types"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

const isLoading = ref(false)

const availableCategories = ref<Kategori[]>([])
const route = useRoute()
const router = useRouter()
const currentRoute = useRoute()

const isbn = currentRoute.params.isbn
const bukuQuery = supabase
  .from("buku")
  .select("*, kategori_buku(kategori)")
  .eq("no_isbn", isbn)
  .single()

type Buku = QueryData<typeof bukuQuery>
const buku = ref<Buku | null>(null)

const { dialog } = useDialog()
const { dialog: errDialog } = useDialog()

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
    let { error } = await supabase.from("buku").delete().eq("no_isbn", isbn)
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

  <article class="buku" v-else v-show="!formIsVisible && buku">
    <h1>Data {{ buku?.judul }} - {{ buku?.jumlah_exspl }}</h1>
    <p>{{ buku?.penulis }}</p>
    <p>{{ buku?.asal }}</p>
    <p>{{ buku?.penerbit }}</p>
    <p>{{ buku?.tahun_terbit }} - {{ buku?.alamat_terbit }}</p>
    <p>{{ buku?.kategori_buku?.kategori }}</p>
  </article>

  <article v-show="formIsVisible">
    <h1>Edit</h1>
    <CTA @click="toggleFormVisibility">Go back</CTA>

    <form class="buku-edit" @submit.prevent="editBook">
      <label for="buku-judul">Judul</label>
      <input type="text" name="buku-judul" id="buku-judul" required v-model="buku?.judul" />
      <label for="buku-asal">Asal</label>
      <input type="text" name="buku-asal" id="buku-asal" required v-model="buku?.asal" />
      <label for="buku-penulis">ISBN</label>
      <input type="text" name="buku-isbn" id="buku-isbn" required v-model="buku?.no_isbn" />
      <label for="buku-penulis">Penulis</label>
      <input type="text" name="buku-penulis" id="buku-penulis" required v-model="buku?.penulis" />
      <label for="buku-penerbit">Penerbit</label>
      <input
        type="text"
        name="buku-penerbit"
        id="buku-penerbit"
        required
        v-model="buku?.penerbit"
      />
      <label for="buku-tahun-terbit">Tahun terbit</label>
      <input
        type="text"
        name="buku-tahun-terbit"
        id="buku-tahun-terbit"
        required
        v-model="buku?.tahun_terbit"
      />
      <label for="buku-alamat-terbit">Alamat terbit</label>
      <input
        type="text"
        name="buku-alamat-terbit"
        id="buku-alamat-terbit"
        required
        v-model="buku?.alamat_terbit"
      />
      <label for="buku-jumlah">Jumlah</label>
      <input
        type="number"
        name="buku-jumlah"
        id="buku-jumlah"
        min="0"
        max="10000"
        required
        v-model="buku?.jumlah_exspl"
      />
      <label for="buku-kategori">Kategori</label>
      <select name="buku-kategori" id="buku-kategori" v-model="buku?.kategori_id" required>
        <option value="" disabled>Please select one</option>
        <option v-for="category in availableCategories" :key="category.id" :value="category.id">
          {{ category.id }} - {{ category.kategori }}
        </option>
      </select>

      <CTA>Save changes</CTA>
    </form>
  </article>

  <div class="button-container">
    <CTA @click="deleteBook(buku?.no_isbn!)" danger>Delete</CTA>
    <CTA @click="toggleFormVisibility" v-show="!formIsVisible">Edit</CTA>
  </div>

  <TheDialog :is-open="errDialog.isOpen" @dialog-close="router.push({ name: 'data-buku' })">
    <h2>Ada kesalahan!</h2>
    <p>
      {{ errDialog.message }}
    </p>
  </TheDialog>
  <TheDialog :is-open="dialog.isOpen" @dialog-close="router.push({ name: 'data-buku' })">
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
