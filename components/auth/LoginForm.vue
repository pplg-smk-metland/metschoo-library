<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod"
import { AuthError } from "@supabase/supabase-js"
import { z } from "zod"

const authStore = useAuthStore()
const router = useRouter()

const toast = useToast()
const isLoading = ref(false)

const formData = reactive({
  email: "",
  password: "",
})

async function handleSignIn({ valid }: { valid: boolean }) {
  if (!valid) return

  isLoading.value = true
  try {
    const { email, password } = formData
    const error = await authStore.handleSignIn(email, password)
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
    await authStore.handleForgotPassword(formData.email)
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

const resolver = zodResolver(
  z.object({
    email: z
      .string()
      .nonempty("email tidak boleh kosong.")
      .email("ini bukan email. Yang bener donk."),
    password: z
      .string()
      .nonempty("password kamu gak mungkin kosong.")
      .min(7, "password harus lebih dari atau sama dengan 8 karakter."),
  })
)
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
      <Form
        v-slot="$form"
        class="flex flex-col gap-2"
        @submit="handleSignIn"
        :resolver
        :initialValues="formData"
        :validateOnValueUpdate="false"
        :validateOnBlur="false"
        :validateOnSubmit="true"
      >
        <label for="email">Email</label>
        <InputText id="email" name="email" placeholder="Email" autocomplete="off" />

        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email.error.message }}
        </Message>

        <label for="password">Password</label>
        <Password
          fluid
          toggle-mask
          input-id="password"
          name="password"
          placeholder="Password Anda"
          :feedback="false"
        />

        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          {{ $form.password.error.message }}
        </Message>

        <CTA type="submit" label="Masuk" :disabled="isLoading" />
        <CTA type="button" label="lupa password?" text @click="isForgotPasswordOpen = true" />
      </Form>
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
          v-model="formData.email"
          type="email"
          name="recovery-email"
          placeholder="email kamu"
          autocomplete="off"
          class="flex-grow"
          required
        />

        <CTA
          type="submit"
          :label="isLoading ? 'sebentar ya...' : 'Kirim email'"
          fill
          :loading="isLoading"
        />
      </form>
    </Dialog>

    <Toast />
  </section>
</template>
