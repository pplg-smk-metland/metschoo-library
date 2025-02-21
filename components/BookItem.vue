<script setup lang="ts">
import type { Buku } from "@/types"

interface Props {
  buku: Buku
}
const props = defineProps<Props>()
const imgURL = ref(getBukuImage(props.buku.image))
</script>

<template>
  <li class="shadow">
    <NuxtLink
      :to="`/buku/${buku.slug}`"
      class="inline-block size-full p-4 rounded-lg hover:bg-primary-500/10 transition-colors duration-200"
    >
      <figure>
        <img
          :src="imgURL as string"
          class="rounded-lg w-full min-h-96 object-cover bg-no-repeat"
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
