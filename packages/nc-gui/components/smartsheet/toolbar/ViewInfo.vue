<script setup lang="ts">
const { isMobileMode } = useGlobal()

const { isSuper } = useRoles()

const { activeView } = storeToRefs(useViewsStore())

const { base, isSharedBase } = storeToRefs(useBase())
const { baseUrl } = useBase()

const { activeTable } = storeToRefs(useTablesStore())
const { tableUrl } = useTablesStore()

const { isLeftSidebarOpen } = storeToRefs(useSidebarStore())

const openedBaseUrl = computed(() => {
  if (!base.value) return ''

  return `${window.location.origin}/#${baseUrl({
    id: base.value.id!,
    type: 'database',
  })}`
})
</script>

<template>
  <div
    class="ml-0.25 flex flex-row font-normal items-center border-gray-50 transition-all duration-100"
    :class="{
      'min-w-36/100 max-w-36/100': !isMobileMode && isLeftSidebarOpen,
      'min-w-39/100 max-w-39/100': !isMobileMode && !isLeftSidebarOpen,
      'w-2/3 text-base ml-1.5': isMobileMode,
      '!max-w-3/4': isSharedBase && !isMobileMode,
    }"
  >
    <template v-if="!isMobileMode">
      <NuxtLink
        class="!hover:(text-black underline-gray-600) !underline-transparent ml-0.75 max-w-1/4"
        :class="{
          '!max-w-none': isSharedBase && !isMobileMode,
          '!text-gray-500': activeTable,
          '!text-gray-700': !activeTable,
        }"
        :to="openedBaseUrl"
      >
        <NcTooltip class="!text-inherit">
          <template #title>
            <span class="capitalize">
              {{ isSuper ? base?.title : $t("general.workingDirs") }}
            </span>
          </template>
          <div v-if="isSuper" class="flex flex-row items-center gap-x-1.5">
            <GeneralProjectIcon
              :meta="{ type: base?.type }"
              class="!grayscale min-w-4"
              :style="{
                filter: 'grayscale(100%) brightness(115%)',
              }"
            />
            <div
              class="hidden !2xl:(flex truncate ml-1)"
              :class="{
                '!flex': isSharedBase && !isMobileMode,
              }"
            >
              <span class="truncate !text-inherit capitalize">
                {{ base?.title }}
              </span>
            </div>
          </div>
          <div v-else
               class="flex text-slate-500  items-center justify-center hover:text-violet-500">
            <svg xmlns="http://www.w3.org/2000/svg"
               height="16"
               width="16"
               viewBox="0 0 512 512">
              <path class="fa-secondary"
                    opacity="0.4"
                    fill="currentColor"
                    d="M336.4 12.9C400.2 34 453 79.5 483.5 138.4c5.2 10.1-2.5 21.6-13.8 21.6H265.2c-12.3 0-20-13.3-13.9-24l67-116c3.6-6.3 11.1-9.4 18-7.1zM0 256c0-50.9 14.9-98.3 40.5-138.2c6.1-9.5 19.9-8.6 25.6 1.2L168.2 296c6.2 10.7-1.5 24-13.9 24H20.5c-7.3 0-13.7-4.9-15.2-12.1C1.8 291.2 0 273.8 0 256zM256 512c-4 0-7.9-.1-11.9-.3c-11.3-.5-17.5-12.9-11.8-22.8L334.5 312c6.2-10.7 21.6-10.7 27.7 0l66.9 115.9c3.6 6.3 2.6 14.3-2.9 19.2C381.1 487.5 321.4 512 256 512z" />
              <path class="fa-primary"
                    opacity="1"
                    fill="currentColor"
                    d="M256 0c4 0 7.9 .1 11.9 .3c11.3 .5 17.4 12.9 11.8 22.8L177.5 200c-6.2 10.7-21.6 10.7-27.7 0L82.8 84.1c-3.6-6.3-2.6-14.3 2.9-19.2C130.9 24.5 190.6 0 256 0zM193.6 492c-3.6 6.3-11.1 9.4-18 7.1C111.8 478 59 432.5 28.5 373.6C23.3 363.5 31 352 42.3 352H246.8c12.3 0 20 13.3 13.9 24l-67 116zm277.9-97.8c-6.1 9.5-19.9 8.6-25.6-1.2L343.8 216c-6.2-10.7 1.5-24 13.9-24H491.5c7.3 0 13.7 4.9 15.2 12.1c3.5 16.8 5.3 34.1 5.3 51.9c0 50.9-14.9 98.3-40.5 138.2z" />
            </svg>
          </div>
        </NcTooltip>
      </NuxtLink>
      <div class="px-1.75 text-gray-500">/</div>
    </template>
    <template v-if="!(isMobileMode && !activeView?.is_default)">
      <LazyGeneralEmojiPicker v-if="isMobileMode" :emoji="activeTable?.meta?.icon" readonly size="xsmall">
        <template #default>
          <MdiTable
            class="min-w-5"
            :class="{
              '!text-gray-500': !isMobileMode,
              '!text-gray-700': isMobileMode,
            }"
          />
        </template>
      </LazyGeneralEmojiPicker>
      <div
        v-if="activeTable"
        :class="{
          'max-w-1/2': isMobileMode || activeView?.is_default,
          'max-w-20/100': !isSharedBase && !isMobileMode && !activeView?.is_default,
          'max-w-none': isSharedBase && !isMobileMode,
        }"
      >
        <NcTooltip class="truncate nc-active-table-title max-w-full">
          <template #title>
            {{ activeTable?.title }}
          </template>
          <span
            class="text-ellipsis overflow-hidden text-gray-500 xs:ml-2"
            :class="{
              'text-gray-500': !isMobileMode,
              'text-gray-800 font-normal': isMobileMode || activeView?.is_default,
            }"
            :style="{
              wordBreak: 'keep-all',
              whiteSpace: 'nowrap',
              display: 'inline',
            }"
          >
            <template v-if="activeView?.is_default">
              {{ activeTable?.title }}
            </template>
            <NuxtLink
              v-else
              class="!text-inherit !underline-transparent !hover:(text-black underline-gray-600)"
              :to="tableUrl({ table: activeTable, completeUrl: true })"
            >
              {{ activeTable?.title }}
            </NuxtLink>
          </span>
        </NcTooltip>
      </div>
    </template>

    <div v-if="!isMobileMode" class="pl-1.25 text-gray-500">/</div>

    <template v-if="!(isMobileMode && activeView?.is_default)">
      <LazyGeneralEmojiPicker v-if="isMobileMode" :emoji="activeView?.meta?.icon" readonly size="xsmall">
        <template #default>
          <GeneralViewIcon :meta="{ type: activeView?.type }" class="min-w-4.5 text-lg flex" />
        </template>
      </LazyGeneralEmojiPicker>

      <SmartsheetToolbarOpenedViewAction />
    </template>
  </div>
</template>
