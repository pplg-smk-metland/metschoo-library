<script setup lang="ts">
import { formatDate } from "#imports"
import type { PeminjamanData } from "~/pages/admin/index.vue"

interface Props {
  data: PeminjamanData[number]
}

const props = defineProps<Props>()
const { buku, peminjaman_detail } = props.data

const imgURL = ref(getBukuImage(buku!.image))

const peminjamanState = computed(() => {
  return {
    isReturned: peminjaman_detail[0].state_id === 5,
    isLate: peminjaman_detail[0].state_id === 6,
    isCancelled: peminjaman_detail[0].state_id === 7,
  }
})
</script>

<template>
  <NuxtLink
    v-if="buku"
    :to="`/buku/${buku.no_isbn}`"
    class="flex gap-2 hover:bg-primary-500/20 rounded-lg"
  >
    <figure class="max-w-24">
      <img
        :src="imgURL as string"
        :alt="`Cover ${buku.judul}`"
        width="100"
        class="size-full object-cover"
      />
    </figure>

    <div class="flex flex-col justify-between py-2 flex-1 leading-none">
      <h3 class="font-normal leading-[.9] line-clamp-2">{{ buku.judul }}</h3>

      <p class="mt-auto">
        <span class="text-sm text-gray-500 dark:text-gray-400">dipinjam pada</span>
        <span class="block">{{ formatDate(new Date(peminjaman_detail[0].created_at)) }}</span>
      </p>

      <p v-if="peminjamanState.isReturned || peminjamanState.isLate" class="m-0">
        <span class="text-sm text-gray-500 dark:text-gray-400">dikembalikan pada</span>
        <span class="block">{{ formatDate(new Date(peminjaman_detail[0].created_at)) }}</span>

        <span v-if="peminjamanState.isLate" class="text-red-500 ring-red-500">Terlambat</span>
      </p>

      <p v-if="peminjamanState.isCancelled" class="m-0 text-sm leading-normal">
        <span class="text-red-400">Dibatalkan</span>
      </p>
    </div>
  </NuxtLink>
</template>
