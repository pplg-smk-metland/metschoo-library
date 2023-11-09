<script setup>
const props = defineProps({
  isButton: Boolean,
  fill: Boolean,
})
</script>

<template>
  <button v-if="isButton" :class="['btn', 'cta', { 'cta--fill': fill }]">
    <slot />
  </button>

  <a v-else href="#">
    <slot />
  </a>
</template>

<style scoped>
.cta {
  outline: 2px solid var(--primary);
}

.cta:hover,
.cta:focus-visible {
  background: var(--dark-grey);
}

.cta--fill {
  background: var(--primary);
  color: var(--white);
}

.cta--fill:is(:hover, :focus-visible) {
  background: var(--secondary-100);
  color: var(--white);
}
</style>
