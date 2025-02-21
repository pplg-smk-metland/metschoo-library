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

const isLoggingIn = ref(false)

function handleSwitchForm() {
  isLoggingIn.value = !isLoggingIn.value
}

const title = computed(() => (isLoggingIn.value ? "Log in" : "Sign in"))
useHead({ title })

const switchFormButtonLabel = computed(() =>
  isLoggingIn.value ? "Sudah punya akun? Masuk" : "Belum punya akun? ayo bikin dulu!"
)
</script>

<template>
  <div class="flex flex-col gap-8 justify-center max-w-xl mx-auto min-h-[70vh]">
    <CTA type="button" :label="switchFormButtonLabel" link @click="handleSwitchForm" />

    <Transition>
      <AuthLoginForm v-if="isLoggingIn" />
      <AuthRegisterForm v-else />
    </Transition>
  </div>
</template>

<style>
.v-enter-leave,
.v-enter-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
