<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import router from "@/router"
import { supabase } from "@/lib/supabase"
import { useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import {
  ambilGambarBukuDariISBN,
  pinjamBukuDariISBN,
  kembalikanBukuDariISBN,
  getBuku,
  type StatusPeminjaman,
  getPeminjamanData,
  getNewestPeminjaman,
} from "@/lib/utils"
import { useBuku, useDialog } from "@/lib/composables"
import type { Buku } from "@/types"
import type { PostgrestError } from "@supabase/supabase-js"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BaseLayout from "@/layouts/BaseLayout.vue"
import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"
import VueDatePicker from "@vuepic/vue-datepicker"
import "@vuepic/vue-datepicker/dist/main.css"

const route = useRoute()
const isbn = route.params.isbn as string

const authStore = useAuthStore()

const isLoading = ref(false)
const { buku } = useBuku()
const imgURL = ref("")

onMounted(async () => {
  try {
    buku.value = await getBuku(isbn)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }

  imgURL.value = `../${await ambilGambarBukuDariISBN(isbn)}`
})

const statusPeminjaman = ref<StatusPeminjaman | null>(null)
onMounted(async () => {
  statusPeminjaman.value = await getPeminjamanData(isbn)
})

const bisaDipinjam = ref(false)

const cekBisaDipinjam = (
  statusPeminjaman: StatusPeminjaman,
  jumlah_exspl: Buku["jumlah_exspl"]
) => {
  const { state_id } = getNewestPeminjaman(statusPeminjaman)
  return state_id !== 1 && jumlah_exspl > 0 && !bukuAdaDiWishlist.value
}

const bisaDikembalikan = ref(false)

const cekBisaDikembalikan = (statusPeminjaman: StatusPeminjaman) => {
  return getNewestPeminjaman(statusPeminjaman).state_id === 2 && !bisaDipinjam.value
}

const bukuAdaDiWishlist = ref(false)

async function checkWishlist(isbn: string) {
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

// statusPeminjaman is null at first.
// watch statusPeminjaman and check buku status.
watch(statusPeminjaman, async (newPeminjaman, _) => {
  if (newPeminjaman === null) return

  bukuAdaDiWishlist.value = await checkWishlist(isbn)
  bisaDipinjam.value = cekBisaDipinjam(newPeminjaman, (buku.value as Buku).jumlah_exspl)
  bisaDikembalikan.value = cekBisaDikembalikan(newPeminjaman)
})

const { dialog } = useDialog()
const { dialog: dialogConfirm } = useDialog()

const date = ref<Date>(new Date())
const formattedDate = computed(() => {
  if (!date) return ""

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date.value as Date)
})

const isValidDate = computed(() => date.value > new Date())

function konfirmasiPinjamBuku({ jumlah_exspl }: Buku) {
  if (jumlah_exspl === 0) {
    dialog.value.open("Maaf, buku ini tidak tersedia untuk saat ini.")
    return
  }

  dialogConfirm.value.open("Mau dikembalikan kapan?")
}

async function pinjamBuku({ judul, no_isbn, jumlah_exspl }: Buku, tanggal: Date) {
  if (!authStore.session) {
    dialog.value.open("kalau mau pinjam buku, buat akun dulu ya")
    router.push({ name: "sign-in" })
    return
  }

  if (!confirm(`Beneran mau pinjem buku ${judul}?`)) return

  try {
    if (bukuAdaDiWishlist.value) {
      await supabase.from("wishlist").delete().eq("no_isbn", no_isbn)
    }
    await pinjamBukuDariISBN(no_isbn, jumlah_exspl, tanggal.toISOString())
    dialog.value.open(`sukses meminjam buku ${judul}`)
  } catch (err) {
    dialog.value.open((err as PostgrestError).message)
  }
}

async function kembalikanBuku({ judul, no_isbn, jumlah_exspl }: Buku) {
  try {
    await kembalikanBukuDariISBN(no_isbn, jumlah_exspl, new Date())
    dialog.value.open(`sukses mengembalikan buku ${judul}`)
  } catch (err) {
    dialog.value.open(`Gagal mengembalikan buku! ${(err as PostgrestError).message}`)
    console.error((err as PostgrestError).message)
  }
}

async function masukkanWishlist({ judul, no_isbn }: Buku) {
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
  bukuAdaDiWishlist.value = await checkWishlist(payload.new.no_isbn)
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
            <CTA @click="konfirmasiPinjamBuku(buku)" v-if="bisaDipinjam" :fill="true">
              Pinjam buku
            </CTA>
            <CTA @click="kembalikanBuku(buku)" v-else :disabled="!bisaDikembalikan" :fill="true"
              >Kembalikan buku</CTA
            >
            <CTA @click="masukkanWishlist(buku)" :disabled="bukuAdaDiWishlist || !bisaDipinjam">
              tambahkan ke wishlist
            </CTA>
          </div>
        </figcaption>

        <TheDialog :is-open="dialogConfirm.isOpen" @dialog-close="dialogConfirm.close()">
          <h2>{{ dialogConfirm.message }}</h2>

          <VueDatePicker
            v-model="date"
            locale="id"
            cancel-text="Batalkan"
            select-text="Pilih"
            :min-date="new Date()"
          />

          <p>Saya akan mengembalikan buku ini pada</p>

          <p class="tanggal">
            <time :datetime="date?.toISOString()" v-if="date">{{ formattedDate }}</time>
            <span v-else> pilih dulu tanggalnya. </span>
          </p>

          <CTA @click="pinjamBuku({ ...buku }, date)" :disabled="!isValidDate">Pinjam buku</CTA>
        </TheDialog>
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

.tanggal {
  font-weight: bold;
}
</style>
