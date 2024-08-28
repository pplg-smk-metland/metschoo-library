<script setup lang="ts">
import { useBuku, useDialog } from "@/composables"
import Select from "primevue/select"
import { StorageError } from "@supabase/storage-js"
import type { Buku, Kategori } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"

import type { Database } from "~/types/supabase"

useHead({
  title: "Tambah Buku",
})

definePageMeta({
  layout: "admin",
})

const supabase = useSupabaseClient<Database>()
const { buku } = useBuku()

const isLoading = ref(false)
const { dialog } = useDialog()
const { dialog: errDialog } = useDialog()

const bukuGambarEl = ref<HTMLInputElement | null>(null)
const bukuGambarURL = ref("")
const bukuGambarFile = ref()

function previewBookImage(bukuGambarEl: HTMLInputElement) {
  bukuGambarFile.value = bukuGambarEl.files?.[0]
  bukuGambarURL.value = URL.createObjectURL(bukuGambarFile.value)
}

async function uploadBookImage(isbn: string, file: File) {
  isLoading.value = true
  try {
    const { error } = await supabase.storage.from("Buku").upload(`public/${isbn}`, file, {
      upsert: false,
    })
    return error
  } finally {
    isLoading.value = false
  }
}

async function insertBookData(buku: Buku) {
  const { error } = await supabase.from("buku").insert({ ...buku })
  return error
}

async function addNewBook(buku: Buku) {
  isLoading.value = true

  const { no_isbn } = buku

  try {
    const insertError = await insertBookData(buku)
    if (insertError) throw insertError

    const uploadError = await uploadBookImage(no_isbn, bukuGambarFile.value)
    if (uploadError) throw uploadError
    dialog.value.open("Buku berhasil ditambahkan!")
  } catch (error) {
    console.table(error as Error)

    let message: string
    if (error instanceof StorageError) {
      message = `Ada kesalahan saat mengunggah sampul buku. Silahkan coba lagi dalam beberapa saat. ${error.message}`
    } else {
      message = `Ada kesalahan saat mengunggah buku. Mungkin ISBNnya sudah ada? ${
        (error as PostgrestError).message
      }`
    }

    errDialog.value.open(message)
  } finally {
    isLoading.value = false
  }
}

const availableCategories = ref<Kategori[] | null>([])

onMounted(async () => {
  availableCategories.value = await getAllAvailableCategories()
})

const router = useRouter()
</script>

<template>
  <header>
    <h1>Tambah buku</h1>
  </header>

  <section class="grid gap-8 buku-container">
    <figure
      class="outline outline-2 outline-gray-300 dark:outline-gray-700 rounded-lg overflow-hidden"
    >
      <img
        v-if="bukuGambarEl && bukuGambarFile"
        :src="bukuGambarURL"
        width="450"
        height="800"
        :alt="`gambar buku ${buku?.judul}`"
      />

      <p v-else class="text-center">Gambar buku akan muncul di sini.</p>
    </figure>

    <form @submit.prevent="addNewBook(buku)" class="grid grid-cols-2 gap-4">
      <label for="buku-gambar">
        Gambar buku
        <InputText
          id="buku-gambar"
          ref="bukuGambarEl"
          type="file"
          name="buku-gambar"
          accept="image/*"
          required
          @change="previewBookImage(bukuGambarEl!)"
        />
      </label>

      <label for="buku-judul">
        Judul
        <InputText
          id="buku-judul"
          v-model="buku.judul"
          type="text"
          name="buku-judul"
          placeholder="judul buku"
          required
        />
      </label>
      <label for="buku-isbn">
        ISBN
        <InputText
          id="buku-isbn"
          v-model="buku.no_isbn"
          type="text"
          name="buku-isbn"
          placeholder="ISBN buku"
          required
        />
      </label>

      <label for="buku-kategori">
        Kategori
        <Select
          v-model="buku.kategori_id"
          placeholder="Pilih kategori"
          :options="availableCategories"
          checkmark
          optionLabel="kategori"
          optionValue="id"
          required
        />
      </label>
      <label for="buku-penulis">
        penulis
        <InputText
          id="buku-penulis"
          v-model="buku.penulis"
          type="text"
          name="buku-penulis"
          placeholder="penulis buku"
          required
        />
      </label>
      <label for="buku-penerbit">
        penerbit
        <InputText
          id="buku-penerbit"
          v-model="buku.penerbit"
          type="text"
          name="buku-penerbit"
          placeholder="penerbit"
          required
        />
      </label>

      <label for="buku-tahun-terbit">
        Tahun terbit
        <InputText
          id="buku-tahun-terbit"
          v-model="buku.tahun_terbit"
          type="text"
          name="buku-tahun-terbit"
          placeholder="tahun terbit"
          required
        />
      </label>
      <label for="buku-alamat-terbit">
        Alamat terbit
        <InputText
          id="buku-alamat-terbit"
          v-model="buku.alamat_terbit"
          type="text"
          name="buku-alamat-terbit"
          placeholder="alamat terbit"
          required
        />
      </label>

      <label for="buku-jumlah">
        Jumlah
        <InputText
          id="buku-jumlah"
          v-model="buku.jumlah_exspl"
          type="number"
          name="buku-jumlah"
          min="0"
          max="10000"
          placeholder="jumlah buku"
          required
        />
      </label>

      <label for="buku-asal">
        Asal
        <InputText
          id="buku-asal"
          v-model="buku.asal"
          type="text"
          name="buku-asal"
          placeholder="asal buku"
          required
        />
      </label>

      <CTA type="submit" :disabled="isLoading" label="Tambah buku baru" class="col-span-2" />

      <TheDialog :is-open="errDialog.isOpen" @dialog-close="errDialog.close()">
        <h2>Ada kesalahan!</h2>
        <p>{{ errDialog.message }}</p>
      </TheDialog>

      <TheDialog
        :is-open="dialog.isOpen"
        @dialog-close="router.push(`/admin/buku/${buku.no_isbn}`)"
      >
        <h2>Sukses!</h2>
        <p>{{ dialog.message }}</p>
      </TheDialog>
    </form>
  </section>
</template>

<style scoped>
.buku-container {
  grid-template-columns: 35ch 1fr;

  @media screen and (max-width: 60em) {
    grid-template-columns: 1fr;
  }
}

.buku-form label {
  padding: 0;
}
</style>
