<script setup>
import { onMounted, ref } from "vue"
import { supabase } from "../supabase"
import CTA from "./CTA.vue"

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
</script>

<template>
  <li class="buku">
    <figure>
      <img :src="`${cdnURL}/${buku.no_isbn}/${imgURL}`" class="buku__gambar" alt="gambar buku" />
    </figure>
    <div class="buku__info">
      <h2 class="buku__judul">{{ buku.judul }}</h2>
      <p>{{ buku.no_isbn }}</p>
      <div class="metadata">
        <p class="buku__penulis">{{ buku.penulis }}</p>
        <p class="buku__tahun-terbit">{{ buku.tahun_terbit }}</p>
      </div>
      <CTA :isButton="true">Pinjam buku</CTA>
    </div>
  </li>
</template>

<style>
.buku {
  outline: 2px solid #444;
  padding: 2rem;
  transition: background-color 200ms ease;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.buku__gambar {
  width: 100%;
  object-fit: cover;
}

.buku__judul .metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata > * {
  margin: 0;
}

.buku__penulis {
  font-size: 1.2rem;
  font-weight: bold;
}

.buku__tahun-terbit {
  font-size: 0.85rem;
}
</style>
