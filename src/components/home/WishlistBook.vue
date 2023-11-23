<script setup>
import CTA from "../CTA.vue"
import { ambilGambarBukuDariISBN } from "../../lib/utils"
import { onMounted, ref } from "vue"

const props = defineProps({
  buku: Object,
})

function pinjamBuku() {
  alert("blom dibikin sabar")
}

const imgURL = ref("")
onMounted(async () => {
  imgURL.value = await ambilGambarBukuDariISBN(props.buku.no_isbn)
})
</script>

<template>
  <li class="buku">
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
      <div class="buku__metadata">
        <h3 class="buku__judul">{{ buku.judul }}</h3>
        <p class="buku__penulis">{{ buku.penulis }}</p>
        <p class="buku__tahun-terbit">{{ buku.tahun_terbit }}</p>
      </div>
      <CTA @click="pinjamBuku">Pinjam buku</CTA>
    </figcaption>
  </li>
</template>
