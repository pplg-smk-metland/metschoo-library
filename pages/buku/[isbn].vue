<script setup lang="ts">
import type { Buku, Peminjaman, PeminjamanDetail, PeminjamanState } from "@/types"
import type { PostgrestError, RealtimePostgresInsertPayload } from "@supabase/supabase-js"
import IconArrowLeft from "~icons/mdi/arrow-left"

import ConfirmPopup from "primevue/confirmpopup"
import { useConfirm } from "primevue/useconfirm"
import Toast from "primevue/toast"
import { useToast } from "primevue/usetoast"
import DatePicker from "primevue/datepicker"
import Dialog from "primevue/dialog"
import type { Database } from "~/types/database.types.ts"
import { addToWishlist } from "~/lib/wishlist"

definePageMeta({
  layout: "default",
})

const supabase = useSupabaseClient<Database>()
const route = useRoute()
const router = useRouter()
const isbn = route.params.isbn as string

const toast = useToast()
const confirm = useConfirm()

const user = useSupabaseUser()

const isLoading = ref(false)

/**
 * get buku data on the server
 */
const { data: buku } = await useAsyncData(async () => await getBuku(isbn))

const imgURL = computed(() => getBukuImage(buku.value?.image))

/**
 * get buku's peminjaman state and check wishlist
 */
const peminjamanState = ref<PeminjamanState | null>(null)
const bukuAdaDiWishlist = ref<boolean | null>(null)

const { data } = await useAsyncData(async () => {
  const [peminjamanStateData, checkWishlistData] = await Promise.all([
    usePeminjamanState(buku.value!),
    useCheckWishlist(isbn),
  ])

  return { peminjamanStateData, checkWishlistData }
})

bukuAdaDiWishlist.value = data.value?.checkWishlistData ?? null
peminjamanState.value = data.value?.peminjamanStateData ?? null

onMounted(async () => {
  if (bukuAdaDiWishlist.value === null || peminjamanState.value === null) {
    toast.add({
      severity: "error",
      summary: "gagal mengambil data peminjaman atau wishlist",
      detail:
        "gagal mengambil data peminjaman atau wishlist. Silahkan refresh atau coba lagi dalam beberapa saat.",
      life: 10000,
    })
  }
})

const dialogIsVisible = ref(false)

const date = ref(new Date())
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

  dialogIsVisible.value = true
}

async function pinjamBuku({ judul, no_isbn }: Buku, tanggal: Date) {
  if (!window.confirm(`Beneran mau pinjem buku ${judul}?`)) return

  try {
    if (bukuAdaDiWishlist.value) {
      await supabase.from("wishlist").delete().eq("buku_id", buku_id)
    }

    const id = await borrowBuku(no_isbn, tanggal)

    if (!buku.value || !peminjamanState.value) return
    buku.value.jumlah_exspl_aktual = buku.value.jumlah_exspl_aktual - 1

    peminjamanState.value = {
      id,
      isBorrowable: false,
      isReturnable: false,
      isCancellable: true,
    }

    toast.add({
      severity: "success",
      summary: "Sukses meminjam buku",
      detail: `sukses meminjam buku ${judul}`,
      life: 10000,
    })
    dialogIsVisible.value = false
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

    if (buku.value) buku.value.jumlah_exspl_aktual += 1

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

/**
 * handle confirmation for adding a new entry to wishlist.
 */
function confirmAddToWishlist(buku: Buku, e: Event) {
  confirm.require({
    target: e.currentTarget as HTMLElement,
    header: "Konfirmasi wishlist",
    message: "Apakah anda mau menambahkan buku ini ke dalam wishlist?",
    group: "headless",
    accept: async () => {
      if (!user.value) {
        return toast.add({
          severity: "warn",
          summary: "gagal memasukkan buku ke wishlist",
          detail: "silahkan masuk jika anda ingin menambahkan buku ke dalam wishlist",
        })
      }

      await handleAddToWishlist(buku)
    },
    onShow: () => (confirmWishlistIsVisible.value = true),
    onHide: () => (confirmWishlistIsVisible.value = false),
  })
}

/**
 * handle adding a new buku to wishlist.
 */
async function handleAddToWishlist(buku: Buku) {
  try {
    await addToWishlist(buku.id)
    bukuAdaDiWishlist.value = true

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: `Sukses menambahkan ${buku.judul} ke dalam wishlist.`,
      life: 5000,
    })
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "gagal",
      detail: `Ada yang salah ketika menambahkan buku ke dalam wishlist. Silahkan coba beberapa saat lagi.`,
    })
  }
}

/**
 * function to subscribe to realtime peminjaman state change.
 */
async function perbaruiDataBuku(payload: RealtimePostgresInsertPayload<PeminjamanDetail>) {
  try {
    peminjamanState.value = await usePeminjamanState(buku.value!, payload.new)
  } catch (err) {
    console.error(err as PostgrestError)

    toast.add({
      severity: "error",
      summary: "Gagal mengambil data peminjaman buku!",
      detail: "Gagal mengambil data peminjaman, silahkan coba lagi.",
      life: 10000,
    })
  }
}

