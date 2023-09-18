<script setup>
import { ref, onMounted } from "vue"
import { useAuthStore } from "../stores/auth.js"
import router from "../router/index.js"

const authStore = useAuthStore()

function signOut() {
  const reallySigningOut = confirm("Beneran nih mau keluar akun?")
  if (reallySigningOut) {
    authStore.handleSignOut()
    router.push()
  }
}

const name = ref("")
const kelas = ref("")
const jurusan = ref("")

function updateUser() {
  const updates = {
    nama: name.value,
    kelas: kelas.value,
    jurusan: jurusan.value,
  }
  authStore.handleUpdateProfile(updates)
}

onMounted(async () => {
  const data = await authStore.getProfile()
  name.value = data.nama
  kelas.value = data.kelas
  jurusan.value = data.jurusan
})
</script>

<template>
  <main>
    <header>
      <h1>Profil</h1>
      <p>Selamat datang di profil kamu</p>
    </header>

    <div class="profile">
      <form @submit.prevent="updateUser">
        <label for="name">Name</label>
        <input type="text" placeholder="nama lu" v-model="name" />

        <label for="kelas">Kelas</label>

        <select name="kelas" id="kelas" v-model="kelas">
          <option value="X">X</option>
          <option value="XI">XI</option>
          <option value="XII">XII</option>
        </select>

        <label for="jurusan">Jurusan</label>
        <input type="text" placeholder="JURUSAN LOO APA" v-model="jurusan" />

        <button type="submit">Ubah profile</button>
      </form>
    </div>

    <div>
      <button @click="signOut">Keluar akun</button>
    </div>
  </main>
</template>
