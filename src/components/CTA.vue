<script setup>
const props = defineProps({
  isLink: Boolean,
  fill: Boolean,
})
</script>

<template>
  <a href="#" v-if="isLink">
    <slot />
  </a>

  <button v-else :class="['btn', 'cta', { 'cta--fill': fill }]">
    <slot />
  </button>
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

.cta:disabled {
  background: var(--dark-grey);
}
</style>
