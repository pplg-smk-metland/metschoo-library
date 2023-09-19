<script setup>
const props = defineProps({
  isButton: Boolean,
  fill: Boolean,
})
</script>

<template>
  <button v-if="isButton" :class="['cta', { 'cta--fill': fill }]">
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

.cta--fill {
  background: var(--primary);
  color: var(--white);
}
</style>
