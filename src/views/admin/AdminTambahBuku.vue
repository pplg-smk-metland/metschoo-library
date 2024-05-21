<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useBuku, useDialog } from "@/lib/composables"
import { supabase } from "@/lib/supabase"
import { StorageError } from "@supabase/storage-js"
import type { Buku, Kategori } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"
import { getAllAvailableCategories } from "@/lib/utils"

import CTA from "@/components/CTA.vue"
import TheDialog from "@/components/TheDialog.vue"

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
    if (error instanceof StorageError) {
      errDialog.value.open(
        `Ada kesalahan saat mengunggah sampul buku. Silahkan coba lagi dalam beberapa saat. ${error.message}`
      )
    } else {
      errDialog.value.open(
        `Ada kesalahan saat mengunggah buku. Mungkin ISBNnya sudah ada? ${
          (error as PostgrestError).message
        }`
      )
    }
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

  <div class="buku-container">
    <div class="buku-gambar">
      <img
        v-if="bukuGambarEl && bukuGambarFile"
        :src="bukuGambarURL"
        width="450"
        height="800"
        alt=""
      />
    </div>

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
          placeholder="judul buku"
          required
        />
      </label>
      <label for="buku-kategori">
        Kategori
        <select id="buku-kategori" v-model="buku.kategori_id" name="buku-kategori" required>
          <option value="" disabled>Pilih salah satu</option>
          <option
            v-for="kategori in availableCategories"
            :key="kategori.id"
            :value="Number(kategori.id)"
          >
            {{ kategori.kategori }}
          </option>
        </select>
      </label>
      <label for="buku-penulis">
        penulis
        <input
          id="buku-penulis"
          v-model="buku.penulis"
          type="text"
          name="buku-penulis"
          placeholder="judul buku"
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
      <CTA :disabled="isLoading" label="Tambah buku baru" class="buku-form__submit" />

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
  </div>
</template>

<style>
.buku-container {
  display: grid;
  grid-template-columns: 35ch 1fr;
  gap: 2rem;

  @media screen and (max-width: 60em) {
    grid-template-columns: 1fr;
  }
}

.buku-gambar img {
  width: 100%;
}

.buku-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 1rem;
}

.buku-form__submit {
  margin-block: 1rem;
  grid-column: span 2;
}
</style>
