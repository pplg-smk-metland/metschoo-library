<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useAuthStore } from "@/stores/auth"
import { supabase } from "@/lib/supabase"
import { kembalikanBukuDariISBN } from "@/lib/utils"
import type { Pengguna } from "@/types"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import ProfileBook from "@/components/profile/ProfileBook.vue"
import ProfileHistoryBook from "@/components/profile/ProfileHistoryBook.vue"
import CTA from "@/components/CTA.vue"

const authStore = useAuthStore()

const pengguna = ref<Pengguna | null>(null)

onMounted(async () => {
  const data = await authStore.getProfile()
  pengguna.value = data
})

// ambil buku yang dipinjam
const pinjamQuery = supabase
  .from("peminjaman")
  .select(`no_isbn, tgl_pinjam, tgl_kembali, state_id, buku(*)`)

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

const riwayatQuery = supabase.from("distinct_riwayat").select("*")

export type Riwayat = QueryData<typeof riwayatQuery>
const riwayat = ref<Riwayat | never>([])

async function ambilRiwayatPeminjaman() {
  try {
    isLoading.value = true
    const { data, error } = await riwayatQuery

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
  riwayat.value = await ambilRiwayatPeminjaman()
})

interface KembalikanBuku {
  judul: string
  no_isbn: string
  jumlah_exspl: number
}

async function kembalikanBuku({ judul, no_isbn, jumlah_exspl }: KembalikanBuku) {
  if (!confirm(`beneran mau kembalikan buku ${judul}?`)) return

  try {
    await kembalikanBukuDariISBN(no_isbn, jumlah_exspl)
    bukuYangDipinjam.value = bukuYangDipinjam.value!.filter(({ buku }) => buku?.no_isbn !== no_isbn)
  } catch (err) {
    console.error((err as PostgrestError).message)
  }
}
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

        <div class="profile__details" v-if="pengguna">
          <h2>{{ pengguna.nama }}</h2>
          <p>{{ pengguna.kelas }} - {{ pengguna.jurusan }}</p>
          <p>{{ pengguna.email }}</p>

          <div class="button-container">
            <CTA :to="{ name: 'profile-edit' }" class="btn cta" :is-link="true">Edit profil</CTA>
            <CTA :to="{ name: 'profile-security' }" class="btn cta" :is-link="true"> Keamanan </CTA>
          </div>
        </div>

        <div class="not-found" v-else>
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
          <ProfileBook
            v-for="data in bukuBlumDikonfirmasi"
            :key="data.no_isbn"
            :data="data"
            @kembalikan-buku="
              kembalikanBuku({
                judul: data.buku!.judul,
                no_isbn: data.buku!.no_isbn,
                jumlah_exspl: data.buku!.jumlah_exspl,
              })
            "
          />
        </ul>

        <h3>Sudah dikonfirmasi</h3>

        <ul class="book-list">
          <li v-if="!bukuSudahDikonfirmasi.length">ga ada bukunya nih</li>
          <ProfileBook
            v-for="data in bukuSudahDikonfirmasi"
            :key="data.no_isbn"
            :data="data"
            @kembalikan-buku="
              kembalikanBuku({
                judul: data.buku!.judul,
                no_isbn: data.no_isbn,
                jumlah_exspl: data.buku!.jumlah_exspl,
              })
            "
          />
        </ul>
      </section>
    </div>

    <aside class="history">
      <h2>Riwayat Peminjaman</h2>

      <ul class="history-list">
        <li v-if="!riwayat.length" class="message">bukunya ga ada ges</li>
        <ProfileHistoryBook
          class="history-list__item"
          v-for="{ buku } in riwayat"
          :key="buku?.no_isbn"
          :buku="buku"
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
