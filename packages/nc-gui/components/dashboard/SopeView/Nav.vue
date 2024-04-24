<script lang="ts" setup>
  import { nextTick } from '@vue/runtime-core'
  import type { SourceType, TableType } from 'nocodb-sdk'
  import { LoadingOutlined } from '@ant-design/icons-vue'

  import {
    ProjectInj,
    ProjectRoleInj,
    TreeViewInj,
    computed,
    h,
    inject,
    navigateTo,
    ref,
    resolveComponent,
    storeToRefs,
    useBase,
    useBases,
    useDialog,
    useGlobal,
    useNuxtApp,
    useRoles,
    useRouter,
    useTablesStore,
    useTabs,
    useToggle,
  } from '#imports'
  import type { NcProject } from '#imports'

  const indicator = h(LoadingOutlined, {
    class: '!text-gray-400',
    style: {
      fontSize: '0.85rem',
    },
    spin: true,
  })

  const router = useRouter()

  const route = router.currentRoute

  const { isSharedBase } = storeToRefs(useBase())

  const { setMenuContext, openRenameTableDialog, duplicateTable, contextMenuTarget } = inject(TreeViewInj)!

  const base = inject(ProjectInj)!

  const basesStore = useBases()

  const { isMobileMode, entryConfig } = useGlobal()

  const { createProject: _createProject } = basesStore

  const { bases } = storeToRefs(basesStore)

  const { loadProjectTables } = useTablesStore()

  const { activeTable } = storeToRefs(useTablesStore())

  const { isUIAllowed } = useRoles()

  useTabs()

  const editMode = ref(false)

  const tempTitle = ref('')

  const activeBaseId = ref('')

  const isErdModalOpen = ref<boolean>(false)

  const input = ref<HTMLInputElement>()

  const baseRole = inject(ProjectRoleInj)

  const { activeProjectId } = storeToRefs(useBases())

  const { baseUrl } = useBase()

  const { $e } = useNuxtApp()

  const isOptionsOpen = ref(false)
  const isBasesOptionsOpen = ref<Record<string, boolean>>({})

  const activeKey = ref<string[]>([])
  const [searchActive] = useToggle()
  const filterQuery = ref('')
  const keys = ref<Record<string, number>>({})

  // If only base is open, i.e in case of docs, base view is open and not the page view
  const baseViewOpen = computed(() => {
    const routeNameSplit = String(route.value?.name).split('baseId-index-index')
    if (routeNameSplit.length <= 1) return false

    const routeNameAfterProjectView = routeNameSplit[routeNameSplit.length - 1]
    return routeNameAfterProjectView.split('-').length === 2 || routeNameAfterProjectView.split('-').length === 1
  })

  const showBaseOption = computed(() => {
    return ['airtableImport', 'csvImport', 'jsonImport', 'excelImport'].some((permission) => isUIAllowed(permission))
  })

  function enableEditMode() {
    editMode.value = true
    tempTitle.value = base.value.title!
    nextTick(() => {
      input.value?.focus()
      input.value?.select()
      input.value?.scrollIntoView()
    })
  }

  defineExpose({
    enableEditMode,
  })

  watch(
    () => activeTable.value?.id,
    async () => {
      if (!activeTable.value) return

      const sourceId = activeTable.value.source_id
      if (!sourceId) return

      activeKey.value = [`collapse-${sourceId}`]
    },
    {
      immediate: true,
    },
  )

  onMounted(() => { base.value.isExpanded = true })

  const scopedSources = computed(() => {
    return entryConfig.value?.scope?.sources.length > 0
      ? base.value?.sources.filter(s => s.is_meta !== 1 && entryConfig.value?.scope?.sources.includes(s.id))
      : []
  })

  const getSourceIndex = (source: any) => {
    for (let index = 0; index < base.value?.sources.length; index++) {
      if (base.value?.sources[index].id === source.id) return index
    }

    return -1
  }
</script>

