<script setup>
import CTA from "@/components/CTA.vue"

const props = defineProps({
  data: Object,
})

defineEmits(["konfirmasiPeminjaman", "konfirmasiPengembalian"])

/* function konfirmasiPeminjaman() {
  emit("konfirmasiPeminjaman")
}

function konfirmasiPengembalian() {
  emit("konfirmasiPengembalian")
} */
</script>

<template>
  <li class="data-row">
    <div class="data-buku">
      <h1>{{ data.buku.judul }}</h1>
      <p>{{ data.no_isbn }}</p>
      <p>{{ data.buku.penerbit }}</p>
      <p>{{ data.buku.jumlah_exspl }}</p>
      <p>
        <span v-if="data.sudah_dikonfirmasi === true">sudah dikonfirmasi</span
        ><span v-else>belum dipinjam</span>
      </p>
    </div>

    <div class="data-pengguna">
      <p>{{ data.pengguna.nama }}</p>
      <p>{{ data.pengguna.kelas }} - {{ data.pengguna.jurusan }}</p>
    </div>

    <CTA @click="$emit('konfirmasiPeminjaman')" v-show="!data.sudah_dikonfirmasi">
      Konfirmasi peminjaman
    </CTA>
    <CTA @click="$emit('konfirmasiPengembalian')" v-show="data.sudah_dikonfirmasi">
      Konfirmasi pengembalian
    </CTA>
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

.data-row h1 {
  line-height: 1;
}
</style>
