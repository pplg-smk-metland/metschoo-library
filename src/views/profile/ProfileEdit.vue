<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useDialog } from "@/lib/composables"
import { useAuthStore } from "@/stores/auth"
import { type PostgrestError } from "@supabase/supabase-js"

import ProfileEditLayout from "@/layouts/ProfileEditLayout.vue"
import TheDialog from "@/components/TheDialog.vue"
import CTA from "@/components/CTA.vue"
import type { Pengguna } from "@/types"

const { dialog } = useDialog()
const dataPengguna = ref<Pengguna | null>()

async function updateUserInfo() {
  try {
    await authStore.handleUpdateProfile(dataPengguna.value!)
    dialog.value.open("sukses memperbarui data pengguna.")
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}

const authStore = useAuthStore()

onMounted(async () => {
  const data = await authStore.getProfile()
  if (data) dataPengguna.value = data
})
</script>

<template>
  <ProfileEditLayout>
    <section class="header">
      <h1>Edit profil</h1>
      <routerLink :to="{ name: 'profile' }">Kembali</routerLink>
    </section>

    <section class="profile">
      <figure class="profile__picture-wrapper">
        <img class="profile__picture" src="@/assets/profilepicture.svg" alt="Foto kamu disini" />
        <CTA>Edit foto profil</CTA>
      </figure>

      <form class="profile__details" @submit.prevent="updateUserInfo">
        <label for="name">Nama</label>
        <input type="text" placeholder="Masukan Nama" v-model="dataPengguna?.nama" />

        <label for="kelas">Kelas</label>
        <select name="kelas" id="kelas" v-model="dataPengguna?.kelas">
          <option value="X">X</option>
          <option value="XI">XI</option>
          <option value="XII">XII</option>
        </select>

        <label for="jurusan">Jurusan</label>
        <input type="text" placeholder="Masukkan Jurusan" v-model="dataPengguna?.jurusan" />

        <div class="button-container">
          <CTA :fill="true">Edit profil</CTA>
        </div>
      </form>
    </section>

    <TheDialog :is-open="dialog.isOpen" @dialog-close="dialog.close()">
      <h2>Info!!!</h2>
      <p>{{ dialog.message }}</p>
    </TheDialog>
  </ProfileEditLayout>
</template>
