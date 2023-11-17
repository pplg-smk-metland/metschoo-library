<script setup>
import BaseLayout from "../layouts/BaseLayout.vue"
import { useAuthStore } from "../stores/auth.js"

const authStore = useAuthStore()
</script>

<template>
  <BaseLayout>
    <h1>Wishlist</h1>
    <p v-if="authStore.session">
      Kamu sudah login tapi kami belom selesai buat aplikasinya sabar yah
    </p>
    <p v-else>Kamu harus login dlu</p>
  </BaseLayout>
</template>
