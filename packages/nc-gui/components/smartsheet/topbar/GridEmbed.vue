<script lang="ts" setup>
  import { useDialog } from '#imports'
  import SubFrameConf from '~/components/dlg/SubFrameConf.vue'
  const { activeView } = storeToRefs(useViewsStore())

  function openQuickImportDialog() {
    const isOpen = ref(true)

    const { close } = useDialog(SubFrameConf, {
      modelValue: isOpen,
      'onUpdate:modelValue': closeDialog,
    })

    function closeDialog() {
      // hide the modal
      isOpen.value = false

      // debounce destroying the component, so the modal transition can finish
      close(50)
    }
  }
</script>

<template>
  <div @click="openQuickImportDialog()"
       :class="{ '!bg-indigo-500/20 hover:!bg-indigo-500/10': activeView?.meta?.loadSubFrame === true }"
       class="rounded-lg text-lg cursor-pointer hover:bg-slate-200 bg-slate-100 h-9 flex items-center px-2 justify-center">
    🍔
  </div>
</template>