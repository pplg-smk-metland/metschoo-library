<script setup lang="ts">
import { useDialog } from "@/composables"
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import { AuthError } from "@supabase/supabase-js"
import type { Database } from "~/types/database.types.ts"

import IconArrowLeft from "~icons/mdi/arrow-left"
import { phoneIsValid } from "~/utils/auth"

useHead({
  title: "Keamanan Profil",
})

definePageMeta({
  layout: "profile-edit",
  middleware: "profil",
})

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const { dialog } = useDialog()
const kredensialPengguna = ref({
  password: "",
  confirmPassword: "",
  email: user.value!.email,
  phoneNumber: user.value?.user_metadata.phone_no,
})

async function changePassword() {
  const { password, confirmPassword } = kredensialPengguna.value

  if (password !== confirmPassword) {
    dialog.value.open("Password tidak sama! coba lagi")
    return
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error
    dialog.value.open("memperbarui kredensial...")
  } catch (err) {
    console.error(err as AuthError)
    let message = "gagal mengubah password! "

    if ((err as AuthError).code === "same_password") {
      message += "password tidak boleh sama dengan yang lama."
    }

    dialog.value.open(message)
  }
}

async function changeEmail() {
  if (!confirm("beneran mau ubah email?")) return

  try {
    const { error } = await supabase.auth.updateUser({
      email: kredensialPengguna.value.email,
    })
    if (error) throw error

    dialog.value.open("Cek email LAMA dan email BARU kamu ya, linknya ada dua...")
  } catch (err) {
    console.table(err as AuthError)
  }
}

async function changePhoneNumber(phoneNumber: string) {
  try {
    const { isValid, message } = phoneIsValid(phoneNumber)
    if (!isValid) {
      dialog.value.open(message)
      return
    }

    const { error } = await supabase.auth.updateUser({
      data: { phone_no: phoneNumber },
    })

    const { error: updateError } = await supabase
      .from("pengguna")
      .update({ phone_no: phoneNumber })
      .eq("user_id", user.value!.id)

    if (error || updateError) throw error

    dialog.value.open("Nomor HP berhasil diperbarui.")
  } catch (err) {
    console.error(err)
    let message =
      "Terjadi kesalahan saat memperbarui nomor HP, pastikan anda tersambung ke internet."
    if (err instanceof AuthError) {
      message = "Terjadi kesalahan saat memperbarui nomor HP (lokal)."
    }

    dialog.value.open(message)
  }
}

const authStore = useAuthStore()
const router = useRouter()

async function signOut() {
  const reallySigningOut = confirm("Beneran nih mau keluar akun?")

  if (!reallySigningOut) {
    return
  }

  await authStore.handleSignOut()
  router.push("/")
}
</script>

<template>
  <PageHeader heading="Ubah kredensial" class="nav">
    <CTA as="router-link" link to="/profil" label="Kembali" class="order-first px-0">
      <IconArrowLeft />
    </CTA>
  </PageHeader>

  <section class="main-section">
    <h2 class="text-lg mb-2">Ubah No. HP</h2>

    <form
      class="flex flex-col gap-2"
      @submit.prevent="changePhoneNumber(kredensialPengguna.phoneNumber)"
    >
      <label for="number">No. HP</label>
      <InputText
        id="number"
        v-model="kredensialPengguna.phoneNumber"
        type="text"
        name="phone number"
        placeholder="08xx"
        required
        maxlength="14"
      />

      <div class="button-container">
        <CTA label="Ubah No. HP" type="submit" />
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2 class="text-lg mb-2">Ubah password</h2>

    <form class="flex flex-col gap-2" @submit.prevent="changePassword">
      <label for="password">Password</label>
      <Password
        v-model="kredensialPengguna.password"
        input-id="password"
        toggle-mask
        fluid
        name="password"
        placeholder="Password rahasia anda"
        minlength="8"
        required
      />

      <label for="confirm-password">konfirmasi password</label>
      <Password
        v-model="kredensialPengguna.confirmPassword"
        input-id="password"
        toggle-mask
        fluid
        name="confirm-password"
        placeholder="Password rahasia anda"
        minlength="8"
        required
      />

      <div class="button-container">
        <CTA label="Ubah password" type="submit" />
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2 class="text-lg mb-2">Ubah email</h2>

    <form class="flex flex-col gap-2" @submit.prevent="changeEmail">
      <label for="email">Email</label>
      <InputText
        id="email"
        v-model="kredensialPengguna.email"
        type="email"
        name="email"
        placeholder="emailanda@apa.com"
        required
      />

      <div class="button-container">
        <CTA label="Ubah email" type="submit" />
      </div>
    </form>
  </section>

  <Divider />

  <section class="main-section">
    <h2 class="text-lg mb-2 text-red-500">Keluar dari akun</h2>
    <p>Klik disini untuk keluar dari akun anda</p>

    <div class="button-container">
      <CTA label="Keluar dari akun" severity="danger" @click="signOut" />
    </div>
  </section>

  <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
    <template v-slot:header>
      <h2 class="text-xl">Info!!!</h2>
    </template>

    <p>{{ dialog.message }}</p>
  </TheDialog>
</template>
