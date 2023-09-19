<script setup>
import { useAuthStore } from "../stores/auth.js"

const authStore = useAuthStore()
</script>

<template>
  <main>
    <h1>Wishlist</h1>
    <p v-if="authStore.session">
      Kamu sudah login tapi kami belom selesai buat aplikasinya sabar yah
    </p>
    <p v-else>Kamu harus login dlu</p>
  </main>
</template>
