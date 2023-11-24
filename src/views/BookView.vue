<script setup>
import { onMounted, ref } from "vue"
import BaseLayout from "../layouts/BaseLayout.vue"
import TheDialog from "../components/TheDialog.vue"
import CTA from "../components/CTA.vue"

import router from "../router"
import { supabase } from "../supabase"
import { useRoute } from "vue-router"
import { useAuthStore } from "../stores/auth"
import { ambilGambarBukuDariISBN, pinjamBukuDariISBN } from "../lib/utils"

const dataBuku = ref({})

const authStore = useAuthStore()

async function ambilDataBuku(no_isbn) {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select("*, peminjaman(sudah_dikonfirmasi)")
      .eq("no_isbn", no_isbn)
      .eq("peminjaman.user_id", authStore.session.user.id)
    if (error) throw error
    return data[0]
  } catch (err) {
    console.error(err.message)
  }
}

const imgURL = ref("")

//ambl data dan gambar buku on first load
onMounted(async () => {
  const route = useRoute()
  const { isbn } = route.params
  dataBuku.value = await ambilDataBuku(isbn)

  imgURL.value = await ambilGambarBukuDariISBN(isbn)
})

const dialogIsOpen = ref(false)
const dialogMessage = ref("")

function openDialog(message) {
  dialogIsOpen.value = true
  dialogMessage.value = message
}

async function pinjamBuku(buku) {
  if (!authStore.session) {
    openDialog("kalau mau pinjam buku, buat akun dulu ya")
    router.push({ name: "sign-in" })
    return
  }

  if (confirm(`Beneran mau pinjem buku ${buku.judul}?`)) {
    try {
      await pinjamBukuDariISBN(buku.no_isbn)
      openDialog(`sukses meminjam buku ${buku.judul}`)
    } catch (err) {
      openDialog(err.message)
    }
  }
}

// TODO: buat logika kembalikan buku
async function kembalikanBuku(isbn) {
  alert(`bentar blom dibuat. btw isbnnya ${isbn}`)
}

async function masukkanWishlist(no_isbn) {
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

function perbaruiDataBuku(payload) {
  const newData = payload.new
  dataBuku.value = newData
}

supabase
  .channel("peminjaman")
  .on("postgres_changes", { event: "*", schema: "public", table: "peminjaman" }, perbaruiDataBuku)
  .subscribe()
</script>

<template>
  <BaseLayout>
    <div class="buku">
      <figure class="buku__gambar">
        <img :src="imgURL" alt="" width="400" height="600" />
      </figure>

      <figcaption class="buku__info">
        <h1>{{ dataBuku.judul }}</h1>
        <p>{{ dataBuku.no_isbn }}</p>
        <p>{{ dataBuku.penulis }}</p>
        <p>{{ dataBuku.penerbit }} - {{ dataBuku.alamat_terbit }} {{ dataBuku.tahun_terbit }}</p>
        <p>{{ dataBuku.jumlah_exspl }}</p>

        {{ dataBuku.peminjaman }}
        <div class="button-container">
          <CTA
            @click="pinjamBuku(dataBuku)"
            :fill="true"
            v-if="!dataBuku.peminjaman?.sudah_dikembalikan"
          >
            Pinjam buku
          </CTA>
          <CTA
            @click="kembalikanBuku(dataBuku.no_isbn)"
            v-else
            :disabled="dataBuku.peminjaman?.sudah_dikonfirmasi"
          >
            Kembalikan buku
          </CTA>
          <CTA
            @click="masukkanWishlist(dataBuku.no_isbn)"
            :disabled="!dataBuku.peminjaman?.sudah_dikonfirmasi"
          >
            tambahkan ke wishlist
          </CTA>
        </div>
      </figcaption>
    </div>

    <TheDialog :is-open="dialogIsOpen" @dialog-close="dialogIsOpen = false">
      <h2>Info!!</h2>
      {{ dialogMessage }}
    </TheDialog>
  </BaseLayout>
</template>

<style scoped>
.buku {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.buku__gambar img {
  object-fit: cover;
}
</style>
