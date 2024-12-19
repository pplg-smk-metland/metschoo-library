<script setup lang="ts">
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import Dialog from "primevue/dialog"
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

const formState = computed(() => {
  return {
    password: {
      isStrong: data.value.password.length >= 8,
      isConfirmed: data.value.confirmPassword === data.value.password,
    },
    phone: phoneIsValid(data.value.phoneNumber),
  }
})

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
  const { nama, email, phoneNumber, password } = data.value

  isLoading.value = true
  try {
    const error = await authStore.handleSignUp({ nama, email, phoneNumber, password })
    if (error) throw error

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

const isForgotPasswordOpen = ref(false)
const isRecoveryEmailSent = ref(false)

function forgotPassword() {
  isForgotPasswordOpen.value = true
}

async function handleForgotPasword() {
  isLoading.value = true

  try {
    await authStore.handleForgotPassword(data.value.email)
    isRecoveryEmailSent.value = true
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "gagal mengirim email!",
      detail: "ada kesalahan saat mengirim email. Silahkan coba lagi",
      life: 10000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="flex flex-col gap-4 flex-auto max-w-xl main-section">
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
          :invalid="!formState.password.isStrong"
          placeholder="Password Anda"
        />

        <CTA type="submit" label="Masuk" :disabled="isLoading && !formState.password.isStrong" />
        <CTA type="button" label="lupa password?" text @click="forgotPassword" />
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
          :invalid="!formState.phone.isValid"
          placeholder="0878 kapan kapan kita ke dufan"
          maxlength="14"
        />

        <span class="text-sm text-red-400 dark:text-red-500" v-show="!formState.phone.isValid">
          {{ formState.phone.message }}
        </span>

        <label for="signup-password">Password</label>
        <Password
          v-model="data.password"
          fluid
          input-id="signup-password"
          required
          toggle-mask
          :invalid="!formState.password.isStrong"
          placeholder="Password Anda"
          aria-describedby="weak-password-help"
        />

        <span
          class="text-sm text-red-400 dark:text-red-500"
          id="weak-password-help"
          v-show="!formState.password.isStrong"
        >
          Password harus memiliki panjang 8 karakter atau lebih.
        </span>

        <label for="confirm-password">Konfirmasi Password</label>
        <Password
          v-model="data.confirmPassword"
          fluid
          input-id="confirm-password"
          required
          toggle-mask
          :invalid="!formState.password.isConfirmed"
          placeholder="Ketik Ulang Password"
          aria-describedby="unconfirmed-password-help"
        />

        <span
          class="text-sm text-red-400 dark:text-red-500"
          id="unconfirmed-password-help"
          v-show="!formState.password.isConfirmed"
        >
          Password tidak sama.
        </span>

        <CTA
          type="submit"
          label="Daftar"
          class="block"
          :disabled="isLoading || !formState.password.isStrong || !formState.password.isConfirmed"
        />
      </form>
    </div>

    <CTA :label="buttonLabel" text @click="handleSwitchForm" />
    <Toast />

    <Dialog
      v-model:visible="isForgotPasswordOpen"
      modal
      header="Lupa password"
      class="mx-4 max-w-xl"
    >
      <p v-show="!isRecoveryEmailSent">
        Masukkan emailmu, dan kami akan mengirimkan link untuk mengganti passwordmu.
      </p>
      <p v-show="isRecoveryEmailSent">
        Email terkirim! setelah kamu klik linknya, kamu bisa menutup tab ini.
      </p>

      <form @submit.prevent="handleForgotPasword" class="flex gap-4 flex-wrap">
        <InputText
          v-model="data.email"
          type="email"
          name="recovery-email"
          id="recovery-email"
          placeholder="email kamu"
          autocomplete="off"
          class="flex-grow"
          required
        />

        <CTA type="submit" :label="isLoading ? 'sebentar ya...' : 'Kirim email'" fill />
      </form>
    </Dialog>
  </section>
</template>

<style scoped>
form label {
  @apply mt-2;
}
</style>
