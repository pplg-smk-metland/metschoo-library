<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import { DataTable, Column, InputText, DatePicker, FloatLabel } from "primevue"
import IconExcel from "~icons/mdi/microsoft-excel"
import xlsx from "xlsx"
import { getPeminjamanData } from "@/lib/peminjaman"
import { formatDate } from "@/utils"

import type { PeminjamanSearchArgs } from "~/types"
import type { PeminjamanData } from "./index.vue"

useHead({
  title: "Peminjaman",
})

definePageMeta({
  layout: "admin",
})

const searchFor = ref<PeminjamanSearchArgs>({
  peminjam: "",
  judul: "",
  tgl_pinjam: [null, null],
  tenggat_waktu: [null, null],
})

const { data: peminjamanData, refresh: refreshPeminjaman } = await useAsyncData(async () => {
  return await getPeminjamanData(searchFor.value)
})

const isLoading = ref(false)

async function handleFilterPeminjaman() {
  isLoading.value = true
  refreshPeminjaman()
  isLoading.value = false
}

const toast = useToast()

async function handleExportToExcel(data: typeof peminjamanData.value) {
  if (!data) {
    return toast.add({
      severity: "error",
      detail: "Error ketika mengekspor!",
      summary: "Tidak ada data untuk diexpor.",
      life: 10000,
    })
  }

  const finalData = data.map((row) => {
    return {
      buku: row.buku?.judul,
      peminjam: row.pengguna,
      "tanggal pinjam": formatDate(new Date(row.tgl_pinjam ?? "")),
      "tenggat waktu": formatDate(new Date(row.tenggat_waktu)),
      keterangan: row.peminjaman_detail[0].peminjaman_state?.name,
    }
  })

  const worksheet = xlsx.utils.json_to_sheet(finalData)
  const workbook = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(workbook, worksheet, `peminjaman`)

  xlsx.writeFileXLSX(workbook, `Peminjaman - Metschoo Library | ${formatDate(new Date())}.xlsx`, {
    compression: true,
  })

  return toast.add({
    severity: "success",
    summary: "sukses mengekspor data!",
    detail: "sukses mengekspor data peminjaman. Lihat folder download anda!",
    life: 10000,
  })
}
</script>

<template>
  <PageHeader heading="Data peminjaman" class="justify-between">
    <CTA fill @click="handleExportToExcel(peminjamanData)" label="Export to Excel">
      <IconExcel />
    </CTA>
  </PageHeader>

  <section class="main-section">
    <form class="py-4 flex gap-4" @submit.prevent="handleFilterPeminjaman">
      <FloatLabel>
        <InputText v-model="searchFor.peminjam" input-id="peminjam" fluid />
        <label for="peminjam">Peminjam</label>
      </FloatLabel>

      <FloatLabel>
        <InputText v-model="searchFor.judul" input-id="no-isbn" fluid />
        <label for="no-isbn">Judul</label>
      </FloatLabel>

      <FloatLabel>
        <DatePicker
          v-model="searchFor.tgl_pinjam[0]"
          input-id="tgl-pinjam-awal"
          show-button-bar
          :manual-input="true"
        />
        <label for="tgl-pinjam-awal">Tanggal pinjam awal</label>
      </FloatLabel>

      <FloatLabel>
        <DatePicker
          v-model="searchFor.tgl_pinjam[1]"
          input-id="tgl-pinjam-akhir"
          show-button-bar
          :manual-input="true"
        />
        <label for="tgl-pinjam-akhir">Tanggal pinjam akhir</label>
      </FloatLabel>

      <FloatLabel>
        <DatePicker
          v-model="searchFor.tenggat_waktu[0]"
          input-id="tenggat-waktu-awal"
          show-button-bar
          :manual-input="true"
        />
        <label for="tenggat-waktu-awal">Tenggat waktu awal</label>
      </FloatLabel>

      <FloatLabel>
        <DatePicker
          v-model="searchFor.tenggat_waktu[1]"
          input-id="tenggat-waktu-akhir"
          show-button-bar
          :manual-input="true"
        />
        <label for="tenggat-waktu-akhir">Tenggat waktu akhir</label>
      </FloatLabel>

      <CTA fill type="submit" label="filter" class="ms-auto" />
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
        <p class="text-center py-8">Tidak ada data peminjaman yang ditemukan.</p>
      </template>

      <template #loading>
        <LoadingSpinner />
      </template>
      <template #header>
        <p class="dark:text-gray-400">Menampilkan {{ peminjamanData?.length }} peminjaman.</p>
      </template>

      <Column field="pengguna.nama" header="Peminjam">
        <template #body="{ data }">
          <NuxtLink
            :to="`/admin/pengguna/${data.pengguna.user_id}`"
            class="hover:underline inline-block py-2"
          >
            {{ data.pengguna.nama }}
          </NuxtLink>
        </template>
      </Column>
      <Column field="judul" header="Judul buku" class="!p-0">
        <template #body="{ data }">
          <NuxtLink
            :to="`/admin/buku/${data.buku.slug}`"
            class="hover:underline py-2 w-full inline-block max-w-72 overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {{ data.buku.judul }}
          </NuxtLink>
        </template>
      </Column>

      <Column field="no_isbn" header="ISBN" />

      <Column field="tgl_pinjam" header="Tanggal pinjam" sortable>
        <template #body="{ data }: { data: PeminjamanData[number] }">
          {{ getPeminjamanStateDate(data, 1) }}
        </template>
      </Column>

      <Column header="Tanggal kembali">
        <template #body="{ data }: { data: PeminjamanData[number] }">
          {{
            [5, 6].includes(data.peminjaman_detail[0].state_id)
              ? getPeminjamanStateDate(data, data.peminjaman_detail[0].state_id)
              : "-"
          }}
        </template>
      </Column>

      <Column field="tenggat_waktu" header="Tenggat waktu" sortable>
        <template #body="slotProps">
          {{ formatDate(new Date(slotProps.data.tenggat_waktu)) }}
        </template>
      </Column>

      <Column header="keterangan" field="state_id" sortable>
        <template #body="slotProps">
          <!-- latest status is on top  -->
          {{ slotProps.data.peminjaman_detail[0].peminjaman_state.name }}
        </template>
      </Column>
    </DataTable>
  </section>

  <Toast />
</template>

<style>
tr.late {
  background-color: var(--color-warning-subtle);
}
</style>