<template>
  <NcDropdown :trigger="['contextmenu']"
              overlay-class-name="nc-dropdown-tree-view-context-menu">
    <div class="ml-3 mr-2 nc-base-sub-menu rounded-md"
         :class="{ active: base.isExpanded }"
         :data-testid="`nc-sidebar-base-${base.title}`"
         :data-base-id="base.id">

      <div class="pr-4 text-slate-500 nc-sidebar-node base-title-node h-11 flex-grow group flex items-center w-full pr-1">

        <div v-e="['c:base:emojiSelect']"
             class="flex items-center select-none pl-3 h-full">
          <a-spin v-if="base.isLoading"
                  class="!ml-1.25 !flex !flex-row !items-center !my-0.5 w-8"
                  :indicator="indicator" />
          <GeneralWsFolderHomeIcon :size="18" />
        </div>

        <div class="pl-2 flex-grow">
          {{ $t("title.workSpaceTables") }} (<span>{{ entryConfig?.scope?.paths?.length }}</span>)
        </div>
      </div>
      <div v-if="base.id && !base.isLoading"
           key="g1"
           class="overflow-x-hidden transition-max-height"
           :class="{ 'max-h-0': !base.isExpanded }">
        <template v-if="base && base?.sources">
          <div class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col"
               :class="{ 'mb-[20px]': isSharedBase }">
            <div v-if="scopedSources.length"
                 class="transition-height duration-200">
              <div class="border-none sortable-list">
                <div v-for="source of scopedSources"
                     :key="`source-${source.id}`"
                     class="mt-2">
                  <a-collapse v-if="source && source.enabled"
                              v-model:activeKey="activeKey"
                              v-e="['c:source:toggle-expand']"
                              class="!mx-0 !px-0 nc-sidebar-source-node mt-0.5"
                              :class="[{ hidden: searchActive && !!filterQuery, '!bg-slate-100/80 actived-panel-header': activeKey?.includes(`collapse-${source.id}`) }]"
                              expand-icon-position="left"
                              accordion
                              :bordered="false"
                              ghost>
                    <template #expandIcon="{ isActive }">
                      <div class="nc-sidebar-expand nc-sidebar-node-btn h-9 !flex items-center">
                        <GeneralIcon icon="triangleFill"
                                     class="nc-sidebar-source-node-btns opacity-40 xs:visible !mt-1 cursor-pointer transform transition-transform duration-500 h-2 w-2 text-slate-500 rotate-90"
                                     :class="{ '!rotate-180': isActive }" />
                      </div>
                    </template>
                    <a-collapse-panel :key="`collapse-${source.id}`">
                      <template #header>
                        <div class="nc-sidebar-node min-w-20 h-10 w-full flex flex-row group">
                          <div class="source-context flex flex-grow items-center gap-1.75 text-gray-800 min-w-1/20 max-w-full"
                               @contextmenu="setMenuContext('source', source)">
                            <svg v-if="activeKey?.includes(`collapse-${source.id}`)"
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="18"
                                 height="18"
                                 viewBox="0 0 24 24">
                              <g fill="none"
                                 stroke="#8F71F3"
                                 stroke-linecap="round"
                                 stroke-linejoin="round"
                                 stroke-width="2">
                                <path
                                      d="m6 14l1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
                                <circle cx="14"
                                        cy="15"
                                        r="1" />
                              </g>
                            </svg>
                            <svg v-else
                                 xmlns="http://www.w3.org/2000/svg"
                                 width="18"
                                 height="18"
                                 viewBox="0 0 24 24">
                              <g fill="none"
                                 stroke="#718097"
                                 stroke-linecap="round"
                                 stroke-linejoin="round"
                                 stroke-width="2">
                                <path
                                      d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                                <circle cx="12"
                                        cy="13"
                                        r="2" />
                                <path d="M12 15v5" />
                              </g>
                            </svg>
                            <div :data-testid="`nc-sidebar-base-${source.alias}`"
                                 class="nc-sidebar-node-title flex capitalize text-ellipsis overflow-hidden select-none"
                                 :style="{ wordBreak: 'keep-all', whiteSpace: 'nowrap', display: 'inline' }">
                              {{ source.alias || '' }}
                            </div>
                          </div>
                          <div class="flex flex-row items-center pr-3">
                            <NcDropdown v-if="!(entryConfig?.scope && entryConfig.scope.paths && entryConfig.scope.paths.length > 0)"
                                        :visible="isBasesOptionsOpen[source!.id!]"
                                        :trigger="['click']"
                                        @update:visible="isBasesOptionsOpen[source!.id!] = $event">
                              <NcButton v-e="['c:source:options']"
                                        class="nc-sidebar-node-btn opacity-0 group-hover:opacity-100"
                                        :class="{ '!text-black !opacity-100 !bg-slate-200': isBasesOptionsOpen[source!.id!] }"
                                        type="text"
                                        size="xxsmall"
                                        @click.stop="isBasesOptionsOpen[source!.id!] = !isBasesOptionsOpen[source!.id!]">
                                <GeneralIcon icon="threeDotHorizontal"
                                             class="text-xl w-4.75" />
                              </NcButton>

                            </NcDropdown>
                          </div>
                        </div>
                      </template>
                      <div ref="menuRefs"
                           :key="`sortable-${source.id}-${source.id && source.id in keys ? keys[source.id] : '0'}`"
                           :nc-source="source.id"
                           class="px-3 pb-3">
                        <DashboardTreeViewTableList :base="base"
                                                    :source-index="getSourceIndex(source)" />
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </NcDropdown>
</template>

<style lang="scss" scoped>
:deep(.ant-collapse-header) {
  @apply !mx-0 !xs: (pl-5.5) !pr-0.5 !py-0.5 hover:bg-slate-100/80 xs:(hover:bg-slate-50) !rounded-md;
}

:deep(.ant-collapse-item-active .ant-collapse-header) {
  @apply bg-slate-100/80
}



:deep(.ant-collapse-item) {
  @apply h-full;
}

:deep(.ant-collapse-content-box) {
  @apply !px-0 !pb-0 !pt-0.25;
}

:deep(.ant-collapse-header:hover .nc-sidebar-source-node-btns) {
  @apply opacity-100;
}
</style>
