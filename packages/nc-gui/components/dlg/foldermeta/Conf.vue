/* eslint-disable @typescript-eslint/indent */
<script setup lang="ts">
  import pickBy from 'lodash/pickBy'
  import some from 'lodash/some'
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
  const isError = ref(false)

  const { $api, $state } = useNuxtApp()

  const dialogShow = useVModel(props, 'modelValue', emits)

  const columns = [
    { title: 'ID', name: 'id', dataIndex: 'id', key: 'id' },
    { title: 'Display Title', name: 'title', dataIndex: 'title', key: 'title' },
    { title: 'Real DataBase Column', name: 'column_name', dataIndex: 'column_name', key: 'column_name' },
    { title: 'Uniq System Key(:guess)', key: 'mapKey', },
  ]

  const cancel = () => {
    dialogShow.value = false;
    emits('update:modelValue', false)
  }

  const tableColumnsKeyMap = ref<{ [key: string]: string }>({})

  const getTableColumnsKeyMap = async () => {
    if (!metas.value?.[table?.id]) {
      isError.value = true;
      return
    }
    isError.value = false;
    const { base_id, source_id, id } = metas.value?.[table.id];
    if (!(base_id && source_id && id)) { return }
    const getMapConf = await $api.instance.get(`/api/v1/user/store/projects/${base_id}/category/${source_id}_tableColumnsMap/key/${table.id}`)
      .then(v => v.data).catch(err => { })

    tableColumnsKeyMap.value = pickBy(getMapConf, (v: string, k: string) => {
      return some(metas.value?.[table.id]?.columns, { id: k })
    })
  }

  const setTableColumnsKeyMap = async () => {
    if (!metas.value?.[table?.id]) {
      return
    }

    const { base_id, source_id, id } = metas.value?.[table.id];
    if (!(base_id && source_id && id)) { return }
    await $api.instance.patch(
      `/api/v1/user/store/projects/${base_id}/category/${source_id}_tableColumnsMap/key/${table.id}`,
      tableColumnsKeyMap.value
    ).then(v => v.data).catch(err => { })

    cancel();
  }

  const tableColumnsConfRef = ref<any>()
  const getTableColumnsConfRef = async (forceRefresh = false) => {
    try {
      const tableKey = table?.meta?.sysTableKey;
      const qStr = forceRefresh ? '?f=Y' : '';
      if (entryConfig.value?.services?.inteApis?.baseURL) {

        tableColumnsConfRef.value = await $fetch(`${entryConfig.value?.services?.inteApis?.baseURL}${entryConfig.value?.services?.inteApis?.columnsMapRefPath}/${tableKey}${qStr}`, {
          method: 'GET',
          headers: { 'Authorization': entryConfig.value?.entryToken?.replace('__token__', '')! },
        })

      } else {
        tableColumnsConfRef.value = await $fetch(`/api/v1/db/meta/tables/conf/QrPYZWnu/DAmVCTSX/xHpKZ80eKh/${tableKey}`, {
          baseURL: $api.instance.defaults.baseURL,
          method: 'GET',
          headers: { 'xc-auth': $state.token.value as string }
        })
      }
    } catch (err) {
    }
  }

  const loadData = async () => {
    if (loading.value === true) { return }

    loading.value = true;
    await getMeta(table.id);
    await getTableColumnsKeyMap();
    await getTableColumnsConfRef()
    loading.value = false;
  }

  watch(() => table.id, () => { loadData() })

  watch(() => dialogShow, () => {
    if (dialogShow.value) { loadData() }
  })

  onMounted(async () => {
    loadData();
  })

  const triggerForceRefresh = ref(2)

  const clickTriggerFR = async () => {
    triggerForceRefresh.value++;

    if (triggerForceRefresh.value % 5 === 1) {
      await getTableColumnsConfRef(true)
    }
  }
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
        <div v-else-if="isError"
             class="py-30 w-120 flex justify-center">
          Get Config Meta Error, pelase check table confKey
        </div>
        <a-table v-else-if="!!metas[table.id]"
                 :columns="columns"
                 size="small"
                 class="border-1 rounded overflow-hidden"
                 :data-source="metas[table.id].columns">
          <template #bodyCell="{ column, record }">
            <template v-if="record && record.id && column.key === 'mapKey'">
              <div class="w-full -mt-1 -mb-1">
                <a-input v-model:value="tableColumnsKeyMap[record && record.id ? record.id : -1]"
                         :placeholder="tableColumnsConfRef?.[record?.column_name] ? `: ${record?.column_name}` : 'Map To Sys Key'" />
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
        <div class="px-5 flex items-center cursor-pointer border-b pt-2 h-10 text-ellipsis truncate"
             style="max-width:200px"
             @click="clickTriggerFR()">
          {{ $t("title.columnsConfRefrence") }}
          <span class="text--accent">
            {{ new Array(triggerForceRefresh - 2).fill('»').join('') }}
          </span>
        </div>
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
            <div v-for="(v, k) in tableColumnsConfRef"
                 style="font-family: monospace;"
                 class="px-2 mt-1 rounded w-full flex items-center"
                 :class="{ 'bg-slate-200/80': Object.values(tableColumnsKeyMap).includes(k) }">
              <span class="flex-grow"
                    :title="v">
                {{ k }}
              </span>
              <span v-if="Object.values(tableColumnsKeyMap).includes(k)"
                    class="text-xs">✔️</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </NcModal>
</template>
