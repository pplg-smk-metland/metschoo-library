<script setup lang="ts">
import type { KunjunganSearchArgs } from "~/types"

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
</script>
<template>
  <PageHeader heading="Admin">
    <p>Halo admin</p>
  </PageHeader>

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
</template>
