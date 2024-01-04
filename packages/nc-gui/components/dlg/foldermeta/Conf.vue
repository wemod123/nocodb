
<script setup lang="ts">
  import type { TableType } from 'nocodb-sdk'
  import {
    useNuxtApp,
    useVModel,
    useMetas
  } from '#imports'

  const { table, ...props } = defineProps<{
    modelValue?: boolean
    table: TableType
  }>()

  const { entryConfig } = useGlobal()

  const emits = defineEmits(['update:modelValue'])

  const { metas, getMeta } = useMetas()

  const loading = ref(false)

  const { $api } = useNuxtApp()

  const dialogShow = useVModel(props, 'modelValue', emits)

  const columns = [
    { title: 'ID', name: 'id', dataIndex: 'id', key: 'id' },
    { title: 'Display Title', name: 'title', dataIndex: 'title', key: 'title' },
    { title: 'DataBase Column (auto)', name: 'column_name', dataIndex: 'column_name', key: 'column_name' },
    { title: 'Map To System Key', key: 'mapKey', },
  ]

  const cancel = () => {
    dialogShow.value = false;
    emits('update:modelValue', false)
  }

  const tableColumnsKeyMap = ref<{ [key: string]: string }>({})

  const getTableColumnsKeyMap = async () => {
    const { base_id, source_id, id } = metas.value[table.id];
    if (!(base_id && source_id && id)) { return }
    tableColumnsKeyMap.value = await $api.instance.get(`/api/v1/user/store/projects/${base_id}/category/${source_id}_tableColumnsMap/key/${table.id}`)
      .then(v => v.data).catch(err => { })
  }

  const setTableColumnsKeyMap = async () => {
    const { base_id, source_id, id } = metas.value[table.id];
    if (!(base_id && source_id && id)) { return }
    await $api.instance.patch(
      `/api/v1/user/store/projects/${base_id}/category/${source_id}_tableColumnsMap/key/${table.id}`,
      tableColumnsKeyMap.value
    ).then(v => v.data).catch(err => { })

    cancel();
  }

  const tableColumnsConfRef = ref<any>()
  const getTableColumnsConfRef = async (tableKey: string) => {
    try {
      tableColumnsConfRef.value = await $fetch(`${entryConfig.value?.services?.inteApis?.baseURL}${entryConfig.value?.services?.inteApis?.columnsMapRefPath}/${tableKey}`, {
        method: 'GET',
        headers: { 'Authorization': entryConfig.value?.entryToken?.replace('__token__', '')! },
      }).then()
    } catch (err) { }
  }

  const loadData = async () => {
    if (loading.value === true) { return }

    loading.value = true;
    await getMeta(table.id);
    await getTableColumnsKeyMap(table.id);
    await getTableColumnsConfRef(table.meta.sysTableKey)
    loading.value = false;
  }

  watch(() => table.id, () => { loadData() })

  watch(() => dialogShow, () => {
    if (dialogShow.value) { loadData() }
  })

  onMounted(async () => {
    loadData();
  })
</script>

<template>
  <NcModal v-model:visible="dialogShow"
           size="slarge"
           width="600"
           no-padding>
    <div class="flex">
      <div class="mt-2 px-6 py-4">
        <div class="font-bold text-lg flex items-center pb-2">
          <div class="flex flex-row items-center gap-x-2">
            <GeneralIcon icon="table" />
            {{ $t('title.columnKeyMaps') }}:
            <span class="text-primary">{{ table.meta.sysTableKey }}</span>
          </div>
          <div class="flex p-1 hover:bg-slate-200/90 ml-2 cursor-pointer bg-slate-200/50 rounded-lg items-center text-slate-500 font-normal"
               @click="loadData()">
            <GeneralIcon icon="reload"
                         class="text-slate-400 text-sm text" />
          </div>
        </div>
        <div v-if="loading"
             class="py-30 w-120 flex justify-center">
          <a-spin />
        </div>
        <a-table v-else-if="!!metas[table.id]"
                 :columns="columns"
                 size="small"
                 class="border-1 rounded overflow-hidden"
                 :data-source="metas[table.id].columns">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'mapKey'">
              <div class="w-full -mt-1 -mb-1">
                <a-input v-model:value="tableColumnsKeyMap[record.id]"
                         placeholder="Map To Sys Key" />
              </div>
            </template>
          </template>
        </a-table>
        <div class="flex flex-row justify-end gap-x-2 mt-4">
          <NcButton type="secondary"
                    @click="cancel()">{{ $t('general.cancel') }}</NcButton>
          <NcButton key="submit"
                    type="primary"
                    label="Rename Table"
                    loading-label="Renaming Table"
                    :loading="loading"
                    @click="setTableColumnsKeyMap()">
            {{ $t('general.save') }}
          </NcButton>
        </div>
      </div>
      <div class="ml-4 border-1 bg-slate-50 rounded-r-2xl"
           style="width:240px;">
        <div class="px-5 flex items-center border-b pt-2 h-10">{{ $t("title.columnsConfRefrence") }}</div>
        <div class="overflow-y-auto nc-scrollbar-md p-3"
             style="max-height:580px">
          <div v-if="loading">
            <a-spin />
          </div>
          <div v-else-if="!tableColumnsConfRef"
               class="px-2 text-slate-500">
            🟡 {{ $t("msg.errorPleaseTryLater") }}
          </div>
          <template v-else>
            <div v-for="conf in tableColumnsConfRef"
                 style="font-family: monospace;"
                 class="px-2 mt-1 rounded w-full flex items-center"
                 :class="{ 'bg-slate-200/80': Object.values(tableColumnsKeyMap).includes(conf.key) }">
              <span class="flex-grow"
                    :title="conf.desc">
                {{ conf.key }}
              </span>
              <span v-if="Object.values(tableColumnsKeyMap).includes(conf.key)"
                    class="text-xs">✔️</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </NcModal>
</template>
