<script setup lang="ts">
import Button from "primevue/button"

interface Props {
  fill?: boolean
  label: string
}

defineProps<Props>()
</script>

<template>
  <Button
    :class="[
      'select-none active:translate-y-1 focus:none focus-visible:ring-primary flex items-center gap-2',
    ]"
    :outlined="!fill"
  >
    <slot />
    <span>{{ label }}</span>
  </Button>
</template>
