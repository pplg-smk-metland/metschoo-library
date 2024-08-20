<script setup lang="ts">
import TheNavbar from "@/components/TheNavbar.vue"
import SignInForm from "@/components/signIn/SignInForm.vue"
</script>

<template>
  <TheNavbar />
  <main>
    <SignInForm />
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
}
</style>
