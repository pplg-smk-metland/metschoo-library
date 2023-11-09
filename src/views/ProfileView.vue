<script setup>
import { ref, onMounted } from "vue"
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

const dataPengguna = ref({})

function updateUser() {
  authStore.handleUpdateProfile(dataPengguna)
}

onMounted(async () => {
  const data = await authStore.getProfile()
  dataPengguna.value = data
})
</script>

<template>
  <main>
    <header>
      <h1>Profil</h1>
      <p>Selamat Datang di Profil kamu</p>
    </header>

    <div class="profile">
      <img class="profile-picture" src="../assets/profilepicture.svg" alt="Foto kamu disini" />
      <form class="profile-form" @submit.prevent="updateUser">
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

        <CTA class="button-ubah" type="submit" :isButton="true" :fill="true">Ubah profil</CTA>
      </form>
    </div>

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
