<script setup lang="ts">
import { RouterLink } from "vue-router"

defineProps({
  //@ts-ignore
  ...RouterLink.props,
  isLink: Boolean,
  fill: Boolean,
  danger: Boolean,
})
</script>

<template>
  <RouterLink
    v-bind="$props"
    :class="['btn', 'cta', { 'cta--fill': fill }, { 'cta--danger': danger }]"
    v-if="isLink"
  >
    <slot />
  </RouterLink>

  <button :class="['btn', 'cta', { 'cta--fill': fill }, { 'cta--danger': danger }]" v-else>
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
