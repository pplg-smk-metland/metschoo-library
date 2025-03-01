<script setup lang="ts">
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import { zodResolver } from "@primevue/forms/resolvers/zod"
import { z } from "zod"
import type { FormSubmitEvent } from "@primevue/forms"

const isLoading = ref(false)

const schema = z
  .object({
    nama: z.string().nonempty("Namamu ga mungkin kosong bre."),
    email: z.string().nonempty("Emailmu ga mungkin kosong bre.").email("Ini bukan email."),
    phoneNumber: z
      .string()
      .regex(/^08\d{9,14}$/, "Nomor HP kamu harus diawali 08 dan memiliki 9 sampai 14 angka."),
    password: z.string().min(8, "Password kamu minimal harus 8 karakter atau lebih."),
    confirmPassword: z.string().nonempty("Kamu lupa ngetik konfirmasi password."),
  })
  .refine((schema) => schema.confirmPassword === schema.password, {
    path: ["confirmPassword"],
    message: "Mohon konfirmasi password kamu.",
  })

const resolver = zodResolver(schema)

const initialFormValues: z.infer<typeof schema> = {
  password: "",
  nama: "",
  email: "",
  phoneNumber: "",
  confirmPassword: "",
}

const authStore = useAuthStore()
const toast = useToast()

const dialogIsVisible = ref(false)

async function handleRegister({ valid, values }: FormSubmitEvent) {
  if (!valid) return

  const { nama, email, phoneNumber, password } = values

  isLoading.value = true
  try {
    const error = await authStore.handleRegister({ nama, email, phoneNumber, password })
    if (error) throw error

    dialogIsVisible.value = true
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

const { loadingText: registerBtnLabel } = useLoadingText(isLoading, "Daftar", "Tunggu sebentar ya")
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
        :resolver="resolver"
        :validate-on-value-update="false"
        :validate-on-submit="true"
        :validateon-blur="true"
        :initial-values="initialFormValues"
        class="flex flex-col gap-2"
        @submit="handleRegister"
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

        <CTA type="submit" :label="registerBtnLabel" :loading="isLoading" />
      </Form>
    </div>

    <Dialog v-model:visible="dialogIsVisible" modal header="Cek email kamu ya!" class="max-w-xl">
      <p>
        Kami sudah mengirimkan email yang berisi pranala untuk konfirmasi akun kamu. Jangan lupa cek
        spam juga! Setelah kamu klik pranalanya, kamu boleh menutup tab ini.
      </p>
    </Dialog>

    <Toast />
  </section>
</template>

<style scoped>
form label {
  @apply mt-2;
}
</style>
