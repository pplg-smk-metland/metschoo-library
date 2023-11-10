<script setup>
import { ref } from "vue"
import { RouterLink } from "vue-router"
import { useAuthStore } from "../stores/auth.js"

const authStore = useAuthStore()

const openNavBtn = ref(null)
const closeNavBtn = ref(null)
const navlinks = ref(null)

function openNav() {
  navlinks.value.classList.add("active")
}

function closeNav() {
  navlinks.value.classList.remove("active")
}
</script>

<template>
  <nav>
    <div>
      <img class="logo" src="/logo.svg" alt="Logo Metschoo Library" />
    </div>

    <ul class="nav-links" ref="navlinks">
      <li class="nav-links__header">
        <div>
          <img class="logo" src="/logo.svg" alt="Logo Metschoo Library" />
        </div>
        <button class="nav-btn close" ref="closeNavBtn" @click="closeNav">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </li>
      <li><router-link :to="{ name: 'home' }">Beranda</router-link></li>
      <li><router-link :to="{ name: 'pustaka' }">Pustaka</router-link></li>
      <li><router-link :to="{ name: 'wishlist' }">Wishlist</router-link></li>
      <li><router-link :to="{ name: 'search' }">Search</router-link></li>
      <li v-if="!authStore.session">
        <router-link :to="{ name: 'sign-in' }">Masuk</router-link>
      </li>
      <li v-else><router-link :to="{ name: 'profile' }">Profil</router-link></li>
    </ul>

    <button class="nav-btn open" ref="openNavBtn" @click="openNav">
      <i class="fa-solid fa-bars"></i>
    </button>
  </nav>
</template>

<style>
nav {
  background: var(--primary);
  color: var(--white);
  font-weight: 300;
  padding-inline: 0.5rem;

  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
}

.logo {
  height: 3.5rem;
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

nav a,
.nav-btn {
  color: inherit;
  text-decoration: none;
  padding: 1rem;
  display: block;
  position: relative;
}

nav a.active::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 0.4rem;
  background: var(--nav-link-active);
}

@media (hover: hover) {
  nav a:hover {
    background-color: #1d564c;
  }
}
@media screen and (min-width: 50em) {
  nav a.active::before {
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
