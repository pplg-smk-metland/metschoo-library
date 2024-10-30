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
    :label="label"
    :class="['select-none active:translate-y-1 focus:none focus-visible:ring-primary']"
    :outlined="!fill"
  >
    <slot />
  </Button>
</template>
