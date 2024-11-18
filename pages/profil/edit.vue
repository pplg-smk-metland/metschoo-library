<script setup lang="ts">
import InputText from "primevue/inputtext"
import type { PostgrestError } from "@supabase/supabase-js"
import Select from "primevue/select"
import Toast from "primevue/toast"
import type { Pengguna } from "@/types"
import { useToast } from "primevue/usetoast"
import IconArrowLeft from "~icons/mdi/arrow-left"

useHead({
  title: "Edit profil",
})

definePageMeta({
  layout: "profile-edit",
  middleware: "profil",
})

const authStore = useAuthStore()

const { data: user } = await useAsyncData(async () => {
  return authStore.profile
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
  <PageHeader heading="Edit profil">
    <CTA as="router-link" link to="/profil" label="Kembali" class="order-first">
      <IconArrowLeft />
    </CTA>
  </PageHeader>

  <section v-if="user" class="main-section flex gap-4">
    <figure class="flex flex-col gap-4">
      <img class="profile__picture" src="@/assets/profilepicture.svg" alt="Foto kamu disini" />
      <CTA label="Edit foto profil" />
    </figure>

    <form class="flex flex-col gap-2 flex-1" @submit.prevent="updateProfile">
      <label for="name">Nama</label>
      <InputText v-model="user.nama" type="text" placeholder="Masukan Nama" />

      <label for="kelas">Kelas</label>
      <Select
        v-model="user.kelas"
        :options="['X', 'XI', 'XII']"
        placeholder="Kelas Berapa Kamu"
        checkmark
      />

      <label for="jurusan">Jurusan</label>
      <InputText v-model="user.jurusan" type="text" placeholder="Masukkan Jurusan" />

      <CTA label="Edit profil" class="mt-auto" @click="updateProfile" />
    </form>
  </section>

  <section v-else>
    <h1>Pengguna tidak ditemukan!</h1>
    <p>Silahkan refresh jika profil anda tidak muncul.</p>
  </section>

  <Toast />
</template>
