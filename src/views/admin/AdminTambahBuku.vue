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

  <div class="buku-gambar">
    <img
      :src="bukuGambarURL"
      width="800"
      height="450"
      alt=""
      v-if="bukuGambarEl && bukuGambarFile"
    />
  </div>

  <form @submit.prevent="addNewBook(buku)">
    <label for="buku-gambar">Gambar buku</label>
    <input
      type="file"
      id="buku-gambar"
      name="buku-gambar"
      accept="image/*"
      ref="bukuGambarEl"
      @change="previewBookImage(bukuGambarEl!)"
      required
    />

    <label for="buku-judul">Judul</label>
    <input
      type="text"
      name="buku-judul"
      id="buku-judul"
      placeholder="judul buku"
      required
      v-model="buku.judul"
    />
    <label for="buku-isbn">ISBN</label>
    <input
      type="text"
      name="buku-isbn"
      id="buku-isbn"
      placeholder="judul buku"
      required
      v-model="buku.no_isbn"
    />
    <label for="buku-kategori">Kategori</label>
    <select name="buku-kategori" id="buku-kategori" v-model="buku.kategori_id" required>
      <option value="" disabled>Pilih salah satu</option>
      <option
        v-for="kategori in availableCategories"
        :key="kategori.id"
        :value="Number(kategori.id)"
      >
        {{ kategori.kategori }}
      </option>
    </select>
    <label for="buku-penulis">penulis</label>
    <input
      type="text"
      name="buku-penulis"
      id="buku-penulis"
      placeholder="judul buku"
      required
      v-model="buku.penulis"
    />
    <label for="buku-penerbit">penerbit</label>
    <input
      type="text"
      name="buku-penerbit"
      id="buku-penerbit"
      placeholder="penerbit"
      required
      v-model="buku.penerbit"
    />
    <label for="buku-tahun-terbit">Tahun terbit</label>
    <input
      type="text"
      name="buku-tahun-terbit"
      id="buku-tahun-terbit"
      placeholder="tahun terbit"
      required
      v-model="buku.tahun_terbit"
    />
    <label for="buku-alamat-terbit">Alamat terbit</label>
    <input
      type="text"
      name="buku-alamat-terbit"
      id="buku-alamat-terbit"
      placeholder="alamat terbit"
      required
      v-model="buku.alamat_terbit"
    />
    <label for="buku-jumlah">Jumlah</label>
    <input
      type="number"
      name="buku-jumlah"
      id="buku-jumlah"
      min="0"
      max="10000"
      placeholder="jumlah buku"
      required
      v-model="buku.jumlah_exspl"
    />
    <label for="buku-asal"> Asal </label>
    <input
      type="text"
      name="buku-asal"
      id="buku-asal"
      placeholder="asal buku"
      required
      v-model="buku.asal"
    />

    <CTA :disabled="isLoading">Tambah buku baru</CTA>

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
</template>

<style>
.buku-gambar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16/9;
}

form .cta {
  margin-block: 1rem;
}
</style>
