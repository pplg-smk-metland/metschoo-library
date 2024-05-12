<script setup lang="ts">
import { watch, ref } from "vue"

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits(["dialogClose"])

const myDialog = ref<HTMLDialogElement | null>(null)

function openDialog() {
  myDialog.value!.showModal()
}

function closeDialog() {
  myDialog.value!.close()
  emit("dialogClose")
}

watch(
  () => props.isOpen,
  (newValue, _) => {
    // newValue is passed when dialog opens, aka props.isOpen changes to true
    if (newValue) openDialog()
  }
)
</script>

<template>
  <dialog
    ref="myDialog"
    class="dialog"
    @close="closeDialog"
  >
    <form method="dialog">
      <button
        class="dialog__close-btn"
        title="close this dialog"
      >
        <i class="fa-solid fa-xmark" />
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
  width: min(calc(100% - 2rem), 60ch);
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
