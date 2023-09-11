<script setup>
import { computed, ref } from "vue"

const props = defineProps({
  isLoggingIn: Boolean,
})

const isSignUp = computed(() => !props.isLoggingIn)

const email = ref("")
const password = ref("")
</script>

<template>
  <div class="signin">
    <div class="form-container log-in" v-show="isLoggingIn">
      <form @submit.prevent="handleLogIn">
        <label for="login-email">Email</label>
        <input required type="email" id="login-email" placeholder="Email" v-model="email" />

        <label for="login-password">Password</label>
        <input
          required
          type="password"
          id="login-password"
          placeholder="Your password here"
          v-model="password"
        />
        <button type="submit" class="btn submit-button">Log in</button>
      </form>
    </div>

    <div class="form-container sign-up" v-show="isSignUp">
      <form @submit.prevent="handleSignUp">
        <label for="signup-email">Email</label>
        <input required type="email" id="signup-email" placeholder="Email" v-model="email" />
        <label for="signup-password">Password</label>
        <input
          required
          type="password"
          id="signup-password"
          placeholder="Your password here"
          v-model="password"
        />

        <button type="submit" class="btn submit-button">Sign up</button>
      </form>
    </div>
  </div>
</template>

<style>
.signin-form {
  flex-basis: 50ch;
}

.submit-button {
  width: 100%;
  margin-block: 1rem;
}
</style>
