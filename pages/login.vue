<script setup lang="ts">
import RegisterOutline from "~icons/mdi/register-outline"
import Login from "~icons/mdi/login"

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
  isLoggingIn.value ? "Belum punya akun? ayo bikin dulu! " : "Sudah punya akun? Masuk"
)
</script>

<template>
  <div class="flex flex-col gap-8 justify-center max-w-xl mx-auto min-h-[70vh]">
    <CTA type="button" :label="switchFormButtonLabel" @click="handleSwitchForm">
      <Login v-show="!isLoggingIn" />
      <RegisterOutline v-show="isLoggingIn" />
    </CTA>

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
