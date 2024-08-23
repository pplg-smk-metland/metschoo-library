<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      const user = useSupabaseUser()

      if (user.value) {
        return navigateTo("/")
      }
    },
  ],
})
</script>
<template>
  <main>
    <SignInForm />
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
}
</style>
