<script setup lang="ts">
import { ReloadViewDataHookInj, iconMap, inject, ref, useNuxtApp, watch } from '#imports'

const { $e, $state } = useNuxtApp()

const { isPaginationLoading } = storeToRefs(useViewsStore())
const reloadHook = inject(ReloadViewDataHookInj)!

const isReloading = ref(false)

const onClick = () => {
  $e('a:table:reload:navbar')
  isReloading.value = true
  reloadHook.trigger()

  const stop = watch($state.isLoading, (isLoading) => {
    if (!isLoading) {
      isReloading.value = false
      stop()
    }
  })
}

watch(isReloading, () => {
  isPaginationLoading.value = isReloading.value
})
</script>

<template>
  <a-tooltip placement="right">
    <template #title> {{ $t('general.reload') }} </template>

    <div
      class="flex ml-2 items-center justify-center select-none cursor-pointer text-gray-500 w-7 h-7 hover:(bg-gray-100 text-black) rounded-lg"
    >
      <component
        :is="iconMap.reload"
        class="group-hover:(text-primary) h-5 w-5 nc-icon-reload text-gray-400"
        :class="isReloading ? 'animate-spin' : ''"
        @click="onClick"
      />
    </div>
  </a-tooltip>
</template>
