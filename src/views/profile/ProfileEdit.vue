<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useDialog } from "@/lib/composables"
import { useAuthStore } from "@/stores/auth"
import { type PostgrestError } from "@supabase/supabase-js"
import Select from "primevue/select"

import ProfileEditLayout from "@/layouts/ProfileEditLayout.vue"
import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"
import type { Pengguna } from "@/types"

const { dialog } = useDialog()

const dataPengguna = ref<Pengguna | null>(null)
const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.session) {
    const data = await authStore.getProfile(authStore.session)
    dataPengguna.value = data
  }
})

async function updateUserInfo() {
  try {
    await authStore.handleUpdateProfile(dataPengguna.value!)
    dialog.value.open("sukses memperbarui data pengguna.")
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}
</script>

<template>
  <ProfileEditLayout>
    <header class="header">
      <h1>Edit profil</h1>
      <routerLink :to="{ name: 'profile' }"> Kembali </routerLink>
    </header>

    <section v-if="dataPengguna" class="profile">
      <figure class="profile__picture-wrapper">
        <img class="profile__picture" src="@/assets/profilepicture.svg" alt="Foto kamu disini" />
        <CTA label="Edit foto profil" />
      </figure>

      <form class="profile__details" @submit.prevent="updateUserInfo">
        <label for="name">Nama</label>
        <input v-model="dataPengguna.nama" type="text" placeholder="Masukan Nama" />

        <label for="kelas">Kelas</label>
        <Select
          v-model="dataPengguna.kelas"
          :options="['X', 'XI', 'XII']"
          placeholder="kelas berapa kamu"
          checkmark
        />

        <label for="jurusan">Jurusan</label>
        <input v-model="dataPengguna.jurusan" type="text" placeholder="Masukkan Jurusan" />

        <div class="button-container">
          <CTA @click="updateUserInfo" :fill="true" label="Edit profil" />
        </div>
      </form>
    </section>

    <section v-else>
      <h1>Pengguna tidak ditemukan!</h1>
      <p>silahkan coba lagi.</p>
    </section>

    <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
      <h2>Info!!!</h2>
      <p>{{ dialog.message }}</p>
    </TheDialog>
  </ProfileEditLayout>
</template>
