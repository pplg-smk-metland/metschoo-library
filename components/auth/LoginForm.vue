<script setup lang="ts">
import { AuthError } from "@supabase/supabase-js"

const authStore = useAuthStore()
const router = useRouter()

const toast = useToast()
const isLoading = ref(false)

const data = ref({
  email: "",
  password: "",
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

const isForgotPasswordOpen = ref(false)
const isRecoveryEmailSent = ref(false)

async function handleForgotPasword() {
  isLoading.value = true

  try {
    await authStore.handleForgotPassword(data.value.email)
    isRecoveryEmailSent.value = true
  } catch (err) {
    console.error(err)

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
      <h1 class="text-center">
        <span>Masuk</span>
      </h1>
      <p class="text-center m-0">Masuk ke akun Metschoo Library yang sudah anda miliki!</p>
    </header>

    <div class="flex-1">
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
          placeholder="Password Anda"
          :feedback="false"
        />

        <CTA type="submit" label="Masuk" :disabled="isLoading" />
        <CTA type="button" label="lupa password?" text @click="isForgotPasswordOpen = true" />
      </form>
    </div>

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

      <form class="flex gap-4 flex-wrap" @submit.prevent="handleForgotPasword">
        <InputText
          id="recovery-email"
          v-model="data.email"
          type="email"
          name="recovery-email"
          placeholder="email kamu"
          autocomplete="off"
          class="flex-grow"
          required
        />

        <CTA type="submit" :label="isLoading ? 'sebentar ya...' : 'Kirim email'" fill />
      </form>
    </Dialog>

    <Toast />
  </section>
</template>
