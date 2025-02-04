<script setup lang="ts">
import type {
  PostgrestError,
  QueryData,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js"
import type { KunjunganSearchArgs, Peminjaman, PeminjamanDetail } from "@/types"
import { formatDate } from "#imports"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import DatePicker from "primevue/datepicker"
import FloatLabel from "primevue/floatlabel"
import Toast from "primevue/toast"
import { ConfirmDialog } from "primevue"

import { getPeminjamanData } from "@/lib/peminjaman"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import type { Database } from "~/types/database.types.ts"
import { searchKunjungans } from "~/utils"

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
    "*, peminjaman_detail(*, peminjaman_state(name)), pengguna(nama, kelas, jurusan), buku(*)"
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

  const activePeminjaman = allPeminjamanData.value.filter((data) => {
    if (!data.peminjaman_detail.length) return false

    const returnedStates = [5, 6, 7]
    return !returnedStates.includes(data.peminjaman_detail[0].state_id)
  })

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
  const data = await getDashboardStatistics()
  return data
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

async function konfirmasiPembatalan(id: Peminjaman["id"]) {
  confirm.require({
    header: "Konfirmasi pembatalan",
    message: "Beneran nih mau membatalkan peminjaman buku?",
    accept: async () => {
      try {
        await cancelBorrowBuku(id)

        toast.add({
          severity: "success",
          summary: "Sukses!",
          detail: "Sukses membatalkan peminjaman buku!",
          life: 10000,
        })
      } catch (err) {
        console.error((err as PostgrestError).message)

        toast.add({
          severity: "error",
          summary: "Gagal membatalkan peminjaman",
          detail: "Gagal membatalkan peminjaman buku. Silahkan coba lagi",
        })
      }
    },
    reject: () => {
      toast.add({
        severity: "info",
        summary: "Gak jadi nih..",
        detail: "Gak jadi membatalkan peminjaman buku.",
        life: 10000,
      })
    },
  })
}

async function konfirmasiPengembalian(dataPeminjaman: Peminjaman) {
  try {
    confirm.require({
      header: "Konfirmasi pengembalian",
      message: "Beneran mau konfirmasi buku ini?",
      accept: async () => {
        await confirmReturnBuku(dataPeminjaman, new Date())

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

const kunjunganSearchFor = ref<KunjunganSearchArgs>({
  timestamp_range: [],
})

const { data: kunjungans } = await useAsyncData(async () => {
  const { data, error } = await searchKunjungans(kunjunganSearchFor.value)

  if (error) {
    toast.add({
      severity: "error",
      summary: "Gagal mengambil data",
      detail: "Gagal mengambil data kunjungan, silahkan coba lagi.",
    })
    throw error
  }
  return data
})

async function handleSearchKunjungans() {
  const { data, error } = await searchKunjungans(kunjunganSearchFor.value)

  if (error) {
    console.error(error)

    toast.add({
      severity: "error",
      summary: "Gagal mencari data peminjaman",
      detail: "gagal mencari data peminjaman, silahkan coba lagi.",
      life: 10000,
    })
  }

  kunjungans.value = data
}

async function insertPeminjamandata(payload: RealtimePostgresChangesPayload<Peminjaman>) {
  try {
    const { data, error } = await _peminjamanQuery.eq("id", (payload.new as Peminjaman).id).single()
    if (error) throw error
    supabase
      .from("peminjaman")
      .select(
        "peminjaman_detail(*, peminjaman_state(name)), pengguna(nama, kelas, jurusan), buku(*)"
      )
    // merge data from payload and data from fetch
    if (data && allPeminjamanData.value)
      allPeminjamanData.value.push({ ...(payload.new as Peminjaman), ...data })
  } catch (err) {
    console.error(err)
  }
}

function updatePeminjamanData(payload: RealtimePostgresChangesPayload<PeminjamanDetail>) {
  const targetData = allPeminjamanData.value!.find(
    (data) => data.id === (payload.new as PeminjamanDetail).peminjaman_id
  )

  if (targetData) {
    targetData.peminjaman_detail[0] = {
      peminjaman_state: targetData.peminjaman_detail[0].peminjaman_state,
      ...(payload.new as PeminjamanDetail),
    }
  }
}

const channel = supabase
  .channel("new_peminjaman")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "peminjaman" },
    insertPeminjamandata
  )
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "peminjaman_detail" },
    updatePeminjamanData
  )

onMounted(() => {
  channel.subscribe()
})

onUnmounted(() => {
  channel.unsubscribe()
})
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
            <div class="flex gap-4">
              <CTA label="konfirmasi" @click="konfirmasiPeminjaman(data.id)" />
              <CTA label="Batalkan" severity="danger" @click="konfirmasiPembatalan(data.id)" />
            </div>
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
            <CTA label="Konfirmasi" @click="konfirmasiPengembalian(data)" />
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
            {{ getPeminjamanStateDate(data, 1, { dateStyle: "long", timeStyle: "long" }) }}
          </template>
        </Column>
      </DataTable>
    </section>

    <section class="main-section col-span-full">
      <ul class="grid grid-cols-4 gap-4">
        <AdminInfoChip to="buku" :data="counts?.peminjaman_count" label="Buku sedang dipinjam" />
        <AdminInfoChip to="buku" :data="counts?.buku_count" label="Buku tersedia" />
        <AdminInfoChip to="pengguna" :data="counts?.pengguna_count" label="Pengguna aktif" />
      </ul>
    </section>

    <section v-if="kunjungans" class="main-section col-span-full">
      <h2 class="leading-relaxed mb-4">Riwayat Kunjungan</h2>

      <form class="flex gap-4 py-4" @submit.prevent="handleSearchKunjungans()">
        <FloatLabel>
          <DatePicker
            v-model="kunjunganSearchFor.timestamp_range[0]"
            input-id="start-date"
            show-button-bar
            :max-date="new Date()"
          />
          <label for="start-date">Tanggal awal</label>
        </FloatLabel>

        <FloatLabel>
          <DatePicker
            v-model="kunjunganSearchFor.timestamp_range[1]"
            input-id="end-date"
            show-button-bar
            :max-date="new Date()"
          />

          <label for="start-date">Tanggal akhir</label>
        </FloatLabel>

        <CTA type="submit" label="filter" class="ml-auto" fill />
      </form>

      <DataTable :value="kunjungans" striped-rows paginator :rows="10">
        <template #header>
          <p>Menampilkan {{ kunjungans.length }} kunjungan.</p>
        </template>

        <Column header="No">
          <template #body="slotProps">
            {{ kunjungans.indexOf(slotProps.data) + 1 }}
          </template>
        </Column>
        <Column field="pengguna.nama" header="Pengguna" />
        <Column header="Waktu">
          <template #body="slotProps">
            {{
              formatDate(new Date(slotProps.data.timestamp), {
                dateStyle: "long",
                timeStyle: "short",
              })
            }}
          </template>
        </Column>
        <Column header="Status">
          <template #body="slotProps">
            {{ slotProps.data.event.replace("_", " ") }}
          </template>
        </Column>
      </DataTable>
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
