<script setup>
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
</script>

<template>
  <main>
    <header>
      <h1>Profil</h1>
      <p>Selamat datang di profil kamu</p>
    </header>

    <div class="profile">
      <form>
        <label for="name">Name</label>
        <input type="text" />

        <label for="email">Email</label>
        <input type="email" />

        <button>Ubah profile</button>
      </form>
    </div>

    <div>
      <button @click="signOut">Keluar akun</button>
    </div>
  </main>
</template>
