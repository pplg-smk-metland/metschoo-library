<script setup lang="ts">
import { onMounted, ref } from "vue"
import router from "@/router"
import { supabase } from "@/lib/supabase"
import { useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { ambilGambarBukuDariISBN, pinjamBukuDariISBN, kembalikanBukuDariISBN } from "@/lib/utils"
import { useDialog } from "@/lib/composables"
import type { Buku } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BaseLayout from "@/layouts/BaseLayout.vue"
import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"

const authStore = useAuthStore()
const buku = ref<Buku | null>(null)

const isLoading = ref(false)
async function ambilDataBuku(isbn: string): Promise<Buku | null> {
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
    console.error((err as PostgrestError).message)
    return null
  } finally {
    isLoading.value = false
  }
}

const bukuBisaDipinjam = ref(true)
async function cekStatusPeminjaman(isbn: string) {
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("tgl_pinjam, sudah_dikembalikan")
      .eq("no_isbn", isbn)

    if (error) throw error

    if (!data || !data.length) return true

    // cek data peminjaman paling baru.
    // User bisa saja meminjam buku yang sama berulang kali
    const initialValue = { tgl_pinjam: "0", sudah_dikembalikan: true }

    const { sudah_dikembalikan } = data.reduce((initial, current) => {
      if (new Date(initial.tgl_pinjam).getTime() < new Date(current.tgl_pinjam).getTime()) {
        return current
      }
      return initial
    }, initialValue)

    return sudah_dikembalikan
  } catch (err) {
    console.error((err as PostgrestError).message)
    return false
  }
}

const bukuAdaDiWishlist = ref(false)

async function cekWishlist(isbn: string) {
  try {
    const { count, error } = await supabase
      .from("wishlist")
      .select("no_isbn", { count: "exact", head: true })
      .eq("no_isbn", isbn)

    if (error) throw error
    if (!count) return false

    return count !== null && count !== 0
  } catch (err) {
    console.trace(err as PostgrestError)
    return false
  }
}

const imgURL = ref("")

// ambil data dan gambar buku
onMounted(async () => {
  const route = useRoute()
  const isbn = route.params.isbn as string

  imgURL.value = await ambilGambarBukuDariISBN(isbn)
  buku.value = await ambilDataBuku(isbn)

  bukuAdaDiWishlist.value = await cekWishlist(isbn)
  bukuBisaDipinjam.value = await cekStatusPeminjaman(isbn)
})

const { dialog } = useDialog()

async function pinjamBuku({
  judul,
  no_isbn,
  jumlah_exspl,
}: {
  judul: string
  no_isbn: string
  jumlah_exspl: number
}) {
  if (!authStore.session) {
    dialog.value.open("kalau mau pinjam buku, buat akun dulu ya")
    router.push({ name: "sign-in" })
    return
  }

  if (jumlah_exspl === 0) {
    dialog.value.open("Maaf, buku ini tidak tersedia untuk saat ini.")
  }

  if (!confirm(`Beneran mau pinjem buku ${judul}?`)) return

  try {
    if (bukuAdaDiWishlist.value) {
      await supabase.from("wishlist").delete().eq("no_isbn", no_isbn)
    }
    await pinjamBukuDariISBN(no_isbn, jumlah_exspl)
    dialog.value.open(`sukses meminjam buku ${judul}`)
  } catch (err) {
    dialog.value.open((err as PostgrestError).message)
  }
}

async function kembalikanBuku({
  judul,
  no_isbn,
  jumlah_exspl,
}: {
  judul: string
  no_isbn: string
  jumlah_exspl: number
}) {
  try {
    await kembalikanBukuDariISBN(no_isbn, jumlah_exspl)
    dialog.value.open(`sukses mengembalikan buku ${judul}`)
  } catch (err) {
    dialog.value.open(`Gagal mengembalikan buku! ${(err as PostgrestError).message}`)
    console.error((err as PostgrestError).message)
  }
}

async function masukkanWishlist({ judul, no_isbn }: { judul: string; no_isbn: string }) {
  try {
    const { data, error } = await supabase.from("wishlist").insert({ no_isbn })
    if (error) throw error

    dialog.value.open(`buku ${judul} berhasil ditambahkan ke dalam wishlist`)
    bukuAdaDiWishlist.value = true
    return data
  } catch (err) {
    dialog.value.open(
      `Ada yang salah ketika menambahkan buku ${judul} ke dalam wishlist. Silahkan coba beberapa saat lagi.`
    )
    console.error((err as PostgrestError).message)
  }
}

async function perbaruiDataBuku(payload: any) {
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

      <div class="buku" v-if="buku">
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
          <h1 class="judul">{{ buku.judul }}</h1>
          <p>
            <span class="penulis">{{ buku.penulis }}</span> -
            <span class="tahun-terbit">{{ buku.tahun_terbit }}</span>
          </p>
          <p>{{ buku.penerbit }} - {{ buku.alamat_terbit }}</p>
          <p>Jumlah tersedia: {{ buku.jumlah_exspl }}</p>

          <div class="button-container">
            <CTA
              @click="
                pinjamBuku({
                  judul: buku.judul,
                  no_isbn: buku.no_isbn,
                  jumlah_exspl: buku.jumlah_exspl,
                })
              "
              v-show="bukuBisaDipinjam"
              :fill="true"
            >
              Pinjam buku
            </CTA>
            <CTA
              @click="
                kembalikanBuku({
                  judul: buku.judul,
                  no_isbn: buku.no_isbn,
                  jumlah_exspl: buku.jumlah_exspl,
                })
              "
              v-show="!bukuBisaDipinjam"
              :fill="true"
            >
              Kembalikan buku
            </CTA>
            <CTA
              @click="masukkanWishlist({ judul: buku.judul, no_isbn: buku.no_isbn })"
              :disabled="bukuAdaDiWishlist || !bukuBisaDipinjam"
            >
              tambahkan ke wishlist
            </CTA>
          </div>
        </figcaption>
      </div>

      <div class="not-found" v-else>
        <h1>Tidak ada buku!</h1>
        <p>Bukunya ga ada brok</p>
      </div>
    </section>

    <section class="main-section">
      <article>
        <h2>Informasi bibliografi</h2>
        <table class="tabel-bibliografi">
          <tbody>
            <tr>
              <td>judul</td>
              <td>{{ buku?.judul }}</td>
            </tr>

            <tr>
              <td>Penulis</td>
              <td>
                {{ buku?.penulis }}
              </td>
            </tr>

            <tr>
              <td>ISBN</td>
              <td>{{ buku?.no_isbn }}</td>
            </tr>

            <tr>
              <td>Penerbit</td>
              <td>{{ buku?.penerbit }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>

    <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
      <h2>Info!!</h2>
      <p>{{ dialog.message }}</p>
    </TheDialog>
  </BaseLayout>
</template>

<style scoped>
.buku {
  display: flex;
  gap: 2rem;
}

.buku figure {
  position: relative;

  flex: 0 1 max-content;
  align-self: flex-start;

  @media screen and (max-width: 50em) {
    flex: 1 0 10ch;
  }
}

.buku__gambar {
  height: 100%;
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

.judul {
  font-size: clamp(2rem, 2.5vw, 3.5rem);
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
