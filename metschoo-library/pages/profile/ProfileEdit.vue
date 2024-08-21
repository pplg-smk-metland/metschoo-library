<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { type PostgrestError } from "@supabase/supabase-js"

import Select from "primevue/select"
import Toast from "primevue/toast"
import ProfileEditLayout from "@/layouts/ProfileEditLayout.vue"
import CTA from "@/components/CTA.vue"
import type { Pengguna } from "@/types"
import { useToast } from "primevue/usetoast"

const dataPengguna = ref<Pengguna | null>(null)
const authStore = useAuthStore()

const router = useRouter()

onMounted(async () => {
  if (!authStore.session) return router.back()

  const data = await authStore.getProfile(authStore.session)
  dataPengguna.value = data
})

const toast = useToast()

async function updateUserInfo() {
  try {
    await authStore.handleUpdateProfile(dataPengguna.value as Pengguna)

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
  <ProfileEditLayout>
    <header class="header">
      <h1>Edit profil</h1>
      <NuxtLink to="/profil"> Kembali </NuxtLink>
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

    <Toast :unstyled="false" />
  </ProfileEditLayout>
</template>
