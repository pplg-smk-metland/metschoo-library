<script setup>
import { ref, onMounted } from "vue"
import { useAuthStore } from "../stores/auth.js"
import router from "../router/index.js"
import { supabase } from "../supabase"
import CTA from "../components/CTA.vue"
import TheDialog from "../components/TheDialog.vue"
import ProfileBook from "../components/profile/ProfileBook.vue"

const authStore = useAuthStore()

const displayFormKeys = ["basic-info", "credentials"]
const displayForm = ref(displayFormKeys[0])

function changeDisplayForm() {
  displayForm.value === displayFormKeys[0]
    ? (displayForm.value = displayFormKeys[1])
    : (displayForm.value = displayFormKeys[0])
}

const dialogIsOpen = ref(false)
const dialogMessage = ref("")

const dataPengguna = ref({})

async function updateUserInfo() {
  try {
    await authStore.handleUpdateProfile(dataPengguna.value)
    dialogIsOpen.value = true
    dialogMessage.value = "sukses memperbarui data pengguna."
  } catch (err) {
    dialogIsOpen.value = true
    dialogMessage.value = err.message
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

// credentials

const userCredentials = ref({
  password: "",
  confirmPassword: "",
  email: "",
})

function updateUserCredentials() {
  alert("memperbarui...")
}

// ambil buku yang dipinjam
const bukuYangDipinjam = ref([])
const isLoading = ref(false)

async function ambilBukuYangDipinjam() {
  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from("peminjaman")
      .select(`tgl_pinjam, tgl_kembali, buku(*)`)
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
      <form
        class="profile-form"
        @submit.prevent="updateUserInfo"
        v-if="displayForm === 'basic-info'"
      >
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

        <div class="button-container">
          <CTA class="button-ubah" :isButton="true" :fill="true">Ubah profil</CTA>
          <CTA :isButton="true" @click="changeDisplayForm">Ubah informasi lainnnya</CTA>
        </div>
      </form>

      <form
        class="profile-form"
        @submit.prevent="updateUserCredentials"
        v-if="displayForm === 'credentials'"
      >
        <label for="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          required
          v-model="userCredentials.password"
        />

        <label for="confirm-password">konfirmasi password</label>
        <input
          type="password"
          name="confirm-password"
          id="confirm-password"
          required
          v-model="userCredentials.confirmPassword"
        />

        <label for="email">Email</label>
        <input type="email" name="email" id="email" required v-model="userCredentials.email" />

        <div class="button-container">
          <CTA :isButton="true" :fill="true">Ubah profil</CTA>
          <CTA :isButton="true" @click="changeDisplayForm">Kembali</CTA>
        </div>
      </form>
    </div>

    <TheDialog :is-open="dialogIsOpen" @dialog-close="dialogIsOpen = false">
      <h2>Info</h2>
      <p>{{ dialogMessage }}</p>
    </TheDialog>

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

.button-keluar {
  margin: 20px;
}
</style>
