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

const isSigningIn = ref(false)

function handleSwitchForm() {
  isSigningIn.value = !isSigningIn.value
}

const title = computed(() => (isSigningIn.value ? "Log in" : "Sign in"))
useHead({ title })

const switchFormButtonLabel = computed(() =>
  isSigningIn.value ? "Belum punya akun? ayo bikin dulu!" : "Sudah punya akun? Masuk"
)
</script>

<template>
  <div class="flex justify-center min-h-[70vh]">
    <CTA type="button" @click="handleSwitchForm" :label="switchFormButtonLabel" />

    <AuthSignInForm v-if="isSigningIn" />
    <AuthLoginForm v-else />
  </div>
</template>
