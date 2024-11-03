<script setup lang="ts">
import type { Buku } from "@/types/index"

interface Props {
  buku: Buku
}
const props = defineProps<Props>()

defineEmits(["pinjamBuku", "hapusBuku"])

const imgURL = ref("")
onMounted(async () => {
  imgURL.value = await getBukuImage(props.buku.no_isbn)
})
</script>

<template>
  <li class="buku dark:hover:bg-primary/20">
    <figure>
      <NuxtLink :to="`/buku/${buku.no_isbn}`">
        <img
          :src="imgURL"
          class="buku__gambar"
          alt="gambar buku"
          loading="lazy"
          width="200"
          height="300"
        />
      </NuxtLink>
    </figure>
    <article class="buku__info">
      <h3 class="buku__judul mt-2">
        {{ buku.judul }}
      </h3>
      <p>
        <span class="buku__penulis">{{ buku.penulis }}</span> -
        <span class="buku__tahun-terbit">{{ buku.tahun_terbit }}</span>
      </p>

      <div class="button-container">
        <CTA label="Pinjam buku" @click="$emit('pinjamBuku')" />
        <CTA label="Hapus dari wishlist" severity="danger" @click="$emit('hapusBuku')" />
      </div>
    </article>
  </li>
</template>

<style scoped>
.buku {
  border-radius: 0.5rem;
  padding: 1rem;

  display: flex;
  flex-direction: column;
}

.buku__info {
  flex: 1;

  display: flex;
  flex-direction: column;
}

.buku__gambar {
  width: 100%;
  aspect-ratio: 1 / 1.55;
  object-fit: cover;
  border-radius: 0.5rem;
}

.button-container {
  flex-direction: column;
  margin-top: auto;
}
</style>
