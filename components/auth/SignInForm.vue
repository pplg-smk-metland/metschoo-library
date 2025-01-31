<script setup lang="ts">
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import type { SignUpData } from "@/types"
import { zodResolver } from "@primevue/forms/resolvers/zod"
import { z } from "zod"

const isLoading = ref(false)

const formData = ref<SignUpData>({
  nama: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
})

const schema = z.object({
  nama: z.string().nonempty("namamu ga mungkin kosong bre."),
  email: z.string().nonempty("emailmu ga mungkin kosong bre.").email("ini bukan email."),
  phoneNumber: z
    .string()
    .regex(/^08\d{10,14}$/, "nomor HP kamu harus diawali 08 dan memiliki 10 sampai 14 angka."),
  password: z.string().min(8, "password kamu minimal harus 8 karakter atau lebih."),
  confirmPassword: z.string().nonempty("kamu lupa ngetik konfirmasi password."),
})

const resolver = zodResolver(schema)

const authStore = useAuthStore()
const toast = useToast()

const formState = computed(() => {
  return {
    password: {
      isStrong: formData.value.password.length >= 8,
      isConfirmed: formData.value.confirmPassword === formData.value.password,
    },
    phone: phoneIsValid(formData.value.phoneNumber),
  }
})

async function handleSignUp({ valid, values }: { valid: boolean; values: Record<string, string> }) {
  if (!valid) return

  const { nama, email, phoneNumber, password } = values

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
      <Form
        v-slot="$form"
        :initial-values="formData"
        :resolver="resolver"
        :validate-on-value-update="false"
        :validate-on-submit="true"
        :validateon-blur="true"
        class="flex flex-col gap-2"
        @submit="handleSignUp"
      >
        <label for="nama">Nama</label>
        <InputText id="nama" type="text" name="nama" placeholder="Siapa namamu?" />

        <Message v-if="$form.nama?.invalid" severity="error" size="small" variant="simple">
          {{ $form.nama?.error.message }}
        </Message>

        <label for="signup-email">Email</label>
        <InputText id="signup-email" name="email" placeholder="Email" />

        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email?.error.message }}
        </Message>

        <label for="signup-number">No. HP</label>
        <InputText
          id="signup-number"
          type="text"
          name="phoneNumber"
          :invalid="!formState.phone.isValid"
          placeholder="0878 kapan kapan kita ke dufan"
        />

        <Message v-if="$form.phoneNumber?.invalid" severity="error" size="small" variant="simple">
          {{ $form.phoneNumber?.error.message }}
        </Message>

        <label for="signup-password">Password</label>
        <Password
          name="password"
          fluid
          input-id="signup-password"
          toggle-mask
          placeholder="Password Anda"
          aria-describedby="weak-password-help"
        />

        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          {{ $form.password?.error.message }}
        </Message>

        <label for="confirm-password">Konfirmasi Password</label>
        <Password
          fluid
          input-id="confirm-password"
          name="confirmPassword"
          toggle-mask
          placeholder="Ketik Ulang Password"
          aria-describedby="unconfirmed-password-help"
          :feedback="false"
        />

        <Message
          v-if="$form.confirmPassword?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.confirmPassword?.error.message }}
        </Message>

        <Message
          v-if="
            !$form.confirmPassword?.invalid &&
            $form.confirmPassword?.value !== $form.password?.value
          "
          severity="error"
          size="small"
          variant="simple"
        >
          Mohon konfirmasi password kamu, ngetiknya yang bener.
        </Message>

        <CTA type="submit" label="Daftar" class="block" :loading="isLoading" />
      </Form>
    </div>

    <Toast />
  </section>
</template>

<style scoped>
form label {
  @apply mt-2;
}
</style>
