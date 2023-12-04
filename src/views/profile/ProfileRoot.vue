<script setup>
import { ref, onMounted, computed } from "vue"
import { useAuthStore } from "@/stores/auth"
import router from "@/router/index.js"
import { supabase } from "@/lib/supabase"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import CTA from "@/components/CTA.vue"
import ProfileBook from "@/components/profile/ProfileBook.vue"

const authStore = useAuthStore()

const dataPengguna = ref({})

function signOut() {
  const reallySigningOut = confirm("Beneran nih mau keluar akun?")
  if (reallySigningOut) {
    authStore.handleSignOut()
    router.push({})
  }
}

onMounted(async () => {
  const data = await authStore.getProfile()
  dataPengguna.value = data
})

// ambil buku yang dipinjam
const bukuYangDipinjam = ref([])
const bukuBlumDikonfirmasi = computed(() => {
  return bukuYangDipinjam.value.filter((buku) => !buku.sudah_dikonfirmasi)
})

const bukuSudahDikonfirmasi = computed(() => {
  return bukuYangDipinjam.value.filter((buku) => buku.sudah_dikonfirmasi)
})

const isLoading = ref(false)

async function ambilBukuYangDipinjam() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("peminjaman")
      .select(`tgl_pinjam, tgl_kembali, sudah_dikembalikan, buku(*)`)
      .eq("user_id", authStore.session.user.id)
      .eq("sudah_dikembalikan", false)

    if (error) throw error
    return data
  } catch (err) {
    console.error(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  bukuYangDipinjam.value = await ambilBukuYangDipinjam()
})

async function kembalikanBuku(buku) {
  const found = bukuYangDipinjam.value.indexOf(buku)
  bukuYangDipinjam.value.splice(found, 1)
}
</script>

<template>
  <header>
    <h1>Profil</h1>
    <p>Selamat Datang di Profil kamu</p>
  </header>

  <section class="profile">
    <figure class="profile__picture-container">
      <img class="profile-picture" src="../assets/profilepicture.svg" alt="Foto kamu disini" />
    </figure>

    <div class="profile__details">
      <h2>{{ dataPengguna.nama }}</h2>
      <p>{{ dataPengguna.kelas }} - {{ dataPengguna.jurusan }}</p>
      <p>{{ dataPengguna.email }}</p>

      <routerLink :to="{ name: 'profile-edit' }" class="nav-link">Edit profil</routerLink>
      <routerLink :to="{ name: 'profile-credentials' }" class="nav-link">
        Edit kredensial
      </routerLink>
    </div>
    <RouterView />
  </section>

  <section>
    <h2>Buku yang dipinjam</h2>
    <LoadingSpinner v-if="isLoading" />
    <p v-else-if="!isLoading && bukuYangDipinjam.length === 0">Ga ada buku yang dipinjam</p>

    <h3>Belum dikonfirmasi</h3>
    <ul class="book-list">
      <li v-if="!bukuBlumDikonfirmasi.length">ga ada bukunya nih</li>
      <ProfileBook v-for="buku in bukuBlumDikonfirmasi" :key="buku.no_isbn" :buku="buku" />
    </ul>

    <h3>Sudah dikonfirmasi</h3>

    <ul class="book-list">
      <li v-if="!bukuSudahDikonfirmasi.length">ga ada bukunya nih</li>
      <ProfileBook
        v-for="buku in bukuSudahDikonfirmasi"
        :key="buku.no_isbn"
        @someEvent="kembalikanBuku(buku)"
      ></ProfileBook>
    </ul>
  </section>

  <div class="button-container">
    <CTA class="button-keluar" @click="signOut">Keluar akun</CTA>
  </div>
</template>

<style scoped>
@media screen and (max-width: 50em) {
  .profile {
    flex-direction: column;
  }
}
.profile {
  display: flex;
  margin-bottom: 200px;
  gap: 2rem;
}

.profile-picture {
  flex-basis: 35ch;
}

.profile-form {
  flex-grow: 1;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem;
}

.nav-link:hover {
  background-color: var(--dark-grey);
}
</style>
