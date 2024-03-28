<script setup>
import { onMounted, ref } from "vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { supabase } from "@/lib/supabase"
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

    <form class="buku-edit">
      <label for="buku-judul">Judul</label>
      <input type="text" name="buku-judul" id="buku-judul" />
      <label for="buku-penulis">Penulis</label>
      <input type="text" name="buku-penulis" id="buku-penulis" />
      <label for="buku-penerbit">Penerbit</label>
      <input type="text" name="buku-penerbit" id="buku-penerbit" />
      <label for="buku-tahun-terbit">Tahun terbit</label>
      <input type="text" name="buku-tahun-terbit" id="buku-tahun-terbit" />
      <label for="buku-alamat-terbit">Alamat terbit</label>
      <input type="text" name="buku-alamat-terbit" id="buku-alamat-terbit" />
      <label for="buku-kategori">Kategori</label>
      <input type="text" name="buku-kategori" id="buku-kategori" />
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
