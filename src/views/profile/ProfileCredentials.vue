<script setup>
import { ref } from "vue"
import { useDialog } from "@/lib/composables"

import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"

const { dialog } = useDialog()
const kredensialPengguna = ref({
  password: "",
  passwordKonfirmasi: "",
  email: "",
})

function ubahKredensial() {
  dialog.value.open("memperbarui kredensial...")
}

function ubahEmail() {
  dialog.value.open("memperbarui email...")
}
</script>

<template>
  <section class="nav">
    <h1>Keamanan</h1>
    <routerLink :to="{ name: 'profile' }">Kembali</routerLink>
  </section>

  <section class="main-section">
    <h2>Ubah Kredensial</h2>

    <form class="profile-form" @submit.prevent="ubahKredensial">
      <label for="password">Password</label>
      <input
        type="password"
        name="password"
        id="password"
        required
        v-model="kredensialPengguna.password"
      />

      <label for="confirm-password">konfirmasi password</label>
      <input
        type="password"
        name="confirm-password"
        id="confirm-password"
        v-model="kredensialPengguna.passwordKonfirmasi"
        required
      />
      <div class="button-container">
        <CTA>Ubah kredensial</CTA>
      </div>
    </form>
  </section>

  <section class="main-section">
    <h2>Ubah email</h2>

    <form @submit.prevent="ubahEmail">
      <label for="email">Email</label>
      <input type="email" name="email" id="email" v-model="kredensialPengguna.email" required />

      <div class="button-container">
        <CTA>Ubah email</CTA>
      </div>
    </form>
  </section>

  <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
    <h2>Info!!!</h2>
    <p>{{ dialog.message }}</p>
  </TheDialog>
</template>
