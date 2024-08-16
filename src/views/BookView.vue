<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import router from "@/router"
import { supabase } from "@/lib/supabase"
import { useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import {
  ambilGambarBukuDariISBN,
  pinjamBukuDariISBN,
  kembalikanBukuDariISBN,
  getBuku,
  getNewestPeminjaman,
  formatDate,
} from "@/lib/utils"
import { useBuku, useDialog } from "@/lib/composables"
import type { Buku, Peminjaman } from "@/types"
import type { PostgrestError, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BaseLayout from "@/layouts/BaseLayout.vue"
import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"
import ConfirmPopup from "primevue/confirmpopup"
import { useConfirm } from "primevue/useconfirm"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import VueDatePicker from "@vuepic/vue-datepicker"
import "@vuepic/vue-datepicker/dist/main.css"

const route = useRoute()
const isbn = route.params.isbn as string

const toast = useToast()
const confirm = useConfirm()

const authStore = useAuthStore()

const isLoading = ref(false)
const { buku } = useBuku()
const imgURL = ref("")

onMounted(async () => {
  try {
    buku.value = await getBuku(isbn)
  } catch (err) {
    console.error(err as PostgrestError)

    buku.value = null
    toast.add({ severity: "error", summary: "Gagal", detail: "Gagal menemukan buku.", life: 10000 })
    return
  }

  imgURL.value = await ambilGambarBukuDariISBN(isbn)
})

const peminjamanTerbaru = ref<Peminjaman | null>(null)

onMounted(async () => {
  try {
    peminjamanTerbaru.value = await getNewestPeminjaman(isbn)

    bukuAdaDiWishlist.value = await checkWishlist(isbn)
    bisaDipinjam.value = cekBisaDipinjam(peminjamanTerbaru.value, buku.value!.jumlah_exspl)
    bisaDikembalikan.value = cekBisaDikembalikan(peminjamanTerbaru.value)
  } catch (err) {
    console.error(err as PostgrestError)

    if ((err as PostgrestError).code === "PGRST116") {
      bisaDipinjam.value = true
      return
    }
  }
})

const bisaDipinjam = ref(false)

const cekBisaDipinjam = (peminjaman: Peminjaman | null, jumlah_exspl: Buku["jumlah_exspl"]) => {
  if (!peminjaman) return true
  return [0, 3, 5, 6].includes(peminjaman.state_id) && jumlah_exspl > 0
}

const bisaDikembalikan = ref(false)

// kalau peminjaman null, artinya, ya kembalikan aja
const cekBisaDikembalikan = (peminjaman: Peminjaman | null) => {
  if (peminjaman) return peminjaman.state_id === 2
  else {
    return true
  }
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

const { dialog: dialogConfirm } = useDialog()
const { dialog: dialogError } = useDialog()

const date = ref(new Date())

const formattedDate = computed(() => {
  if (!date.value) return ""
  return formatDate(date.value, { dateStyle: "full" })
})

const isValidDate = computed(() => date.value > new Date())

function konfirmasiPinjamBuku() {
  dialogConfirm.value.open("Mau dikembalikan kapan?")
}

async function pinjamBuku({ judul, no_isbn }: Buku, tanggal: Date) {
  if (!authStore.session) {
    return toast.add({
      severity: "warn",
      summary: "Tidak bisa meminjam buku",
      detail: "kalau mau pinjam buku, buat akun dulu ya.",
      life: 10000,
    })
  }

  if (!window.confirm(`Beneran mau pinjem buku ${judul}?`)) return

  try {
    if (bukuAdaDiWishlist.value) {
      await supabase.from("wishlist").delete().eq("no_isbn", no_isbn)
    }

    await pinjamBukuDariISBN(no_isbn, tanggal)
    toast.add({
      severity: "success",
      summary: "Sukses meminjam buku",
      detail: `sukses meminjam buku ${judul}`,
      life: 10000,
    })
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "Gagal meminjam buku",
      detail: `Gagal meminjam buku, coba lagi nanti.`,
      life: 10000,
    })
  }
}

async function kembalikanBuku({ judul }: Buku, id: Peminjaman["id"]) {
  try {
    await kembalikanBukuDariISBN(id)

    toast.add({
      severity: "success",
      summary: "Sukses!",
      detail: `sukses mengembalikan buku ${judul}`,
      life: 10000,
    })
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: `Gagal mengembalikan buku! ${(err as PostgrestError).message}`,
      life: 10000,
    })
  }
}

