<script setup lang="ts">
import type { History } from "@/pages/profil/index.vue"
import { formatDate } from "#imports"

interface Props {
  data: History[number]
}

const props = defineProps<Props>()
const { buku, tgl_pinjam, tgl_kembali, tenggat_waktu } = props.data
const imgUrl = ref("")

const late = computed(() => {
  return new Date(tenggat_waktu!) < new Date(tgl_kembali!)
})

onMounted(async () => {
  imgUrl.value = await getBukuImage(buku!.no_isbn)
})
</script>

<template>
  <NuxtLink
    v-if="buku"
    :to="`/buku/${buku.no_isbn}`"
    class="flex gap-2 hover:bg-primary-500/20 rounded-lg"
  >
    <figure class="max-w-24">
      <img :src="imgUrl" :alt="`Cover ${buku.judul}`" width="100" class="size-full object-cover" >
    </figure>

    <div class="flex flex-col justify-between py-2 flex-1 leading-none">
      <h3 class="text-lg font-normal leading-[.9]">{{ buku.judul }}</h3>

      <p>
        <span class="text-sm text-gray-500 dark:text-gray-400">dipinjam pada</span>
        <span class="block">{{ formatDate(new Date(tgl_pinjam!)) }}</span>
      </p>

      <p v-if="tgl_kembali" class="m-0">
        <span class="text-sm text-gray-500 dark:text-gray-400">dikembalikan pada</span>
        <span class="block">{{ formatDate(new Date(tgl_kembali)) }}</span>
      </p>

      <p v-else class="m-0 text-sm leading-normal">
        <span class="text-red-400">Dibatalkan</span>
        <span v-if="late" class="text-red-500 ring-red-500">Terlambat</span>
      </p>
    </div>
  </NuxtLink>
</template>
