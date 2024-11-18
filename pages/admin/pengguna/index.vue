<script setup lang="ts">
import type { Database } from "~/types/database.types"

useHead({
  title: "Pengguna",
})

definePageMeta({
  layout: "admin",
})

const supabase = useSupabaseClient<Database>()

const toast = useToast()

const { data: penggunas } = await useAsyncData(async () => {
  const { data, error } = await supabase.from("pengguna").select("*, pengguna_roles(name)")
  if (error) {
    toast.add({
      severity: "error",
      summary: "Gagal mengambil data",
      detail: "Gagal mengambil data pengguna, silahkan coba lagi.",
    })
  }

  if (error) throw error

  return data
})
</script>

<template>
  <PageHeader heading="Manajemen pengguna">
    <p>Temukan pengguna dan kelola data mereka</p>
  </PageHeader>

  <section v-if="!penggunas">
    <p>Tidak ada pengguna di sini.</p>
  </section>

  <section v-else class="main-section">
    <DataTable :value="penggunas" striped-rows>
      <template #header>
        <p>Menampilkan {{ penggunas.length }} pengguna.</p>
      </template>

      <Column header="No">
        <template #body="slotProps">
          {{ penggunas.indexOf(slotProps.data) + 1 }}
        </template>
      </Column>

      <Column header="Nama" field="nama" sortable />
      <Column header="Kelas" field="kelas" sortable />
      <Column header="Jurusan" field="jurusan" />
      <Column header="Role">
        <template #body="slotProps">
          {{ slotProps.data.pengguna_roles.name }}
        </template>
      </Column>

      <Column header="Aksi">
        <template #body="slotProps">
          <NuxtLink :to="`/admin/pengguna/${slotProps.data.user_id}`">
            <CTA label="edit" link />
          </NuxtLink>
        </template>
      </Column>
    </DataTable>
  </section>
</template>
