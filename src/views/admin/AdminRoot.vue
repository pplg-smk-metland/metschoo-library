<script setup lang="ts">
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import type { Buku, Peminjaman } from "@/types"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataRow from "@/components/admin/DataRow.vue"
import TheDialog from "@/components/TheDialog.vue"
import { useDialog } from "@/lib/composables"

const isLoading = ref(false)
const { dialog } = useDialog()

const dataPeminjamanQuery = supabase
  .from("peminjaman")
  .select("*, pengguna(nama), buku(judul, penulis, jumlah_exspl, no_isbn)")
  .eq("state_id", 1)

export type DataPeminjaman = QueryData<typeof dataPeminjamanQuery>
const bukuBelumDipinjam = ref<DataPeminjaman>([])

async function ambilDataPeminjaman() {
  try {
    isLoading.value = true
    const { data, error } = await dataPeminjamanQuery
    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return []
  } finally {
    isLoading.value = false
  }
}

const bukuDipinjamQuery = supabase
  .from("peminjaman")
  .select("*, pengguna(nama, kelas, jurusan), buku(judul, penulis, jumlah_exspl, no_isbn)")
  .eq("state_id", 2)

export type BukuDipinjam = QueryData<typeof bukuDipinjamQuery>
const bukuDipinjam = ref<BukuDipinjam>([])

async function ambilBukuYangDipinjam() {
  try {
    isLoading.value = true
    const { data, error } = await bukuDipinjamQuery
    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  bukuBelumDipinjam.value = await ambilDataPeminjaman()
  bukuDipinjam.value = await ambilBukuYangDipinjam()
})

async function konfirmasiPeminjaman(id: Peminjaman["id"]) {
  try {
    if (!confirm("beneran nih mau konfirmasi peminjaman buku")) return
    const { error } = await supabase.from("peminjaman").update({ state_id: 2 }).eq("id", id)
    if (error) throw error

    bukuBelumDipinjam.value = bukuBelumDipinjam.value.filter((buku) => buku.id !== id)

    dialog.value.open(`Sukses mengkonfirmasi peminjaman buku`)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}

async function konfirmasiPengembalian(no_isbn: Buku["no_isbn"]) {
  try {
    const { error } = await supabase
      .from("peminjaman")
      .update({ state_id: 4 })
      .eq("no_isbn", no_isbn)
    if (error) throw error

    dialog.value.open(`Sukses mengkonfirmasi pengembalian buku`)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}
</script>

<template>
  <h1>Admin</h1>
  <p>Halo admin</p>

  <section class="main-section">
    <h2>Buku yang belum dikonfirmasi</h2>

    <ul class="data-list">
      <LoadingSpinner v-if="isLoading" />
      <li v-if="!isLoading && !bukuBelumDipinjam.length">ga ada data peminjamannya</li>
      <DataRow
        v-for="data in bukuBelumDipinjam"
        :key="data.user_id"
        :data="data"
        :buku="data.buku!"
        @konfirmasi-peminjaman="konfirmasiPeminjaman(data.id)"
        @konfirmasi-pengembalian="konfirmasiPengembalian(data.no_isbn)"
      />
    </ul>
  </section>

  <section class="main-section">
    <h2>Buku yang sedang dipinjam</h2>

    <ul class="data-list">
      <LoadingSpinner v-if="isLoading" />
      <li v-if="!isLoading && !bukuDipinjam.length">Tidak ada buku yang sedang dipinjam</li>
      <DataRow
        v-else
        v-for="data in bukuDipinjam"
        :key="data.no_isbn"
        :data="data"
        :buku="data.buku!"
        @konfirmasi-peminjaman="konfirmasiPeminjaman(data.id)"
        @konfirmasi-pengembalian="konfirmasiPengembalian(data.no_isbn)"
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
