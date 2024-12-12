<script setup lang="ts">
import type { PeminjamanData } from "@/pages/admin/index.vue"

interface Props {
  data: PeminjamanData[number]
}

const { data } = defineProps<Props>()
const { buku } = data

const imgURL = ref(getBukuImage(buku?.image))
</script>

<template>
  <li v-if="!buku" />
  <li v-else>
    <NuxtLink
      v-if="buku"
      :to="`/buku/${buku.no_isbn}`"
      class="p-4 rounded-lg h-full flex flex-col gap-4 shadow-md hover:bg-primary/10"
    >
      <figure>
        <img
          :src="imgURL as string"
          class="w-full object-cover"
          alt="gambar buku"
          loading="lazy"
          width="200"
          height="300"
        />
      </figure>

      <figcaption class="buku__info">
        <div class="buku__metadata">
          <h3 class="leading-tight">
            {{ buku.judul }}
          </h3>

          <p class="text-sm my-0">{{ buku.no_isbn }}</p>
          <p class="text-sm my-0">
            {{ buku.penulis }} -<span class="buku__tahun-terbit">{{ buku.tahun_terbit }}</span>
          </p>
        </div>
      </figcaption>

      <div class="mt-auto">
        <p>
          <span class="text-gray-500 dark:text-gray-400"> Dipinjam pada </span>
          <time class="block" :datetime="getPeminjamanStateDate(data, 1)">
            {{ getPeminjamanStateDate(data, 1) }}
          </time>
        </p>

        <p>
          <span class="text-gray-500 dark:text-gray-400"> Tenggat pengembalian </span>
          <time class="block" :datetime="new Date(data.tenggat_waktu).toString()">
            {{ new Date(data.tenggat_waktu).toLocaleDateString() }}
          </time>
        </p>
      </div>
    </NuxtLink>
  </li>
</template>
