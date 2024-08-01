<script setup lang="ts">
import IconArrowDownDrop from "~icons/mdi/arrow-down-drop"
import { ref } from "vue"
import type { RouteLocationRaw } from "vue-router"

interface SidebarMainLink {
  label: string
  destination: RouteLocationRaw | any
  isExpanded?: boolean
}

interface SidebarSubLink extends SidebarMainLink {
  destination: SidebarMainLink[]
}

type SidebarLink = SidebarMainLink | SidebarSubLink

const sidebarLinks = ref<SidebarLink[]>([
  {
    label: "Dashboard",
    destination: {
      name: "admin",
    },
  },
  {
    label: "Manajemen pengguna",
    destination: { name: "admin-manajemen-pengguna" },
  },
  {
    label: "Peminjaman ",
    destination: { name: "admin-peminjaman" },
  },
  {
    label: "buku",
    isExpanded: false,
    destination: [
      {
        label: "Data buku",
        destination: { name: "admin-data-buku" },
      },
      {
        label: "Tambah buku",
        destination: { name: "admin-tambah-buku" },
      },
    ],
  },
])
</script>

<template>
  <nav class="sidebar">
    <ul class="sidebar__list">
      <li class="sidebar__item" v-for="link in sidebarLinks" :key="link.label">
        <routerLink v-if="!link.destination.length" :to="(link as SidebarMainLink).destination">
          {{ link.label }}
        </routerLink>

        <template v-else>
          <button @click="link.isExpanded = !link.isExpanded">
            {{ link.label }}
            <icon-arrow-down-drop :class="[{ rotate: link.isExpanded }, 'icon']" />
          </button>

          <ul class="sidebar__sub-list" :class="{ expanded: link.isExpanded }">
            <li v-for="sublink in (link as SidebarSubLink).destination" :key="sublink.label">
              <routerLink :to="sublink.destination">{{ sublink.label }}</routerLink>
            </li>
          </ul>
        </template>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar {
  background: var(--primary);
  color: var(--white);
  max-height: 100vh;
  position: sticky;
  top: 3rem;

  grid-area: sidebar;

  display: flex;
  flex-direction: column;
}

.sidebar__item {
  display: flex;
  flex-direction: column;
}

.sidebar__item > * {
  padding: 1rem;
}

.sidebar button {
  display: flex;
  justify-content: space-between;
}

.sidebar button .icon.rotate {
  rotate: -180deg;
  transition: rotate 500ms ease;
}

.sidebar a {
  display: block;
  color: inherit;
  padding: 1rem;
}

.sidebar a:hover {
  background: var(--primary-200);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar__sub-list {
  max-height: 0;
  overflow-y: hidden;
  transition: max-height 200ms ease;
  background: var(--primary-200);
}

.sidebar__sub-list.expanded {
  max-height: 200px;
}

.sidebar__sub-list a {
  padding-block: 0.5rem;
}
</style>
