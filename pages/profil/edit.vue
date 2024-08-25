<script setup lang="ts">
import { type PostgrestError } from "@supabase/supabase-js"

import Select from "primevue/select"
import Toast from "primevue/toast"
import type { Pengguna } from "@/types"
import { useToast } from "primevue/usetoast"

useHead({
  title: "Edit profil",
})

definePageMeta({
  layout: "profile-edit",
})

const authStore = useAuthStore()
const supabaseUser = useSupabaseUser()
const user = ref<Pengguna | null>(null)

onMounted(async () => {
  user.value = await authStore.getProfile(supabaseUser.value.id)
})

const toast = useToast()

async function updateProfile() {
  try {
    await authStore.handleUpdateProfile(user.value as Pengguna)

    toast.add({
      severity: "success",
      summary: "Sukses!",
      detail: "sukses memperbarui data pengguna.",
      life: 10000,
    })
  } catch (err) {
    console.error((err as PostgrestError).message)

    toast.add({
      severity: "error",
      summary: "Gagal",
      detail: "Gagal memperbarui data pengguna. Silahkan coba lagi nanti",
      life: 10000,
    })
  }
}
</script>

<template>
  <header class="header">
    <h1>Edit profil</h1>
    <NuxtLink to="/profil">Kembali</NuxtLink>
  </header>

  <section v-if="user" class="profile">
    <figure class="profile__picture-wrapper">
      <img class="profile__picture" src="@/assets/profilepicture.svg" alt="Foto kamu disini" />
      <CTA label="Edit foto profil" />
    </figure>

    <form class="profile__details" @submit.prevent="updateProfile">
      <label for="name">Nama</label>
      <input v-model="user.nama" type="text" placeholder="Masukan Nama" />

      <label for="kelas">Kelas</label>
      <Select
        v-model="user.kelas"
        :options="['X', 'XI', 'XII']"
        placeholder="kelas berapa kamu"
        checkmark
      />

      <label for="jurusan">Jurusan</label>
      <input v-model="user.jurusan" type="text" placeholder="Masukkan Jurusan" />

      <div class="button-container">
        <CTA @click="updateProfile" :fill="true" label="Edit profil" />
      </div>
    </form>
  </section>

  <section v-else>
    <h1>Pengguna tidak ditemukan!</h1>
    <p>silahkan coba lagi.</p>
  </section>

  <Toast :unstyled="false" />
</template>
