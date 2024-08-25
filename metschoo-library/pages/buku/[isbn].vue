<script setup lang="ts">
import { useDialog } from "@/composables"
import type { Buku, Peminjaman, PeminjamanState } from "@/types"
import type { PostgrestError, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

import ConfirmPopup from "primevue/confirmpopup"
import { useConfirm } from "primevue/useconfirm"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import VueDatePicker from "@vuepic/vue-datepicker"
import "@vuepic/vue-datepicker/dist/main.css"
import type { Database } from "~/types/supabase"

definePageMeta({
  layout: "default",
})

const supabase = useSupabaseClient<Database>()
const route = useRoute()
const isbn = route.params.isbn as string

const toast = useToast()
const confirm = useConfirm()

const user = useSupabaseUser()

const isLoading = ref(false)
const { buku } = useBuku()
const imgURL = ref("")

onMounted(async () => {
  try {
    buku.value = await getBuku(isbn)
  } catch (err) {
    console.error(err as PostgrestError)

    buku.value = null

    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Gagal menemukan buku.",
      life: 10000,
    })
  }

  imgURL.value = await getBukuImage(isbn)
})

const peminjamanState = ref<PeminjamanState | null>(null)

onMounted(async () => {
  try {
    peminjamanState.value = await usePeminjamanState(isbn)
    bukuAdaDiWishlist.value = await checkWishlist(isbn)
  } catch (err) {
    console.error(err as PostgrestError)
  }
})

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
  if (!user.value) {
    return toast.add({
      severity: "warn",
      summary: "Tidak bisa meminjam buku",
      detail: "kalau mau pinjam buku, buat akun dulu ya.",
      life: 10000,
    })
  }

  dialogConfirm.value.open("Mau dikembalikan kapan?")
}

async function pinjamBuku({ judul, no_isbn }: Buku, tanggal: Date) {
  if (!window.confirm(`Beneran mau pinjem buku ${judul}?`)) return

  try {
    if (bukuAdaDiWishlist.value) {
      await supabase.from("wishlist").delete().eq("no_isbn", no_isbn)
    }

    await borrowBuku(no_isbn, tanggal)

    toast.add({
      severity: "success",
      summary: "Sukses meminjam buku",
      detail: `sukses meminjam buku ${judul}`,
      life: 10000,
    })
    dialogConfirm.value.close()
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

async function batalkanPeminjamanBuku({ judul }: Buku, id: Peminjaman["id"]) {
  if (!window.confirm(`apakah anda ingin membatalkan peminjaman ${judul}?`)) {
    return toast.add({
      severity: "info",
      summary: "Tidak jadi",
      detail: "Tidak jadi membatalkan peminjaman buku.",
      life: 10000,
    })
  }

  try {
    await cancelBorrowBuku(id)

    toast.add({
      severity: "success",
      summary: "Sukses!",
      detail: `Sukses membatalkan peminjaman buku ${judul}.`,
      life: 10000,
    })
  } catch (err) {
    console.error(err as PostgrestError)

    toast.add({
      severity: "error",
      summary: "Gagal!",
      detail: "gagal membatalkan peminjaman buku! Silahkan coba lagi nanti.",
      life: 10000,
    })
  }
}

async function kembalikanBuku({ judul }: Buku, id: Peminjaman["id"]) {
  try {
    await returnBuku(id)

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
  if (!user.value) {
    toast.add({
      severity: "warn",
      summary: "gagal memasukkan buku ke wishlist",
      detail: "silahkan masuk jika anda ingin menambahkan buku ke dalam wishlist",
    })
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
    peminjamanState.value = await usePeminjamanState((payload.new as Peminjaman).no_isbn)
  } catch (err) {
    dialogError.value.open("Gagal mengambil data peminjaman, silahkan coba lagi.")
    console.error(err as PostgrestError)
  }
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
  <section class="main-section">
    <LoadingSpinner v-if="isLoading" />

    <div v-if="!buku" class="not-found">
      <h1>Tidak ada buku!</h1>
      <p>Bukunya ga ada brok</p>
    </div>

    <div v-else class="buku">
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
            v-if="peminjamanState?.isBorrowable"
            :fill="true"
            @click="konfirmasiPinjamBuku"
            label="Pinjam buku"
          />

          <CTA
            v-else
            :disabled="!peminjamanState?.isCancellable"
            danger
            label="batalkan peminjaman"
            @click="batalkanPeminjamanBuku(buku, peminjamanState?.id!)"
          />

          <CTA
            v-if="peminjamanState?.isReturnable"
            :disabled="!peminjamanState?.isReturnable"
            :fill="true"
            @click="kembalikanBuku(buku, peminjamanState?.id!)"
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
            :disabled="bukuAdaDiWishlist || !peminjamanState?.isBorrowable"
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
