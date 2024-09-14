<script setup lang="ts">
import type { PeminjamanData } from "@/pages/admin/index.vue"

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
  <li v-if="!buku">anying lah</li>

  <li v-else class="grid grid-cols-2 gap-2 p-4 outline outline-1 outline-primary">
    <section>
      <NuxtLink :to="`/admin/buku/${buku.no_isbn}`">
        <h1 class="text-lg">{{ buku.judul }}</h1>
        <p>{{ buku.no_isbn }}</p>
        <p>{{ buku.jumlah_exspl }}</p>

        <Message severity="info" v-if="borrowConfirmed">sudah dikonfirmasi</Message>
        <Message severity="info" v-if="borrowPending">belum dipinjam</Message>
        <Message severity="info" v-if="returnPending">belum dikembalikan</Message>
      </NuxtLink>
    </section>

    <section class="data-pengguna">
      <p>{{ data.pengguna!.nama }}</p>
      <p>{{ data.pengguna!.kelas }} - {{ data.pengguna!.jurusan }}</p>
    </section>

    <CTA
      v-show="borrowPending"
      label="Konfirmasi peminjaman "
      @click="$emit('konfirmasiPeminjaman')"
    />
    <CTA
      v-show="returnPending"
      label=" Konfirmasi pengembalian "
      @click="$emit('konfirmasiPengembalian')"
    />
  </li>
</template>
