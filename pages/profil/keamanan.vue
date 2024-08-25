<script setup lang="ts">
import { useDialog } from "@/composables"

import { type AuthError } from "@supabase/supabase-js"
import type { Database } from "~/types/supabase"

useHead({
  title: "Keamanan Profil",
})

definePageMeta({
  layout: "profile-edit",
})

const supabase = useSupabaseClient<Database>()

const { dialog } = useDialog()
const kredensialPengguna = ref({
  password: "",
  passwordKonfirmasi: "",
  email: "",
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

const authStore = useAuthStore()
const router = useRouter()

async function signOut() {
  const reallySigningOut = confirm("Beneran nih mau keluar akun?")

  if (reallySigningOut) {
    await authStore.handleSignOut()
    router.push("/")
  }
}

const { profile } = authStore

onMounted(async () => {
  kredensialPengguna.value.email = profile!.email
})
</script>

<template>
  <section class="nav">
    <h1>Ubah kredensial</h1>
    <NuxtLink to="/profil"> Kembali </NuxtLink>
  </section>

  <section class="main-section">
    <h2>Ubah password</h2>
    <form class="profile-form" @submit.prevent="ubahKredensial">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="kredensialPengguna.password"
        type="password"
        name="password"
        placeholder="Password rahasia anda"
        required
      />

      <label for="confirm-password">konfirmasi password</label>
      <input
        id="confirm-password"
        v-model="kredensialPengguna.passwordKonfirmasi"
        type="password"
        name="confirm-password"
        placeholder="Password rahasia anda"
        required
      />
      <div class="button-container">
        <CTA label="Ubah kredensial" />
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2>Ubah email</h2>

    <form @submit.prevent="ubahEmail">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="kredensialPengguna.email"
        type="email"
        name="email"
        placeholder="emailanda@apa.com"
        required
      />

      <div class="button-container">
        <CTA label="Ubah email" />
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2>Keluar dari akun</h2>
    <p>Klik disini untuk keluar dari akun anda</p>

    <div class="button-container">
      <CTA @click="signOut" label="Keluar dari akun" severity="danger" />
    </div>
  </section>

  <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
    <h2>Info!!!</h2>
    <p>{{ dialog.message }}</p>
  </TheDialog>
</template>
