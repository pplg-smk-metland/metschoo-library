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
  <section
    class="flex flex-col gap-4 flex-auto max-w-xl p-8 rounded-lg bg-surface-300 dark:bg-surface-700"
  >
    <header>
      <template v-if="isSigningIn">
        <h1 v-if="isSigningIn" class="text-center">
          <span>Masuk</span>
        </h1>
        <p class="text-center m-0">Masuk ke akun Metschoo Library yang sudah anda miliki!</p>
      </template>

      <template v-else>
        <h1 class="text-center">
          <span>Daftar</span>
        </h1>
        <p class="text-center m-0">Buat akun Metschoo Library yang baru!</p>
      </template>
    </header>

    <div v-if="isSigningIn" class="flex-1">
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

    <div v-else class="flex-1">
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
    <Toast />
  </section>
</template>
