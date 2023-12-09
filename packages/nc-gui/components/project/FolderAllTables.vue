<script lang="ts" setup>
  import type { SourceType, TableType } from 'nocodb-sdk'
  import orderBy from 'lodash/orderBy'

  const { activeTables, tablePins } = storeToRefs(useTablesStore())
  const { openTable, setTablePins } = useTablesStore()
  const { openedProject } = storeToRefs(useBases())

  const defaultBase = computed(() => {
    return openedProject.value?.sources?.[0]
  })

  const tablesGroup = computed(() => {
    return {
      pinnedTables: activeTables.value?.filter((t: TableType) => tablePins.value[t.id as string] === true),
      otherTables: activeTables.value?.filter((t: TableType) => tablePins.value[t.id as string] !== true),
    }
  })

  const sources = computed(() => {
    // Convert array of sources to map of sources

    const baseMap = new Map<string, SourceType>()

    openedProject.value?.sources?.forEach((source) => {
      baseMap.set(source.id!, source)
    })

    return baseMap
  })

  const pinTable = async (id: string) => {
    if (openedProject.value?.id) {
      await setTablePins(openedProject.value.id, {
        ...tablePins.value,
        [id]: !tablePins.value[id]
      })
    }
  }
</script>

<template>
  <div class="w-full">
    <div class="flex px-9 pt-7 font-bold text-lg text-slate-500">
      {{ $t('title.totalxTablesInyWorkspaces', {
        x: activeTables.length,
        y: ((openedProject?.sources?.length || 1) - 1),
        xs: activeTables.length > 1 ? 's' : '',
        ys: (openedProject?.sources?.length || 1) > 2 ? 's' : ''
      }) }}
    </div>
    <div class="nc-scrollbar-md px-8 pb-8"
         style="height:calc(100vh - 92px)">
      <div v-for="(tables, k) in tablesGroup"
           class="mt-6 p-4 bg-white rounded border-1 border-slate-200/60">

        <div class="flex text-slate-500 items-center pb-2">
          <GeneralWsTableListPin v-if="k === 'pinnedTables'"
                                 size="16"
                                 pinned="true" />
          <svg v-else
               xmlns="http://www.w3.org/2000/svg"
               width="16"
               height="16"
               viewBox="0 0 24 24">
            <path fill="#9DACCA"
                  fill-rule="evenodd"
                  d="M20 4H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1ZM4 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H4Zm2 5h2v2H6V7Zm5 0a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-6Zm-3 4H6v2h2v-2Zm2 1a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1Zm-2 3H6v2h2v-2Zm2 1a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1Z"
                  clip-rule="evenodd" />
          </svg>
          <div class="pl-2">{{ $t(`title.${k}`) }}</div>
          <div class="bg-violet-100/80 rounded flex items-center justify-center px-1.5 h-5 ml-2">
            {{ tables.length }}
          </div>
        </div>
        <div v-if="tables.length === 0"
             class="text-slate-400 py-4">
          {{ $t("title.noItems") }}
        </div>
        <template v-else>
          <div v-for="table in orderBy(tables, ['source_id'], ['asc'])"
               :key="table.id"
               class="py-1 flex flex-row w-full cursor-pointer hover:bg-slate-200 border-1 border-slate-200/80 px-3 bg-slate-100 rounded mt-1.5"
               data-testid="proj-view-list__item"
               @click="openTable(table)">
            <div class="flex flex-row w-4/8 items-center gap-x-2"
                 data-testid="proj-view-list__item-title">
              <GeneralIcon icon="table"
                           class="text-slate-400 w-5 h-5" />
              {{ table?.title }}
            </div>

            <div class="w-3/8 text-gray-400 flex items-center">
              <div v-if="table.source_id === defaultBase?.id"
                   class="ml-0.75">-</div>
              <a-tooltip v-else>
                <template #title>
                  {{ $t("general.workingDirs") }}: {{ sources.get(table.source_id!)?.alias }}
                </template>
                <div class="capitalize flex flex-row items-center gap-x-2">
                  <GeneralWsFolderIcon size="18"
                                       class="text-gray-400" />
                  {{ sources.get(table.source_id!)?.alias }}
                </div>
              </a-tooltip>
            </div>

            <div class="w-1/8 text-gray-400 ml-0.25 flex justify-end">
              <a-tooltip>
                <template #title>
                  {{ $t(`activity.${tablePins[table.id] ? 'unpinTable' : 'pinTable'}`) }}
                </template>
                <div class="rounded-full w-9 h-9 cursor-pointer hover:bg-slate-100 flex justify-center items-center"
                     @click.stop="pinTable(table.id)">
                  <GeneralWsTableListPin size="16"
                                         :pinned="tablePins[table.id]" />
                </div>
              </a-tooltip>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
