<script setup lang="ts">
import CTA from "@/components/CTA.vue"
import { onMounted, ref } from "vue"
import { supabase } from "../../lib/supabase"
import { getAllAvailableCategories } from "../../lib/utils"

const buku = ref({
  no_isbn: "",
  judul: "",
  penulis: "",
  penerbit: "",
  tahun_terbit: "",
  alamat_terbit: "",
  asal: "",
  jumlah_exspl: 0,
  kategori_id: 0,
})

const isLoading = ref(false)

function previewBookImage() {
  bukuGambarFile.value = bukuGambarEl.value.files[0]
  bukuGambarURL.value = URL.createObjectURL(bukuGambarFile.value)
}

async function uploadBookImage(isbn: string, file: File) {
  isLoading.value = true
  try {
    const { error } = await supabase.storage.from("Buku").upload(`${isbn}/${isbn}`, file, {
      upsert: false,
    })
    if (error) throw error
  } catch (error) {
    console.trace(error.message)
  } finally {
    isLoading.value = false
  }
}

async function addNewBook() {
  isLoading.value = true
  const {
    no_isbn,
    judul,
    penulis,
    penerbit,
    tahun_terbit,
    alamat_terbit,
    asal,
    jumlah_exspl,
    kategori_id,
  } = buku.value

  try {
    const { error } = await supabase.from("buku").insert({
      no_isbn,
      judul,
      penulis,
      penerbit,
      tahun_terbit,
      alamat_terbit,
      asal,
      jumlah_exspl,
      kategori_id,
    })

    if (error) throw error

    await uploadBookImage(no_isbn, bukuGambarFile.value)
  } catch (err) {
    console.trace(err.message)
  } finally {
    isLoading.value = false
  }
}

const bukuGambarEl = ref(null)
const bukuGambarURL = ref("")
const bukuGambarFile = ref(null)

const availableCategories = ref([])

onMounted(async () => {
  availableCategories.value = await getAllAvailableCategories()
})
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

  <form @submit.prevent="addNewBook">
    <label for="buku-gambar">Gambar buku</label>
    <input
      type="file"
      id="buku-gambar"
      name="buku-gambar"
      accept="image/*"
      ref="bukuGambarEl"
      @change="previewBookImage(bukuGambarEl, bukuGambarFile)"
      required
    />

    <label for="buku-judul">Judul</label>
    <input type="text" name="buku-judul" id="buku-judul" required v-model="buku.judul" />
    <label for="buku-isbn">ISBN</label>
    <input type="text" name="buku-isbn" id="buku-isbn" required v-model="buku.no_isbn" />
    <label for="buku-penulis">penulis</label>
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
    <input type="text" name="buku-penulis" id="buku-penulis" required v-model="buku.penulis" />
    <label for="buku-penerbit">penerbit</label>
    <input type="text" name="buku-penerbit" id="buku-penerbit" required v-model="buku.penerbit" />
    <label for="buku-tahun-terbit">Tahun terbit</label>
    <input
      type="text"
      name="buku-tahun-terbit"
      id="buku-tahun-terbit"
      required
      v-model="buku.tahun_terbit"
    />
    <label for="buku-alamat-terbit">Alamat terbit</label>
    <input
      type="text"
      name="buku-alamat-terbit"
      id="buku-alamat-terbit"
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
      required
      v-model="buku.jumlah_exspl"
    />
    <label for="buku-asal"> Asal </label>
    <input type="text" name="buku-asal" id="buku-asal" required v-model="buku.asal" />

    <CTA>Tambah buku baru</CTA>
  </form>
</template>

<style>
.buku-gambar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16/9;
}
</style>
