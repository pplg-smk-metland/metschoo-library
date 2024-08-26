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
  <nav class="sidebar">
    <PanelMenu :model="sidebarLinks">
      <template #item="{ item }">
        <NuxtLink
          class="sidebar__link"
          v-if="item.route"
          :to="`/admin/${item.route !== 'admin' ? item.route : ''}`"
        >
          {{ item.label }}
        </NuxtLink>
        <button class="sidebar__link" v-else @click="item.isExpanded = !item.isExpanded">
          <span>{{ item.label }}</span>
          <IconArrowDownDrop :class="['icon', { rotate: item.isExpanded }]" />
        </button>
      </template>
    </PanelMenu>
  </nav>
</template>

<style scoped>
.sidebar {
  background: var(--primary);
  color: var(--pale-white);
  max-height: 100vh;
  position: sticky;
  top: 3rem;

  grid-area: sidebar;

  display: flex;
  flex-direction: column;
}

.sidebar .icon {
  font-size: 1.2rem;
}

.sidebar .icon.rotate {
  rotate: -180deg;
  transition: rotate 500ms ease;
}

.sidebar__link {
  @apply p-4 flex justify-between;
}

.sidebar__link.router-link-exact-active {
  @apply border-l-4 border-l-primary text-white;
}
</style>
