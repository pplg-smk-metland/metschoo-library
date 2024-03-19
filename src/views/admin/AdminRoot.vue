<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabase"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import DataRow from "@/components/admin/DataRow.vue"

const isLoading = ref(false)
const dataPeminjaman = ref([])
const bukuDipinjam = ref([])

async function ambilDataPeminjaman() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("peminjaman")
      .select("*, pengguna(*), buku(*)")
      .eq("sudah_dikonfirmasi", false)
    if (error) throw error
    return data
  } catch (err) {
    console.error(err.message)
  } finally {
    isLoading.value = false
  }
}

async function ambilBukuYangDipinjam() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("peminjaman")
      .select("*, pengguna(nama, jurusan), buku(*)")
      .eq("sudah_dikonfirmasi", true)
      .eq("sudah_dikembalikan", false)
    if (error) throw error
    return data
  } catch (err) {
    console.error(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  dataPeminjaman.value = await ambilDataPeminjaman()
  bukuDipinjam.value = await ambilBukuYangDipinjam()
})

async function konfirmasiPeminjaman(no_isbn) {
  try {
    if (!confirm("beneran nih mau konfirmasi peminjaman buku")) return
    const { error } = await supabase
      .from("peminjaman")
      .update({ sudah_dikonfirmasi: true, tgl_pinjam: new Date().toISOString() })
      .eq("no_isbn", no_isbn)
    if (error) throw error

    dataPeminjaman.value = dataPeminjaman.value.filter((buku) => buku.no_isbn !== no_isbn)
  } catch (err) {
    console.error(err.message)
  }
}

function konfirmasiPengembalian(no_isbn) {
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
        @konfirmasi-peminjaman="konfirmasiPeminjaman(data.no_isbn)"
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