const confirmWishlistIsVisible = ref(false)

function konfirmasiMasukkanWishlist(buku: Buku, e: Event) {
  confirm.require({
    target: e.currentTarget as HTMLElement,
    header: "Konfirmasi wishlist",
    message: "Apakah anda mau menambahkan buku ini ke dalam wishlist?",
    group: "headless",
    accept: async () => {
      await masukkanWishlist(buku)
    },
    onShow: () => (confirmWishlistIsVisible.value = true),
    onHide: () => (confirmWishlistIsVisible.value = false),
  })
}

async function masukkanWishlist({ no_isbn }: Buku) {
  if (!authStore.session) {
    alert("silahkan masuk jika anda ingin menambahkan buku ke dalam wishlist")
    return
  }

  try {
    const { data, error } = await supabase.from("wishlist").insert({ no_isbn })
    if (error) throw error

    bukuAdaDiWishlist.value = true

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Sukses menambahkan buku ke dalam wishlist",
      life: 5000,
    })
    return data
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "gagal",
      detail: `Ada yang salah ketika menambahkan buku ke dalam wishlist. Silahkan coba beberapa saat lagi.`,
    })
    console.error((err as PostgrestError).message)
  }
}

async function perbaruiDataBuku(payload: RealtimePostgresChangesPayload<Peminjaman>) {
  try {
    peminjamanTerbaru.value = await getNewestPeminjaman(isbn)
  } catch (err) {
    dialogError.value.open("Gagal mengambil data peminjaman, silahkan coba lagi.")
    console.error(err as PostgrestError)
  }

  bisaDipinjam.value = cekBisaDipinjam(payload.new as Peminjaman, buku.value!.jumlah_exspl)
  bisaDikembalikan.value = cekBisaDikembalikan(payload.new as Peminjaman)
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

      <div v-if="buku" class="buku">
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
          <h1 class="judul">
            {{ buku.judul }}
          </h1>
          <p>
            <span class="penulis">{{ buku.penulis }}</span> -
            <span class="tahun-terbit">{{ buku.tahun_terbit }}</span>
          </p>
          <p>{{ buku.penerbit }} - {{ buku.alamat_terbit }}</p>
          <p>Jumlah tersedia: {{ buku.jumlah_exspl }}</p>

          <div class="button-container">
            <CTA
              v-if="bisaDipinjam"
              :fill="true"
              @click="konfirmasiPinjamBuku"
              label="Pinjam buku"
            />
            <CTA
              v-else
              :disabled="!bisaDikembalikan"
              :fill="true"
              @click="kembalikanBuku(buku, peminjamanTerbaru.id)"
              label="kembalikan buku"
            />

            <ConfirmPopup group="headless" aria-label="popup">
              <template #container="{ message, acceptCallback, rejectCallback }">
                <section class="p-confirmpopup-content">
                  <h3>{{ message.header }}</h3>
                  <p>{{ message.message }}</p>
                </section>

                <section class="p-confirmpopup-footer">
                  <CTA label="Tidak" @click="rejectCallback" />
                  <CTA label="Ya" @click="acceptCallback" fill />
                </section>
              </template>
            </ConfirmPopup>

            <Toast position="top-right" :unstyled="false" />
            <CTA
              :disabled="bukuAdaDiWishlist || !bisaDipinjam"
              :aria-expanded="confirmWishlistIsVisible"
              :aria-controls="confirmWishlistIsVisible ? 'confirm' : null"
              @click="konfirmasiMasukkanWishlist(buku, $event)"
              label="tambahkan ke wishlist"
            />
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
            <time v-if="date" :datetime="date?.toISOString()">{{ formattedDate }}</time>
            <span v-else> pilih dulu tanggalnya. </span>
          </p>

          <CTA
            :disabled="!isValidDate"
            @click="pinjamBuku({ ...buku }, date)"
            :title="!isValidDate ? 'pilih dulu tanggal yang benar.' : 'pinjam buku'"
            label="Pinjam buku"
          />
        </TheDialog>
      </div>

      <div v-else class="not-found">
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

    <TheDialog :is-open="dialogError.isOpen" @dialog-close="dialogError.close()">
      <h2>Ups, ada yang salah nih.</h2>
      <p>{{ dialogError.message }}</p>
      <p>Silahkan coba lagi, atau hubungi admin.</p>
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
