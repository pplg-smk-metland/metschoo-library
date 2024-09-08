<script setup lang="ts">
import type {
  PostgrestError,
  QueryData,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js"
import type { Buku, Peminjaman } from "@/types"

import DataRow from "@/components/admin/DataRow.vue"
import ConfirmDialog from "primevue/confirmdialog"
import Toast from "primevue/toast"
import { getPeminjamanData } from "@/lib/peminjaman"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import type { Database } from "~/types/database.types.ts"

useHead({
  title: "Admin",
})

definePageMeta({
  layout: "admin",
})

const supabase = useSupabaseClient<Database>()

const isLoading = ref(false)

const peminjamanQuery = supabase
  .from("peminjaman")
  .select("*, peminjaman_state(name), pengguna(nama, kelas, jurusan), buku(*)")
export type PeminjamanData = QueryData<typeof peminjamanQuery>
const peminjamanData = ref<PeminjamanData>([])

const bukusBorrowPending = computed(() => {
  return peminjamanData.value.filter((data) => data.state_id === 1)
})

const bukusBorrowConfirmed = computed(() => {
  return peminjamanData.value.filter((data) => data.state_id === 2)
})

const bukusReturnPending = computed(() => {
  return peminjamanData.value.filter((data) => data.state_id === 4)
})

onMounted(async () => {
  isLoading.value = true
  peminjamanData.value = await getPeminjamanData()
  isLoading.value = false
})

const confirm = useConfirm()
const toast = useToast()

async function konfirmasiPeminjaman(id: Peminjaman["id"]) {
  try {
    confirm.require({
      group: "headless",
      header: "Konfirmasi peminjaman",
      message: "Beneran nih mau konfirmasi peminjaman buku?",
      accept: async () => {
        await confirmBorrowBuku(id)

        toast.add({
          severity: "success",
          summary: "Sukses!",
          detail: "Sukses mengkonfirmasi peminjaman buku!",
          life: 10000,
        })
      },
      reject: () => {
        toast.add({
          severity: "info",
          summary: "Gak jadi",
          detail: "Gak jadi mengkonfirmasi peminjaman buku.",
          life: 10000,
        })
      },
    })
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "Gagal konfirmasi peminjaman",
      detail: "Gagal mengkonfirmasi peminjaman buku. Silahkan coba lagi",
    })
  }
}

async function konfirmasiPengembalian(dataPeminjaman: Peminjaman, buku: Buku) {
  try {
    confirm.require({
      group: "headless",
      header: "Konfirmasi pengembalian",
      message: "Beneran mau konfirmasi buku ini?",
      accept: async () => {
        await confirmReturnBuku(dataPeminjaman, buku, new Date())

        toast.add({
          severity: "success",
          summary: "Sukses!",
          detail: `Sukses mengkonfirmasi pengembalian buku`,
          life: 10000,
        })
      },
    })
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: `Gagal mengkonfirmasi pengembalian buku. Silahkan coba lagi nanti`,
      life: 10000,
    })
  }
}

async function insertPeminjamandata(payload: RealtimePostgresChangesPayload<Peminjaman>) {
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("peminjaman_state(name), pengguna(nama, kelas, jurusan), buku(*)")
      .eq("id", (payload.new as Peminjaman).id)
      .single()
    if (error) throw error

    // merge data from payload and data from fetch
    if (data) peminjamanData.value.push({ ...(payload.new as Peminjaman), ...data })
  } catch (err) {
    console.error(err)
  }
}

function updatePeminjamanData(payload: RealtimePostgresChangesPayload<Peminjaman>) {
  const targetData = peminjamanData.value!.find(
    (data) => data.id === (payload.new as Peminjaman).id
  )
  if (targetData) targetData.state_id = (payload.new as Peminjaman).state_id
}

supabase
  .channel("new_peminjaman")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "peminjaman" },
    insertPeminjamandata
  )
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "peminjaman" },
    updatePeminjamanData
  )
  .subscribe()
</script>

<template>
  <PageHeader heading="Admin">
    <p>Halo admin</p>
  </PageHeader>

  <LoadingSpinner v-if="isLoading" />

  <template v-else>
    <section class="main-section">
      <h2>Buku yang belum dikonfirmasi</h2>
      <ul class="data-list">
        <li v-if="bukusBorrowPending && !bukusBorrowPending.length">belum ada bukunya</li>
        <DataRow
          v-for="data in bukusBorrowPending"
          :key="data.id"
          :data="data"
          :buku="data.buku"
          @konfirmasi-peminjaman="konfirmasiPeminjaman(data.id)"
        />
      </ul>

      <h2>Buku yang sedang dipinjam</h2>
      <ul class="data-list">
        <li v-if="bukusBorrowConfirmed && !bukusBorrowConfirmed.length">belum ada bukunya</li>
        <DataRow
          v-for="data in bukusBorrowConfirmed"
          :key="data.id"
          :data="data"
          :buku="data.buku"
        />
      </ul>

      <h2>Buku untuk dikembalikan</h2>
      <ul class="data-list">
        <li v-if="bukusReturnPending && !bukusReturnPending.length">belum ada bukunya</li>
        <DataRow
          v-for="data in bukusReturnPending"
          :key="data.id"
          :data="data"
          :buku="data.buku"
          @konfirmasi-pengembalian="konfirmasiPengembalian(data, data.buku!)"
        />
      </ul>
    </section>
  </template>

  <ConfirmDialog position="top" group="headless">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <header class="p-confirmdialog-header">
        <span class="p-confirmdialog-title">{{ message.header }}</span>
      </header>

      <div class="p-confirmdialog-content">
        <span>{{ message.message }}</span>
      </div>

      <footer class="p-confirmdialog-footer">
        <CTA label="Tidak" @click="rejectCallback" />
        <CTA fill label="Ya" @click="acceptCallback" />
      </footer>
    </template>
  </ConfirmDialog>

  <Toast :unstyled="false" />
</template>

<style scoped>
.data-list {
  list-style: none;
  margin: 0;
  padding: 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50ch, 1fr));
  gap: 1rem;
}
</style>
