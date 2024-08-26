<template>
  <div class="wrapper">
    <TheNavbar />
    <AdminSidebar />
    <main class="dark:bg-surface-900 dark:text-white">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.wrapper {
  display: grid;
  grid-template-areas:
    "navbar navbar"
    "sidebar content";
  grid-template-columns: 25ch minmax(0, 1fr);
  grid-template-rows: min-content auto;
  flex: 1;
}

main {
  grid-area: content;
}
</style>
