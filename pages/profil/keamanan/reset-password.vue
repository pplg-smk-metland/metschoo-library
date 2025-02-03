<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms"
import { zodResolver } from "@primevue/forms/resolvers/zod"
import type { AuthApiError } from "@supabase/supabase-js"
import Password from "primevue/password"
import { z } from "zod"

useHead({
  title: "Reset password",
})

definePageMeta({
  layout: "default",
})

const schema = z.object({
  password: z.string().nonempty().min(8, " Password harus memiliki panjang 8 karakter atau lebih."),
  confirmPassword: z.string().nonempty("gak boleh kosong."),
})

const resolver = zodResolver(schema)

const isLoading = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const toast = useToast()

async function handleResetPassword({ valid, values }: FormSubmitEvent) {
  if (!valid) return

  isLoading.value = true
  try {
    await authStore.handleResetPassword(values.password)
    toast.add({
      severity: "success",
      summary: "Berhasil masuk!",
      detail:
        "Password kamu sudah berhasil diganti. Mengembalikan kamu ke beranda dalam 15 detik...",
      life: 10000,
    })

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
      <Form
        :resolver
        v-slot="$form"
        :validate-on-submit="false"
        :validate-on-blur="true"
        :validate-on-value-update="false"
        class="flex flex-col gap-2"
        @submit="handleResetPassword"
      >
        <label for="password">Password baru kamu</label>
        <Password
          fluid
          toggle-mask
          input-id="password"
          name="password"
          placeholder="Password Anda"
        />

        <Message
          v-show="$form.password?.invalid"
          class="text-sm text-red-400 dark:text-red-500"
          variant="simple"
          size="small"
        >
          {{ $form.password?.error.message }}
        </Message>

        <label for="confirm-password">Konfirmasi password baru</label>
        <Password
          id="confirm-password"
          fluid
          name="confirmPassword"
          toggle-mask
          placeholder="password anda"
        />

        <Message
          v-show="
            $form.confirmPassword?.invalid || $form.confirmPassword?.value !== $form.password?.value
          "
          class="text-sm text-red-400 dark:text-red-500"
          variant="simple"
          size="small"
        >
          {{ $form.confirmPassword?.error.message }}
        </Message>

        <CTA
          type="submit"
          :label="isLoading ? 'sebentar ya...' : 'reset password'"
          :loading="isLoading"
        />
      </Form>
    </section>
  </div>
  <Toast />
</template>
