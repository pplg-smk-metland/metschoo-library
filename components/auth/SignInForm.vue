<script setup lang="ts">
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import type { SignUpData } from "@/types"

const isLoading = ref(false)

const data = ref<SignUpData>({
  nama: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
})

const authStore = useAuthStore()
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
</script>

<template>
  <section class="flex flex-col gap-4 flex-auto max-w-xl main-section">
    <header>
      <h1 class="text-center">
        <span>Daftar</span>
      </h1>
      <p class="text-center m-0">Buat akun Metschoo Library yang baru!</p>
    </header>

    <div class="flex-1">
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

        <span v-show="!formState.phone.isValid" class="text-sm text-red-400 dark:text-red-500">
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
          v-show="!formState.password.isStrong"
          id="weak-password-help"
          class="text-sm text-red-400 dark:text-red-500"
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
          :feedback="false"
        />

        <span
          v-show="!formState.password.isConfirmed"
          id="unconfirmed-password-help"
          class="text-sm text-red-400 dark:text-red-500"
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

    <Toast />
  </section>
</template>

<style scoped>
form label {
  @apply mt-2;
}
</style>
