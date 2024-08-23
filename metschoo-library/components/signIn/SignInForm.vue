<script setup lang="ts">
import { useDialog } from "@/composables"
import { AuthError } from "@supabase/supabase-js"


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

const authStore = useAuthStore()
const router = useRouter()

async function handleSignIn() {
  try {
    const error = await authStore.handleSignIn(data.value.email, data.value.password)
    if (error) throw error
    router.push("/")
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

    <div v-if="isSigningIn" class="form-container log-in">
      <form @submit.prevent="handleSignIn">
        <label for="login-email">Email</label>
        <input id="login-email" v-model="data.email" required type="email" placeholder="Email" />

        <label for="login-password">Password</label>
        <input
          id="login-password"
          v-model="data.password"
          required
          type="password"
          placeholder="Password Anda"
        />
        <CTA type="submit" :fill="true" label="Masuk" />
      </form>
    </div>

    <div v-else class="form-container sign-up">
      <form @submit.prevent="handleSignUp">
        <label for="nama">Nama</label>
        <input id="nama" type="text" name="nama" placeholder="Siapa namamu?" required />
        <label for="signup-email">Email</label>
        <input id="signup-email" v-model="data.email" required type="email" placeholder="Email" />
        <label for="signup-password">Password</label>
        <input
          id="signup-password"
          v-model="data.password"
          required
          type="password"
          placeholder="Password Anda"
        />
        <label for="confirm-password">Konfirmasi Password</label>
        <input
          v-model="data.confirmPassword"
          type="password"
          placeholder="Ketik Ulang Password"
          required
        />

        <CTA type="submit" :fill="true" label="Daftar" />
      </form>
    </div>

    <CTA @click="handleSwitchForm" label="Belum punya akun? Daftar" v-if="isSigningIn" />
    <CTA @click="handleSwitchForm" label="Sudah punya akun? Masuk" v-else />
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
