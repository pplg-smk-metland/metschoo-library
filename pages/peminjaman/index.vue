<script setup lang="ts">
import type { QueryData } from "@supabase/supabase-js"
import IconArrowLeft from "~icons/mdi/arrow-left"
import { Tabs, Tab, TabList, TabPanel, TabPanels } from "primevue"

definePageMeta({
  layout: "default",
  middleware: "auth",
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const _peminjamanQuery = supabase
  .from("peminjaman")
  .select("*, buku(no_isbn, judul, penulis, image), peminjaman_detail(*, peminjaman_state(name))")
  .order("tgl_pinjam", { ascending: false })
  .order("created_at", { referencedTable: "peminjaman_detail", ascending: false })

export type PeminjamanItem = QueryData<typeof _peminjamanQuery>

const { data: peminjamans } = await useAsyncData(
  "peminjaman",
  async () => {
    const { data, error } = await _peminjamanQuery
    if (error) {
      console.error(error)
      return []
    }

    return data
  },
  { watch: [user.value!] }
)

const activeStates = [1, 2, 4]

const historicalPeminjaman = computed(() => {
  return peminjamans.value
    ? peminjamans.value.filter((data) => {
        const latestStateId = data.peminjaman_detail[0].state_id
        return !activeStates.includes(latestStateId)
      })
    : []
})

const activePeminjaman = computed(() => {
  return peminjamans.value
    ? peminjamans.value.filter((data) => {
        const latestStateId = data.peminjaman_detail[0].state_id
        return activeStates.includes(latestStateId)
      })
    : []
})
</script>

<template>
  <div class="max-w-4xl mx-auto grid gap-4">
    <PageHeader heading="Peminjaman">
      <CTA as="router-link" link to="/profil" label="Kembali" class="order-first px-0">
        <IconArrowLeft />
      </CTA>
    </PageHeader>

    <section class="main-section">
      <Tabs value="aktif">
        <TabList>
          <Tab value="aktif">Aktif</Tab>
          <Tab value="selesai">Selesai</Tab>
          <Tab value="semua">Semua</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="aktif">
            <ul>
              <PeminjamanItem
                v-for="peminjaman in activePeminjaman"
                :key="peminjaman.id"
                :peminjaman="peminjaman"
              />

              <li v-if="!peminjamans || !peminjamans.length">belum ada peminjaman.</li>
            </ul>
          </TabPanel>

          <TabPanel value="selesai">
            <ul>
              <PeminjamanItem
                v-for="peminjaman in historicalPeminjaman"
                :key="peminjaman.id"
                :peminjaman="peminjaman"
              />

              <li v-if="!peminjamans || !peminjamans.length">belum ada peminjaman.</li>
            </ul>
          </TabPanel>

          <TabPanel value="semua">
            <ul>
              <PeminjamanItem
                v-for="peminjaman in peminjamans"
                :key="peminjaman.id"
                :peminjaman="peminjaman"
              />

              <li v-if="!peminjamans || !peminjamans.length">belum ada peminjaman.</li>
            </ul>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </section>
  </div>
</template>

<style scoped>
.peminjaman-item {
  grid-template-columns: 20ch 1fr;
  grid-template-rows: min-content 1fr;
}

.detail-item {
  display: grid;
  grid-template-columns: 1rem 1fr;
  column-gap: 1rem;
}

.detail-item::before,
.detail-item::after {
  content: "";

  display: block;
  position: relative;
  justify-self: center;
}

.detail-item::before {
  @apply bg-surface-400/50 dark:bg-blue-100/50;

  border-radius: 100px;
  aspect-ratio: 1/1;
  order: -2;
  padding: 0.5rem;
  height: 100%;
}

.detail-item::after {
  @apply bg-surface-300 dark:bg-surface-600;

  order: -1;
  width: 0.2rem;
  height: 100%;
}

.detail-item:last-of-type::after {
  background: transparent;
}
</style>
