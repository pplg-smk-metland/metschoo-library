<script setup lang="ts">
import type { PostgrestError, QueryData } from "@supabase/supabase-js"
import { getPeminjamanData } from "~/lib/peminjaman"
import type { Pengguna } from "~/types"
import type { Database } from "~/types/database.types"

useHead({
  title: "Profil",
})

definePageMeta({
  layout: "default",
})

const supabase = useSupabaseClient<Database>()

const peminjamanQuery = supabase.from("peminjaman").select("*, buku(*)")
export type PeminjamanData = QueryData<typeof peminjamanQuery>

const bukuYangDipinjam = ref<PeminjamanData>([])

/** daftar buku yang belum dikonfirmasi */
const bukuBlumDikonfirmasi = computed(() => {
  return bukuYangDipinjam.value.filter(({ state_id }) => state_id === 1)
})

const bukuSudahDikonfirmasi = computed(() => {
  return bukuYangDipinjam.value.filter(({ state_id }) => state_id === 2)
})

const isLoading = ref(false)

const historyQuery = supabase.from("peminjaman_history").select("*")
export type History = QueryData<typeof historyQuery>

const history = ref<History>([])

async function getPeminjamanHistory() {
  try {
    isLoading.value = true
    const { data, error } = await historyQuery

    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return []
  } finally {
    isLoading.value = false
  }
}

const authStore = useAuthStore()
const profile = ref<Pengguna | null>()

authStore.$subscribe((mutation, state) => {
  profile.value = state.profile
})

onMounted(async () => {
  history.value = await getPeminjamanHistory()

  bukuYangDipinjam.value = await getPeminjamanData()
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
        <h2>{{ profile?.nama }}</h2>
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
      <h2>Buku yang dipinjam</h2>
      <LoadingSpinner v-if="isLoading" />
      <p v-else-if="!isLoading && bukuYangDipinjam.length === 0">Ga ada buku yang dipinjam</p>

      <h3>Belum dikonfirmasi</h3>
      <ul class="book-list">
        <li v-if="!bukuBlumDikonfirmasi.length">ga ada bukunya nih</li>
        <ProfileBook v-for="data in bukuBlumDikonfirmasi" :key="data.no_isbn" :data="data" />
      </ul>

      <h3>Sudah dikonfirmasi</h3>

      <ul class="book-list">
        <li v-if="!bukuSudahDikonfirmasi.length">ga ada bukunya nih</li>
        <ProfileBook v-for="data in bukuSudahDikonfirmasi" :key="data.no_isbn" :data="data" />
      </ul>
    </section>

    <aside class="main-section rounded-lg col-span-full lg:row-span-3 lg:col-span-3">
      <h2>Riwayat Peminjaman</h2>

      <ul class="history-list">
        <li v-if="!history.length" class="message">bukunya ga ada ges</li>
        <ProfileHistoryBook
          v-for="data in history"
          :key="data.buku?.no_isbn"
          class="history-list__item"
          :data="data"
        />
      </ul>
    </aside>
  </div>
</template>

<style scoped>
@media screen and (max-width: 50em) {
  .wrapper {
    grid-template-columns: 1fr;
  }

  .profile {
    flex-direction: column;
  }
}

.profile {
  display: flex;
  gap: 2rem;
}

.profile-picture {
  flex-basis: 35ch;
}

.profile-form {
  flex-grow: 1;
}

.history-list {
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
