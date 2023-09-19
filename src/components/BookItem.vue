<script setup>
const props = defineProps({
  buku: Object,
})
</script>

<template>
  <li class="buku">
    <h2 class="buku__judul">{{ buku.judul }}</h2>
    <p>{{ buku.no_isbn }}</p>
    <div class="metadata">
      <p class="buku__penulis">{{ buku.penulis }}</p>
      <p class="buku__tahun-terbit">{{ buku.tahun_terbit }}</p>
    </div>
  </li>
</template>

<style>
.buku {
  outline: 2px solid #444;
  padding: 2rem;
  transition: background-color 200ms ease;
}

.buku__judul .metadata {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata > * {
  margin: 0;
}

.buku__penulis {
  font-size: 1.2rem;
  font-weight: bold;
}

.buku__tahun-terbit {
  font-size: 0.85rem;
}

@media (hover: hover) {
  .buku:hover {
    background: var(--dark-grey);
  }
}
</style>
