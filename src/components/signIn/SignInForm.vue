<script setup lang="ts">
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { supabase } from "@/lib/supabase"
import { useDialog } from "@/lib/composables"

import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"
import { useRouter } from "vue-router"
import { AuthError } from "@supabase/supabase-js"

const authStore = useAuthStore()
const router = useRouter()

const isSigningIn = ref(false)

function handleSwitchForm() {
  isSigningIn.value = !isSigningIn.value
}

const data = ref({
  email: "",
  password: "",
  confirmPassword: "",
})

const { dialog } = useDialog()

async function handleSignIn() {
  try {
    await authStore.handleSignIn(data.value.email, data.value.password)
    router.push({ name: "home" })
  } catch (err) {
    if (err instanceof AuthError) dialog.value.open(err.message)
    else console.error((err as Error).message)
  }
}

async function handleSignUp() {
  const { email, password, confirmPassword } = data.value

  if (confirmPassword !== password) {
    alert("passwordnya ga sama")
    return
  }

  try {
    await authStore.handleSignUp(email, password)
    alert("Cek email lu ya buat verifikasi email!")
  } catch (err) {
    if (err instanceof AuthError) dialog.value.open(err.message)
  }
}
</script>

<template>
  <div class="signin">
    <h1 v-if="isSigningIn">
      <span>Masuk</span>
      <p>Masuk ke akun Metschoo Library yang sudah anda miliki!</p>
    </h1>
    <h1 v-else>
      <span>Daftar</span>
      <p>Buat akun Metschoo Library yang baru!</p>
    </h1>

    <div class="form-container log-in" v-if="isSigningIn">
      <form @submit.prevent="handleSignIn">
        <label for="login-email">Email</label>
        <input required type="email" id="login-email" placeholder="Email" v-model="data.email" />

        <label for="login-password">Password</label>
        <input
          required
          type="password"
          id="login-password"
          placeholder="Password Anda"
          v-model="data.password"
        />
        <CTA type="submit" :fill="true">Masuk</CTA>
      </form>
    </div>

    <div class="form-container sign-up" v-else>
      <form @submit.prevent="handleSignUp">
        <label for="nama">Nama</label>
        <input type="text" name="nama" id="nama" placeholder="Siapa namamu?" required />
        <label for="signup-email">Email</label>
        <input required type="email" id="signup-email" placeholder="Email" v-model="data.email" />
        <label for="signup-password">Password</label>
        <input
          required
          type="password"
          id="signup-password"
          placeholder="Password Anda"
          v-model="data.password"
        />
        <label for="confirm-password">Konfirmasi Password</label>
        <input
          type="password"
          placeholder="Ketik Ulang Password"
          required
          v-model="data.confirmPassword"
        />

        <CTA type="submit" :fill="true">Daftar</CTA>
      </form>
    </div>

    <CTA @click="handleSwitchForm">
      <span v-if="isSigningIn">Belum punya akun? Daftar</span>
      <span v-else>Sudah punya akun? Masuk</span>
    </CTA>
  </div>

  <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
    <h2>Error!</h2>
    {{ dialog.message }}
  </TheDialog>
</template>

<style>
.signin {
  /* background-color: #a4c5c5; */
  flex-basis: 60ch;
  max-width: 60ch;
  padding: 2rem;
  outline: 2px solid #ddd;
  border-radius: 0.5rem;

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
