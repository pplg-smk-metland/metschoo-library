<script setup>
import { onMounted, ref } from "vue"
import { useDialog } from "@/lib/composables"
import { useAuthStore } from "@/stores/auth"
import router from "@/router"

import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"

const { dialog } = useDialog()
const kredensialPengguna = ref({
  password: "",
  passwordKonfirmasi: "",
  email: "",
})

function ubahKredensial() {
  dialog.value.open("memperbarui kredensial...")
}

function ubahEmail() {
  dialog.value.open("memperbarui email...")
}

function signOut() {
  const authStore = useAuthStore()
  const reallySigningOut = confirm("Beneran nih mau keluar akun?")
  if (reallySigningOut) {
    authStore.handleSignOut()
    router.push({})
  }
}

onMounted(async () => {
  const authStore = useAuthStore()
  const data = await authStore.getProfile()
  kredensialPengguna.value.email = data.email
})
</script>

<template>
  <section class="nav">
    <h1>Keamanan</h1>
    <routerLink :to="{ name: 'profile' }">Kembali</routerLink>
  </section>

  <section class="main-section">
    <h2>Ubah Kredensial</h2>

    <form class="profile-form" @submit.prevent="ubahKredensial">
      <label for="password">Password</label>
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Password rahasia anda"
        required
        v-model="kredensialPengguna.password"
      />

      <label for="confirm-password">konfirmasi password</label>
      <input
        type="password"
        name="confirm-password"
        id="confirm-password"
        placeholder="Password rahasia anda"
        required
        v-model="kredensialPengguna.passwordKonfirmasi"
      />
      <div class="button-container">
        <CTA>Ubah kredensial</CTA>
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2>Ubah email</h2>

    <form @submit.prevent="ubahEmail">
      <label for="email">Email</label>
      <input
        type="email"
        name="email"
        id="email"
        placeholder="emailanda@apa.com"
        required
        v-model="kredensialPengguna.email"
      />

      <div class="button-container">
        <CTA>Ubah email</CTA>
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2>Keluar dari akun</h2>
    <p>Klik disini untuk keluar dari akun anda</p>

    <div class="button-container">
      <CTA @click="signOut">Keluar dari akun</CTA>
    </div>
  </section>

  <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
    <h2>Info!!!</h2>
    <p>{{ dialog.message }}</p>
  </TheDialog>
</template>
