<script setup lang="ts">
import InputText from "primevue/inputtext"
import type { PostgrestError } from "@supabase/supabase-js"
import Select from "primevue/select"
import Toast from "primevue/toast"
import type { Pengguna } from "@/types"
import { useToast } from "primevue/usetoast"
import IconArrowLeft from "~icons/mdi/arrow-left"
import { zodResolver } from "@primevue/forms/resolvers/zod"
import { z } from "zod"

useHead({
  title: "Edit profil",
})

definePageMeta({
  layout: "profile-edit",
  middleware: "profil",
})

const user = useSupabaseUser()
const authStore = useAuthStore()

const { data: userProfile } = await useAsyncData(async () => {
  if (user.value) return await authStore.getProfile(user.value.id)
})

const initialFormValues = ref({
  nama: userProfile.value?.nama,
  kelas: userProfile.value?.kelas,
  jurusan: userProfile.value?.jurusan,
})

const formSchema = z.object({
  nama: z.string().nonempty("nama kamu gak mungkin kosong."),
  kelas: z.enum(["X", "XI", "XII"], { message: "kelasnya gak valid." }),
  jurusan: z.string().nonempty("jurusan kamu gak mungkin kosong."),
})

const resolver = zodResolver(formSchema)

const toast = useToast()

async function updateProfile({ valid }: { valid: boolean }) {
  if (!valid) return

  try {
    await authStore.handleUpdateProfile(userProfile.value as Pengguna)

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

  <Message v-if="user?.user_metadata.new">
    Sebelum kamu meminjam buku, ayo masukkan dulu kelas dan jurusanmu!
  </Message>

  <section v-if="userProfile" class="main-section flex gap-4">
    <figure class="flex flex-col gap-4">
      <img
        width="300"
        height="300"
        class="flex-1"
        src="@/assets/profilepicture.svg"
        alt="Foto kamu disini"
      />
      <CTA label="Edit foto profil" />
    </figure>

    <Form
      v-slot="$form"
      :initial-values="initialFormValues"
      :resolver="resolver"
      :validate-on-value-update="false"
      :validate-on-blur="true"
      :validate-on-submit="true"
      class="flex flex-col gap-2 flex-grow"
      @submit="updateProfile"
    >
      <label for="name">Nama</label>
      <InputText v-model="userProfile.nama" name="nama" type="text" placeholder="Masukan Nama" />

      <Message v-if="$form.nama?.invalid" severity="error" size="small" variant="simple">
        {{ $form.nama?.error.message }}
      </Message>

      <label for="kelas">Kelas</label>
      <Select
        v-model="userProfile.kelas"
        :options="['X', 'XI', 'XII']"
        name="kelas"
        placeholder="Kelas Berapa Kamu"
        checkmark
      />

      <Message v-if="$form.kelas?.invalid" severity="error" size="small" variant="simple">
        {{ $form.kelas?.error.message }}
      </Message>

      <label for="jurusan">Jurusan</label>
      <InputText
        v-model="userProfile.jurusan"
        name="jurusan"
        type="text"
        placeholder="Masukkan Jurusan"
      />

      <Message v-if="$form.jurusan?.invalid" severity="error" size="small" variant="simple">
        {{ $form.jurusan?.error.message }}
      </Message>

      <CTA type="submit" label="Edit profil" class="mt-auto" />
    </Form>
  </section>

  <section v-else>
    <h1>Pengguna tidak ditemukan!</h1>
    <p>Silahkan refresh jika profil anda tidak muncul.</p>
  </section>

  <Toast />
</template>
