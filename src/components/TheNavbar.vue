<script setup lang="ts">
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { RouterLink } from "vue-router"

const authStore = useAuthStore()

const openNavBtn = ref(null)
const closeNavBtn = ref(null)
const navlinks = ref<HTMLUListElement | null>(null)

function openNav() {
  navlinks.value?.classList.add("active")
}

function closeNav() {
  navlinks.value?.classList.remove("active")
}
</script>

<template>
  <nav class="navbar">
    <div class="logo">
      <img src="/logo.svg" alt="Logo Metschoo Library" />
    </div>

    <ul ref="navlinks" class="nav-links">
      <li class="nav-links__header">
        <div class="logo">
          <router-link :to="{ name: 'home' }">
            <img src="/logo.svg" alt="Logo Metschoo Library" />
          </router-link>
        </div>
        <button ref="closeNavBtn" class="nav-btn close" @click="closeNav">
          <i class="fa-solid fa-xmark" />
        </button>
      </li>
      <li>
        <router-link class="nav-link" :to="{ name: 'home' }"> Beranda </router-link>
      </li>
      <li>
        <router-link class="nav-link" :to="{ name: 'pustaka' }"> Pustaka </router-link>
      </li>
      <li>
        <router-link class="nav-link" :to="{ name: 'wishlist' }"> Wishlist </router-link>
      </li>
      <li v-if="!authStore.session">
        <router-link :to="{ name: 'sign-in' }" class="nav-link nav-link--cta"> Masuk </router-link>
      </li>
      <li v-else>
        <router-link :to="{ name: 'profile' }" class="nav-link nav-link--cta"> Profil </router-link>
      </li>
    </ul>

    <button ref="openNavBtn" class="nav-btn open" @click="openNav">
      <i class="fa-solid fa-bars" />
    </button>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--primary);
  color: var(--white);
  font-weight: 300;
  padding-inline: 0.5rem;
  z-index: 10;

  grid-area: navbar;

  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
}

.logo img {
  height: 3.5rem;
}

.logo a::before {
  display: none;
}

.nav-links {
  background: inherit;
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;

  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  translate: 0 -100%;
  transition: translate 200ms ease;
}

.nav-links.active {
  translate: 0 0;
  z-index: 10;
}

.nav-links__header {
  padding-inline: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-link,
.nav-btn {
  color: inherit;
  text-decoration: none;
  padding: 1rem;
  display: block;
  position: relative;
}

.nav-link--cta {
  background: var(--primary-200);
}

.nav-link.active::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 0.4rem;
  background: var(--nav-link-active);
}

@media (hover: hover) {
  .nav-links a:hover {
    background: var(--primary-200);
  }
}

@media screen and (min-width: 50em) {
  .nav-link.active::before {
    height: 0.4rem;
    width: 100%;
  }

  .nav-links {
    flex-direction: row;
    position: relative;
    translate: 0;
    width: auto;
  }

  .nav-links__header {
    display: none;
  }

  .nav-btn {
    display: none;
  }
}
</style>
