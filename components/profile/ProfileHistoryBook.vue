<script setup lang="ts">
import type { History } from "@/pages/profil/index.vue"

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
      <img :src="imgUrl" :alt="`Cover ${buku.judul}`" width="100" class="size-full object-cover" />
    </figure>

    <div class="flex flex-col justify-between py-2 flex-1 leading-none">
      <header>
        <h3>{{ buku.judul }}</h3>
        <p class="m-0">{{ buku.penulis }}</p>
      </header>

      <p>
        dipinjam pada <span class="block font-bold">{{ formatDate(new Date(tgl_pinjam)) }}</span>
      </p>
      <p v-if="tgl_kembali">
        dikembalikan pada
        <span class="block font-bold">{{ formatDate(new Date(tgl_kembali)) }}</span>
      </p>
      <p v-else class="text-red-400 leading-normal">Dibatalkan</p>
      <p v-if="late" class="text-red-500 ring-red-500">Terlambat</p>
    </div>
  </NuxtLink>
</template>
