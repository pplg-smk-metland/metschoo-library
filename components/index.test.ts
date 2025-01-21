// @vitest-environment nuxt

import { setActivePinia, createPinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { useThemeStore } from "@/stores/theme"

import { mountSuspended } from "@nuxt/test-utils/runtime"
import { beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import BookItem from "./BookItem.vue"
import TheNavbar from "./TheNavbar.vue"
import ThemeToggle from "./ThemeToggle.vue"
import type { Buku } from "@/types"
import TheHeader from "./TheHeader.vue"
import WishlistBook from "./wishlist/WishlistBook.vue"
import { defaultOptions } from "primevue"

const buku: Buku = {
  judul: "Write tests for modern web applications with Vitest",
  no_isbn: "123-456-789",
  kategori_id: 1,
  alamat_terbit: "Jonggol",
  tahun_terbit: "2024",
  penerbit: "Erlangga",
  penulis: "Efraim",
  image: "dummy/path/to/buku.png",
  jumlah_exspl: 10,
  asal: "sumbangan",
}

describe("BookItem component", () => {
  it("contains judul, penulis, and tahun terbit", async () => {
    const component = await mountSuspended(BookItem, { props: { buku } })
    expect(component.text()).toContain(buku.judul)
    expect(component.text()).toContain(buku.penulis)
    expect(component.text()).toContain(buku.tahun_terbit)
  })
})

describe("WishlistBook component", async () => {
  const component = await mountSuspended(WishlistBook, {
    props: { buku },
  })

  it("renders buku data correctly", () => {
    expect(component.html()).toContain(buku.judul)
    expect(component.html()).toContain(buku.penulis)
    expect(component.html()).toContain(buku.tahun_terbit)
  })

  it("emits pinjamBuku and hapusBuku events correctly", () => {
    const borrowBtn = component.get('[data-testid="buku-borrow"]')
    borrowBtn.trigger("click")
    expect(component.emitted()).toHaveProperty("pinjamBuku")

    const deleteBtn = component.get('[data-testid="buku-delete"]')
    deleteBtn.trigger("click")
    expect(component.emitted()).toHaveProperty("hapusBuku")
  })
})

describe("TheNavbar component", async () => {
  const navbar = await mountSuspended(TheNavbar, {
    global: {
      plugins: [createTestingPinia()],
    },
  })

  it.todo("[mobile] has burger to toggle nav links on mobile", () => {
    window.innerWidth = 300
    window.dispatchEvent(new Event("resize"))

    const navOpen = navbar.get('[data-testid="burger-open"]')
    expect(navOpen.isVisible()).toBe(true)

    window.innerWidth = 1024
    window.dispatchEvent(new Event("resize"))

    expect(navOpen.isVisible()).toBe(false)
  })

  it("[mobile] can display nav links on mobile", async () => {
    const navbar = mount(TheNavbar)

    expect(typeof window).not.toBeUndefined()

    window.innerWidth = 300
    window.dispatchEvent(new Event("resize"))

    expect(window.innerWidth).toBeLessThanOrEqual(300)
    const navOpen = navbar.find('[data-testid="burger-open"]')
    const navbarLinks = navbar.find('[data-testid="nav-links"]')

    expect(navbarLinks.classes()).not.toContain("-translate-y-0")
    expect(navbarLinks.classes()).toContain("-translate-y-full")

    await navOpen.trigger("click")

    expect(navbarLinks.classes()).not.toContain("-translate-y-full")
    expect(navbarLinks.classes()).toContain("-translate-y-0")
  })
})

describe("ThemeToggle component", async () => {
  const component = await mountSuspended(ThemeToggle, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            theme: "light",
          },
          stubActions: false,
        }),
      ],
    },
  })

  beforeEach(() => setActivePinia(createPinia()))

  it("can change theme via theme toggle", async () => {
    const { getTheme, setTheme } = useThemeStore()

    const themeToggle = component.find('[data-testid="theme-toggle"]')

    setTheme("light")
    // click nya ga mau jalan anjer
    // jadi themenya gak ganti
    await themeToggle.trigger("click")
    expect(getTheme()).toBe("dark")

    await themeToggle.trigger("click")
    expect(getTheme()).toBe("light")
  })
})

describe("TheHeader component", () => {
  it("has default text", async () => {
    const component = await mountSuspended(TheHeader, {
      global: {
        mocks: {
          $primevue: {
            config: defaultOptions,
          },
        },
      },
    })

    expect(component.html()).toContain("Metschoo Library")
    expect(component.html()).toContain("Selamat datang di Metschoo Library!")
  })

  it("can render heading and text properly", async () => {
    const component = await mountSuspended(TheHeader, {
      global: {
        mocks: {
          $primevue: {
            config: defaultOptions,
          },
        },
      },
      slots: {
        "header-heading": () => "Peminjaman",
        "header-text": () => "Welcome to the peminjaman page",
      },
    })

    expect(component.html()).toContain("Peminjaman")
    expect(component.html()).toContain("Welcome to the peminjaman page")
  })
})
