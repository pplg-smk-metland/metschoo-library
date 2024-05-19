<script setup lang="ts">
import Button from "primevue/button"

defineProps({
  fill: Boolean,
  danger: Boolean,
  label: String,
})
</script>

<template>
  <Button
    :label="label"
    :class="['cta', { 'cta--fill': fill }, { 'cta--danger': danger }]"
  ></Button>
</template>

<style scoped>
.cta {
  border: 2px solid var(--primary);
  text-align: center;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
}

.cta:hover,
.cta:focus-visible {
  background: var(--dark-grey);
}

.cta:active {
  translate: 0 4px;
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
