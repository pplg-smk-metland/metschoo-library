<script setup lang="ts">
import xlsx from "xlsx"
import type { KunjunganSearchArgs } from "~/types"
import IconExcel from "~icons/mdi/microsoft-excel"

useHead({
  title: "Kunjungan",
})

definePageMeta({
  layout: "admin",
})

const toast = useToast()

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

async function handleExportToExcel(data: typeof kunjungans.value) {
  if (!data || !data.length) {
    return toast.add({
      severity: "error",
      summary: "Error ketika mengekspor!",
      detail: "Tidak ada data untuk diexpor.",
      life: 10000,
    })
  }

  const finalData = data.map((row) => ({
    pengguna: row.pengguna ? row.pengguna.nama : "-",
    kelas: row.pengguna ? row.pengguna.kelas : "-",
    jurusan: row.pengguna ? row.pengguna.jurusan : "-",
    waktu: formatDate(new Date(row.timestamp)),
    status: row.event,
  }))

  const worksheet = xlsx.utils.json_to_sheet(finalData)
  const workbook = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(workbook, worksheet, "peminjaman")

  xlsx.writeFileXLSX(workbook, `Kunjungan - Metschoo Library ${formatDate(new Date())}.xlsx`, {
    compression: true,
  })

  return toast.add({
    severity: "success",
    summary: "Expor sukses!",
    detail: "sukses mengekspor data kunjungan. Lihat folder download anda!",
    life: 10000,
  })
}
</script>
<template>
  <PageHeader heading="Riwayat Kunjungan" class="justify-between">
    <CTA fill label="Export to Excel" @click="handleExportToExcel(kunjungans)">
      <IconExcel />
    </CTA>
  </PageHeader>

  <section v-if="kunjungans" class="main-section col-span-full">
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
      <Column field="pengguna.kelas" header="Kelas" />
      <Column field="pengguna.jurusan" header="Jurusan" />

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

  <Toast />
</template>
