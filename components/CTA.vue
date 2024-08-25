<script setup lang="ts">
import Button from "primevue/button"

interface Props {
  fill?: boolean
  label: string
  link?: boolean
}

defineProps<Props>()
</script>

<template>
  <Button
    :label="label"
    :class="[
      'px-8 py-4 select-none active:translate-y-1',
      { 'hover:bg-primary-200': !fill },
      { 'bg-primary-500 text-primary-contrast hover:text-primary': fill },
    ]"
    :link="link"
    outlined
  />
</template>
