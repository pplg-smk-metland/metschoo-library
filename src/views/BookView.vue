<script setup>
import { onMounted, ref } from "vue"
import BaseLayout from "../layouts/BaseLayout.vue"
import CTA from "../components/CTA.vue"

import { supabase } from "../supabase"
import { useRoute } from "vue-router"
import { useAuthStore } from "../stores/auth"
import { ambilBukuDariISBN } from "../lib/utils"

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

const imgURL = ref("")

onMounted(async () => {
  //ambl databuku
  const route = useRoute()
  const { isbn } = route.params
  dataBuku.value = await ambilDataBuku(isbn)

  // ambil gambar buku
  imgURL.value = await ambilBukuDariISBN(isbn)
})

function pinjamBuku() {
  alert("bentar ya lom dibkin")
}

async function masukkanWishlist(no_isbn) {
  const authStore = useAuthStore()
  try {
    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ user_id: authStore.session.user.id, no_isbn: no_isbn }])
    if (error) throw error
    return data
  } catch (err) {
    console.error(err.message)
  }
}
</script>

<template>
  <BaseLayout>
    <div class="buku">
      <div class="buku__gambar">
        <img :src="imgURL" alt="" width="400" />
      </div>
      <div class="buku__info">
        <h1>{{ dataBuku.judul }}</h1>
        <p>{{ dataBuku.no_isbn }}</p>
        <p>{{ dataBuku.penulis }}</p>
        <p>{{ dataBuku.penerbit }} - {{ dataBuku.alamat_terbit }} {{ dataBuku.tahun_terbit }}</p>
        <p>{{ dataBuku.jumlah_exspl }}</p>

        <div class="button-container">
          <CTA @click="pinjamBuku">Pinjam buku</CTA>
          <CTA @click="masukkanWishlist(dataBuku.no_isbn)">tambahkan ke wishlist</CTA>
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
