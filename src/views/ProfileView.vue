<script setup>
import { ref, onMounted } from "vue"
import { useAuthStore } from "../stores/auth.js"
import router from "../router/index.js"
import { supabase } from "../supabase"
import CTA from "../components/CTA.vue"
import ProfileBook from "../components/profile/ProfileBook.vue"

const authStore = useAuthStore()

const dataPengguna = ref({})
async function updateUser() {
  try {
    await authStore.handleUpdateProfile(dataPengguna.value)
    alert("sukses memperbarui data pengguna.")
  } catch (err) {
    alert("gagal memperbarui data pengguna.")
    console.error(err.message)
  }
}

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
const isLoading = ref(false)

async function ambilBukuYangDipinjam() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("peminjaman")
      .select(`*`)
      .eq("user_id", authStore.session.user.id)

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
</script>

<template>
  <header>
    <h1>Profil</h1>
    <p>Selamat Datang di Profil kamu</p>
  </header>

  <main>
    <div class="profile">
      <img class="profile-picture" src="../assets/profilepicture.svg" alt="Foto kamu disini" />
      <form class="profile-form" @submit.prevent="updateUser">
        <label for="name">Nama</label>
        <input type="text" placeholder="Masukan Nama" v-model="dataPengguna.nama" />

        <label for="kelas">Kelas</label>
        <select name="kelas" id="kelas" v-model="dataPengguna.kelas">
          <option value="X">X</option>
          <option value="XI">XI</option>
          <option value="XII">XII</option>
        </select>

        <label for="jurusan">Jurusan</label>
        <input type="text" placeholder="Masukkan Jurusan" v-model="dataPengguna.jurusan" />

        <CTA class="button-ubah" type="submit" :isButton="true" :fill="true">Ubah profil</CTA>
      </form>
    </div>

    <section>
      <ul class="book-list">
        <li v-if="isLoading">Bukunya lagi diambil, tunggu sebentar ya</li>
        <li v-else-if="!isLoading && bukuYangDipinjam.length === 0">Ga ada buku yang dipinjam</li>
        <ProfileBook v-for="buku in bukuYangDipinjam" :key="buku.no_isbn" :buku="buku" />
      </ul>
    </section>

    <div>
      <CTA class="button-keluar" :isButton="true" @click="signOut">Keluar akun</CTA>
    </div>
  </main>
</template>
<style>
@media screen and (max-width: 50em) {
  .profile {
    flex-direction: column;
  }
}
.profile {
  display: flex;
  margin-bottom: 200px;
  gap: 20px;
}

.profile-form {
  flex-basis: 1000px;
}

.profile-picture {
  height: 360px;
  margin: 20px;
}

.button-ubah {
  justify-self: flex-end;
  margin-left: auto;
}

.button-keluar {
  margin: 20px;
}
</style>
