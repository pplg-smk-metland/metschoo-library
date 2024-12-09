<script setup lang="ts">
import { getPeminjamanData } from "~/lib/peminjaman"
import IconArrowRight from "~icons/mdi/arrow-right"

useHead({
  title: "Profil",
})

definePageMeta({
  layout: "default",
  middleware: "profil",
})

const authStore = useAuthStore()
const user = useSupabaseUser()

const { data: profile } = useAsyncData(async () => await authStore.getProfile(user.value!.id))

const { data: peminjaman } = useAsyncData(async () => await getPeminjamanData())
const history = computed(() => {
  return peminjaman.value ? peminjaman.value.filter((data) => data.tgl_kembali === null) : []
})

/** daftar buku yang belum dikonfirmasi */
const bukuBlumDikonfirmasi = computed(() => {
  return peminjaman.value?.filter(({ peminjaman_detail }) => peminjaman_detail[0].state_id === 1)
})

const bukuSudahDikonfirmasi = computed(() => {
  return peminjaman.value?.filter(({ peminjaman_detail }) => peminjaman_detail[0].state_id === 2)
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

    <aside
      class="main-section rounded-lg col-span-full lg:row-span-3 lg:col-span-3 flex flex-col gap-8"
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
        <li v-if="!peminjaman?.length" class="message">bukunya ga ada ges</li>
        <ProfileHistoryCard
          v-for="data in history"
          :key="data.id"
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
