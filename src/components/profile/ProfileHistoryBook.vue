<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ambilGambarBukuDariISBN } from "@/lib/utils"
import type { Riwayat } from "@/views/profile/ProfileRoot.vue"

interface Props {
  buku: Riwayat[0]["buku"]
}

const props = defineProps<Props>()
const buku = props.buku
const imgUrl = ref("")

onMounted(async () => {
  imgUrl.value = await ambilGambarBukuDariISBN(buku!.no_isbn)
})
</script>

<template>
  <RouterLink v-if="buku" :to="`/buku/${buku.no_isbn}`" class="buku">
    <div class="buku__gambar">
      <img :src="imgUrl" :alt="`Cover ${buku.judul}`" width="100" />
    </div>
    <div class="buku__teks">
      <h3>{{ buku.judul }}</h3>
      <p>{{ buku.penulis }}</p>
    </div>
  </RouterLink>
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
