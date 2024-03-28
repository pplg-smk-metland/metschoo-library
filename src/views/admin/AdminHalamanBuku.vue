<script setup>
import { onMounted, ref } from "vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { supabase } from "../../lib/supabase"
import { useRoute } from "vue-router"
import CTA from "@/components/CTA.vue"

const isLoading = ref(false)

const buku = ref({})
const router = useRoute()

async function ambilBuku() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("buku")
      .select("*, kategori_buku(kategori)")
      .eq("no_isbn", router.params.isbn)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.trace(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  buku.value = await ambilBuku()
})

//TODO: add kategori
async function editBook() {
  try {
    const { error } = await supabase
      .from("buku")
      .update({
        judul: buku.value.judul,
        no_isbn: buku.value.no_isbn,
        penulis: buku.value.penulis,
        penerbit: buku.value.penerbit,
        tahun_terbit: buku.value.tahun_terbit,
        alamat_terbit: buku.value.alamat_terbit,
        asal: buku.value.asal,
        jumlah_exspl: buku.value.jumlah_exspl,
      })
      .eq("no_isbn", router.params.isbn)
    if (error) throw error
  } catch (err) {
    console.trace(err.message)
  }
}

function deleteBook() {
  alert("not implemented yet")
}

const formIsVisible = ref(false)

function toggleFormVisibility() {
  formIsVisible.value = !formIsVisible.value
}
</script>

<template>
  <LoadingSpinner v-if="isLoading" />

  <article class="buku" v-else v-show="!formIsVisible">
    <h1>Data {{ buku.judul }}</h1>
    <p>{{ buku.penulis }}</p>
    <p>{{ buku.penerbit }}</p>
    <p>{{ buku.tahun_terbit }} - {{ buku.alamat_terbit }}</p>
    <!-- <p>{{ buku.kategori_buku.kategori }}</p> -->
  </article>

  <article v-show="formIsVisible">
    <h1>Edit</h1>
    <CTA @click="toggleFormVisibility">Go back</CTA>

    <form class="buku-edit" @submit.prevent="editBook">
      <label for="buku-judul">Judul</label>
      <input type="text" name="buku-judul" id="buku-judul" v-model="buku.judul" />
      <label for="buku-asal">Asal</label>
      <input type="text" name="buku-asal" id="buku-asal" v-model="buku.asal" />
      <label for="buku-penulis">Penulis</label>
      <input type="text" name="buku-isbn" id="buku-isbn" v-model="buku.no_isbn" />
      <label for="buku-penulis">Penulis</label>
      <input type="text" name="buku-penulis" id="buku-penulis" v-model="buku.penulis" />
      <label for="buku-penerbit">Penerbit</label>
      <input type="text" name="buku-penerbit" id="buku-penerbit" v-model="buku.penerbit" />
      <label for="buku-tahun-terbit">Tahun terbit</label>
      <input
        type="text"
        name="buku-tahun-terbit"
        id="buku-tahun-terbit"
        v-model="buku.tahun_terbit"
      />
      <label for="buku-alamat-terbit">Alamat terbit</label>
      <input
        type="text"
        name="buku-alamat-terbit"
        id="buku-alamat-terbit"
        v-model="buku.alamat_terbit"
      />
      <label for="buku-jumlah">Jumlah</label>
      <input
        type="number"
        name="buku-jumlah"
        id="buku-jumlah"
        max="10000"
        v-model="buku.jumlah_exspl"
      />
      <!-- <label for="buku-kategori">Kategori</label> -->
      <!-- <input -->
      <!--   type="text" -->
      <!--   name="buku-kategori" -->
      <!--   id="buku-kategori" -->
      <!--   v-model="buku.kategori_buku.kategori" -->
      <!-- /> -->
      <CTA>Save</CTA>
    </form>
  </article>

  <div class="button-container">
    <CTA @click="deleteBook" danger>Delete</CTA>
    <CTA @click="toggleFormVisibility" v-show="!formIsVisible">Edit</CTA>
  </div>
</template>

<style scoped>
.buku-edit {
  padding-block: 1rem;
}

.buku-edit button {
  margin-block: 1rem;
}
</style>
