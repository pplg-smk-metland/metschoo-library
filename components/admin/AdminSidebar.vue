<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"

import IconArrowDownDrop from "~icons/mdi/arrow-down-drop"
import PanelMenu from "primevue/panelmenu"

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
    ],
  },
])
</script>

<template>
  <nav class="p-4 dark:bg-slate-900 sticky top-8 sidebar">
    <PanelMenu :model="sidebarLinks">
      <template #item="{ item }">
        <NuxtLink
          v-if="item.route"
          class="sidebar__link"
          :to="`/admin/${item.route !== 'admin' ? item.route : ''}`"
        >
          {{ item.label }}
        </NuxtLink>
        <button v-else class="sidebar__link" @click="item.isExpanded = !item.isExpanded">
          <span>{{ item.label }}</span>
          <IconArrowDownDrop :class="['icon', { rotate: item.isExpanded }]" />
        </button>
      </template>
    </PanelMenu>
  </nav>
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
