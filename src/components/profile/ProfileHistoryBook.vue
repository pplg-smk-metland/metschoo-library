<script setup>
import { ref, onMounted } from "vue"
import { ambilGambarBukuDariISBN } from "@/lib/utils"

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
  <RouterLink :to="`buku/${buku.no_isbn}`">
    <article class="buku">
      <div class="buku__gambar">
        <img :src="imgUrl" alt="" width="100" />
      </div>
      <div class="buku__teks">
        <h3>{{ dataBuku.judul }}</h3>
      </div>
    </article>
  </RouterLink>
</template>

<style scoped>
.buku {
  display: flex;
}

.buku:hover {
  background: var(--dark-grey);
}

.buku__gambar {
  min-width: max-content;
}

.buku__gambar img {
  height: 100%;
  object-fit: cover;
}

.buku__teks {
  padding: 1rem;
}
</style>
