import defaultTheme from "tailwindcss/defaultTheme.js"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./assets/presets/**/*.{js,vue,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Josefin Sans"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  darkMode: "selector",
  plugins: [require("tailwindcss-primeui")],
}
