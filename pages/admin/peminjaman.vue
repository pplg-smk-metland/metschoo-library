<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import { getPeminjamanData } from "@/lib/peminjaman"
import type { Peminjaman } from "@/types"
import { formatDate } from "#imports"

useHead({
  title: "Peminjaman",
})

definePageMeta({
  layout: "admin",
})

const peminjamanData = ref<Peminjaman[]>([])

const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  peminjamanData.value = await getPeminjamanData()
  isLoading.value = false
})

const lateClass = (data: Peminjaman) => {
  if (data.tgl_kembali) {
    const isLate = new Date(data.tenggat_waktu).getTime() < new Date(data.tgl_kembali).getTime()
    return [{ late: isLate }]
  } else {
    return [{ late: false }]
  }
}
</script>

<template>
  <PageHeader heading="Data peminjaman" />

  <section class="main-section">
    <h2>Belum dikonfirmasi</h2>

    <DataTable
      :value="peminjamanData"
      scrollable
      :loading="isLoading"
      striped-rows
      paginator
      rows="20"
    >
      <template #empty>
        <p>Belum ada yang meminjam</p>
      </template>

      <template #loading>
        <LoadingSpinner />
      </template>

      <Column field="pengguna.nama" header="Peminjam" />
      <Column field="buku.judul" header="Judul buku" />
      <Column field="no_isbn" header="ISBN" />
      <Column field="tgl_pinjam" header="Tanggal pinjam" sortable>
        <template #body="slotProps">
          {{ formatDate(new Date(slotProps.data.tgl_pinjam)) }}
        </template>
      </Column>
      <Column field="tenggat_waktu" header="Tenggat waktu" sortable>
        <template #body="slotProps">
          {{ formatDate(new Date(slotProps.data.tenggat_waktu)) }}
        </template>
      </Column>

      <Column header="keterangan" field="state_id" sortable>
        <template #body="slotProps">
          {{ slotProps.data.peminjaman_state.name }}
        </template>
      </Column>
    </DataTable>
  </section>
</template>

<style>
tr.late {
  background-color: var(--color-warning-subtle);
}
</style>
