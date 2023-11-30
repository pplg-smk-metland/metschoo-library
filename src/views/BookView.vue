<script setup>
import { onMounted, ref } from "vue"
import router from "@/router"
import { supabase } from "@/lib/supabase"
import { useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { ambilGambarBukuDariISBN, pinjamBukuDariISBN, kembalikanBukuDariISBN } from "@/lib/utils"

import BaseLayout from "@/layouts/BaseLayout.vue"
import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"

const authStore = useAuthStore()
const dataBuku = ref({})

async function ambilDataBuku(isbn) {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select("*")
      .eq("no_isbn", isbn)
      .limit(1)
      .single()
    if (error) throw error

    return data
  } catch (err) {
    console.error(err.message)
  }
}

// cek jika buku sudah dipinjam
const bukuBisaDipinjam = ref(true)
async function cekStatusPeminjaman(isbn) {
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("tgl_pinjam, sudah_dikembalikan")
      .eq("user_id", authStore.session.user.id)
      .eq("no_isbn", isbn)
    if (error) throw error

    if (!data || !data.length) return true

    // cek data peminjaman paling baru
    const bukuPalingBaru = ref({ tgl_pinjam: new Date(0) })

    data.forEach((buku) => {
      if (
        new Date(bukuPalingBaru.value.tgl_pinjam).getTime() < new Date(buku.tgl_pinjam).getTime()
      ) {
        bukuPalingBaru.value = buku
      }
    })

    // kalau sudah dikembalikan bisa dipinjam
    return bukuPalingBaru.value.sudah_dikembalikan
  } catch (err) {
    console.error(err.message)
  }
}

// wishlist
const bukuAdaDiWishlist = ref(false)
async function CekWishlist(isbn) {
  try {
    const { count, error } = await supabase
      .from("wishlist")
      .select("no_isbn", { count: "exact", head: true })
      .eq("user_id", authStore.session.user.id)
      .eq("no_isbn", isbn)
    if (error) throw error

    return count !== null && count !== 0
  } catch (err) {
    console.error(err.message)
  }
}

const imgURL = ref("")

// ambil data dan gambar buku
onMounted(async () => {
  const route = useRoute()
  const { isbn } = route.params

  imgURL.value = await ambilGambarBukuDariISBN(isbn)
  dataBuku.value = await ambilDataBuku(isbn)

  bukuBisaDipinjam.value = await cekStatusPeminjaman(isbn)
  bukuAdaDiWishlist.value = await CekWishlist(isbn)
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

async function kembalikanBuku(isbn) {
  try {
    await kembalikanBukuDariISBN(isbn)
  } catch (err) {
    openDialog(`Gagal mengembalikan buku! ${err.message}`)
    console.error(err.message)
  }
}

async function masukkanWishlist(isbn) {
  try {
    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ user_id: authStore.session.user.id, no_isbn: isbn }])
    if (error) throw error

    openDialog(`buku berhasil ditambahkan ke dalam wishlist`)
    bukuAdaDiWishlist.value = true
    return data
  } catch (err) {
    openDialog(
      `Ada yang salah ketika menambahkan buku ke dalam wishlist. Silahkan coba beberapa saat lagi.`
    )
    console.error(err.message)
  }
}

async function perbaruiDataBuku(payload) {
  bukuBisaDipinjam.value = await cekStatusPeminjaman(payload.new.no_isbn)
}

supabase
  .channel("peminjaman")
  .on("postgres_changes", { event: "*", schema: "public", table: "peminjaman" }, perbaruiDataBuku)
  .subscribe()
</script>

<template>
  <BaseLayout>
    <div class="buku" v-if="dataBuku !== undefined">
      <figure class="buku__gambar">
        <img :src="imgURL" alt="" width="400" height="600" />
      </figure>

      <figcaption class="buku__info">
        <h1>{{ dataBuku.judul }}</h1>
        <p>{{ dataBuku.no_isbn }}</p>
        <p>{{ dataBuku.penulis }}</p>
        <p>{{ dataBuku.penerbit }} - {{ dataBuku.alamat_terbit }} {{ dataBuku.tahun_terbit }}</p>
        <p>{{ dataBuku.jumlah_exspl }}</p>

        <div class="button-container">
          <CTA @click="pinjamBuku(dataBuku)" v-show="bukuBisaDipinjam" :fill="true">
            Pinjam buku
          </CTA>
          <CTA @click="kembalikanBuku(dataBuku.no_isbn)" v-show="!bukuBisaDipinjam" :fill="true">
            Kembalikan buku
          </CTA>
          <CTA @click="masukkanWishlist(dataBuku.no_isbn)" :disabled="bukuAdaDiWishlist">
            tambahkan ke wishlist
          </CTA>
        </div>
      </figcaption>
    </div>

    <div class="not-found" v-else>
      <h1>Tidak ada buku!</h1>
      <p>Bukunya ga ada brok</p>
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