const channel = supabase.channel("peminjaman").on(
  "postgres_changes",
  {
    event: "INSERT",
    schema: "public",
    table: "peminjaman_detail",
  },
  (payload: RealtimePostgresInsertPayload<PeminjamanDetail>) => {
    if (!peminjamanState.value || payload.new.peminjaman_id !== peminjamanState.value.id) return
    perbaruiDataBuku(payload)
  }
)

onMounted(() => {
  channel.subscribe()
})

onUnmounted(() => {
  channel.unsubscribe()
})
</script>

<template>
  <div v-if="!buku && !isLoading" class="not-found">
    <h1>Tidak ada buku!</h1>
    <p>Bukunya ga ada brok</p>

    <CTA label="cari buku lain" fill as="router-link" to="/pustaka" />
  </div>

  <LoadingSpinner v-if="isLoading" />

  <section
    v-else-if="buku"
    class="buku main-section max-w-6xl mx-auto grid grid-cols-6 grid-rows-2 gap-4 justify-items-start"
  >
    <header class="col-span-full">
      <CTA label="kembali" link class="order-first" @click="router.go(-1)">
        <IconArrowLeft />
      </CTA>
    </header>

    <figure
      class="self-start col-span-2 md:row-span-2 place-self-center relative dark:brightness-75 z-0"
    >
      <img
        class="w-48 max-w-100 h-100"
        :src="imgURL as string"
        :alt="`sampul buku ${buku.judul}`"
        width="400"
        height="600"
      />
      <img class="buku__gambar--bayangan" :src="imgURL as string" alt="" width="400" height="600" />
    </figure>

    <article class="buku__info col-span-4">
      <h1 class="judul max-w-5xl">
        {{ buku.judul }}
      </h1>
      <p class="text-slate-700 dark:text-slate-400">
        <span>{{ buku.penulis }}</span> -
        <span>{{ buku.tahun_terbit }}</span>
      </p>
      <p>{{ buku.penerbit }} - {{ buku.alamat_terbit }}</p>
      <p>
        Jumlah tersedia:
        <span :class="['font-bold', { 'text-red': buku.jumlah_exspl_aktual === 0 }]">
          {{ buku.jumlah_exspl_aktual }}
        </span>
      </p>

      <div class="button-container">
        <CTA
          v-if="!peminjamanState?.isCancellable && !peminjamanState?.isReturnable"
          :disabled="!peminjamanState?.isBorrowable && user"
          fill
          label="Pinjam buku"
          @click="konfirmasiPinjamBuku"
        />

        <CTA
          v-if="peminjamanState?.isCancellable"
          severity="danger"
          label="batalkan peminjaman"
          @click="batalkanPeminjamanBuku(buku, peminjamanState?.id!)"
        />

        <CTA
          v-if="peminjamanState?.isReturnable"
          :disabled="!peminjamanState?.isReturnable"
          fill
          label="kembalikan buku"
          @click="kembalikanBuku(buku, peminjamanState?.id!)"
        />

        <ConfirmPopup group="headless" aria-label="popup">
          <template #container="{ message, acceptCallback, rejectCallback }">
            <section class="px-4 pt-4">
              <h3>{{ message.header }}</h3>
              <p>{{ message.message }}</p>
            </section>

            <section class="px-4 pb-4 flex gap-2">
              <CTA label="Tidak" @click="rejectCallback" />
              <CTA label="Ya" fill @click="acceptCallback" />
            </section>
          </template>
        </ConfirmPopup>

        <Toast position="top-right" />
        <CTA
          :disabled="bukuAdaDiWishlist || !peminjamanState?.isBorrowable"
          :aria-expanded="confirmWishlistIsVisible"
          :aria-controls="confirmWishlistIsVisible ? 'confirm' : null"
          label="tambahkan ke wishlist"
          @click="confirmAddToWishlist(buku, $event)"
        />
      </div>
    </article>

    <article class="col-span-full md:col-span-4 justify-self-stretch overflow-x-auto h-min">
      <h2>Informasi bibliografi</h2>
      <table class="tabel-bibliografi block">
        <tbody class="table-auto block">
          <tr>
            <td>Judul</td>
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

    <Dialog v-model:visible="dialogIsVisible" modal header="Mau dikembalikan kapan?">
      <div class="flex flex-col gap-4">
        <p>Saya akan mengembalikan buku ini pada...</p>

        <DatePicker v-model="date" :min-date="new Date()" date-format="DD, dd MM yy" fluid />

        <CTA
          :disabled="!isValidDate"
          label="Pinjam buku"
          fill
          @click="pinjamBuku({ ...buku }, date)"
        />
      </div>
    </Dialog>
  </section>
</template>

<style scoped>
.buku {
  grid-template-rows: min-content auto;
}

.buku__gambar--bayangan {
  position: absolute;
  bottom: -10px;
  left: 10px;
  opacity: 80%;
  z-index: -1;
  filter: blur(10px);
}

.judul {
  font-size: clamp(2rem, 2.5vw, 3.5rem);
}

.tabel-bibliografi td {
  padding: 0.5rem;
  text-wrap: wrap;
}
</style>
