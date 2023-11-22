<script setup>
import { ref, onMounted } from "vue"

import DataRow from "../../components/admin/DataRow.vue"

import { supabase } from "../../supabase"

const dataPeminjaman = ref([])

async function ambilDataPeminjaman() {
  try {
    const { data, error } = await supabase.from("peminjaman").select("*, pengguna(*), buku(*)")
    if (error) throw error
    return data
  } catch (err) {
    console.error(err.message)
  }
}

onMounted(async () => {
  dataPeminjaman.value = await ambilDataPeminjaman()
})

async function konfirmasiPeminjaman(no_isbn) {
  try {
    alert("beneran nih mau konfirmasi")
    const { data, error } = await supabase
      .from("peminjaman")
      .update({ sudah_dipinjam: true })
      .eq("no_isbn", no_isbn)
      .select()
    if (error) throw error

    dataPeminjaman.value = data
  } catch (err) {
    console.error(err.message)
  }
}
</script>

<template>
  <h1>Admin</h1>
  <p>Halo admin</p>

  <section class="main-section">
    <h2>Data peminjaman buku</h2>

    <ul class="data-list">
      <li v-if="!dataPeminjaman.length">ga ada data peminjamannya</li>
      <DataRow
        v-for="data in dataPeminjaman"
        :key="data.user_id"
        :data="data"
        @konfirmasi="konfirmasiPeminjaman(data.no_isbn)"
      />
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
