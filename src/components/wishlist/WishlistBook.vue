<script setup lang="ts">
import { ambilGambarBukuDariISBN } from "@/lib/utils"
import { onMounted, ref } from "vue"
import CTA from "@/components/CTA.vue"
import { type Buku } from "@/types/index"

interface Props {
  buku: Buku
}
const props = defineProps<Props>()

defineEmits(["pinjamBuku", "hapusBuku"])

const imgURL = ref("")
onMounted(async () => {
  imgURL.value = await ambilGambarBukuDariISBN(props.buku.no_isbn)
})
</script>

<template>
  <li class="buku">
    <figure>
      <routerLink :to="`/buku/${buku.no_isbn}`">
        <img
          :src="imgURL"
          class="buku__gambar"
          alt="gambar buku"
          loading="lazy"
          width="200"
          height="300"
        />
      </routerLink>
    </figure>
    <figcaption class="buku__info">
      <h3 class="buku__judul">{{ buku.judul }}</h3>
      <p>
        <span class="buku__penulis">{{ buku.penulis }}</span> -
        <span class="buku__tahun-terbit">{{ buku.tahun_terbit }}</span>
      </p>

      <div class="button-container">
        <CTA @click="$emit('pinjamBuku')">Pinjam buku</CTA>
        <CTA @click="$emit('hapusBuku')">Hapus dari wishlist</CTA>
      </div>
    </figcaption>
  </li>
</template>

<style scoped>
.buku {
  border-radius: 0.5rem;
  padding: 1rem;

  display: flex;
  flex-direction: column;
}

.buku:hover {
  background: var(--dark-grey);
}

.buku__info {
  flex: 1;

  display: flex;
  flex-direction: column;
}

.buku__gambar {
  width: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
}

.button-container {
  flex-direction: column;
}
</style>
