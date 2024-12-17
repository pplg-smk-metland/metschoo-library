<script setup lang="ts">
import IconClose from "~icons/mdi/close"

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
    class="dialog backdrop:blur-lg min-h-[50vh] grid gap-4 m-auto translate-y-2/4 [&:not([open])]:pointer-events-none [&:not([open])]:opacity-0 open:translate-y-0 transition-all duration-200 border-4 border-solid border-surface-200/80 dark:border-surface-700 rounded-lg text-inherit"
    @close="closeDialog"
  >
    <form method="dialog" class="bg-surface-100 dark:bg-surface-800">
      <header
        class="bg-surface-200 dark:bg-surface-800 py-4 px-6 flex justify-between items-center"
      >
        <button
          class="border-surface-200/80 dark:border-surface-700/70 rounded-full order-last"
          title="close this dialog"
        >
          <IconClose size="20" />
        </button>

        <slot name="header"></slot>
      </header>

      <Divider class="!border-2 !m-0" />

      <div class="px-6 py-4">
        <p>ini adalah sebuah dialog</p>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(calc(100% - 2rem), 65ch);
}
</style>
