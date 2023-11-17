<script setup>
import { onMounted, ref } from "vue"
import { supabase } from "../supabase"
import { useAuthStore } from "../stores/auth"
import router from "../router"
import CTA from "./CTA.vue"
import TheDialog from "./TheDialog.vue"

const props = defineProps({
  buku: Object,
})

const cdnURL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Buku`
const imgURL = ref("")

async function getBookImage() {
  const { data, error } = await supabase.storage
    .from("Buku")
    .list(`${props.buku.no_isbn}/`, { limit: 1, offset: 0, search: props.buku.no_isbn })
  if (error) throw error

  return data[0]?.name
}

onMounted(async () => {
  try {
    imgURL.value = await getBookImage()
  } catch (error) {
    console.error(error)
  }
})

const dialogIsOpen = ref(false)
const dialogMessage = ref("")

function openDialog(message) {
  dialogIsOpen.value = true
  dialogMessage.value = message
}

async function pinjamBuku(buku) {
  if (!authStore.session) {
    openDialog("kalau mau pinjam buku, buat akun dulu ya")
    router.push({ name: "sign-in" })
    return
  }

  // TODO: buat logika peminjaman buku
  if (confirm(`Beneran mau pinjem buku ${buku.judul}?`)) {
    const updates = {
      no_isbn: buku.no_isbn,
    }

    try {
      await supabase.from("peminjaman").insert(updates)
      openDialog(`sukses memnijam buku ${buku.judul}`)
    } catch (err) {
      openDialog(err.message)
    }
  }

  statusPeminjaman()
}

const authStore = useAuthStore()

async function statusPeminjaman() {
  const { data, error } = await supabase
    .from("peminjaman")
    .select()
    .eq("user_id", authStore.session.user.id)
  if (error) throw error
  return data
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
        width="400"
        height="600"
      />
    </figure>
    <figcaption class="buku__info">
      <div class="metadata">
        <h2 class="buku__judul">{{ buku.judul }}</h2>
        <p class="buku__penulis">{{ buku.penulis }}</p>
        <p class="buku__tahun-terbit">{{ buku.tahun_terbit }}</p>
      </div>
      <CTA :isButton="true" @click="pinjamBuku(buku)">Pinjam buku</CTA>
    </figcaption>

    <TheDialog :is-open="dialogIsOpen" @dialog-close="dialogIsOpen = false">
      <h2>Info!!</h2>
      <p>{{ dialogMessage }}</p>
    </TheDialog>
  </li>
</template>

<style>
.buku {
  outline: 2px solid #444;
  transition: background-color 200ms ease;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.buku__gambar {
  width: 100%;
  object-fit: cover;
  background-repeat: no-repeat;
}

.buku__info {
  padding: 2rem;
}

.buku .metadata {
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
