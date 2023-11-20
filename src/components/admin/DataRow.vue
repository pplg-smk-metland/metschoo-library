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
    <p>{{ data.no_pengguna }}</p>
    <p>{{ data.no_isbn }}</p>
    <p>
      <span v-if="data.sudah_dipinjam === true">sudah dipinjam</span
      ><span v-else>belum dipinjam</span>
    </p>
    <CTA @click="konfirmasi" :disabled="data.sudah_dipinjam">Konfirmasi peminjaman</CTA>
  </li>
</template>

<style scoped>
.data-row {
  outline: 2px solid var(--primary);
  padding: 1rem 2rem;
}
</style>
