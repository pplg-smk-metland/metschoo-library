<script setup lang="ts">
import { type Theme } from "@/types"

const themeStore = useThemeStore()

function toggleTheme(theme: Theme) {
  themeStore.setTheme(theme === "light" ? "dark" : "light")
}
</script>

<template>
  <button @click="toggleTheme(themeStore.theme)">
    {{ themeStore.theme }}
  </button>
</template>
