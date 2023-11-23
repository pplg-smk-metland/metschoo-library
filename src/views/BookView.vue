<script setup>
import { onMounted, ref } from "vue"
import BaseLayout from "../layouts/BaseLayout.vue"
import CTA from "../components/CTA.vue"
import { supabase } from "../supabase"
import { useRoute } from "vue-router"

const dataBuku = ref({})

async function ambilDataBuku(no_isbn) {
  try {
    const { data, error } = await supabase.from("buku").select("*").eq("no_isbn", no_isbn)
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error(err.message)
  }
}

const cdnURL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Buku`
const imgURL = ref("")

async function ambilGambarBuku() {
  const { data, error } = await supabase.storage
    .from("Buku")
    .list(`${dataBuku.value.no_isbn}/`, { limit: 1, offset: 0, search: dataBuku.value.no_isbn })
  if (error) throw error

  return data[0]?.name
}

onMounted(async () => {
  //ambl databuku
  const route = useRoute()
  const { isbn } = route.params
  dataBuku.value = await ambilDataBuku(isbn)

  // ambil gambar buku
  imgURL.value = await ambilGambarBuku()
})
</script>

<template>
  <BaseLayout>
    <div class="buku">
      <div class="buku__gambar">
        <img :src="`${cdnURL}/${dataBuku.no_isbn}/${imgURL}`" alt="" width="400" />
      </div>
      <div class="buku__info">
        <h1>{{ dataBuku.judul }}</h1>
        <p>{{ dataBuku.no_isbn }}</p>
        <p>{{ dataBuku.penulis }}</p>
        <p>{{ dataBuku.penerbit }} - {{ dataBuku.alamat_terbit }} {{ dataBuku.tahun_terbit }}</p>
        <p>{{ dataBuku.jumlah_exspl }}</p>

        <div class="button-container">
          <CTA @click="alert('bentar belum dibuat')">Pinjam buku</CTA>
          <CTA @click="alert('bentar belum dibuat')">tambahkan ke wishlist</CTA>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.buku {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
