<script setup>
import AdminSidebar from "../components/admin/AdminSidebar.vue"
</script>

<template>
  <div class="wrapper">
    <AdminSidebar></AdminSidebar>
    <main><slot /></main>
  </div>
</template>

<style>
.wrapper {
  display: flex;
}
</style>
