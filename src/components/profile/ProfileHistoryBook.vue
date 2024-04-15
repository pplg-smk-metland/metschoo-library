<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ambilGambarBukuDariISBN } from "@/lib/utils"

import CTA from "../../components/CTA.vue"

const props = defineProps({
  buku: Object,
})

const dataBuku = props.buku.buku
const imgUrl = ref("")

onMounted(async () => {
  imgUrl.value = await ambilGambarBukuDariISBN(props.buku.no_isbn)
})
</script>

<template>
  <article class="buku">
    <div class="buku__gambar">
      <img :src="imgUrl" :alt="`Cover ${dataBuku.judul}`" width="100" />
    </div>
    <div class="buku__teks">
      <h3>{{ dataBuku.judul }}</h3>
      <CTA is-link fill :to="`/buku/${dataBuku.no_isbn}`" class="btn cta">pinjam lagi</CTA>
    </div>
  </article>
</template>

<style scoped>
.buku {
  overflow: hidden;
  display: flex;
}

.buku__gambar {
  min-width: max-content;
}

.buku__gambar img {
  border-radius: 0.5rem;
  height: 100%;
  object-fit: cover;
}

.buku__teks {
  padding: 1rem;
  flex-grow: 1;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.buku__teks h3 {
  margin-block: 0 0.5rem;
}
</style>
