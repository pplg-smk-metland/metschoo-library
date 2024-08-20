<script setup lang="ts">
import { ref } from "vue"
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
    route: {
      name: "admin",
    },
  },
  {
    label: "Manajemen pengguna",
    route: { name: "admin-manajemen-pengguna" },
  },
  {
    label: "Peminjaman ",
    route: { name: "admin-peminjaman" },
  },
  {
    label: "buku",
    isExpanded: false,
    items: [
      {
        label: "Data buku",
        route: { name: "admin-data-buku" },
      },
      {
        label: "Tambah buku",
        route: { name: "admin-tambah-buku" },
      },
    ],
  },
])
</script>

<template>
  <nav class="sidebar">
    <PanelMenu :model="sidebarLinks">
      <template #item="{ item }">
        <routerLink class="sidebar__link" v-if="item.route" :to="item.route">
          {{ item.label }}
        </routerLink>
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
  flex: 1;
  color: inherit;
  padding: 1rem;

  display: flex;
  justify-content: space-between;
}

.sidebar__link:hover {
  background: var(--primary-200);
  color: var(--white);
}

.sidebar__link.router-link-exact-active {
  background: var(--primary-200);
  border-left: 2px solid var(--white);
  color: var(--white);
}
</style>
