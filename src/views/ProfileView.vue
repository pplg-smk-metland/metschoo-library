<script setup>
import { ref, onMounted, computed } from "vue"
import { useAuthStore } from "@/stores/auth"
import router from "@/router/index.js"
import { supabase } from "@/lib/supabase"
import { useDialog } from "@/lib/composables"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import BaseLayout from "@/layouts/BaseLayout.vue"
import CTA from "@/components/CTA.vue"
import TheDialog from "@/components/TheDialog.vue"
import ProfileBook from "@/components/profile/ProfileBook.vue"

const authStore = useAuthStore()

const displayFormKeys = ["basic-info", "credentials"]
const displayForm = ref(displayFormKeys[0])

function changeDisplayForm() {
  displayForm.value === displayFormKeys[0]
    ? (displayForm.value = displayFormKeys[1])
    : (displayForm.value = displayFormKeys[0])
}

const dialog = useDialog()
const dataPengguna = ref({})

async function updateUserInfo() {
  try {
    await authStore.handleUpdateProfile(dataPengguna.value)
    dialog.open("sukses memperbarui data pengguna.")
  } catch (err) {
    dialog.open(err.message)
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
  <BaseLayout>
    <header>
      <h1>Profil</h1>
      <p>Selamat Datang di Profil kamu</p>
    </header>

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
          <CTA class="button-ubah" :fill="true">Ubah profil</CTA>
          <CTA @click="changeDisplayForm">Ubah informasi lainnnya</CTA>
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
          <CTA :fill="true">Ubah profil</CTA>
          <CTA @click="changeDisplayForm">Kembali</CTA>
        </div>
      </form>
    </div>

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

    <div>
      <CTA class="button-keluar" @click="signOut">Keluar akun</CTA>
    </div>

    <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close">
      <h2>Info</h2>
      <p>{{ dialog.message }}</p>
    </TheDialog>
  </BaseLayout>
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
</style>
