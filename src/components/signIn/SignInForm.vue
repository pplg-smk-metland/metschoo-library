<script setup>
import { ref } from "vue"
import { useAuthStore } from "../../stores/auth.js"

const authStore = useAuthStore()

const isSigningIn = ref(false)

function handleSwitchForm() {
  isSigningIn.value = !isSigningIn.value
}

const email = ref("")
const password = ref("")

async function handleSignIn() {
  await authStore.handleSignIn(email.value, password.value)
}

async function handleSignUp() {
  await authStore.handleSignUp(email.value, password.value)
}
</script>

<template>
  <div class="signin">
    <h1>
      <span v-if="isSigningIn">Masuk ke akun</span>
      <span v-else>Daftar akun baru</span>
    </h1>
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
        <button type="submit" class="btn submit-button confirm-button">Masuk</button>
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

        <button type="submit" class="btn submit-button confirm-button">Daftar</button>
      </form>
    </div>
    <button @click="handleSwitchForm" class="btn submit-button switch-button">
      <span v-if="isSigningIn">Belum punya akun? Daftar</span>
      <span v-else>Sudah punya akun? Masuk</span>
    </button>
  </div>
</template>

<style>
.signin-form {
  flex-basis: 50ch;
}

.signin {
  flex-basis: 500px;
  background-color: #a4c5c5;
  max-width: 50%;
  padding: 50px;
  margin: 50px;
  border-radius: 42px;
  box-shadow: -10px 10px 10px 5px rgba(0, 0, 0, 0.4);
}

input {
  border-style: none;
  background-color: #d9d9d9;
  border-radius: 12px;
}

.signin > h1 {
  text-align: center;
}

.submit-button {
  text-align: center;
  width: 100%;
  margin-block: 1rem;
}

.confirm-button {
  background-color: #ababab;
  border-radius: 12px;
  margin-block: 25px;
}

.switch-button {
  border: 1px solid black;
  border-radius: 12px;
}
</style>
