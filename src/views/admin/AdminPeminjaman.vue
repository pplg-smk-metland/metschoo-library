<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import { getPeminjamanData, type PeminjamanData } from "@/lib/peminjaman"
import { formatDate } from "@/lib/utils"

const peminjamanData = ref<PeminjamanData>([])

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
</script>

<template>
  <h1>Data peminjaman</h1>

  <DataTable :value="borrowPending" scrollable :loading="isLoading">
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
    <Column field="tgl_pinjam" header="Tanggal pinjam"></Column>
    <Column field="tgl_kembali" header="Tanggal kembali"></Column>
    <Column field="tenggat_waktu" header="Tenggat waktu"></Column>
  </DataTable>

  <DataTable :value="peminjamanData" selection-mode="multiple" scrollable>
    <template #header>
      <h2>Data peminjaman Seminggu terakhir</h2>
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
        <routerLink :to="{ name: 'admin-halaman-buku', params: { isbn: slotProps.data.no_isbn } }">
          {{ slotProps.data.buku.judul }}
        </routerLink>
      </template>
    </Column>
    <Column field="no_isbn" header="ISBN"></Column>

    <Column field="tgl_pinjam" header="Tanggal Pinjam" sortable>
      <template #body="slotProps">
        {{ formatDate(new Date(slotProps.data.tgl_pinjam)) }}
      </template>
    </Column>

    <Column field="tenggat_waktu" header="Tenggat Waktu">
      <template #body="slotProps">
        {{ formatDate(new Date(slotProps.data.tenggat_waktu)) }}
      </template>
    </Column>

    <Column field="tgl_kembali" header="Tanggal Kembali" sortable>
      <template #body="slotProps">
        {{ formatDate(new Date(slotProps.data.tgl_kembali)) }}
      </template>
    </Column>
  </DataTable>
</template>
