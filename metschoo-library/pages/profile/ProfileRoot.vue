<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useAuthStore } from "@/stores/auth"
import { supabase } from "@/supabase"
import type { Pengguna } from "@/types"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import ProfileBook from "@/components/profile/ProfileBook.vue"
import ProfileHistoryBook from "@/components/profile/ProfileHistoryBook.vue"
import CTA from "@/components/CTA.vue"

const authStore = useAuthStore()

const pengguna = ref<Pengguna | null>(null)

onMounted(async () => {
  if (!authStore.session) return
  const data = await authStore.getProfile(authStore.session)
  pengguna.value = data
})

// ambil buku yang dipinjam
const pinjamQuery = supabase
  .from("peminjaman")
  .select(`no_isbn, tgl_pinjam, tgl_kembali, tenggat_waktu, state_id, buku(*)`)

export type BukuPinjam = QueryData<typeof pinjamQuery>
const bukuYangDipinjam = ref<BukuPinjam>([])

/** daftar buku yang belum dikonfirmasi */
const bukuBlumDikonfirmasi = computed(() => {
  return bukuYangDipinjam.value.filter(({ state_id }) => state_id === 1)
})

const bukuSudahDikonfirmasi = computed(() => {
  return bukuYangDipinjam.value.filter(({ state_id }) => state_id === 2)
})

const isLoading = ref(false)

async function ambilBukuYangDipinjam() {
  try {
    isLoading.value = true
    const { data, error } = await pinjamQuery

    if (error) throw error
    return data
  } catch (err) {
    console.error((err as PostgrestError).message)
    return []
  } finally {
    isLoading.value = false
  }
}

const historyQuery = supabase.from("peminjaman_history").select("*")

export type History = QueryData<typeof historyQuery>
const history = ref<History | never>([])

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

onMounted(async () => {
  bukuYangDipinjam.value = await ambilBukuYangDipinjam()
  history.value = await getPeminjamanHistory()
})
</script>

<template>
  <main class="wrapper">
    <div class="profile-view">
      <header>
        <h1>Profil</h1>
        <p>Selamat Datang di Profil kamu</p>
      </header>

      <section class="profile">
        <figure class="profile__picture-container">
          <img
            class="profile-picture"
            src="@/assets/profilepicture.svg"
            width="300"
            height="300"
            alt="Foto kamu disini"
          />
        </figure>

        <div v-if="pengguna" class="profile__details">
          <h2>{{ pengguna.nama }}</h2>
          <p>{{ pengguna.kelas }} - {{ pengguna.jurusan }}</p>
          <p>{{ pengguna.email }}</p>

          <div class="button-container">
            <NuxtLink :to="{ name: 'profile-edit' }">
              <CTA label="Edit profil" />
            </NuxtLink>
            <Nuxtlink :to="{ name: 'profile-security' }">
              <CTA label="Keamanan" />
            </Nuxtlink>
          </div>
        </div>

        <div v-else class="not-found">
          <h1>Pengguna tidak ditemukan!</h1>
          <p>Silahkan coba beberapa saat lagi, atau hubungi admin Metschoo Library.</p>
        </div>

        <RouterView />
      </section>

      <section>
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
    </div>

    <aside class="history">
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
  </main>
</template>

<style scoped>
.wrapper {
  padding: 0;
  display: grid;
  grid-template-columns: 3fr 1fr;
}

.profile-view {
  padding: 2rem;
}

.history {
  padding: 2rem 1.5rem;
  outline: 2px solid var(--neutral, --grey);
}

.history h2 {
  text-align: center;
}

@media screen and (max-width: 50em) {
  .wrapper {
    grid-template-columns: 1fr;
  }

  .history h2 {
    text-align: center;
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
