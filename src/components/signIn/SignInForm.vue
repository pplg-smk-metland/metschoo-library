<script setup>
import { ref } from "vue"
import CTA from "../CTA.vue"
import { useAuthStore } from "../../stores/auth.js"

const authStore = useAuthStore()

const isSigningIn = ref(false)

function handleSwitchForm() {
  isSigningIn.value = !isSigningIn.value
}

const email = ref("")
const password = ref("")
const confirmPassword = ref("")

async function handleSignIn() {
  await authStore.handleSignIn(email.value, password.value)
}

async function handleSignUp() {
  if (confirmPassword.value === password.value) {
    await authStore.handleSignUp(email.value, password.value)
  } else alert("passwordnya gak sama..")
}
</script>

<template>
  <div class="signin">
    <h1>
      <div v-if="isSigningIn">
        <span>Masuk</span>
        <p>Masuk ke akun Metschoo Library yang sudah anda miliki!</p>
      </div>
      <div v-else>
        <span>Daftar</span>
        <p>Buat akun Metschoo Library yang baru!</p>
      </div>
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
          placeholder="Password Anda"
          v-model="password"
        />
        <CTA type="submit" :is-button="true" :fill="true">Masuk</CTA>
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
          placeholder="Password Anda"
          v-model="password"
        />
        <label for="confirm-password">Konfirmasi Password</label>
        <input
          type="password"
          placeholder="Ketik Ulang Password"
          required
          v-model="confirmPassword"
        />

        <CTA type="submit" :is-button="true" :fill="true">Daftar</CTA>
      </form>
    </div>
    <CTA @click="handleSwitchForm" :is-button="true">
      <span v-if="isSigningIn">Belum punya akun? Daftar</span>
      <span v-else>Sudah punya akun? Masuk</span>
    </CTA>
  </div>
</template>

<style>
.signin {
  background-color: #a4c5c5;
  flex-basis: 60ch;
  max-width: 60ch;
  padding: 2rem;
  border-radius: 42px;
  box-shadow: -10px 10px 10px 5px rgba(0, 0, 0, 0.4);

  display: flex;
  flex-direction: column;
}

.form-container {
  flex-grow: 1;
}

.signin h1 {
  text-align: center;
}

.signin p {
  font-weight: 300;
  font-size: large;
}

.signin .btn {
  width: 100%;
  text-align: center;
  margin-block-start: 2rem;
}
</style>
