<template>
  <footer>
    <p>Klrfl, 2023.</p>
    <a href="https://github.com/pplg-smkmetland/metschoo-library">This website on Github</a>
    <router-link :to="{ name: 'admin' }">masuk ke admin</router-link>
  </footer>
</template>

<style>
footer {
  background: #222;
  color: #ddd;
  padding: 2rem;
}

footer a {
  display: block;
}
</style>
