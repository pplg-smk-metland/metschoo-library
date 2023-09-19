<script setup>
import { onMounted, reactive } from "vue"
import { useAuthStore } from "../stores/auth.js"
import router from "../router/index.js"
import CTA from "../components/CTA.vue"

const authStore = useAuthStore()

function signOut() {
  const reallySigningOut = confirm("Beneran nih mau keluar akun?")
  if (reallySigningOut) {
    authStore.handleSignOut()
    router.push()
  }
}

const dataPengguna = reactive({
  nama: "",
  kelas: "",
  jurusan: "",
})

function updateUser() {
  authStore.handleUpdateProfile(dataPengguna)
}

onMounted(async () => {
  const { nama, kelas, jurusan } = await authStore.getProfile()
  dataPengguna.nama = nama
  dataPengguna.kelas = kelas
  dataPengguna.jurusan = jurusan
})
</script>

<template>
  <header>
    <h1>Profil</h1>
    <p>Selamat Datang di Profil kamu</p>
  </header>

  <div class="profile">
    <form @submit.prevent="updateUser">
      <label for="name">Name</label>
      <input type="text" placeholder="Masukan Nama" v-model="dataPengguna.nama" />

      <label for="kelas">Kelas</label>
      <select name="kelas" id="kelas" v-model="dataPengguna.kelas">
        <option value="X">X</option>
        <option value="XI">XI</option>
        <option value="XII">XII</option>
      </select>

      <label for="jurusan">Jurusan</label>
      <input type="text" placeholder="Masukkan Jurusan" v-model="dataPengguna.jurusan" />

      <CTA type="submit" :isButton="true" :fill="true">Ubah profil</CTA>
    </form>
  </div>

  <div>
    <CTA :isButton="true" @click="signOut">Keluar akun</CTA>
  </div>
</template>
