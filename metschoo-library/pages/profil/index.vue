<script setup lang="ts">
import type { Pengguna } from "@/types"
import type { PostgrestError, QueryData } from "@supabase/supabase-js"

import LoadingSpinner from "@/components/LoadingSpinner.vue"
import ProfileBook from "@/components/profile/ProfileBook.vue"
import ProfileHistoryBook from "@/components/profile/ProfileHistoryBook.vue"
import CTA from "@/components/CTA.vue"
import type { Database } from "~/types/supabase"

definePageMeta({
  layout: "profile-edit"
})

const supabase = useSupabaseClient<Database>()
const authStore = useAuthStore()

const pengguna = ref<Pengguna | null>(null)

const router = useRouter()

onMounted(async () => {
  if (!authStore.session) return router.back()
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
  <main class="wrapper"></main>
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
