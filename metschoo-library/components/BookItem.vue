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
  <li class="buku">
    <NuxtLink :to="`/buku/${buku.no_isbn}`">
      <figure>
        <img
          :src="imgURL"
          class="buku__gambar"
          :alt="`cover buku ${buku.judul}`"
          loading="lazy"
          height="400"
        />
      </figure>
      <figcaption class="buku__info">
        <div class="metadata">
          <h3 class="buku__judul">
            {{ buku.judul }}
          </h3>
          <p class="buku__penulis">
            {{ buku.penulis }}
          </p>
          <p class="buku__tahun-terbit">
            {{ buku.tahun_terbit }}
          </p>
        </div>
      </figcaption>
    </NuxtLink>
  </li>
</template>

<style scoped>
.buku {
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.buku:hover {
  background: var(--dark-grey);
}

.buku__gambar {
  border-radius: 0.5rem;
  width: 100%;
  object-fit: cover;
  background-repeat: no-repeat;
}

.buku__info {
  margin-block-start: 1rem;
}

.buku__judul {
  font-size: 1.5rem;
  margin: 0;
  line-height: 1;
}

.buku__penulis {
  margin-block: 0.5rem 0;
  line-height: 1.2;
}

.buku__tahun-terbit {
  font-size: 0.75rem;
  margin: 0;
}

.buku .btn {
  align-self: start;
  margin: 0 1rem 1rem 1rem;
}
</style>
