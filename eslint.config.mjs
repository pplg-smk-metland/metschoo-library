// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt(
  // Your custom configs here

  {
    languageOptions: {
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
    ignores: ["**/assets/presets/"],
    rules: {
      // "@typescript-eslint/consistent-type-imports": "error",
      "prefer-const": "error",
      "vue/no-multiple-template-root": "off", // we're not using Vue 2
    },
  }
)
