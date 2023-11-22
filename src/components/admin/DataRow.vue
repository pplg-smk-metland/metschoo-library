<script setup>
import CTA from "../CTA.vue"

const props = defineProps({
  data: Object,
})

const emit = defineEmits(["konfirmasi"])

function konfirmasi() {
  emit("konfirmasi")
}
</script>

<template>
  <li class="data-row">
    <div class="data-buku">
      <h1>{{ data.buku.judul }}</h1>
      <p>{{ data.no_isbn }}</p>
      <p>{{ data.buku.penerbit }}</p>
      <p>{{ data.buku.jumlah_exspl }}</p>
      <p>
        <span v-if="data.sudah_dipinjam === true">sudah dipinjam</span
        ><span v-else>belum dipinjam</span>
      </p>
    </div>

    <div class="data-pengguna">
      <p>{{ data.pengguna.nama }}</p>
      <p>{{ data.pengguna.kelas }} - {{ data.pengguna.jurusan }}</p>
    </div>
    <CTA @click="konfirmasi" :disabled="data.sudah_dipinjam">Konfirmasi peminjaman</CTA>
  </li>
</template>

<style scoped>
.data-row {
  outline: 2px solid var(--primary);
  padding: 1rem 2rem;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
</style>
