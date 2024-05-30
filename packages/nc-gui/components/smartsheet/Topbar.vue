<script setup lang="ts">
  import { IsPublicInj, inject, ref, useSmartsheetStoreOrThrow, useViewsStore } from '#imports'

  const { isGrid, isForm, isGallery, isKanban, isMap } = useSmartsheetStoreOrThrow()

  const { isSuper } = useRoles();

  const router = useRouter()
  const route = router.currentRoute

  const isPublic = inject(IsPublicInj, ref(false))

  const { isViewsLoading } = storeToRefs(useViewsStore())

  const { isMobileMode } = storeToRefs(useConfigStore())

  const { appInfo, entryConfig } = useGlobal()

  const isSharedBase = computed(() => route.value.params.typeOrId === 'base')
</script>

<template>
  <div class="nc-table-topbar h-20 py-1 flex gap-2 items-center border-b border-gray-200 overflow-hidden relative max-h-[var(--topbar-height)] min-h-[var(--topbar-height)] md:(pr-2 pl-2) xs:(pl-12 ml-1 pr-2)"
       style="z-index: 7">
    <template v-if="isViewsLoading">
      <a-skeleton-input :active="true"
                        class="!w-44 !h-4 ml-2 !rounded overflow-hidden" />
    </template>
    <template v-else>
      <GeneralOpenLeftSidebarBtn v-if="!isMobileMode" />

      <LazySmartsheetToolbarViewInfo v-if="!isPublic" />

      <div v-if="isMobileMode && !isForm" 
           class="border-1 rounded-lg flex justify-center pr-1 items-center w-10 h-10">
        <LazySmartsheetToolbarReload />
      </div>

      <div v-if="isMobileMode && isForm" class="flex-1" /> 

      <div v-if="!isSharedBase && !isMobileMode && isSuper"
           class="w-47.5">
        <SmartsheetTopbarSelectMode />
      </div>
      <div v-if="!isMobileMode" class="flex-1" />

      <GeneralApiLoader v-if="!isMobileMode" />

      <LazyGeneralShareProject v-if="(isForm || isGrid || isKanban || isGallery || isMap) && !isPublic && !isMobileMode"
                               is-view-toolbar />

      <LazyGeneralLanguage v-if="false && isSharedBase && !appInfo.ee"
                           class="cursor-pointer text-lg hover:(text-black bg-gray-200) mr-0 p-1.5 rounded-md" />

      <SmartsheetToolbarExport v-if="!isMobileMode && entryConfig?.entryToken" />

      <GeneralOpenLeftSidebarBtn v-if="isMobileMode" />
    </template>
  </div>
</template>

<style scoped>
.nc-table-toolbar-mobile {
  @apply flex-wrap h-auto py-2;
}
</style>
