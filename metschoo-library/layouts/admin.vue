<template>
  <div class="wrapper">
    <TheNavbar />
    <AdminSidebar />
    <main>
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
}

main {
  grid-area: content;
}
</style>
