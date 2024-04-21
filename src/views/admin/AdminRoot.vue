<script setup lang="ts">
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import type { Buku } from "@/types"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataRow from "@/components/admin/DataRow.vue"

const isLoading = ref(false)

const dataPeminjamanQuery = supabase
  .from("peminjaman")
  .select("*, pengguna(nama), buku(judul, penulis, jumlah_exspl, no_isbn)")
  .eq("sudah_dikonfirmasi", false)

type DataPeminjaman = QueryData<typeof dataPeminjamanQuery>
const dataPeminjaman = ref<DataPeminjaman>([])

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
  .select("*, pengguna(nama, jurusan), buku(*)")
  .eq("sudah_dikonfirmasi", true)
  .eq("sudah_dikembalikan", false)

type BukuDipinjam = QueryData<typeof bukuDipinjamQuery>
const bukuDipinjam = ref<BukuDipinjam>([])

async function ambilBukuYangDipinjam() {
  try {
    isLoading.value = true
    const { data, error } = await bukuDipinjamQuery
    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
  } finally {
    isLoading.value = false
    return []
  }
}

onMounted(async () => {
  dataPeminjaman.value = await ambilDataPeminjaman()
  bukuDipinjam.value = await ambilBukuYangDipinjam()
})

async function konfirmasiPeminjaman(no_isbn: Buku["no_isbn"], jumlah_exspl: Buku["jumlah_exspl"]) {
  try {
    if (!confirm("beneran nih mau konfirmasi peminjaman buku")) return
    const { error } = await supabase
      .from("peminjaman")
      .update({
        sudah_dikonfirmasi: true,
        tgl_pinjam: new Date().toISOString(),
        jumlah_exspl: Number(jumlah_exspl) - 1,
      })
      .eq("no_isbn", no_isbn)
    if (error) throw error

    dataPeminjaman.value = dataPeminjaman.value.filter((buku) => buku.no_isbn !== no_isbn)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}

function konfirmasiPengembalian(no_isbn: Buku["no_isbn"]) {
  alert(`kembalikan buku dengan no isbn ${no_isbn}`)
}
</script>

<template>
  <h1>Admin</h1>
  <p>Halo admin</p>

  <section class="main-section">
    <h2>Buku yang belum dikonfirmasi</h2>

    <ul class="data-list">
      <LoadingSpinner v-if="isLoading" />
      <li v-if="!isLoading && !dataPeminjaman.length">ga ada data peminjamannya</li>
      <DataRow
        v-for="data in dataPeminjaman"
        :key="data.user_id"
        :data="data"
        @konfirmasi-peminjaman="konfirmasiPeminjaman(data.no_isbn, data.buku!.jumlah_exspl)"
        @konfirmasi-pengembalian="konfirmasiPengembalian(data.no_isbn)"
      />
    </ul>
  </section>

  <section class="main-section">
    <h2>Buku yang sedang dipinjam</h2>

    <ul class="data-list">
      <LoadingSpinner v-if="isLoading" />
      <li v-if="!isLoading && !bukuDipinjam.length">Tidak ada buku yang sedang dipinjam</li>
      <DataRow v-else v-for="data in bukuDipinjam" :key="data.no_isbn" :data="data" />
    </ul>
  </section>
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
