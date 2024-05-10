<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { supabase } from "@/lib/supabase"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import type { Buku, Peminjaman } from "@/types"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataRow from "@/components/admin/DataRow.vue"
import TheDialog from "@/components/TheDialog.vue"
import { useDialog } from "@/lib/composables"
import { confirmBorrowBuku, confirmReturnBuku } from "@/lib/utils"

const isLoading = ref(false)
const { dialog } = useDialog()

const peminjamanDataQuery = supabase
  .from("peminjaman")
  .select("*, pengguna(nama, kelas, jurusan), buku(*)")
export type PeminjamanData = QueryData<typeof peminjamanDataQuery>

const peminjamanData = ref<PeminjamanData | null>(null)

async function getPeminjamanData() {
  try {
    const { data, error } = await peminjamanDataQuery
    if (error) throw error
    return data
  } catch (error) {
    console.log(error as PostgrestError)
    return null
  }
}

const bukusBorrowPending = computed(() => {
  if (!peminjamanData.value) return []
  return peminjamanData.value.filter((data) => data.state_id === 1)
})

const bukusBorrowConfirmed = computed(() => {
  if (!peminjamanData.value) return []
  return peminjamanData.value.filter((data) => data.state_id === 2)
})

const bukusReturnPending = computed(() => {
  if (!peminjamanData.value) return []
  return peminjamanData.value.filter((data) => data.state_id === 4)
})

onMounted(async () => {
  isLoading.value = true
  peminjamanData.value = await getPeminjamanData()
  isLoading.value = false
})

async function konfirmasiPeminjaman(id: Peminjaman["id"]) {
  try {
    if (!confirm("beneran nih mau konfirmasi peminjaman buku")) return
    await confirmBorrowBuku(id)

    dialog.value.open(`Sukses mengkonfirmasi peminjaman buku`)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}

async function konfirmasiPengembalian(dataPeminjaman: Peminjaman, buku: Buku) {
  try {
    await confirmReturnBuku(dataPeminjaman, buku, new Date())

    dialog.value.open(`Sukses mengkonfirmasi pengembalian buku`)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}
</script>

<template>
  <h1>Admin</h1>
  <p>Halo admin</p>

  <LoadingSpinner v-if="isLoading" />
  <section class="main-section" v-else>
    <h2>Buku yang belum dikonfirmasi</h2>
    <ul class="data-list">
      <li v-if="!isLoading && !bukusBorrowPending.length">ga ada data peminjamannya</li>
      <DataRow
        v-for="data in bukusBorrowPending"
        :key="data.id"
        :data="data"
        :buku="data.buku"
        @konfirmasi-peminjaman="konfirmasiPeminjaman(data.id)"
      />
    </ul>

    <h2>Buku yang sedang dipinjam</h2>
    <ul class="data-list">
      <DataRow v-for="data in bukusBorrowConfirmed" :data="data" :buku="data.buku" />
    </ul>

    <h2>Buku untuk dikembalikan</h2>
    <ul class="data-list">
      <DataRow
        v-for="data in bukusReturnPending"
        :key="data.id"
        :data="data"
        :buku="data.buku"
        @konfirmasi-pengembalian="konfirmasiPengembalian(data, data.buku!)"
      />
    </ul>
  </section>

  <TheDialog :is-open="dialog.isOpen" :dialog-close="dialog.close">
    <h2>Sukses!</h2>
    <p>{{ dialog.message }}</p>
  </TheDialog>
</template>

<style scoped>
.data-list {
  list-style: none;
  margin: 0;
  padding: 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50ch, 1fr));
  gap: 1rem;
}
</style>
