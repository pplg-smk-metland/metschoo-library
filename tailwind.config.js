import defaultTheme from "tailwindcss/defaultTheme.js"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./presets/**/*.{js,vue,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Josefin Sans"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-primeui")],
}
