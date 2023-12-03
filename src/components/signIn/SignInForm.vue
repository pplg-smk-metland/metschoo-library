<script setup>
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { supabase } from "@/lib/supabase"
import { useDialog } from "@/lib/composables"

import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"

const authStore = useAuthStore()

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
  } catch (err) {
    dialog.value.open(err.message)
    console.error(err.message)
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
  } catch (err) {
    dialog.value.open(err.message)
    console.error(err.message)
  }

  await supabase
    .from("pengguna")
    .update({ nama: data.value.nama })
    .eq("user_id", authStore.session.user.id)
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
        <CTA type="submit" :is-button="true" :fill="true">Masuk</CTA>
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

        <CTA type="submit" :is-button="true" :fill="true">Daftar</CTA>
      </form>
    </div>

    <CTA @click="handleSwitchForm" :is-button="true">
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
