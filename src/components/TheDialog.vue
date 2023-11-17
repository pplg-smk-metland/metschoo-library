<script setup>
import { watch, ref } from "vue"

const props = defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(["dialogClose"])

const myDialog = ref(null)

function openDialog() {
  myDialog.value.showModal()
}

function closeDialog() {
  myDialog.value.close()
  emit("dialogClose")
}

watch(
  () => props.isOpen,
  (newValue, oldValue) => {
    // newValue is passed when dialog opens, aka props.isOpen changes to true
    if (newValue) openDialog()
  }
)
</script>

<template>
  <dialog ref="myDialog" class="dialog" @close="closeDialog">
    <form method="dialog">
      <button class="dialog__close-btn" @click="closeModal" title="close this dialog">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <slot>
        <p>ini adalah sebuah dialog</p>
      </slot>
    </form>
  </dialog>
</template>

<style>
.dialog {
  margin: auto;
  padding: 2rem;
  min-height: 50vh;
}

.dialog::backdrop {
  backdrop-filter: blur(2rem);
}

.dialog__close-btn {
  border: 2px solid black;
  color: var(--primary);
  padding: 0.5rem;
  margin-left: auto;

  display: grid;
  place-items: center;

  position: absolute;
  top: 2rem;
  right: 2rem;
}
</style>
