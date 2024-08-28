<script setup lang="ts">
interface Props {
  heading: string
}

defineProps<Props>()
</script>

<template>
  <header class="flex flex-col items-start gap-1">
    <h1>{{ heading }}</h1>
    <slot />
  </header>
</template>
