<script setup lang="ts">
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

const user = useSupabaseUser()
</script>

<template>
  <nav class="navbar">
    <div class="logo">
      <img src="/logo.svg" alt="Logo Metschoo Library" />
    </div>

    <ul ref="navlinks" class="nav-links">
      <li class="nav-links__header">
        <div class="logo">
          <NuxtLink to="/">
            <img src="/logo.svg" alt="Logo Metschoo Library" />
          </NuxtLink>
        </div>
        <button ref="closeNavBtn" class="nav-btn close" @click="closeNav">
          <i class="fa-solid fa-xmark" />
        </button>
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
      <li v-if="!user">
        <NuxtLink to="/login" class="nav-link nav-link--cta"> Masuk </NuxtLink>
      </li>
      <li v-else>
        <NuxtLink to="/profil" class="nav-link nav-link--cta"> Profil </NuxtLink>
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
