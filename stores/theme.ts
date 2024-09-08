import { ref } from "vue"
import { type Theme } from "@/types"

export const useThemeStore = defineStore("theme", () => {
  const THEME_KEY = "ml-app-theme"
  const theme: Ref<Theme> = ref("dark")

  function getTheme(): Theme {
    const storedTheme = ref(localStorage.getItem(THEME_KEY) || "dark")
    return storedTheme.value as Theme
  }

  function setTheme(targetTheme: Theme) {
    localStorage.setItem(THEME_KEY, targetTheme)
    theme.value = targetTheme
  }

  return { theme, getTheme, setTheme }
})
