<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
// import { getPeminjamanData, type PeminjamanData } from "@/lib/peminjaman"
import { getPeminjamanData } from "@/lib/peminjaman"
import type { Peminjaman } from "@/types"

useHead({
  title: "Peminjaman",
})

definePageMeta({
  layout: "admin",
})

const peminjamanData = ref([])
const peminjamanDataWeek = computed(() => {
  const now = new Date()
  const nowAWeekLater = new Date().setDate(now.getDate() + 7)
  const weekRange = nowAWeekLater - now.getTime()

  return peminjamanData.value.filter(
    (data) => now.getTime() - new Date(data.tgl_pinjam).getTime() < weekRange
  )
})

const borrowPending = computed(() => {
  return peminjamanData.value.filter(({ state_id }) => state_id === 1)
})

const returnPending = computed(() => {
  return peminjamanData.value.filter(({ state_id }) => state_id === 4)
})

const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  peminjamanData.value = await getPeminjamanData()
  isLoading.value = false
})

const lateClass = (data: Peminjaman) => {
  const isLate = new Date(data.tenggat_waktu).getTime() < new Date(data.tgl_kembali).getTime()
  return [{ late: isLate }]
}
</script>

<template>
  <h1>Data peminjaman</h1>

  <DataTable :value="borrowPending" scrollable :loading="isLoading" stripedRows>
    <template #header>
      <h2>Belum dikonfirmasi</h2>
    </template>

    <template #empty>
      <p>Belum ada yang meminjam</p>
    </template>

    <template #loading>
      <LoadingSpinner />
    </template>

    <Column field="pengguna.nama" header="Peminjam"></Column>
    <Column field="buku.judul" header="Judul buku"></Column>
    <Column field="no_isbn" header="ISBN"></Column>
    <Column field="tgl_pinjam" header="Tanggal pinjam">
      <template #body="slotProps">
        {{ formatDate(new Date(slotProps.data.tgl_pinjam)) }}
      </template>
    </Column>
    <Column field="tenggat_waktu" header="Tenggat waktu">
      <template #body="slotProps">
        {{ formatDate(new Date(slotProps.data.tenggat_waktu)) }}
      </template>
    </Column>
  </DataTable>

  <DataTable :value="returnPending" scrollable>
    <template #header>
      <h2>Mau dikembalikan</h2>
      <p>Buku yang mau dikembalikan</p>
    </template>
    <template #empty>
      <p>Tidak ada data</p>
    </template>

    <Column field="pengguna.nama" header="Peminjam"></Column>
    <Column field="buku.judul" header="Judul buku"></Column>
    <Column field="tgl_pinjam" header="Tanggal pinjam"></Column>
  </DataTable>

  <DataTable
    :value="peminjamanDataWeek"
    sortField="tenggat_waktu"
    :sortOrder="-1"
    scrollable
    :rowClass="lateClass"
  >
    <template #header>
      <h2>Data peminjaman Seminggu terakhir</h2>
    </template>

    <template #empty>
      <p>Tidak peminjaman selama seminggu terakhir.</p>
    </template>

    <Column field="pengguna.nama" header="Peminjam">
      <template #body="slotProps">
        <p>
          <span>
            {{ slotProps.data.pengguna.nama }}
          </span>
          -
          <span>
            {{ slotProps.data.pengguna.kelas }}
            {{ slotProps.data.pengguna.jurusan }}
          </span>
        </p>
      </template>
    </Column>

    <Column field="buku.judul" header="Judul">
      <template #body="slotProps">
        <NuxtLink :to="`/admin/buku/${slotProps.data.no_isbn}`">
          {{ slotProps.data.buku.judul }}
        </NuxtLink>
      </template>
    </Column>
    <Column field="no_isbn" header="ISBN"></Column>

    <Column field="tgl_pinjam" header="Tanggal Pinjam" sortable>
      <template #body="slotProps">
        {{ formatDate(new Date(slotProps.data.tgl_pinjam)) }}
      </template>
    </Column>

    <Column field="tenggat_waktu" header="Tenggat Waktu" :sortable="true">
      <template #body="slotProps">
        {{ formatDate(new Date(slotProps.data.tenggat_waktu)) }}
      </template>
    </Column>

    <Column field="tgl_kembali" header="Tanggal Kembali" sortable>
      <template #body="slotProps">
        {{ slotProps.data.tgl_kembali ? formatDate(new Date(slotProps.data.tgl_kembali)) : "-" }}
      </template>
    </Column>
  </DataTable>
</template>

<style>
tr.late {
  background-color: var(--color-warning-subtle);
}
</style>
