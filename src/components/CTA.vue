<script setup>
const props = defineProps({
  isButton: Boolean,
})
</script>

<template>
  <button v-if="isButton" class="cta">
    <slot />
  </button>

  <a v-else href="#">
    <slot />
  </a>
</template>

<style scoped>
.cta {
  outline: 2px solid var(--primary);
  padding: 1rem 2rem;
  margin-block: 1rem;
}
</style>
