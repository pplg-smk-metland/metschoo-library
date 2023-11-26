<script setup>
import CTA from "../CTA.vue"
import { ambilGambarBukuDariISBN, pinjamBukuDariISBN } from "../../lib/utils"
import { onMounted, ref } from "vue"
import { supabase } from "../../supabase"

const props = defineProps({
  buku: Object,
})

const emit = defineEmits(["pinjamBuku", "hapusBuku"])

async function pinjamBuku() {
  emit("pinjamBuku")
  try {
    await pinjamBukuDariISBN(props.buku.no_isbn)
    await supabase.from("wishlist").delete().eq("no_isbn", props.buku.no_isbn)
  } catch (err) {
    console.error(err.message)
  }
}

async function hapusBukuDariWishlist() {
  emit("hapusBuku", props.buku)
  try {
    await supabase.from("wishlist").delete().eq("no_isbn", props.buku.no_isbn)
  } catch (err) {
    console.error(err.message)
  }
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
      <CTA @click="hapusBukuDariWishlist">Hapus buku dari wishlist</CTA>
    </figcaption>
  </li>
</template>

<style>
.buku img {
  object-fit: cover;
}
</style>
