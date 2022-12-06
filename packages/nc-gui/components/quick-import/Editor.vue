<script setup lang="ts">
import type { TableType } from 'nocodb-sdk'
import { ActiveViewInj, computed, ref } from '#imports'

const { activeQuickImportTab } = useQuickImportStoreOrThrow()!

const { metas, getMeta } = useMetas()

const meta = computed<TableType | undefined>(() => activeQuickImportTab.value && metas.value[activeQuickImportTab.value.id!])

const { views } = useViews(meta)

const activeView = ref()

const reloadEventHook = createEventHook<void | boolean>()

const reloadViewMetaEventHook = createEventHook<void | boolean>()

const openNewRecordFormHook = createEventHook<void>()

provide(MetaInj, meta)

provide(ActiveViewInj, activeView)

provide(FieldsInj, ref(meta.value?.columns || []))

provide(ReloadViewDataHookInj, reloadEventHook)

provide(ReloadViewMetaHookInj, reloadViewMetaEventHook)

provide(OpenNewRecordFormHookInj, openNewRecordFormHook)

useProvideSmartsheetStore(activeView, meta)

const { loadData } = useViewData(meta, activeView)

watch(activeQuickImportTab, async (v) => {
  if (v) {
    // v === null: removing tab
    // else : adding a tab
    // include the quick import table in metas
    await getMeta(v.id!)
  }
})

watch(views, async () => {
  // update active view
  activeView.value = views.value[0]
  // load data
  await loadData()
})
</script>

<template>
  <a-layout>
    <a-layout-sider theme="light">
      <LazyDashboardTreeView />
    </a-layout-sider>
    <a-layout-content v-if="activeQuickImportTab">
      <div class="nc-container flex flex-col h-full mt-1.5 px-12">
        <div class="flex flex-col h-full flex-1 min-w-0">
          <LazyQuickImportTabs />
          <LazySmartsheetToolbar />
          <div class="flex flex-1 min-h-0">
            <div class="h-full flex-1 min-w-0 min-h-0 bg-gray-50">
              <LazySmartsheetGrid />
            </div>
          </div>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style scoped lang="scss"></style>
