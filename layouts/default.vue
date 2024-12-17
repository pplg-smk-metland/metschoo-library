<template>
  <TheNavbar />
  <main class="px-4 py-8 md:px-8">
    <slot />
  </main>
  <TheFooter />
</template>

<style>
body::before,
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -10;
  opacity: 0;
  transition: opacity 2500ms ease-in;
}

body.dark {
  --primary-bg: hsl(from var(--p-primary-500) h 70% 30% / 0.35);
}

body.dark::before,
body.dark::after {
  opacity: 1;
}

body.dark::before {
  background: radial-gradient(ellipse at right bottom, var(--primary-bg), transparent 30%);
  background-position: right;
}

body.dark::after {
  background: linear-gradient(135deg, var(--primary-bg), transparent 70vh);
}

main {
  min-height: 70vh;
  flex-grow: 1;
}
</style>
