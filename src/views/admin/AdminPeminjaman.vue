<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import { getPeminjamanData, type PeminjamanData } from "@/lib/peminjaman"

const peminjamanData = ref<PeminjamanData>([])

onMounted(async () => {
  peminjamanData.value = await getPeminjamanData()
})

// const tabularPeminjaman = computed(() => {
//   return peminjamanData.value.map(() => ({
//     field: "",
//     header: "",
//   }))
// })

// const tabularPeminjaman = [
//   // column
//   {
//     header: "Peminjam",
//     field: {},
//   },
// ]

// peminjam | kelas & jurusan | judul | isbn | tanggal pinjam | tenggat waktu | tanggal kembali
</script>

<template>
  <h1>halo</h1>

  <div class="table-container">
    <DataTable :value="peminjamanData">
      <Column field="pengguna.nama" header="Peminjam"></Column>
      <Column field="pengguna.kelas" header="Kelas"></Column>
      <Column field="pengguna.jurusan" header="Jurusan"></Column>
      <Column field="buku.judul" header="Judul"></Column>
      <Column field="no_isbn" header="ISBN"></Column>
      <Column field="tgl_pinjam" header="Tanggal Pinjam"></Column>
      <Column field="tenggat_waktu" header="Tenggat Waktu"></Column>
      <Column field="tgl_kembali" header="Tanggal Kembali"></Column>
    </DataTable>
  </div>
</template>

<style>
.table-container {
  overflow-x: auto;
}

table {
  min-width: max-content;
}

th,
td {
  padding: 0.5rem 1rem;
}

tr:nth-child(even) {
  background: var(--grey);
}
</style>
