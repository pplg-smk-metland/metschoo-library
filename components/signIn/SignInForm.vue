<script setup lang="ts">
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import { AuthError } from "@supabase/supabase-js"
import type { SignUpData } from "@/types"

const isSigningIn = ref(false)
const buttonLabel = computed(() =>
  isSigningIn.value ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"
)

const title = computed(() => (isSigningIn.value ? "Log in" : "Sign in"))

// title used in /login
useHead({
  title: title,
})

const isLoading = ref(false)

function handleSwitchForm() {
  isSigningIn.value = !isSigningIn.value
}

const data = ref<SignUpData>({
  nama: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
})

const authStore = useAuthStore()
const router = useRouter()

const toast = useToast()

async function handleSignIn() {
  isLoading.value = true
  try {
    const error = await authStore.handleSignIn(data.value.email, data.value.password)
    if (error) throw error
    router.push("/")
  } catch (err) {
    console.error(err)

    let detail = "Ada sebuah kesalahan saat mendaftar. Silahkan coba lagi"
    if (err instanceof AuthError) {
      if (err.message === "Invalid login credentials") {
        detail = "email atau password salah."
      }
    }

    toast.add({
      severity: "error",
      summary: "Gagal masuk!",
      detail,
      life: 10000,
    })
  } finally {
    isLoading.value = false
  }
}

async function handleSignUp() {
  const { nama, email, phoneNumber, password, confirmPassword } = data.value

  if (confirmPassword !== password) {
    alert("passwordnya ga sama")
    return
  }

  isLoading.value = true
  try {
    await authStore.handleSignUp({ nama, email, phoneNumber, password })
    alert("Cek email lu ya buat verifikasi email!")
  } catch (err) {
    console.error(err)

    toast.add({
      severity: "error",
      summary: "Gagal mendaftar!",
      detail: "Ada sebuah kesalahan saat mendaftar. Silahkan coba lagi",
      life: 10000,
    })
  } finally {
    isLoading.value = false
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
        <Password
          v-model="data.password"
          fluid
          toggle-mask
          input-id="login-password"
          required
          minlength="8"
          placeholder="Password Anda"
        />
        <CTA type="submit" label="Masuk" :disabled="isLoading" />
      </form>
    </div>

    <div v-else class="flex-1">
      <form class="flex flex-col gap-2" @submit.prevent="handleSignUp">
        <label for="nama">Nama</label>
        <InputText
          id="nama"
          v-model="data.nama"
          type="text"
          name="nama"
          placeholder="Siapa namamu?"
          required
        />

        <label for="signup-email">Email</label>
        <InputText
          id="signup-email"
          v-model="data.email"
          required
          type="email"
          placeholder="Email"
        />
        <label for="signup-number">No. HP</label>
        <InputText
          id="signup-number"
          v-model="data.phoneNumber"
          type="text"
          required
          placeholder="0878 kapan kapan kita ke dufan"
          maxlength="14"
        />
        <label for="signup-password">Password</label>
        <Password
          v-model="data.password"
          fluid
          input-id="signup-password"
          required
          toggle-mask
          minlength="8"
          placeholder="Password Anda"
        />
        <label for="confirm-password">Konfirmasi Password</label>
        <Password
          v-model="data.confirmPassword"
          fluid
          input-id="confirm-password"
          required
          toggle-mask
          minlength="8"
          placeholder="Ketik Ulang Password"
        />

        <CTA type="submit" label="Daftar" class="block" :disabled="isLoading" />
      </form>
    </div>

    <CTA :label="buttonLabel" text @click="handleSwitchForm" />
    <Toast />
  </section>
</template>
