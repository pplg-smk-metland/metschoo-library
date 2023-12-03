<script setup>
import { onMounted, ref } from "vue"
import router from "@/router"
import { supabase } from "@/lib/supabase"
import { useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { ambilGambarBukuDariISBN, pinjamBukuDariISBN, kembalikanBukuDariISBN } from "@/lib/utils"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BaseLayout from "@/layouts/BaseLayout.vue"
import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"

const authStore = useAuthStore()
const dataBuku = ref({})

const isLoading = ref(false)
async function ambilDataBuku(isbn) {
  try {
    isLoading.value = true
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
  } finally {
    isLoading.value = false
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
async function cekWishlist(isbn) {
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

  bukuAdaDiWishlist.value = await cekWishlist(isbn)
  bukuBisaDipinjam.value = (await cekStatusPeminjaman(isbn)) && !bukuAdaDiWishlist.value
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

  if (!confirm(`Beneran mau pinjem buku ${buku.judul}?`)) return
  try {
    await pinjamBukuDariISBN(buku.no_isbn)
    if (bukuAdaDiWishlist.value) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", authStore.session.user.id)
        .eq("no_isbn", buku.no_isbn)
    }
    openDialog(`sukses meminjam buku ${buku.judul}`)
  } catch (err) {
    openDialog(err.message)
  }
}

async function kembalikanBuku(buku) {
  try {
    await kembalikanBukuDariISBN(buku.no_isbn)
    openDialog(`sukses mengembalikan buku ${buku.judul}`)
  } catch (err) {
    openDialog(`Gagal mengembalikan buku! ${err.message}`)
    console.error(err.message)
  }
}

async function masukkanWishlist(buku) {
  try {
    const { data, error } = await supabase
      .from("wishlist")
      .insert([{ user_id: authStore.session.user.id, no_isbn: buku.no_isbn }])
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
  bukuAdaDiWishlist.value = await cekWishlist(payload.new.no_isbn)
  bukuBisaDipinjam.value =
    (await cekStatusPeminjaman(payload.new.no_isbn)) && !bukuAdaDiWishlist.value
}

supabase
  .channel("peminjaman")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "peminjaman",
    },
    perbaruiDataBuku
  )
  .subscribe()
</script>

<template>
  <BaseLayout>
    <section class="main-section">
      <LoadingSpinner v-if="isLoading" />

      <div class="not-found" v-else-if="!isLoading && dataBuku === undefined">
        <h1>Tidak ada buku!</h1>
        <p>Bukunya ga ada brok</p>
      </div>

      <div class="buku" v-else>
        <figure>
          <img class="buku__gambar" :src="imgURL" alt="" width="400" height="600" />
          <img
            class="buku__gambar buku__gambar--bayangan"
            :src="imgURL"
            alt=""
            width="400"
            height="600"
          />
        </figure>

        <figcaption class="buku__info">
          <h1 class="judul">{{ dataBuku.judul }}</h1>
          <p>
            <span class="penulis">{{ dataBuku.penulis }}</span> -
            <span class="tahun-terbit">{{ dataBuku.tahun_terbit }}</span>
          </p>
          <p>{{ dataBuku.penerbit }} - {{ dataBuku.alamat_terbit }}</p>
          <p>Jumlah eksemplar: {{ dataBuku.jumlah_exspl }}</p>

          <div class="button-container">
            <CTA @click="pinjamBuku(dataBuku)" v-show="bukuBisaDipinjam" :fill="true">
              Pinjam buku
            </CTA>
            <CTA @click="kembalikanBuku(dataBuku)" v-show="!bukuBisaDipinjam" :fill="true">
              Kembalikan buku
            </CTA>
            <CTA
              @click="masukkanWishlist(dataBuku)"
              :disabled="bukuAdaDiWishlist || !bukuBisaDipinjam"
            >
              tambahkan ke wishlist
            </CTA>
          </div>
        </figcaption>
      </div>
    </section>

    <section class="main-section">
      <article>
        <h2>Informasi bibliografi</h2>
        <table class="tabel-bibliografi">
          <tbody>
            <tr>
              <td>judul</td>
              <td>{{ dataBuku.judul }}</td>
            </tr>

            <tr>
              <td>Penulis</td>
              <td>
                {{ dataBuku.penulis }}
              </td>
            </tr>

            <tr>
              <td>ISBN</td>
              <td>{{ dataBuku.no_isbn }}</td>
            </tr>

            <tr>
              <td>Penerbit</td>
              <td>{{ dataBuku.penerbit }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
    <TheDialog :is-open="dialogIsOpen" @dialog-close="dialogIsOpen = false">
      <h2>Info!!</h2>
      {{ dialogMessage }}
    </TheDialog>
  </BaseLayout>
</template>

<style scoped>
.buku {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.buku figure {
  position: relative;
}

.buku__gambar {
  object-fit: cover;
}

.buku__gambar--bayangan {
  position: absolute;
  bottom: -10px;
  left: 10px;
  opacity: 80%;
  z-index: -2;
  filter: blur(10px);
}

.buku__info {
  max-width: 100ch;
}

.button-container {
  display: flex;
  gap: 0.5rem;
}

.judul {
  font-size: 2.8rem;
  line-height: 1.1;
}

.penulis {
  color: #777;
}

.tabel-bibliografi {
  border-collapse: collapse;
}

.tabel-bibliografi tr:nth-child(even) {
  backdrop-filter: invert(0.2);
}

.tabel-bibliografi td {
  padding: 0.5rem;
}
</style>
