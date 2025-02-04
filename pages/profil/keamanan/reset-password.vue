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

const router = useRouter()
const user = useSupabaseUser()

if (!user) router.push("/")

const schema = z.object({
  password: z
    .string({ message: "kamu lupa ngetik password baru kamu." })
    .min(8, " Password harus memiliki panjang 8 karakter atau lebih."),
  confirmPassword: z.string({ message: "kamu lupa mengetik konfirmasi password." }),
})

const resolver = zodResolver(schema)

const isLoading = ref(false)
const authStore = useAuthStore()

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
        v-slot="$form"
        class="flex flex-col gap-2"
        :resolver
        :validate-on-value-update="false"
        :validate-on-blur="false"
        :validate-on-submit="true"
        @submit="handleResetPassword"
      >
        <label for="password">Password baru kamu</label>
        <Password
          fluid
          toggle-mask
          input-id="password"
          name="password"
          placeholder="Password baru kamu"
          autocomplete="off"
        />

        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          {{ $form.password?.error.message }}
        </Message>

        <label for="confirm-password">Konfirmasi Password</label>
        <Password
          fluid
          toggle-mask
          input-id="confirm-password"
          name="confirmPassword"
          placeholder="Konfirmasi password kamu"
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
