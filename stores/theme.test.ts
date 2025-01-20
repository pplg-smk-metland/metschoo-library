import { describe, it, expect, beforeEach } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useThemeStore } from "./theme"

describe("theme store", () => {
  beforeEach(() => setActivePinia(createPinia()))

  it("stores dark theme by default", () => {
    const { getTheme } = useThemeStore()

    expect(getTheme()).toBe("dark")
  })

  it("can store theme in localStorage", () => {
    const { getTheme, setTheme } = useThemeStore()

    setTheme("light")
    expect(getTheme()).toBe("light")

    setTheme("dark")
    expect(getTheme()).toBe("dark")
  })
})
