<script setup lang="ts">
import CTA from "@/components/CTA.vue"
import type { PeminjamanData } from "@/views/admin/AdminRoot.vue"
import { computed } from "vue"
interface Props {
  data: PeminjamanData[number]
  buku: PeminjamanData[number]["buku"]
}

const { data, buku } = defineProps<Props>()
defineEmits(["konfirmasiPeminjaman", "konfirmasiPengembalian"])

const borrowPending = computed(() => data.state_id === 1)
const borrowConfirmed = computed(() => data.state_id === 2)
const returnPending = computed(() => data.state_id === 4)
</script>

<template>
  <li class="data-row">
    <div class="data-buku">
      <routerLink :to="{ name: 'admin-halaman-buku', params: { isbn: buku.no_isbn } }">
        <h1>{{ buku.judul }}</h1>
        <p>{{ buku.no_isbn }}</p>
        <p>{{ buku.jumlah_exspl }}</p>
        <p class="status">
          <span v-if="borrowConfirmed">sudah dikonfirmasi</span>
          <span v-if="borrowPending">belum dipinjam</span>
          <span v-if="returnPending">belum dikembalikan</span>
        </p>
      </routerLink>
    </div>

    <div class="data-pengguna">
      <p>{{ data.pengguna!.nama }}</p>
      <p>{{ data.pengguna!.kelas }} - {{ data.pengguna!.jurusan }}</p>
    </div>

    <CTA
      v-show="borrowPending"
      @click="$emit('konfirmasiPeminjaman')"
      label="Konfirmasi peminjaman "
    />
    <CTA
      v-show="returnPending"
      @click="$emit('konfirmasiPengembalian')"
      label=" Konfirmasi pengembalian "
    />
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
