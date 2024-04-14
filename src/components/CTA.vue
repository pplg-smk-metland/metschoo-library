<script setup>
defineProps({
  isLink: Boolean,
  fill: Boolean,
  danger: Boolean,
})
</script>

<template>
  <routerLink v-if="isLink">
    <slot />
  </routerLink>

  <button v-else :class="['btn', 'cta', { 'cta--fill': fill }, { 'cta--danger': danger }]">
    <slot />
  </button>
</template>

<style scoped>
.cta {
  outline: 2px solid var(--primary);
  text-align: center;
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

.cta--danger {
  background: var(--color-danger);
  color: var(--white);
}

.cta:disabled {
  background: var(--dark-grey);
}
</style>
