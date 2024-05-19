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
  <div class="table-container">
    <DataTable :value="peminjamanData" selection-mode="multiple">
      <template #header>
        <h1>Data peminjaman</h1>
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
          <routerLink
            :to="{ name: 'admin-halaman-buku', params: { isbn: slotProps.data.no_isbn } }"
          >
            {{ slotProps.data.buku.judul }}
          </routerLink>
        </template>
      </Column>
      <Column field="no_isbn" header="ISBN"></Column>
      <Column field="tgl_pinjam" header="Tanggal Pinjam" sortable></Column>
      <Column field="tenggat_waktu" header="Tenggat Waktu"></Column>
      <Column field="tgl_kembali" header="Tanggal Kembali" sortable></Column>
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

.p-table-header,
.p-table-cell {
  padding: 0.5rem 1rem;
}

.p-table-header {
  display: flex;
  justify-content: space-between;
}

.p-sort {
  cursor: pointer;
}

tr:nth-child(even) {
  background: var(--grey);
}
</style>
