<script setup lang="ts">
  const { isMobileMode, entryConfig } = useGlobal()

  const { isSuper } = useRoles()

  const { activeView } = storeToRefs(useViewsStore())

  const { base, isSharedBase } = storeToRefs(useBase())
  const { baseUrl } = useBase()

  const { openTable } = useTableNew({ baseId: base.value.id! })

  const { activeTable } = storeToRefs(useTablesStore())

  const { isLeftSidebarOpen } = storeToRefs(useSidebarStore())

  const openedBaseUrl = async () => {
    if (entryConfig.value?.entryToken) {
      return;
    }

    await navigateTo(baseUrl({
      id: base.value.id!,
      type: 'database',
    }))
  }

  const _openTable = async () => {
    await openTable(activeTable.value!)
  }

</script>

<template>
  <div class="ml-0.25 flex flex-row font-normal items-center border-gray-50 transition-all duration-100"
       :class="{
         'w-2/3 text-base ml-1.5': isMobileMode,
         '!max-w-3/4': isSharedBase && !isMobileMode,
       }">
    <template v-if="!isMobileMode">
      <NuxtLink class="!hover:(text-black underline-gray-600) !underline-transparent ml-0.75 max-w-1/4"
                :class="{
                  '!max-w-none': isSharedBase && !isMobileMode,
                  '!text-gray-500': activeTable,
                  '!text-gray-700': !activeTable,
                  '!hover:cursor-default': !!entryConfig?.entryToken
                }"
                @click="openedBaseUrl()">
        <NcTooltip class="!text-inherit"
                   :disabled="!!entryConfig?.entryToken">
          <template #title>
            <span class="capitalize">
              {{ isSuper ? base?.title : $t("title.workspaceHome") }}
            </span>
          </template>
          <div v-if="isSuper"
               class="flex flex-row items-center gap-x-1.5">
            <GeneralProjectIcon :meta="{ type: base?.type }"
                                class="!grayscale min-w-4"
                                :style="{
                                  filter: 'grayscale(100%) brightness(115%)',
                                }" />
            <div class="hidden !2xl:(flex truncate ml-1)"
                 :class="{
                   '!flex': isSharedBase && !isMobileMode,
                 }">
              <span class="truncate !text-inherit capitalize">
                {{ base?.title }}
              </span>
            </div>
          </div>
          <div v-else
               class="flex text-slate-500  items-center justify-center hover:text-violet-500">
            <GeneralWsFolderHomeIcon :size="16" />
          </div>
        </NcTooltip>
      </NuxtLink>
      <div class="px-1.75 text-gray-500">/</div>
    </template>
    <template v-if="!(isMobileMode && !activeView?.is_default)">
      <LazyGeneralEmojiPicker v-if="isMobileMode"
                              :emoji="activeTable?.meta?.icon"
                              readonly
                              size="xsmall">
        <template #default>
          <MdiTable class="min-w-5"
                    :class="{
                      '!text-gray-500': !isMobileMode,
                      '!text-gray-700': isMobileMode,
                    }" />
        </template>
      </LazyGeneralEmojiPicker>
      <div v-if="activeTable">
        <NcTooltip class="truncate nc-active-table-title max-w-full">
          <template #title>
            {{ activeTable?.title }}
          </template>
          <span class="text-ellipsis overflow-hidden text-gray-500 xs:ml-2"
                :class="{
                  'text-gray-500': !isMobileMode,
                  'text-gray-800 font-normal': isMobileMode || activeView?.is_default,
                }"
                :style="{
                  wordBreak: 'keep-all',
                  whiteSpace: 'nowrap',
                  display: 'inline',
                }">
            <template v-if="activeView?.is_default">
              {{ activeTable?.title }}
            </template>
            <NuxtLink v-else
                      class="!text-inherit !underline-transparent !hover:(text-black underline-gray-600)"
                      @click="_openTable()">
              {{ activeTable?.title }}
            </NuxtLink>
          </span>
        </NcTooltip>
      </div>
    </template>

    <div v-if="!isMobileMode"
         class="pl-1.25 text-gray-500">/</div>

    <template v-if="!(isMobileMode && activeView?.is_default)">
      <LazyGeneralEmojiPicker v-if="isMobileMode"
                              :emoji="activeView?.meta?.icon"
                              readonly
                              size="xsmall">
        <template #default>
          <GeneralViewIcon :meta="{ type: activeView?.type }"
                           class="min-w-4.5 text-lg flex" />
        </template>
      </LazyGeneralEmojiPicker>

      <SmartsheetToolbarOpenedViewAction />
    </template>
  </div>
</template>
