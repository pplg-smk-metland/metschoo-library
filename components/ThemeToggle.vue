<script setup lang="ts">
import IconMoonCrescent from "~icons/mdi/moon-and-stars"
import IconSun from "~icons/mdi/weather-sunny"
import type { Theme } from "@/types"

const themeStore = useThemeStore()

function toggleTheme(theme: Theme) {
  themeStore.setTheme(theme === "light" ? "dark" : "light")
}
</script>

<template>
  <button
    :title="`mode ${themeStore.theme}`"
    data-testid="theme-toggle"
    @click="toggleTheme(themeStore.theme ?? 'light')"
  >
    <IconMoonCrescent v-if="themeStore.theme === 'dark'" />
    <IconSun v-else />
  </button>
</template>
