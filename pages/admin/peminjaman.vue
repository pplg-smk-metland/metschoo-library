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
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)

const isLoading = ref(false)

onMounted(async () => {
  handleFilterPeminjaman()
})

async function handleFilterPeminjaman() {
  isLoading.value = true
  peminjamanData.value = await getPeminjamanData(startDate.value, endDate.value)
  isLoading.value = false
}

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
    <form class="py-4 flex gap-4" @submit.prevent="handleFilterPeminjaman">
      <FloatLabel>
        <DatePicker
          v-model="startDate"
          :invalid="!endDate || !startDate || endDate < startDate"
          input-id="start-date"
        />
        <label for="start-date">Tanggal awal</label>
      </FloatLabel>

      <FloatLabel>
        <DatePicker
          v-model="endDate"
          :invalid="!endDate || !startDate || startDate < endDate"
          input-id="end-date"
        />
        <label for="end-date">Tanggal akhir</label>
      </FloatLabel>

      <CTA type="submit" label="filter" class="ml-auto" />
    </form>

    <DataTable
      :value="peminjamanData"
      scrollable
      scroll-height="60vh"
      :loading="isLoading"
      striped-rows
      paginator
      :rows="20"
    >
      <template #empty>
        <p>Belum ada yang meminjam</p>
      </template>

      <template #loading>
        <LoadingSpinner />
      </template>

      <Column field="pengguna.nama" header="Peminjam" />
      <Column header="Judul buku" class="!p-0">
        <template #body="{ data }">
          <NuxtLink
            :to="`/admin/buku/${data.buku.no_isbn}`"
            class="hover:underline py-4 w-full inline-block"
          >
            {{ data.buku.judul }}
          </NuxtLink>
        </template>
      </Column>
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
