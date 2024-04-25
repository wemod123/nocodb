<script lang="ts" setup>
  import { get } from 'lodash-es'
  import type { BaseType, TableType } from 'nocodb-sdk'
  import { toRef } from '@vue/reactivity'
  import { message } from 'ant-design-vue'
  import { storeToRefs } from 'pinia'

  import { ProjectRoleInj, TreeViewInj, useNuxtApp, useRoles, useTabs, useMetas } from '#imports'
  import type { SidebarTableNode } from '~/lib'

  const props = withDefaults(
    defineProps<{
      base: BaseType
      table: SidebarTableNode
      sourceIndex: number
    }>(),
    { sourceIndex: 0 },
  )

  const { getMeta } = useMetas()

  const base = toRef(props, 'base')
  const table = toRef(props, 'table')
  const sourceIndex = toRef(props, 'sourceIndex')

  const { openTable: _openTable } = useTableNew({
    baseId: base.value.id!,
  })

  const route = useRoute()

  const { isUIAllowed } = useRoles()

  const { isMobileMode, isSysM, entryConfig } = useGlobal()

  const tableQrLink = computed(() => {
    return get(entryConfig.value, ['services', 'qUrls', table.value?.meta?.sysTableKey])
  })

  const tabStore = useTabs()
  const { updateTab } = tabStore

  const { $e, $api, $state } = useNuxtApp()

  useTableNew({
    baseId: base.value.id!,
  })

  const baseRole = inject(ProjectRoleInj)
  provide(SidebarTableInj, table)

  const { openRenameTableDialog, duplicateTable } = inject(TreeViewInj)!

  const openSetMetaDialog = () => {
    const isOpenSetMetaDialog = ref(true)
    const { close } = useDialog(resolveComponent('DlgFolderTableSetMeta'), {
      'modelValue': isOpenSetMetaDialog,
      'tableMeta': table,
      'onUpdate:modelValue': closeDialog,
    })

    function closeDialog() {
      isOpenSetMetaDialog.value = false;

      close(200);
    }
  }

  const openColumnKeyMapsDlg = () => {
    const isOpenColumnKeyMapConf = ref(true)
    const { close } = useDialog(resolveComponent('DlgFoldermetaConf'), {
      'modelValue': isOpenColumnKeyMapConf,
      'table': table,
      'onUpdate:modelValue': closeDialog,
    })

    function closeDialog() {
      isOpenColumnKeyMapConf.value = false;

      close(200);
    }
  }

  const openLinkQRCodeDialog = (qrLink: any) => {
    const isOpenQrLink = ref(true)
    const { close } = useDialog(resolveComponent('DlgFoldermetaQrLink'), {
      'modelValue': isOpenQrLink,
      qrLink,
      'onUpdate:modelValue': closeDialog,
    })

    function closeDialog() {
      isOpenQrLink.value = false;

      close(200);
    }
  }

  const { loadViews: _loadViews } = useViewsStore()
  const { activeView, activeViewTitleOrId } = storeToRefs(useViewsStore())
  const { isLeftSidebarOpen } = storeToRefs(useSidebarStore())

  // todo: temp
  const { baseTables } = storeToRefs(useTablesStore())
  const tables = computed(() => baseTables.value.get(base.value.id!) ?? [])

  const openedTableId = computed(() => route.params.viewId)

  const isTableDeleteDialogVisible = ref(false)

  const setIcon = async (icon: string, table: TableType) => {
    try {
      table.meta = {
        ...((table.meta as object) || {}),
        icon,
      }
      tables.value.splice(tables.value.indexOf(table), 1, { ...table })

      updateTab({ id: table.id }, { meta: table.meta })

      // await $api.dbTable.update(table.id as string, {
      //   meta: table.meta,
      // })

      await $fetch(`/api/v2/meta/tables/${table.id}/patch-meta`, {
        baseURL: $api.instance.defaults.baseURL,
        method: 'PATCH',
        body: { meta: table.meta },
        headers: { 'xc-auth': $state.token.value as string }
      }) as string;

      $e('a:table:icon:navdraw', { icon })
    } catch (e) {
      message.error(await extractSdkResponseErrorMsg(e))
    }
  }

  // Todo: temp

  const { isSharedBase } = useBase()
  // const isMultiBase = computed(() => base.sources && base.sources.length > 1)

  const canUserEditEmote = computed(() => {
    return isUIAllowed('tableIconEdit', { roles: baseRole?.value })
  })

  const isExpanded = ref(false)
  const isLoading = ref(false)
  const openDropdown = ref(false)

  const onExpand = async () => {
    if (isExpanded.value) {
      isExpanded.value = false
      return
    }

    isLoading.value = true
    try {
      await _loadViews({ tableId: table.value.id, ignoreLoading: true })
    } catch (e) {
      message.error(await extractSdkResponseErrorMsg(e))
    } finally {
      isLoading.value = false
      isExpanded.value = true
    }
  }

  const onOpenTable = async () => {
    isLoading.value = true
    try {
      await _openTable(table.value)

      if (isMobileMode.value) {
        isLeftSidebarOpen.value = false
      }
    } catch (e) {
      message.error(await extractSdkResponseErrorMsg(e))
    } finally {
      isLoading.value = false
      isExpanded.value = true
    }
  }

  watch(
    () => activeView.value?.id,
    () => {
      if (!activeView.value) return

      if (activeView.value?.fk_model_id === table.value?.id) {
        isExpanded.value = true
      }
    },
    {
      immediate: true,
    },
  )

  const isTableOpened = computed(() => {
    return openedTableId.value === table.value?.id && (activeView.value?.is_default || !activeViewTitleOrId.value)
  })

  const setMarkAsSys = async (table: TableType) => {
    try {
      table.meta = {
        ...((table.meta as object) || {}),
        markAsSys: !Boolean(table.meta?.markAsSys),
      }

      tables.value.splice(tables.value.indexOf(table), 1, { ...table })

      await $api.dbTable.update(table.id as string, {
        meta: table.meta
      })

      // Force Update Meta
      await getMeta(table.id!, true)

    } catch (e) {
      message.error(await extractSdkResponseErrorMsg(e))
    }
  }
