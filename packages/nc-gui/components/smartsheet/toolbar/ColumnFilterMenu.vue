<script setup lang="ts">
  import {
    ActiveViewInj,
    AllFiltersInj,
    IsLockedInj,
    computed,
    iconMap,
    inject,
    ref,
    useGlobal,
    useMenuCloseOnEsc,
    useSmartsheetStoreOrThrow,
    useViewFilters,
    watch,
  } from '#imports'

  const isLocked = inject(IsLockedInj, ref(false))

  const activeView = inject(ActiveViewInj, ref())

  const { isMobileMode } = useGlobal()

  const filterComp = ref<typeof ColumnFilter>()

  const { nestedFilters } = useSmartsheetStoreOrThrow()

  // todo: avoid duplicate api call by keeping a filter store
  const { nonDeletedFilters, loadFilters } = useViewFilters(
    activeView!,
    undefined,
    computed(() => true),
    () => false,
    nestedFilters.value,
    true,
  )

  const filtersLength = ref(0)

  watch(
    () => activeView?.value?.id,
    async (viewId) => {
      if (viewId) {
        await loadFilters()
        filtersLength.value = nonDeletedFilters.value.length || 0
      }
    },
    { immediate: true },
  )

  const open = ref(false)

  const allFilters = ref({})

  provide(AllFiltersInj, allFilters)

  useMenuCloseOnEsc(open)
</script>

<template>
  <NcDropdown v-model:visible="open"
              :trigger="['click']"
              overlay-class-name="nc-dropdown-filter-menu nc-toolbar-dropdown"
              class="!xs:hidden">
    <div :class="{ 'nc-active-btn': filtersLength }">
      <a-button v-e="['c:filter']"
                class="nc-filter-menu-btn nc-toolbar-btn txt-sm"
                :disabled="isLocked">
        <div class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg"
               width="16"
               height="16"
               viewBox="0 0 24 24">
            <path fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4h16v2.172a2 2 0 0 1-.586 1.414L15 12v7l-6 2v-8.5L4.52 7.572A2 2 0 0 1 4 6.227V4z" />
          </svg>
          <!-- Filter -->
          <span v-if="!isMobileMode"
                class="text-capitalize !text-sm font-normal">{{ $t('activity.filter') }}</span>

          <span v-if="filtersLength"
                class="bg-brand-50 text-brand-500 py-1 px-2 text-md rounded-md">{{ filtersLength }}</span>
        </div>
      </a-button>
    </div>

    <template #overlay>
      <SmartsheetToolbarColumnFilter ref="filterComp"
                                   class="nc-table-toolbar-menu"
                                   :auto-save="true"
                                   data-testid="nc-filter-menu"
                                   @update:filters-length="filtersLength = $event">
    </SmartsheetToolbarColumnFilter>
  </template>
</NcDropdown></template>
