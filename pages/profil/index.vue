<script setup lang="ts">
import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import { getPeminjamanData } from "~/lib/peminjaman"
import type { Database } from "~/types/database.types"

useHead({
  title: "Profil",
})

definePageMeta({
  layout: "default",
  middleware: "profil",
})

const supabase = useSupabaseClient<Database>()

const historyQuery = supabase.from("peminjaman_history").select("*")
export type History = QueryData<typeof historyQuery>

async function getPeminjamanHistory() {
  try {
    const { data, error } = await historyQuery

    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return []
  }
}

const authStore = useAuthStore()
const user = useSupabaseUser()

const { data: profile } = useAsyncData(async () => await authStore.getProfile(user.value!.id))

const { data: peminjaman } = useAsyncData(async () => {
  const [history, dataPeminjaman] = await Promise.all([getPeminjamanHistory(), getPeminjamanData()])
  return { history, dataPeminjaman }
})

/** daftar buku yang belum dikonfirmasi */
const bukuBlumDikonfirmasi = computed(() => {
  return peminjaman.value?.dataPeminjaman.filter(({ state_id }) => state_id === 1)
})

const bukuSudahDikonfirmasi = computed(() => {
  return peminjaman.value?.dataPeminjaman.filter(({ state_id }) => state_id === 2)
})
</script>

<template>
  <div class="grid gap-4 grid-cols-1 lg:grid-cols-12 lg:grid-flow-dense max-w-screen-2xl mx-auto">
    <PageHeader heading="Profil" class="col-span-full">
      <p>Selamat Datang di Profil kamu</p>
    </PageHeader>

    <section class="main-section flex gap-4 col-span-full lg:col-span-9">
      <figure class="profile__picture-container">
        <img
          class="profile-picture"
          src="@/assets/profilepicture.svg"
          width="300"
          height="300"
          alt="Foto kamu disini"
        />
      </figure>

      <div class="profile__details">
        <h2 class="text-lg font-bold">{{ profile?.nama }}</h2>
        <p>{{ profile?.kelas }} - {{ profile?.jurusan }}</p>
        <p>{{ profile?.email }}</p>

        <div class="button-container">
          <NuxtLink to="/profil/edit">
            <CTA label="Edit profil" />
          </NuxtLink>
          <NuxtLink to="/profil/keamanan">
            <CTA label="Keamanan" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="main-section col-span-full lg:col-span-9">
      <p v-if="peminjaman?.dataPeminjaman.length === 0">Ga ada buku yang dipinjam</p>

      <Tabs v-else value="belum-dikonfirmasi">
        <TabList>
          <Tab value="belum-dikonfirmasi" class="flex gap-2 items-center">
            Belum dikonfirmasi
            <Badge
              v-show="bukuBlumDikonfirmasi?.length"
              :value="bukuBlumDikonfirmasi?.length"
              severity="secondary"
              size="small"
            />
          </Tab>

          <Tab value="sudah-dikonfirmasi" class="flex gap-2 items-center">
            Sudah dikonfirmasi
            <Badge
              v-show="bukuSudahDikonfirmasi?.length"
              :value="bukuSudahDikonfirmasi?.length"
              severity="secondary"
              size="small"
            />
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="belum-dikonfirmasi">
            <ul class="book-list">
              <li v-if="!bukuBlumDikonfirmasi?.length">ga ada bukunya nih</li>
              <ProfileBook v-for="data in bukuBlumDikonfirmasi" :key="data.no_isbn" :data="data" />
            </ul>
          </TabPanel>

          <TabPanel value="sudah-dikonfirmasi">
            <ul class="book-list">
              <li v-if="!bukuSudahDikonfirmasi?.length">ga ada bukunya nih</li>
              <ProfileBook v-for="data in bukuSudahDikonfirmasi" :key="data.no_isbn" :data="data" />
            </ul>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </section>

    <aside class="main-section rounded-lg col-span-full lg:row-span-3 lg:col-span-3">
      <h2 class="text-xl font-bold mb-8">Riwayat Peminjaman</h2>

      <ul class="flex flex-col gap-4">
        <li v-if="!peminjaman?.history.length" class="message">bukunya ga ada ges</li>
        <ProfileHistoryBook
          v-for="data in peminjaman?.history"
          :key="data.buku?.no_isbn"
          class="history-list__item"
          :data="data"
        />
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.profile-picture {
  flex-basis: 35ch;
}
</style>
