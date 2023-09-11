<script setup>
import { ref } from "vue"
import { RouterLink } from "vue-router"

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
    <div class="logo">ceritanya logo</div>

    <ul class="nav-links" ref="navlinks">
      <li class="nav-links__header">
        <div class="logo">Ceritanya logo</div>
        <button class="nav-btn close" ref="closeNavBtn" @click="closeNav">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </li>
      <li><router-link :to="{ name: 'home' }">Beranda</router-link></li>
      <li><router-link :to="{ name: 'pustaka' }">Pustaka</router-link></li>
      <li><router-link :to="{ name: 'layanan' }">Layanan</router-link></li>
      <li><router-link :to="{ name: 'wishlist' }">Wishlist</router-link></li>
      <li><router-link :to="{ name: 'sign-in' }">Sign in</router-link></li>
    </ul>

    <button class="nav-btn open" ref="openNavBtn" @click="openNav">
      <i class="fa-solid fa-bars"></i>
    </button>
  </nav>
</template>
<style>
nav {
  background: var(--accent);
  padding-inline: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
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
  display: inline-block;
}

@media screen and (min-width: 50em) {
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
