<script setup lang="ts">
import type {
  PostgrestError,
  QueryData,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js"
import type { Buku, Peminjaman } from "@/types"
import { formatDate } from "#imports"

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

const bukuCount = ref<number | null>(0)
const penggunaCount = ref<number | null>(0)

onMounted(async () => {
  bukuCount.value = await countBukus()
  penggunaCount.value = await countPenggunas()
})
</script>

<template>
  <PageHeader heading="Admin">
    <p>Halo admin</p>
  </PageHeader>

  <LoadingSpinner v-if="isLoading" />

  <div v-else class="grid grid-cols-2 gap-4">
    <section class="main-section">
      <h2>Buku yang belum dikonfirmasi</h2>

      <DataTable :value="bukusBorrowPending" size="small">
        <template #empty>
          <span class="text-gray-300 dark:text-gray-600">Belum ada</span>
        </template>

        <Column field="buku.judul" header="Buku" />
        <Column field="pengguna.nama" header="Peminjam" />
        <Column field="pengguna.kelas" header="Kelas" />
        <Column header="aksi">
          <template #body="{ data }">
            <CTA label="konfirmasi" @click="konfirmasiPeminjaman(data.id)" />
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="main-section flex-1">
      <h2>Buku mau dikembalikan</h2>

      <DataTable :value="bukusReturnPending" size="small">
        <template #empty>
          <span class="text-gray-300 dark:text-gray-600">Belum ada</span>
        </template>

        <Column field="buku.judul" header="buku" />
        <Column field="pengguna.nama" header="peminjam" />
        <Column field="pengguna.kelas" header="kelas" />
        <Column header="aksi">
          <template #body="{ data }">
            <CTA label="Konfirmasi" @click="konfirmasiPengembalian(data.id, data.buku)" />
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="main-section col-span-full">
      <h2>Buku yang sedang dipinjam</h2>

      <DataTable :value="bukusBorrowConfirmed">
        <template #empty>
          <span class="text-gray-300 dark:text-gray-600">Belum ada</span>
        </template>

        <Column field="buku.judul" header="Buku" />
        <Column field="pengguna.nama" header="Peminjam" />
        <Column field="pengguna.kelas" header="Kelas" />
        <Column header="Dipinjam pada">
          <template #body="{ data }">
            {{ formatDate(new Date(data.tgl_pinjam), { dateStyle: "long", timeStyle: "long" }) }}
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="main-section col-span-full">
      <ul class="grid grid-cols-4 gap-4">
        <AdminInfoChip to="buku" :data="90" label="Buku sedang dipinjam" />
        <AdminInfoChip to="buku" :data="bukuCount" label="Buku tersedia" />
        <AdminInfoChip to="pengguna" :data="penggunaCount" label="Pengguna aktif" />
      </ul>
    </section>
  </div>

  <ConfirmDialog position="top" />

  <Toast />
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
