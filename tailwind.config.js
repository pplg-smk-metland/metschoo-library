import defaultTheme from "tailwindcss/defaultTheme.js"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./assets/presets/**/*.{js,vue,ts}"],
  theme: {
    extend: {
      colors: {
        green: "#336f6c",
      },
      fontFamily: {
        sans: ['"Josefin Sans"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-primeui")],
}
