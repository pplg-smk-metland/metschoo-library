<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../../supabase"
import CTA from "../CTA.vue"

const props = defineProps({
  buku: Object,
})

const cdnURL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Buku`
const imgURL = ref("")

async function getImages() {
  const { data, error } = await supabase.storage
    .from("Buku")
    .list(props.buku.no_isbn + "/", { limit: 1, offset: 0, search: props.buku.no_isbn })
  if (error) throw error

  return data[0]?.name
}

onMounted(async () => {
  try {
    imgURL.value = await getImages()
  } catch (error) {
    console.error(error)
  }
})

async function kembalikanBuku(buku) {
  try {
    const { error } = await supabase.from("pengembalian").delete().eq("no_isbn", buku.no_isbn)
    if (error) throw error
  } catch (err) {
    console.error(err.message)
  }
}
</script>

<template>
  <li class="buku">
    <figure>
      <img
        :src="`${cdnURL}/${buku.no_isbn}/${imgURL}`"
        class="buku__gambar"
        alt="gambar buku"
        loading="lazy"
        width="200"
        height="300"
      />
    </figure>
    <div class="buku__info">
      <h2 class="buku__judul">{{ buku.judul }}</h2>
      <p>{{ buku.no_isbn }}</p>
      <div class="metadata">
        <p class="buku__penulis">{{ buku.penulis }}</p>
        <p class="buku__tahun-terbit">{{ buku.tahun_terbit }}</p>
      </div>
      <CTA :isButton="true" @click="kembalikanBuku(buku)">Kembalikan buku</CTA>
    </div>
  </li>
</template>
