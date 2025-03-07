<script setup lang="ts">
import { getPeminjamanData } from "~/lib/peminjaman"
import IconArrowRight from "~icons/mdi/arrow-right"
import { Tab, Tabs, TabList, Badge, TabPanels, TabPanel, Toast, useToast } from "primevue"
import type { Database } from "~/types/database.types"

useHead({
  title: "Profil",
})

definePageMeta({
  layout: "default",
  middleware: "profil",
})

const authStore = useAuthStore()
const user = useSupabaseUser()
const toast = useToast()

const { data: profile } = useAsyncData(async () => await authStore.getProfile(user.value!.id))

const { data: peminjaman } = useAsyncData(async () => await getPeminjamanData())
const activePeminjaman = computed(() => {
  return peminjaman.value
    ? peminjaman.value.filter((data) => ![5, 6, 7].includes(data.peminjaman_detail[0]?.state_id))
    : []
})

const pastPeminjaman = computed(() =>
  peminjaman.value
    ? peminjaman.value.filter(({ peminjaman_detail }) =>
        [5, 6, 7].includes(peminjaman_detail[0].state_id)
      )
    : []
)

/** daftar buku yang belum dikonfirmasi */
const bukuBlumDikonfirmasi = computed(() => {
  return activePeminjaman.value?.filter(
    ({ peminjaman_detail }) => peminjaman_detail[0]?.state_id === 1
  )
})

const bukuSudahDikonfirmasi = computed(() => {
  return activePeminjaman.value?.filter(
    ({ peminjaman_detail }) => peminjaman_detail[0]?.state_id === 2
  )
})

const supabase = useSupabaseClient<Database>()
const { data: presence } = await useAsyncData(async () => {
  if (!user.value) return

  const { data, error } = await supabase
    .from("kunjungan")
    .select("event, timestamp")
    .eq("user_id", user.value.id)
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(error)
  }

  return data
})

const isPresent = computed(() => {
  return presence.value && presence.value.event === "check_in"
})

/*
 * returns true if user already clicked the presency button
 * less than 5 mins ago
 */
const isDelayed = computed(() => {
  if (!presence.value) return false

  const delta = new Date().getTime() - new Date(presence.value.timestamp).getTime()
  return delta <= 1000 * 60 * 5 // less than 5 mins
})

async function enterLibrary() {
  try {
    const newEvent = isPresent.value ? "check_out" : "check_in"
    const { data, error } = await supabase
      .from("kunjungan")
      .insert({
        event: newEvent,
      })
      .select("event, timestamp")
      .single()

    if (error) throw error

    const toastDetail = isPresent.value
      ? "Sukses keluar perpustakaan, semoga hari mu menyenangkan."
      : "Sukses masuk perpustakaan, selamat beraktivitas."

    toast.add({
      severity: "success",
      summary: "Sukses!",
      detail: toastDetail,
      life: 5000,
    })

    presence.value = data
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Gagal!",
      detail: "Terjadi kesalahan saat masuk perpustakaan. Coba lagi nanti.",
      life: 5000,
    })
    console.error(error)
  }
}
</script>

<template>
  <div class="grid gap-4 grid-cols-1 lg:grid-cols-12 lg:grid-flow-dense max-w-screen-2xl mx-auto">
    <PageHeader heading="Profil" class="col-span-full flex-col">
      <p>Selamat Datang di Profil kamu</p>
    </PageHeader>

    <section class="main-section flex gap-4 col-span-full lg:col-span-5">
      <figure class="profile__picture-container">
        <img
          class="basis-32 rounded-lg size-32 aspect-square cover"
          src="@/assets/profilepicture.svg"
          width="150"
          height="150"
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

    <section class="main-section col-span-full lg:col-span-4">
      <h3>✨ Zona Kunjunganmu! ✨</h3>
      <p v-if="isPresent">Wow! kamu lagi nongkrong di perpustakaan sekarang! 📚</p>
      <p v-else>Oh tidak! Kayaknya kamu lagi jauh dari buku-buku favoritmu. 😢</p>

      <form class="mt-4 flex flex-col gap-4 align-start" @submit.prevent="enterLibrary">
        <label v-if="isDelayed" class="text-gray-500">
          Tunggu beberapa saat lagi ya, kamu hanya bisa keluar/masuk perpustakaan setiap 5 menit.
        </label>

        <CTA
          v-else
          :label="isPresent ? 'keluar perpustakaan' : 'masuk perpustakaan'"
          type="submit"
        />
      </form>
    </section>

    <section class="main-section col-span-full lg:col-span-9">
      <p v-if="peminjaman?.length === 0">Ga ada buku yang dipinjam</p>

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
              <ProfileBook v-for="data in bukuBlumDikonfirmasi" :key="data.id" :data="data" />
            </ul>
          </TabPanel>

          <TabPanel value="sudah-dikonfirmasi">
            <ul class="book-list">
              <li v-if="!bukuSudahDikonfirmasi?.length">ga ada bukunya nih</li>
              <ProfileBook v-for="data in bukuSudahDikonfirmasi" :key="data.id" :data="data" />
            </ul>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </section>

    <aside
      class="main-section rounded-lg col-span-full lg:row-span-2 lg:col-span-3 flex flex-col gap-8"
    >
      <header>
        <h2 class="text-xl font-bold">Riwayat Peminjaman</h2>
        <CTA
          link
          as="router-link"
          to="/peminjaman"
          class="hover:text-underline px-0"
          label="lihat selengkapnya"
        >
          <IconArrowRight size="20" class="order-last" />
        </CTA>
      </header>

      <ul class="flex flex-col gap-4">
        <li v-if="!pastPeminjaman?.length" class="message">bukunya ga ada ges</li>
        <ProfileHistoryCard
          v-for="data in pastPeminjaman"
          :key="data.id"
          class="history-list__item"
          :data="data"
        />
      </ul>
    </aside>
  </div>
  <Toast />
</template>
