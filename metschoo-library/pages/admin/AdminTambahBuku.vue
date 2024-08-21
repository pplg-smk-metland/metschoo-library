<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useBuku, useDialog } from "@/composables"
import Select from "primevue/select"
import { StorageError } from "@supabase/storage-js"
import type { Buku, Kategori } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"

import CTA from "@/components/CTA.vue"
import TheDialog from "@/components/TheDialog.vue"
import type { Database } from "~/types/supabase"

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
  <h1>Tambah buku</h1>

  <section class="buku-container">
    <figure class="buku-gambar">
      <img
        v-if="bukuGambarEl && bukuGambarFile"
        :src="bukuGambarURL"
        width="450"
        height="800"
        :alt="`gambar buku ${buku?.judul}`"
      />

      <p v-else class="buku-gambar__placeholder">Gambar buku akan muncul di sini.</p>
    </figure>

    <form @submit.prevent="addNewBook(buku)" class="buku-form">
      <label for="buku-gambar">
        Gambar buku
        <input
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
        <input
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
        <input
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
        <input
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
        <input
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
        <input
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
        <input
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
        <input
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
        <input
          id="buku-asal"
          v-model="buku.asal"
          type="text"
          name="buku-asal"
          placeholder="asal buku"
          required
        />
      </label>
      <CTA type="submit" :disabled="isLoading" label="Tambah buku baru" class="buku-form__submit" />

      <TheDialog :is-open="errDialog.isOpen" @dialog-close="errDialog.close()">
        <h2>Ada kesalahan!</h2>
        <p>{{ errDialog.message }}</p>
      </TheDialog>

      <TheDialog
        :is-open="dialog.isOpen"
        @dialog-close="router.push({ name: 'admin-buku', params: { isbn: buku.no_isbn } })"
      >
        <h2>Sukses!</h2>
        <p>{{ dialog.message }}</p>
      </TheDialog>
    </form>
  </section>
</template>

<style scoped>
.buku-container {
  display: grid;
  grid-template-columns: 35ch 1fr;
  gap: 2rem;

  @media screen and (max-width: 60em) {
    grid-template-columns: 1fr;
  }
}

.buku-gambar {
  outline: 2px solid var(--neutral);
  border-radius: 0.5rem;
  overflow: hidden;
}

.buku-gambar img {
  width: 100%;
}

.buku-gambar__placeholder {
  text-align: center;
}

.buku-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.buku-form label {
  padding: 0;
}

.buku-form__submit {
  grid-column: span 2;
}
</style>
