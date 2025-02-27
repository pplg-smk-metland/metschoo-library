<script setup lang="ts">
interface Props {
  heading: string
  class?: string | string[]
}

const { class: className } = defineProps<Props>()
</script>

<template>
  <header
    :class="[
      'flex items-start gap-2',
      {
        'flex-col': !className,
      },
      className,
    ]"
  >
    <h1>{{ heading }}</h1>
    <slot />
  </header>
</template>
