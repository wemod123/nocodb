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

  const { isMobileMode } = useGlobal()

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
  const isTableDeleteDialogVisible = ref(false)

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

  function openTableCreateDialog(sourceIndex?: number | undefined) {
    const isOpen = ref(true)
    let sourceId = base.value!.sources?.[0].id
    if (typeof sourceIndex === 'number') {
      sourceId = base.value!.sources?.[sourceIndex].id
    }

    if (!sourceId || !base.value?.id) return

    const { close } = useDialog(resolveComponent('DlgTableCreate'), {
      'modelValue': isOpen,
      sourceId, // || sources.value[0].id,
      'baseId': base.value!.id,
      'onCreate': closeDialog,
      'onUpdate:modelValue': () => closeDialog(),
    })

    function closeDialog(table?: TableType) {
      isOpen.value = false

      if (!table) return

      base.value.isExpanded = true

      if (!activeKey.value || !activeKey.value?.includes(`collapse-${sourceId}`)) {
        activeKey.value?.push(`collapse-${sourceId}`)
      }

      // TODO: Better way to know when the table node dom is available
      setTimeout(() => {
        const newTableDom = document.querySelector(`[data-table-id="${table.id}"]`)
        if (!newTableDom) return

        newTableDom?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 1000)

      close(480)
    }
  }

  function openTableRenameDialog(sourceIndex?: number | undefined) {
    const source = typeof sourceIndex === 'number' && base.value!.sources?.[sourceIndex]
    if (!source) return

    $e('c:ws:rename')

    const isOpen = ref(true)

    const { close } = useDialog(resolveComponent('DlgWsRename'), {
      'modelValue': isOpen,
      'baseId': base.value.id,
      'sourceId': source.id,
      'currentTitle': source.alias,
      'onUpdate:modelValue': closeDialog,
    })

    function closeDialog() {
      isOpen.value = false

      close(480)
    }

  }

  async function onProjectClick(base: NcProject, ignoreNavigation?: boolean, toggleIsExpanded?: boolean) {
    if (!base) {
      return
    }

    if (!toggleIsExpanded) $e('c:base:open')

    ignoreNavigation = isMobileMode.value || ignoreNavigation
    toggleIsExpanded = isMobileMode.value || toggleIsExpanded

    base.isExpanded = true


    const isProjectPopulated = basesStore.isProjectPopulated(base.id!)

    if (!isProjectPopulated) base.isLoading = true

    if (!ignoreNavigation) {
      await navigateTo(
        baseUrl({
          id: base.id!,
          type: 'database',
          isSharedBase: isSharedBase.value,
        }),
      )
    }

    if (!isProjectPopulated) {
      await loadProjectTables(base.id!)
    }

    if (!isProjectPopulated) {
      const updatedProject = bases.value.get(base.id!)!
      updatedProject.isLoading = false
    }
  }

  function openErdView(source: SourceType) {
    $e('c:project:relation')

    const isOpen = ref(true)

    const { close } = useDialog(resolveComponent('DlgProjectErd'), {
      'modelValue': isOpen,
      'sourceId': source!.id,
      'onUpdate:modelValue': () => closeDialog(),
      'baseId': base.value.id,
    })

    function closeDialog() {
      isOpen.value = false

      close(480)
    }
  }

  const contextMenuBase = computed(() => {
    if (contextMenuTarget.type === 'source') {
      return contextMenuTarget.value
    } else if (contextMenuTarget.type === 'table') {
      const source = base.value?.sources?.find((b) => b.id === contextMenuTarget.value.source_id)
      if (source) return source
    }
    return null
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

  onKeyStroke('Escape', () => {
    if (isOptionsOpen.value) {
      isOptionsOpen.value = false
    }

    for (const key of Object.keys(isBasesOptionsOpen.value)) {
      isBasesOptionsOpen.value[key] = false
    }
  })

  function tableDelete() {
    isTableDeleteDialogVisible.value = true
    $e('c:table:delete')
  }

  onMounted(() => { base.value.isExpanded = true })
  const isUIAclModalOpen = ref(false)
  const activedSource = ref<SourceType>()

  function openAcl(source: SourceType) {
    if (!source?.id) { return; }
    activedSource.value = source;
    isUIAclModalOpen.value = true
  }

  function atUpdateModalVis(evt: boolean) {
    isUIAclModalOpen.value = evt
  }
</script>

<template>
  <NcDropdown :trigger="['contextmenu']"
              overlay-class-name="nc-dropdown-tree-view-context-menu">
    <div class="ml-3 mr-2 nc-base-sub-menu rounded-md"
         :class="{ active: base.isExpanded }"
         :data-testid="`nc-sidebar-base-${base.title}`"
         :data-base-id="base.id">

      <div :class="{
        'bg-violet-100 !text-primary active': activeProjectId === base.id && baseViewOpen && !isMobileMode,
        'hover:bg-violet-100': !(activeProjectId === base.id && baseViewOpen),
      }"
           :data-testid="`nc-sidebar-base-title-${base.title}`"
           class="cursor-pointer pr-4 text-slate-500 nc-sidebar-node base-title-node h-11 flex-grow rounded-md group flex items-center w-full pr-1"
           @click="onProjectClick(base)">

        <div v-e="['c:base:emojiSelect']"
             class="flex items-center select-none pl-3 h-full">
          <a-spin v-if="base.isLoading"
                  class="!ml-1.25 !flex !flex-row !items-center !my-0.5 w-8"
                  :indicator="indicator" />
          <GeneralWsFolderHomeIcon :size="18" />
        </div>

        <div class="pl-2 flex-grow">
          {{ $t("title.workspaceHome") }} (<span>{{ (base?.sources?.length || 1) - 1 }}</span>)
        </div>
        <DashboardTreeViewFolderCreateWs v-if="isUIAllowed('tableCreate', { roles: baseRole })" />
        <svg xmlns="http://www.w3.org/2000/svg"
             width="20"
             height="20"
             viewBox="0 0 256 256">
          <g fill="currentColor">
            <path d="M216 115.54V208a8 8 0 0 1-8 8h-48a8 8 0 0 1-8-8v-48a8 8 0 0 0-8-8h-32a8 8 0 0 0-8 8v48a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-92.46a8 8 0 0 1 2.62-5.92l80-75.54a8 8 0 0 1 10.77 0l80 75.54a8 8 0 0 1 2.61 5.92Z"
                  opacity=".1" />
            <path opacity=".4"
                  d="m218.83 103.77l-80-75.48a1.14 1.14 0 0 1-.11-.11a16 16 0 0 0-21.53 0l-.11.11l-79.91 75.48A16 16 0 0 0 32 115.55V208a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48h32v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-92.45a16 16 0 0 0-5.17-11.78ZM208 208h-48v-48a16 16 0 0 0-16-16h-32a16 16 0 0 0-16 16v48H48v-92.45l.11-.1L128 40l79.9 75.43l.11.1Z" />
          </g>
        </svg>
      </div>
      <div class="pt-2" />
      <div v-if="base.id && !base.isLoading"
           key="g1"
           class="overflow-x-hidden transition-max-height"
           :class="{ 'max-h-0': !base.isExpanded }">
        <template v-if="base && base?.sources">
          <div class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col"
               :class="{ 'mb-[20px]': isSharedBase }">
            <div v-if="base?.sources?.slice(1).filter((el) => el.enabled)?.length"
                 class="transition-height duration-200">
              <div class="border-none sortable-list">
                <div v-for="(source, sourceIndex) of base.sources"
                     :key="`source-${source.id}`"
                     class="mt-2">
                  <template v-if="sourceIndex === 0"></template>
                  <a-collapse v-else-if="source && source.enabled"
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
                          <div v-if="sourceIndex === 0"
                               class="source-context flex items-center gap-2 text-gray-800 nc-sidebar-node-title"
                               @contextmenu="setMenuContext('source', source)">
                            <GeneralBaseLogo class="min-w-4 !xs:(min-w-4.25 w-4.25 text-sm)" />
                            {{ $t('general.default') }}
                          </div>
                          <div v-else
                               class="source-context flex flex-grow items-center gap-1.75 text-gray-800 min-w-1/20 max-w-full"
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
                            <NcDropdown :visible="isBasesOptionsOpen[source!.id!]"
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
                              <template #overlay>
                                <NcMenu class="nc-scrollbar-md !px-1.5"
                                        :style="{
                                          maxHeight: '70vh',
                                          overflow: 'overlay',
                                        }"
                                        @click="isBasesOptionsOpen[source!.id!] = false">

                                  <NcMenuItem v-if="isUIAllowed('tableCreate', { roles: baseRole })"
                                              key="rename"
                                              @click.stop="openTableRenameDialog(sourceIndex)">
                                    <GeneralIcon icon="edit"
                                                 class="leading-5"
                                                 style="-webkit-text-stroke: 0.15px" />
                                    {{ $t('general.rename') }}
                                  </NcMenuItem>

                                  <NcDivider v-if="isUIAllowed('tableCreate', { roles: baseRole })" />

                                  <NcMenuItem v-if="isUIAllowed('tableCreate', { roles: baseRole })"
                                              key="createTable"
                                              @click.stop="openTableCreateDialog(sourceIndex)">
                                    <GeneralIcon icon="plus"
                                                 class="text-xl leading-5"
                                                 style="-webkit-text-stroke: 0.15px" />
                                    {{ $t('activity.createTable') }}
                                  </NcMenuItem>

                                  <DashboardTreeViewBaseOptions v-if="showBaseOption"
                                                                v-model:base="base"
                                                                :source="source" />
                                  <NcDivider v-if="showBaseOption" />
                                  <NcMenuItem key="erd"
                                              @click="openErdView(source)">
                                    <div v-e="['c:source:erd']"
                                         class="flex gap-2 items-center">
                                      <GeneralIcon icon="erd" />
                                      {{ $t('title.relations') }}
                                    </div>
                                  </NcMenuItem>

                                  <NcDivider v-if="isUIAllowed('tableCreate', { roles: baseRole })" />
                                  <NcMenuItem v-if="isUIAllowed('tableCreate', { roles: baseRole })"
                                              key="privilegesMgmt"
                                              @click="openAcl(source)">
                                    <div v-e="['c:source:erd']"
                                         class="flex gap-2 items-center">
                                      <GeneralIcon icon="acl" />
                                      {{ $t('title.privilegesMgmt') }}
                                    </div>
                                  </NcMenuItem>

                                </NcMenu>
                              </template>
                            </NcDropdown>
                          </div>
                        </div>
                      </template>
                      <div ref="menuRefs"
                           :key="`sortable-${source.id}-${source.id && source.id in keys ? keys[source.id] : '0'}`"
                           :nc-source="source.id"
                           class="px-3 pb-3">
                        <DashboardTreeViewTableList :base="base"
                                                    :source-index="sourceIndex" />
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
    <template v-if="!isSharedBase"
              #overlay>
      <NcMenu class="!py-0 rounded text-sm">
        <template v-if="contextMenuTarget.type === 'base' && base.type === 'database'"></template>

        <template v-else-if="contextMenuTarget.type === 'source'"></template>

        <template v-else-if="contextMenuTarget.type === 'table'">
          <NcMenuItem v-if="isUIAllowed('tableRename')"
                      @click="openRenameTableDialog(contextMenuTarget.value, true)">
            <div v-e="['c:table:rename']"
                 class="nc-base-option-item flex gap-2 items-center">
              <GeneralIcon icon="edit"
                           class="text-gray-700" />
              {{ $t('general.rename') }}
            </div>
          </NcMenuItem>

          <NcMenuItem v-if="isUIAllowed('tableDuplicate') && (contextMenuBase?.is_meta || contextMenuBase?.is_local)"
                      @click="duplicateTable(contextMenuTarget.value)">
            <div v-e="['c:table:duplicate']"
                 class="nc-base-option-item flex gap-2 items-center">
              <GeneralIcon icon="duplicate"
                           class="text-gray-700" />
              {{ $t('general.duplicate') }}
            </div>
          </NcMenuItem>
          <NcDivider />
          <NcMenuItem v-if="isUIAllowed('table-delete')"
                      class="!hover:bg-red-50"
                      @click="tableDelete">
            <div class="nc-base-option-item flex gap-2 items-center text-red-600">
              <GeneralIcon icon="delete" />
              {{ $t('general.delete') }}
            </div>
          </NcMenuItem>
        </template>
      </NcMenu>
    </template>
  </NcDropdown>
  <DlgTableDelete v-if="contextMenuTarget.value?.id && base?.id"
                  v-model:visible="isTableDeleteDialogVisible"
                  :table-id="contextMenuTarget.value?.id"
                  :base-id="base?.id" />
  <GeneralModal v-model:visible="isErdModalOpen"
                size="large">
    <div class="h-[80vh]">
      <LazyDashboardSettingsErd :source-id="activeBaseId" />
    </div>
  </GeneralModal>
  <GeneralModal v-model:visible="isUIAclModalOpen"
                class="!w-[60rem]"
                closable
                @update:visible="atUpdateModalVis">
    <div v-if="isUIAclModalOpen"
         class="p-6">
      <DashboardSettingsFolderUiAcl :source-id="activedSource?.id"
                                    :source-name="activedSource?.alias"
                                    @close="isUIAclModalOpen = false" />
    </div>
  </GeneralModal>
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
