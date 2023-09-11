<script setup>
import { ref } from "vue"
import SignInForm from "../components/signIn/SignInForm.vue"

const isSigningIn = ref(false)

function handleSwitchForm() {
  isSigningIn.value = !isSigningIn.value
}
</script>

<template>
  <div class="about">
    <h1>
      <span v-if="isSigningIn">Sign in</span>
      <span v-else>Sign up</span>
    </h1>

    <SignInForm :isSigningIn="isSigningIn" />

    <button @click="handleSwitchForm" class="btn submit-button">
      <span v-if="isSigningIn">Belum punya akun? Sign up</span>
      <span v-else>Sudah punya akun? Sign in</span>
    </button>
  </div>
</template>
