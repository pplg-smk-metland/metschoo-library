<script setup lang="ts">
import MdiHamburgerMenu from "~icons/mdi/hamburger-menu"
import MdiClose from "~icons/mdi/close"

const openNavBtn = ref(null)
const closeNavBtn = ref(null)
const navlinks = ref<HTMLUListElement | null>(null)

function openNav() {
  navlinks.value?.classList.remove("-translate-y-full")
  navlinks.value?.classList.add("-translate-y-0")
}

function closeNav() {
  navlinks.value?.classList.add("-translate-y-full")
  navlinks.value?.classList.remove("-translate-y-0")
}

const user = useSupabaseUser()
const isAdmin = computed(() =>
  user.value ? user.value.app_metadata?.role === "super-admin" : false
)
</script>

<template>
  <nav
    class="flex justify-between items-center sticky top-0 bg-primary dark:bg-surface-700/90 z-10 shadow-md backdrop-blur-md navbar"
  >
    <div class="logo">
      <img src="/logo.svg" alt="Logo Metschoo Library" class="h-14" />
    </div>

    <ul
      ref="navlinks"
      class="flex flex-col absolute top-0 left-0 -translate-y-full w-full md:flex-row md:relative md:translate-y-0 md:w-auto bg-surface-700 md:bg-transparent transition-transform z-10"
      data-testid="nav-links"
      @click="closeNav"
    >
      <li class="flex justify-between md:hidden md:appearance-none">
        <div class="logo">
          <NuxtLink to="/">
            <img src="/logo.svg" alt="Logo Metschoo Library" height="50" class="w-16" />
          </NuxtLink>
        </div>
        <button
          ref="closeNavBtn"
          class="nav-btn md:hidden"
          data-testid="burger-close"
          @click="closeNav"
        >
          <MdiClose />
        </button>
      </li>
      <li>
        <ClientOnly fallback-tag="span">
          <ThemeToggle class="nav-link text-lg" />

          <template #fallback>
            <span class="nav-link">Memuat tema...</span>
          </template>
        </ClientOnly>
      </li>
      <li>
        <NuxtLink class="nav-link" to="/"> Beranda </NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-link" to="/pustaka"> Pustaka </NuxtLink>
      </li>
      <li>
        <NuxtLink class="nav-link" to="/wishlist"> Wishlist </NuxtLink>
      </li>

      <template v-if="user">
        <template v-if="!isAdmin">
          <li>
            <NuxtLink class="nav-link" to="/request"> Request Buku </NuxtLink>
          </li>

          <li>
            <NuxtLink to="/profil" class="nav-link bg-primary-700"> Profil </NuxtLink>
          </li>
        </template>

        <li v-else>
          <NuxtLink to="/admin" class="nav-link bg-primary-700"> Admin </NuxtLink>
        </li>
      </template>

      <li v-else>
        <NuxtLink to="/login" class="nav-link bg-primary-700"> Masuk </NuxtLink>
      </li>
    </ul>

    <button ref="openNavBtn" class="nav-btn md:hidden" data-testid="burger-open" @click="openNav">
      <MdiHamburgerMenu />
    </button>
  </nav>
</template>

<style scoped>
.navbar {
  grid-area: navbar;
}

.nav-link {
  display: block;
}

.nav-link,
.nav-btn {
  @apply text-gray-300/90 hover:text-gray-100 dark:hover:bg-surface-800 transition-colors p-4 relative;
}

.nav-link::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.2rem;
  transition: opacity 200ms ease;
  opacity: 0;
  background: var(--p-primary-700);

  @media screen and (max-width: 50em) {
    width: 0.2rem;
    height: 100%;
  }
}

.nav-link.router-link-active::before {
  opacity: 1;
}
</style>
