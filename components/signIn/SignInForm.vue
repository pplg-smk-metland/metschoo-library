<script setup lang="ts">
import { AuthError } from "@supabase/supabase-js"

const isSigningIn = ref(false)
const buttonLabel = computed(() =>
  isSigningIn.value ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"
)

const title = computed(() => (isSigningIn.value ? "Log in" : "Sign in"))

// title used in /login
useHead({
  title: title,
})

function handleSwitchForm() {
  isSigningIn.value = !isSigningIn.value
}

const data = ref({
  email: "",
  password: "",
  confirmPassword: "",
})

const authStore = useAuthStore()
const router = useRouter()

const toast = useToast()
async function handleSignIn() {
  try {
    const error = await authStore.handleSignIn(data.value.email, data.value.password)
    if (error) throw error
    router.push("/")
  } catch (err) {
    console.error(err)

    if (err instanceof AuthError) {
      toast.add({
        severity: "error",
        summary: "Gagal masuk!",
        detail: "Ada sebuah kesalahan saat masuk. Silahkan coba lagi",
      })
    }
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
    console.error(err)

    if (err instanceof AuthError) {
      toast.add({
        severity: "error",
        summary: "Gagal mendaftar!",
        detail: "Ada sebuah kesalahan saat mendaftar. Silahkan coba lagi",
      })
    }
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
      <form class="flex flex-col gap-2" @submit.prevent="handleSignIn">
        <label for="login-email">Email</label>
        <InputText
          id="login-email"
          v-model="data.email"
          required
          type="email"
          placeholder="Email"
        />

        <label for="login-password">Password</label>
        <InputText
          id="login-password"
          v-model="data.password"
          required
          type="password"
          placeholder="Password Anda"
        />
        <CTA type="submit" label="Masuk" />
      </form>
    </div>

    <div v-else class="form-container sign-up">
      <form class="flex flex-col gap-2" @submit.prevent="handleSignUp">
        <label for="nama">Nama</label>
        <InputText id="nama" type="text" name="nama" placeholder="Siapa namamu?" required />

        <label for="signup-email">Email</label>
        <InputText
          id="signup-email"
          v-model="data.email"
          required
          type="email"
          placeholder="Email"
        />
        <label for="signup-password">Password</label>
        <Password
          id="signup-password"
          v-model="data.password"
          class="w-full"
          required
          toggle-mask
          placeholder="Password Anda"
        />
        <label for="confirm-password">Konfirmasi Password</label>
        <Password
          v-model="data.confirmPassword"
          class="w-full"
          placeholder="Ketik Ulang Password"
          required
        />

        <CTA type="submit" label="Daftar" class="block" />
      </form>
    </div>

    <CTA :label="buttonLabel" text @click="handleSwitchForm" />
  </div>
    <Toast />
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
