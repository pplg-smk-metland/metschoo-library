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
  <div class="flex justify-center min-h-[70vh]">
    <SignInForm />
  </div>
</template>