</script>

<template>
  <div class="nc-tree-item nc-table-node-wrapper text-sm select-none w-full"
       :data-order="table.order"
       :data-id="table.id"
       :data-table-id="table.id"
       :class="[`nc-base-tree-tbl nc-base-tree-tbl-${table.title}`, isMobileMode ? 'ntnw-narrow' : '']"
       :data-active="openedTableId === table.id">
    <GeneralTooltip class="nc-tree-item-inner nc-sidebar-node pl-2 pr-0.75 mb-0.25 rounded-md h-10 w-full group cursor-pointer hover:bg-slate-200"
                    :class="{
                      'hover:bg-slate-200': openedTableId !== table.id,
                      'pl-2 xs:(pl-2)': sourceIndex !== 0,
                      'pl-2': sourceIndex === 0,
                      '!bg-slate-200 !text-primary': isTableOpened,
                    }"
                    modifier-key="Alt">
      <template #title>{{ table.table_name }}</template>
      <div v-e="['a:table:open']"
           class="table-context flex items-center gap-1 h-full pr-2"
           :data-testid="`nc-tbl-side-node-${table.title}`"
           @click="onOpenTable">
        <div class="flex flex-row h-full items-center pl-3">
          <NcButton v-e="['c:table:toggle-expand']"
                    type="text"
                    size="xxsmall"
                    class="nc-sidebar-node-btn nc-sidebar-expand hover:!bg-slate-300"
                    :class="activeView?.fk_model_id === table.id ? '!bg-slate-200 !text-gray-900' : ''"
                    @click.stop="onExpand">
            <GeneralLoader v-if="table.isViewsLoading"
                           class="flex w-4 h-4 !text-gray-600 !mt-0.75" />
            <GeneralIcon v-else
                         icon="triangleFill"
                         class="group-hover:opacity-100 opacity-50 cursor-pointer transform transition-transform duration-500 h-2 w-2 rotate-90"
                         :class="{ '!rotate-180 !opacity-100 !text-purple-400': isExpanded }" />
          </NcButton>

          <div class="flex w-auto pl-0.5"
               :data-testid="`tree-view-table-draggable-handle-${table.title}`">
            <div v-e="['c:table:emoji-picker']"
                 class="flex items-center nc-table-icon"
                 :class="{
                   'pointer-events-none': !canUserEditEmote,
                 }"
                 @click.stop>
              <LazyGeneralEmojiPicker :key="table.meta?.icon"
                                      :emoji="table.meta?.icon"
                                      size="small"
                                      :readonly="!canUserEditEmote || isMobileMode"
                                      @emoji-selected="setIcon($event, table)">
                <template #default>
                  <NcTooltip class="flex"
                             placement="topLeft"
                             hide-on-click
                             :disabled="!canUserEditEmote">
                    <template #title>
                      {{ $t('general.changeIcon') }}
                    </template>

                    <component :is="iconMap.table"
                               v-if="table.type === 'table'"
                               class="flex w-5 !text-gray-500 text-sm"
                               :class="{
                                 'group-hover:text-gray-500': isUIAllowed('tableSort', { roles: baseRole }),
                                 '!text-black': openedTableId === table.id,
                               }" />

                    <MdiEye v-else
                            class="flex w-5 !text-gray-500 text-sm"
                            :class="{
                              'group-hover:text-gray-500': isUIAllowed('tableSort', { roles: baseRole }),
                              '!text-black': openedTableId === table.id,
                            }" />
                  </NcTooltip>
                </template>
              </LazyGeneralEmojiPicker>
            </div>
          </div>
        </div>

        <span class="nc-tbl-title nc-sidebar-node-title text-ellipsis overflow-hidden select-none"
              :class="{
                '!font-medium': isTableOpened,
              }"
              :data-testid="`nc-tbl-title-${table.title}`"
              :style="{ wordBreak: 'keep-all', whiteSpace: 'nowrap', display: 'inline' }">
          {{ table.title || table.table_name }}
        </span>
        <div class="flex flex-grow h-full"></div>
        <NcTooltip class="flex"
                   placement="topLeft">
          <template #title>
            <div class="px-1.5 pt-1">{{ $t('msg.tableEntityMsg', { table: table.title || table.table_name }) }}</div>
            <div v-if="table.meta?.markAsSys"
                 class="py-1 text-yellow-300 flex items-center">
              <div class="flex items-center justify-center w-5">
                <GeneralIcon icon="lock" />
              </div>
              <span>{{ $t("title.sysTable") }}</span>
            </div>
          </template>
          <GeneralIconsTableLock v-if="table.meta?.markAsSys"
                                 class="!text-rose-400 hover:!text-rose-500 mr-1 opacity-0 group-hover:opacity-100"
                                 :class="{ 'opacity-100': openDropdown === true }"
                                 size="18" />
          <GeneralIcon v-else
                       icon="table"
                       class="!text-gray-400 hover:!text-primary mr-1 opacity-0 group-hover:opacity-100"
                       :class="{ 'opacity-100': openDropdown === true }" />
        </NcTooltip>
        <div class="flex flex-row items-center">
          <div v-if="!isSharedBase &&
            (isUIAllowed('tableRename', { roles: baseRole }) || isUIAllowed('tableDelete', { roles: baseRole }))
            "
               v-e="['c:table:option']">
            <NcDropdown :trigger="['click']"
                        class="nc-sidebar-node-btn"
                        @click.stop
                        @update:visible="openDropdown = !!$event">
              <MdiDotsHorizontal data-testid="nc-sidebar-table-context-menu"
                                 :class="{ '!opacity-100': openDropdown }"
                                 class="min-w-5.75 min-h-5.75 mt-0.2 mr-0.25 px-0.5 !text-gray-600 transition-opacity opacity-0 group-hover:opacity-100 nc-tbl-context-menu outline-0 rounded-md hover:(bg-gray-500 bg-opacity-15 !text-black)" />

              <template #overlay>
                <NcMenu class="!px-1"
                        :style="{ minWidth: '140px' }">

                  <NcMenuItem v-if="isSysM"
                              @click="setMarkAsSys(table)">
                    <div class="flex gap-2 items-center">
                      {{ table.meta?.markAsSys ? '🟠' : '🔘' }}
                      {{ $t(`title.${table.meta?.markAsSys ? 'unMarkSysTable' : 'markAsSysTable'}`) }}
                    </div>
                  </NcMenuItem>

                  <NcMenuItem v-if="isSysM"
                              @click="openSetMetaDialog(table)">
                    <div>
                      <div class="flex gap-2 leading-4 items-center">
                        🗝️ {{ $t("title.updateSystemTableKey") }}
                      </div>
                      <div class="text-xs leading-4 pl-6 text-slate-400">{{ table.meta?.sysTableKey || '-' }}</div>
                    </div>
                  </NcMenuItem>

                  <NcMenuItem v-if="isSysM"
                              @click="openColumnKeyMapsDlg(table)">
                    <div>
                      <div class="flex gap-2 leading-4 items-center">
                        🔁 {{ $t("title.columnKeyMaps") }}
                      </div>
                    </div>
                  </NcMenuItem>

                  <NcMenuItem v-if="isUIAllowed('tableRename', { roles: baseRole })"
                              :data-testid="`sidebar-table-rename-${table.title}`"
                              :disabled="table.meta?.markAsSys"
                              :class="[table.meta?.markAsSys ? '!text-slate-400' : '!text-slate-600']"
                              @click="openRenameTableDialog(table, base.sources[sourceIndex].id)">
                    <GeneralIconsDbEdit size="18" />
                    <div>
                      {{ $t(`title.updateDbTableName`) }}
                    </div>
                  </NcMenuItem>

                  <NcMenuItem v-if="isUIAllowed('tableRename', { roles: baseRole }) && !!tableQrLink"
                              @click="openLinkQRCodeDialog(tableQrLink)">
                    <div class="w-[18px] h-[18px] flex items-center justify-center">
                      <GeneralIcon icon="qrCode"
                                   style="font-size:18px" />
                    </div>
                    <div>
                      {{ tableQrLink.title }}
                    </div>
                  </NcMenuItem>
                  <!-- 
                  <NcMenuItem v-if="isUIAllowed('tableDuplicate') &&
                    base.sources?.[sourceIndex] &&
                    (base.sources[sourceIndex].is_meta || base.sources[sourceIndex].is_local)
                    "
                              :data-testid="`sidebar-table-duplicate-${table.title}`"
                              @click="duplicateTable(table)">
                    <div v-e="['c:table:duplicate']"
                         class="flex gap-2 items-center">
                      <GeneralIcon icon="duplicate"
                                   class="text-gray-700" />
                      {{ $t('general.duplicate') }}
                    </div>
                  </NcMenuItem> -->

                  <NcMenuItem v-if="isUIAllowed('tableDelete', { roles: baseRole })"
                              :data-testid="`sidebar-table-delete-${table.title}`"
                              class="!hover:bg-red-50"
                              :class="[table.meta?.markAsSys ? '!text-slate-400' : '!text-red-500']"
                              :disabled="table.meta?.markAsSys"
                              @click="isTableDeleteDialogVisible = true">
                    <div v-e="['c:table:delete']"
                         class="flex gap-2 items-center">
                      <GeneralIcon icon="delete" />
                      {{ table.meta?.markAsSys ? $t('title.canNotDeleteSysTable') : $t('general.delete') }}
                    </div>
                  </NcMenuItem>
                </NcMenu>
              </template>
            </NcDropdown>
          </div>
        </div>
      </div>
      <DlgTableDelete v-if="table.id && base?.id"
                      v-model:visible="isTableDeleteDialogVisible"
                      :table-id="table.id"
                      :base-id="base.id"
                      @update:visible="openDropdown = false" />
    </GeneralTooltip>
    <DashboardTreeViewFolderViewsList v-if="isExpanded"
                                      :table-id="table.id"
                                      :base-id="base.id" />
  </div>
</template>

<style scoped lang="scss">
.nc-tree-item {
  @apply relative after:(pointer-events-none content-[''] rounded absolute top-0 left-0 w-full h-full right-0 !bg-current transition duration-200 opacity-0);
}

.nc-tree-item.nc-table-node-wrapper {
  &:before {
    content: "";
    width: 2px;
    left: 30px;
    top: 30px;
    z-index: 99;
    position: absolute;
    height: calc(100% - 48px);
    display: block !important;
    background-color: #DFE4EE;
    background-size: 41px 41px;
    background-position: 0px 32px;
    background-image: repeating-linear-gradient(0deg, #9F2AF3, #9F2AF3 4px, #DFE4EE 4px, #DFE4EE);
  }

  &.ntnw-narrow:before{
    left: 36.2px;
  }
}

.nc-tree-item svg {
  @apply text-primary text-opacity-60;
}
</style>
