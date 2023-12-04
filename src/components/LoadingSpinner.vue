<template>
  <div class="loader-wrapper">
    <p>sebentar ya...</p>

    <div class="loader">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<style scoped>
.loader-wrapper {
  min-height: 20vh;
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.loader {
  --loader-size: 100px;
  display: block;
  position: relative;
  width: var(--loader-size);
  height: var(--loader-size);
  aspect-ratio: 1 / 1;
}

.loader div {
  --loader-color: var(--primary-500);

  box-sizing: border-box;
  border: 8px solid var(--loader-color);
  border-color: var(--loader-color) transparent transparent transparent;
  border-radius: 50%;
  width: var(--loader-size);
  height: var(--loader-size);
  margin: 8px;

  position: absolute;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.loader div:nth-child(1) {
  animation-delay: -450ms;
}

.loader div:nth-child(2) {
  animation-delay: -300ms;
}

.loader div:nth-child(3) {
  animation-delay: -150ms;
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}
</style>
