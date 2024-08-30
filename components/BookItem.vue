<script setup lang="ts">
import type { Buku } from "@/types"

interface Props {
  buku: Buku
}
const props = defineProps<Props>()
const imgURL = ref("")

onMounted(async () => {
  try {
    imgURL.value = await getBukuImage(props.buku.no_isbn)
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <li class="shadow">
    <NuxtLink
      :to="`/buku/${buku.no_isbn}`"
      class="inline-block size-full p-4 rounded-lg hover:bg-primary-500/10 transition-colors duration-200"
    >
      <figure>
        <img
          :src="imgURL"
          class="rounded-lg w-full object-cover bg-no-repeat"
          :alt="`cover buku ${buku.judul}`"
          loading="lazy"
          height="400"
        />
      </figure>
      <figcaption class="mt-4">
        <div class="metadata">
          <h3 class="leading-none text-2xl text-slate-900/90 dark:text-slate-300/90">
            {{ buku.judul }}
          </h3>
          <p class="leading-none my-2">
            {{ buku.penulis }}
          </p>
          <p class="text-sm">
            {{ buku.tahun_terbit }}
          </p>
        </div>
      </figcaption>
    </NuxtLink>
  </li>
</template>
