<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import { getPeminjamanData } from "@/lib/peminjaman"
import { formatDate } from "#imports"
import type { PeminjamanSearchArgs } from "~/types"
import { InputText, DatePicker, FloatLabel } from "primevue"
import type { PeminjamanData } from "./index.vue"

useHead({
  title: "Peminjaman",
})

definePageMeta({
  layout: "admin",
})

const searchFor = ref<PeminjamanSearchArgs>({
  peminjam: "",
  no_isbn: "",
  tgl_pinjam: [null, null],
  tenggat_waktu: [null, null],
})

const { data: peminjamanData } = await useAsyncData(
  async () => await getPeminjamanData(searchFor.value)
)

const isLoading = ref(false)

async function handleFilterPeminjaman() {
  isLoading.value = true
  peminjamanData.value = await getPeminjamanData(searchFor.value)
  isLoading.value = false
}
</script>

<template>
  <PageHeader heading="Data peminjaman" />

  <section class="main-section">
    <form class="py-4 flex gap-4" @submit.prevent="handleFilterPeminjaman">
      <FloatLabel>
        <InputText v-model="searchFor.peminjam" input-id="peminjam" fluid />
        <label for="peminjam">Peminjam</label>
      </FloatLabel>

      <FloatLabel>
        <InputText v-model="searchFor.no_isbn" input-id="no-isbn" fluid />
        <label for="no-isbn">ISBN</label>
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
        <p>Belum ada yang meminjam</p>
      </template>

      <template #loading>
        <LoadingSpinner />
      </template>
      <template #header>
        <p>Menampilkan {{ peminjamanData?.length }} peminjaman.</p>
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
            :to="`/admin/buku/${data.buku.no_isbn}`"
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
</template>

<style>
tr.late {
  background-color: var(--color-warning-subtle);
}
</style>
