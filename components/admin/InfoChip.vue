<script setup lang="ts">
interface Props {
  data: unknown
  label: string
  to: string
}

defineProps<Props>()
</script>

<template>
  <li>
    <router-link
      :to="`/admin/${to}`"
      class="block outline outline-1 outline-slate-300 dark:outline-slate-700 hover:outline-slate-500 p-4 rounded-lg"
    >
      <p class="text-2xl font-bold">{{ data }}</p>
      <span>{{ label }}</span>
    </router-link>
  </li>
</template>
