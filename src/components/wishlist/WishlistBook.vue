<script setup>
import { ambilGambarBukuDariISBN, pinjamBukuDariISBN } from "@/lib/utils"
import { onMounted, ref } from "vue"
import { supabase } from "@/lib/supabase"
import CTA from "@/components/CTA.vue"

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
        <CTA @click="pinjamBuku">Pinjam buku</CTA>
        <CTA @click="hapusBukuDariWishlist">Hapus dari wishlist</CTA>
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
  margin-block-start: auto;
}

.button-container .btn {
  margin: 0;
  text-align: center;
  display: block;
  width: 100%;
}

.button-container .btn + .btn {
  margin-block-start: 0.5rem;
}
</style>
