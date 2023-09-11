<script setup>
import { ref } from "vue"
import { useAuthStore } from "../../stores/auth.js"

import router from "../../router/index.js"

const props = defineProps({
  isSigningIn: Boolean,
})

const authStore = useAuthStore()

const email = ref("")
const password = ref("")

async function handleSignIn() {
  await authStore.handleSignIn(email.value, password.value)
  router.push({ name: "home" })
}

async function handleSignUp() {
  await authStore.handleSignUp(email.value, password.value)
  router.push({ name: "home" })
}
</script>

<template>
  <div class="signin">
    <div class="form-container log-in" v-if="isSigningIn">
      <form @submit.prevent="handleSignIn">
        <label for="login-email">Email</label>
        <input required type="email" id="login-email" placeholder="Email" v-model="email" />

        <label for="login-password">Password</label>
        <input
          required
          type="password"
          id="login-password"
          placeholder="Your password here"
          v-model="password"
        />
        <button type="submit" class="btn submit-button">Sign in</button>
      </form>
    </div>

    <div class="form-container sign-up" v-else>
      <form @submit.prevent="handleSignUp">
        <label for="signup-email">Email</label>
        <input required type="email" id="signup-email" placeholder="Email" v-model="email" />
        <label for="signup-password">Password</label>
        <input
          required
          type="password"
          id="signup-password"
          placeholder="Your password here"
          v-model="password"
        />

        <button type="submit" class="btn submit-button">Sign up</button>
      </form>
    </div>
  </div>
</template>

<style>
.signin-form {
  flex-basis: 50ch;
}

.submit-button {
  width: 100%;
  margin-block: 1rem;
}
</style>
