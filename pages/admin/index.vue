<script setup lang="ts">
import type {
  PostgrestError,
  QueryData,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js"
import type { Buku, Peminjaman } from "@/types"
import { formatDate } from "#imports"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
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

const _peminjamanQuery = supabase
  .from("peminjaman")
  .select(
    "*, peminjaman_detail(*), peminjaman_state(name), pengguna(nama, kelas, jurusan), buku(*)"
  )
  .order("created_at", { referencedTable: "peminjaman_detail", ascending: false })
  .limit(1, { referencedTable: "peminjaman_detail" })
export type PeminjamanData = QueryData<typeof _peminjamanQuery>

/**
 * get all peminjaman data
 */
const { data: allPeminjamanData } = useLazyAsyncData(async () => await getPeminjamanData())

const peminjamanData = computed(() => {
  if (!allPeminjamanData.value) return null

  const activePeminjaman = allPeminjamanData.value.filter(
    (data) => data.peminjaman_detail.length && data.tgl_kembali === null
  )

  const bukusBorrowPending = activePeminjaman.filter(
    (data) => data.peminjaman_detail[0].state_id === 1
  )
  const bukusBorrowConfirmed = activePeminjaman.filter(
    (data) => data.peminjaman_detail[0].state_id === 2
  )
  const bukusReturnPending = activePeminjaman.filter(
    (data) => data.peminjaman_detail[0].state_id === 4
  )

  return { bukusBorrowConfirmed, bukusBorrowPending, bukusReturnPending }
})

const { data: counts } = await useLazyAsyncData(async () => {
  const [bukuCount, penggunaCount] = await Promise.all([countBukus(), countPenggunas()])
  return { bukuCount: bukuCount ?? 0, penggunaCount: penggunaCount ?? 0 }
})

onMounted(async () => {
  if (!counts.value) {
    toast.add({
      severity: "error",
      summary: "gagal mengambil data dashboard",
      detail:
        "gagal mengambil data statistik dashboard. Silahkan coba refresh atau lagi dalam beberapa saat",
      life: 10000,
    })
  }
})

const confirm = useConfirm()
const toast = useToast()

async function konfirmasiPeminjaman(id: Peminjaman["id"]) {
  confirm.require({
    header: "Konfirmasi peminjaman",
    message: "Beneran nih mau konfirmasi peminjaman buku?",
    accept: async () => {
      try {
        await confirmBorrowBuku(id)

        toast.add({
          severity: "success",
          summary: "Sukses!",
          detail: "Sukses mengkonfirmasi peminjaman buku!",
          life: 10000,
        })
      } catch (err) {
        console.error((err as PostgrestError).message)

        toast.add({
          severity: "error",
          summary: "Gagal konfirmasi peminjaman",
          detail: "Gagal mengkonfirmasi peminjaman buku. Silahkan coba lagi",
        })
      }
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
    const { data, error } = await _peminjamanQuery.eq("id", (payload.new as Peminjaman).id).single()
    if (error) throw error
    supabase
      .from("peminjaman")
      .select("peminjaman_state(name), pengguna(nama, kelas, jurusan), buku(*)")
    // merge data from payload and data from fetch
    if (data && allPeminjamanData.value)
      allPeminjamanData.value.push({ ...(payload.new as Peminjaman), ...data })
  } catch (err) {
    console.error(err)
  }
}

function updatePeminjamanData(payload: RealtimePostgresChangesPayload<Peminjaman>) {
  const targetData = allPeminjamanData.value!.find(
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

  <div class="grid grid-cols-2 gap-4">
    <section class="main-section">
      <h2 class="leading-relaxed mb-4">Buku yang belum dikonfirmasi</h2>

      <DataTable :value="peminjamanData?.bukusBorrowPending" striped-rows>
        <template #empty>
          <span class="text-gray-300 dark:text-gray-600">Belum ada</span>
        </template>

        <Column field="buku.judul" header="Buku" />
        <Column field="pengguna.nama" header="Peminjam" />
        <Column field="pengguna.kelas" header="Kelas" />
        <Column header="aksi">
          <template #body="{ data }: { data: PeminjamanData[number] }">
            <CTA label="konfirmasi" @click="konfirmasiPeminjaman(data.id)" />
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="main-section flex-1">
      <h2 class="leading-relaxed mb-4">Buku mau dikembalikan</h2>

      <DataTable :value="peminjamanData?.bukusReturnPending" striped-rows>
        <template #empty>
          <span class="text-gray-300 dark:text-gray-600">Belum ada</span>
        </template>

        <Column field="buku.judul" header="buku" />
        <Column field="pengguna.nama" header="peminjam" />
        <Column field="pengguna.kelas" header="kelas" />
        <Column header="aksi">
          <template #body="{ data }: { data: PeminjamanData[number] }">
            <CTA label="Konfirmasi" @click="konfirmasiPengembalian(data, data.buku as Buku)" />
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="main-section col-span-full">
      <h2 class="leading-relaxed mb-4">Buku yang sedang dipinjam</h2>

      <DataTable :value="peminjamanData?.bukusBorrowConfirmed" striped-rows>
        <template #empty>
          <span class="text-gray-300 dark:text-gray-600">Belum ada</span>
        </template>

        <Column field="buku.judul" header="Buku" />
        <Column field="pengguna.nama" header="Peminjam" />
        <Column field="pengguna.kelas" header="Kelas" />
        <Column header="Dipinjam pada">
          <template #body="{ data }: { data: PeminjamanData[number] }">
            {{ formatDate(new Date(data.tgl_pinjam), { dateStyle: "long", timeStyle: "long" }) }}
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="main-section col-span-full">
      <ul class="grid grid-cols-4 gap-4">
        <AdminInfoChip to="buku" :data="90" label="Buku sedang dipinjam" />
        <AdminInfoChip to="buku" :data="counts?.bukuCount" label="Buku tersedia" />
        <AdminInfoChip to="pengguna" :data="counts?.penggunaCount" label="Pengguna aktif" />
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
