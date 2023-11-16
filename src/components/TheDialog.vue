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
      <button @click="closeModal">close dialog</button>
      <slot>
        <p>ini adalah sebuah dialog</p>
      </slot>
    </form>
  </dialog>
</template>

<style>
.dialog {
  margin: auto;
}

.dialog::backdrop {
  backdrop-filter: blur(2rem);
}
</style>
