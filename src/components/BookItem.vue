<script setup>
import { onMounted, ref } from "vue"
import { supabase } from "../supabase"
import { useAuthStore } from "../stores/auth"
import router from "../router"
import CTA from "./CTA.vue"
import TheDialog from "./TheDialog.vue"

import { ambilBukuDariISBN } from "../lib/utils.js"

const props = defineProps({
  buku: Object,
})

const imgURL = ref("")
onMounted(async () => {
  try {
    imgURL.value = await ambilBukuDariISBN(props.buku.no_isbn)
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
      openDialog(`sukses meminjam buku ${buku.judul}`)
    } catch (err) {
      openDialog(err.message)
    }
  }

  statusPeminjaman()
}

async function statusPeminjaman() {
  const authStore = useAuthStore()
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
      <CTA @click="pinjamBuku(buku)">Pinjam buku</CTA>

      <TheDialog :is-open="dialogIsOpen" @dialog-close="dialogIsOpen = false">
        <h2>Info!!</h2>
        <p>{{ dialogMessage }}</p>
      </TheDialog>
    </routerLink>
  </li>
</template>

<style scoped>
.buku {
  border-radius: 0.5rem;
  outline: 2px solid #ddd;

  display: flex;
  flex-direction: column;
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

.buku__tahun-terbit {
  font-size: 0.75rem;
}

.buku .btn {
  align-self: start;
  margin: 0 1rem 1rem 1rem;
}
</style>
