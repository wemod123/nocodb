<script setup lang="ts">
  import {
    IsPublicInj,
    inject,
    ref,
    storeToRefs,
    useGlobal,
    useSharedView,
    useSmartsheetStoreOrThrow,
    useViewsStore,
  } from '#imports'

  const { isGrid, isGallery, isKanban, isMap } = useSmartsheetStoreOrThrow()

  const isPublic = inject(IsPublicInj, ref(false))

  const { isViewsLoading } = storeToRefs(useViewsStore())

  const { isMobileMode } = useGlobal()

  const { allowCSVDownload, sharedView } = useSharedView()
</script>

<template>
  <div :class="{ 'xs:ml-8 !min-h-[54px]': isPublic }"
       class="nc-table-toolbar px-2.5 py-1 xs:pl-6 flex gap-2 items-center border-b border-gray-200 overflow-hidden max-h-12 min-h-12 z-7">
    <template v-if="isViewsLoading">
      <a-skeleton-input :active="true"
                        class="!w-44 !h-4 ml-2 !rounded overflow-hidden" />
    </template>
    <template v-else>
      <div v-if="isPublic"
           class="xs:flex-grow">
        <div :class="{ 'pl-10': isMobileMode }"
             class="text-xl font-semibold truncate flex gap-2 items-center pr-3">
          <GeneralViewIcon v-if="sharedView"
                           class="!text-xl"
                           :meta="sharedView" />
          <div class="truncate"
               :style="{ maxWidth: isMobileMode ? `250px` : '500px' }">
            {{ sharedView?.title }}
          </div>
        </div>
      </div>
      <LazySmartsheetToolbarMappedBy v-if="isMap" />

      <LazySmartsheetToolbarFieldsMenu v-if="isGrid || isGallery || isKanban || isMap"
                                       :show-system-fields="false"
                                       :class="{ 'hidden': isPublic }" />

      <LazySmartsheetToolbarStackedBy v-if="isKanban" />

      <LazySmartsheetToolbarColumnFilterMenu v-if="isGrid || isGallery || isKanban || isMap" />

      <LazySmartsheetToolbarGroupByMenu v-if="isGrid"
                                        :class="{ 'hidden': isPublic }" />

      <LazySmartsheetToolbarSortListMenu v-if="isGrid || isGallery || isKanban" />

      <LazySmartsheetToolbarRowHeight v-if="isGrid"
                                      :class="{ 'hidden': isPublic && isMobileMode }" />

      <template v-if="!isMobileMode">
        <LazySmartsheetToolbarExport v-if="isPublic && allowCSVDownload" />
        <div class="flex-1 xs:!flex-shrink-0 xs:!flex-grow-0" />
      </template>

      <LazySmartsheetToolbarSearchData v-if="(isGrid || isGallery || isKanban) && !isPublic"
                                       :class="{
                                         'shrink': !isMobileMode,
                                         'w-full': isMobileMode,
                                         '!-ml-2': isMobileMode
                                       }" />
    </template>
  </div>
</template>

<style scoped>
.nc-table-toolbar-mobile {
  @apply flex-wrap h-auto py-2;
}
</style>
