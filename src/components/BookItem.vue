<script setup>
import { onMounted, ref } from "vue"
import { ambilGambarBukuDariISBN } from "@/lib/utils.js"

const props = defineProps({
  buku: Object,
})

const imgURL = ref("")
onMounted(async () => {
  try {
    imgURL.value = await ambilGambarBukuDariISBN(props.buku.no_isbn)
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <li class="buku">
    <routerLink :to="`/buku/${buku.no_isbn}`">
      <figure>
        <img
          :src="imgURL"
          class="buku__gambar"
          alt="gambar buku"
          loading="lazy"
          width="200"
          height="300"
        />
      </figure>
      <figcaption class="buku__info">
        <div class="metadata">
          <h3 class="buku__judul">{{ buku.judul }}</h3>
          <p class="buku__penulis">{{ buku.penulis }}</p>
          <p class="buku__tahun-terbit">{{ buku.tahun_terbit }}</p>
        </div>
      </figcaption>
    </routerLink>
  </li>
</template>

<style scoped>
.buku {
  border-radius: 0.5rem;
  outline: 2px solid #ddd;
}

.buku__gambar {
  width: 100%;
  object-fit: cover;
  background-repeat: no-repeat;
}

.buku__info {
  padding: 1rem;
  flex-grow: 1;
}

.buku__judul {
  font-weight: normal;
  margin: 0;
  line-height: 1;
}

.buku__penulis {
  margin-block: 1rem 0;
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
