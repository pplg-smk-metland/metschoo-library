<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"
import { Popover } from "primevue"
import IconArrowDownDrop from "~icons/mdi/arrow-down-drop"
import PanelMenu from "primevue/panelmenu"
import type { Pengguna } from "@/types"

interface Props {
  profile: Pengguna | null
}

const props = defineProps<Props>()

const router = useRouter()
const authStore = useAuthStore()

async function signOut() {
  await authStore.handleSignOut()
  router.push("/")
}

interface SidebarLink {
  label: string
  items?: SidebarSubLink[]
  route?: RouteLocationRaw
  isExpanded?: boolean
}

interface SidebarSubLink {
  label: string
  route: RouteLocationRaw
}

const sidebarLinks = ref<SidebarLink[]>([
  {
    label: "Dashboard",
    route: "admin",
  },
  {
    label: "Manajemen pengguna",
    route: "pengguna",
  },
  {
    label: "Peminjaman",
    route: "peminjaman",
  },
  {
    label: "buku",
    isExpanded: false,
    items: [
      {
        label: "Data buku",
        route: "buku/",
      },
      {
        label: "Tambah buku",
        route: "buku/tambah",
      },
      {
        label: "Kategori buku",
        route: "buku/kategori",
      },
    ],
  },
])

const popover = ref()

const toggle = (e: Event) => {
  popover.value.toggle(e)
}
</script>

<template>
  <section class="p-4 sticky top-8 sidebar flex flex-col gap-4">
    <header class="grid grid-cols-[1fr,5rem]">
      <h2 class="font-bold text-lg m-0">Admin</h2>
      <p class="order-last m-0">
        {{ props.profile?.email }}
      </p>
      <CTA label="toggle" class="row-span-2" @click="toggle">
        <IconArrowDownDrop class="text-lg" />
      </CTA>
    </header>

    <Popover ref="popover">
      <CTA label="Keluar akun" severity="danger" @click="signOut" />
    </Popover>

    <PanelMenu :model="sidebarLinks">
      <template #item="{ item }">
        <NuxtLink
          v-if="item.route"
          class="sidebar__link"
          :to="`/admin/${item.route !== 'admin' ? item.route : ''}`"
        >
          {{ item.label }}
        </NuxtLink>
        <button v-else class="sidebar__link w-full" @click="item.isExpanded = !item.isExpanded">
          <span>{{ item.label }}</span>
          <IconArrowDownDrop
            :class="['icon transition-transform', { 'rotate-180': item.isExpanded }]"
          />
        </button>
      </template>
    </PanelMenu>
  </section>
</template>

<style scoped>
.sidebar {
  grid-area: sidebar;
}

.sidebar .icon {
  font-size: 1.2rem;
}

.sidebar__link {
  @apply p-4 flex justify-between hover:text-slate-900 dark:hover:text-white;
}

.sidebar__link.router-link-exact-active {
  @apply border-l-4 border-l-primary dark:text-white;
}
</style>
