<script setup>
import { ref } from "vue"
import SignInForm from "../components/signIn/SignInForm.vue"

const isLoggingIn = ref(false)

function handleSwitchForm() {
  isLoggingIn.value = !isLoggingIn.value
}
</script>

<template>
  <div class="about">
    <h1>
      <span v-if="isLoggingIn">Login</span>
      <span v-else>Sign up</span>
    </h1>

    <SignInForm :isLoggingIn="isLoggingIn" />

    <button @click="handleSwitchForm" class="btn submit-button">
      <span v-if="isLoggingIn">Belum punya akun? Sign up</span>
      <span v-else>Have an account already? Log in</span>
    </button>
  </div>
</template>
