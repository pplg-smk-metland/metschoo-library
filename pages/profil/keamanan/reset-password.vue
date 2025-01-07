<script setup lang="ts">
import type { AuthApiError } from "@supabase/supabase-js"
import Password from "primevue/password"

useHead({
  title: "Reset password",
})

definePageMeta({
  layout: "default",
  middleware: "profil",
})

const data = ref({
  password: "",
  confirmPassword: "",
})

const formState = computed(() => {
  return {
    password: {
      isStrong: data.value.password.length >= 8,
      isConfirmed: data.value.confirmPassword === data.value.password,
    },
  }
})

const isLoading = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const toast = useToast()

async function handleResetPassword() {
  isLoading.value = true
  try {
    await authStore.handleResetPassword(data.value.password)
    toast.add({
      severity: "success",
      summary: "Berhasil masuk!",
      detail: "Password kamu sudah berhasil diganti. Mengembalikan kamu ke beranda dalam 15 detik...",
      life: 10000,
    })
    
    // [HAPUS KOMEN SETELAH SELESAI] delay beberapa detik dengan memakai setTimeout


    setTimeout(() => router.push("/"), 15000)
    router.push("/")
  } catch (err) { 
    console.log((err as AuthApiError).code)
    if ((err as AuthApiError).code == "same_password") {
      toast.add({
      severity: "error",
      summary: "Gagal masuk!",
      detail: "Password harus berbeda dari password sebelumnya.",
      life: 10000,
    })
    }
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <PageHeader heading="reset password" />

    <section class="main-section">
      <form class="flex flex-col gap-2" @submit.prevent="handleResetPassword">
        <label for="password">Password baru kamu</label>
        <Password
          v-model="data.password"
          fluid
          toggle-mask
          input-id="password"
          required
          :invalid="!formState.password.isStrong"
          placeholder="Password Anda"
        />

        <span v-show="!formState.password.isStrong" class="text-sm text-red-400 dark:text-red-500">
          Password harus memiliki panjang 8 karakter atau lebih.
        </span>

        <label for="confirm-password">Konfirmasi password baru</label>
        <Password
          id="confirm-password"
          v-model="data.confirmPassword"
          fluid
          type="password"
          name="confirm-password"
          required
          toggle-mask
          :invalid="!formState.password.isConfirmed"
          placeholder="password anda"
        />
        <span
          v-show="!formState.password.isConfirmed"
          class="text-sm text-red-400 dark:text-red-500"
        >
          Password tidak sama.
        </span>

        <CTA
          type="submit"
          :label="isLoading ? 'sebentar ya...' : 'reset password'"
          :disabled="!(formState.password.isStrong && formState.password.isConfirmed) || isLoading"
        />
      </form>
    </section>
  </div>
  <Toast />

</template>
