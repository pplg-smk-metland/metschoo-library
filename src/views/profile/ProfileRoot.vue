<script setup>
import { ref, onMounted, computed } from "vue"
import { useAuthStore } from "@/stores/auth"
import { supabase } from "@/lib/supabase"
import { kembalikanBukuDariISBN } from "@/lib/utils"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import ProfileBook from "@/components/profile/ProfileBook.vue"

const authStore = useAuthStore()

const dataPengguna = ref({})

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
  if (!confirm(`beneran mau kembalikan buku ${buku.judul}?`)) return

  try {
    await kembalikanBukuDariISBN(buku.no_isbn)

    // hapus buku dari tampilan
    const found = bukuYangDipinjam.value.indexOf(buku)
    bukuYangDipinjam.value.splice(found, 1)
  } catch (err) {
    console.error(err.message)
  }
}
</script>

<template>
  <header>
    <h1>Profil</h1>
    <p>Selamat Datang di Profil kamu</p>
  </header>

  <section class="profile">
    <figure class="profile__picture-container">
      <img
        class="profile-picture"
        src="../../assets/profilepicture.svg"
        width="300"
        height="300"
        alt="Foto kamu disini"
      />
    </figure>

    <div class="profile__details">
      <h2>{{ dataPengguna.nama }}</h2>
      <p>{{ dataPengguna.kelas }} - {{ dataPengguna.jurusan }}</p>
      <p>{{ dataPengguna.email }}</p>

      <routerLink :to="{ name: 'profile-edit' }" class="nav-link">Edit profil</routerLink>
      <routerLink :to="{ name: 'profile-security' }" class="nav-link"> Keamanan </routerLink>
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
      <ProfileBook
        v-for="buku in bukuBlumDikonfirmasi"
        :key="buku.no_isbn"
        :buku="buku"
        @kembalikan-buku="kembalikanBuku(buku.buku)"
      />
    </ul>

    <h3>Sudah dikonfirmasi</h3>

    <ul class="book-list">
      <li v-if="!bukuSudahDikonfirmasi.length">ga ada bukunya nih</li>
      <ProfileBook
        v-for="buku in bukuSudahDikonfirmasi"
        :key="buku.no_isbn"
        @kembalikan-buku="kembalikanBuku(buku.buku)"
      />
    </ul>
  </section>
</template>

<style scoped>
@media screen and (max-width: 50em) {
  .profile {
    flex-direction: column;
  }
}

.profile {
  display: flex;
  gap: 2rem;
}

.profile-picture {
  flex-basis: 35ch;
}

.profile-form {
  flex-grow: 1;
}

.nav-link {
  padding: 0.5rem;
}

.nav-link:hover {
  background-color: var(--dark-grey);
}
</style>
