import { ref } from "vue"
import type { Theme } from "@/types"

export const useThemeStore = defineStore("theme", () => {
  const THEME_KEY = "ml-app-theme"
  const theme = ref<Theme>()

  function getTheme(): Theme {
    const storedTheme = localStorage.getItem(THEME_KEY) || "dark"
    return storedTheme as Theme
  }

  function setTheme(targetTheme: Theme) {
    localStorage.setItem(THEME_KEY, targetTheme)
    theme.value = targetTheme
  }

  return { theme, getTheme, setTheme }
})
