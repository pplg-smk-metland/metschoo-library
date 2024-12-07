<script setup lang="ts">
import { useDialog } from "@/composables"
import InputText from "primevue/inputtext"
import Password from "primevue/password"
import type { AuthError } from "@supabase/supabase-js"
import type { Database } from "~/types/database.types.ts"

import IconArrowLeft from "~icons/mdi/arrow-left"

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
  passwordKonfirmasi: "",
  email: user.value!.email,
  phoneNumber: user.value?.user_metadata.phone_no,
})

async function ubahKredensial() {
  const { password, passwordKonfirmasi } = kredensialPengguna.value

  if (password !== passwordKonfirmasi) {
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
    console.error((err as AuthError).message)
  }
}

async function ubahEmail() {
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

async function changePhoneNumber() {
  try {
    const phoneNumber = kredensialPengguna.value.phoneNumber
    if (!phoneNumber.match(/^08\d{10,14}$/)) {
      dialog.value.open(
        "Nomor HP tidak valid. Harus dimulai dengan 08 dan terdiri dari 10-14 angka."
      )
      return
    }

    const { error } = await supabase.auth.updateUser({
      data: { phone_no: phoneNumber },
    })

    if (error) throw error

    dialog.value.open("Nomor HP berhasil diperbarui.")
  } catch (err) {
    console.error(err)
    dialog.value.open("Terjadi kesalahan saat memperbarui nomor HP.")
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

    <form class="flex flex-col gap-2" @submit.prevent="changePhoneNumber">
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

    <form class="flex flex-col gap-2" @submit.prevent="ubahKredensial">
      <label for="password">Password</label>
      <Password
        v-model="kredensialPengguna.password"
        input-id="password"
        toggle-mask
        fluid
        name="password"
        placeholder="Password rahasia anda"
        required
      />

      <label for="confirm-password">konfirmasi password</label>
      <Password
        v-model="kredensialPengguna.passwordKonfirmasi"
        input-id="password"
        toggle-mask
        fluid
        name="confirm-password"
        placeholder="Password rahasia anda"
        required
      />
      <div class="button-container">
        <CTA label="Ubah kredensial" type="submit" />
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2 class="text-lg mb-2">Ubah email</h2>

    <form class="flex flex-col gap-2" @submit.prevent="ubahEmail">
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
    <h2>Info!!!</h2>
    <p>{{ dialog.message }}</p>
  </TheDialog>
</template>
