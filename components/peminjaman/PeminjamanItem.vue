<script setup lang="ts">
import type { PeminjamanItem } from "~/pages/peminjaman/index.vue"
import { Divider, Image } from "primevue"

interface Props {
  peminjaman: PeminjamanItem[number]
}

defineProps<Props>()
</script>

<template>
  <li class="grid gap-4 items-start grid-flow-dense rounded-lg peminjaman-item">
    <figure v-if="peminjaman.buku" class="contents">
      <RouterLink :to="`/buku/${peminjaman.buku.slug}`" class="row-span-2">
        <Image
          :src="getBukuImage(peminjaman.buku?.image)"
          width="400"
          height="600"
          class="size-full object-cover aspect-[2/3] rounded-md"
        />
      </RouterLink>

      <figcaption>
        <p class="font-bold text-lg max-w-lg leading-[1]">{{ peminjaman.buku.judul }}</p>
        <p class="text-sm">{{ peminjaman.buku.penulis }}</p>
      </figcaption>
    </figure>

    <article>
      <p>Tenggat waktu pengembalian: {{ formatDate(new Date(peminjaman.tenggat_waktu)) }}</p>
      <ul>
        <li v-for="detail in peminjaman.peminjaman_detail" :key="detail.id" class="detail-item">
          <span class="block text-gray-600 dark:text-gray-400 text-sm order-[-1]">
            {{
              formatDate(new Date(detail.created_at), {
                dateStyle: "long",
                timeStyle: "medium",
              })
            }}
          </span>

          <span class="order-last pb-2">
            {{ detail.peminjaman_state!.name }}
          </span>
        </li>
      </ul>
    </article>

    <Divider
      class="!mt-0 col-span-full before:w-8/12 before:border-t-2 before:border-surface-100/60 dark:before:border-surface-600/50 before:left-[unset]"
    />
  </li>
</template>

<style scoped>
.peminjaman-item {
  grid-template-columns: 20ch 1fr;
  grid-template-rows: min-content 1fr;

  @media only screen and (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.detail-item {
  display: grid;
  grid-template-columns: 1rem 1fr;
  column-gap: 1rem;
}

.detail-item::before,
.detail-item::after {
  content: "";

  display: block;
  position: relative;
  justify-self: center;
}

.detail-item::before {
  @apply bg-surface-400/50 dark:bg-blue-100/50;

  border-radius: 100px;
  aspect-ratio: 1/1;
  order: -2;
  padding: 0.5rem;
  height: 100%;
}

.detail-item::after {
  @apply bg-surface-300 dark:bg-surface-600;

  order: -1;
  width: 0.2rem;
  height: 100%;
}

.detail-item:last-of-type::after {
  background: transparent;
}
</style>
