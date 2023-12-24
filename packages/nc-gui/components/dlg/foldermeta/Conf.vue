
import type { Meta } from 'nuxt/dist/head/runtime/components';

import type { Table } from 'ant-design-vue';

import type { divIcon } from 'leaflet';
<script setup lang="ts">
  import { isEmpty, find } from 'lodash-es'
  import type { TableType } from 'nocodb-sdk'
  import {
    nextTick,
    useNuxtApp,
    useVModel,
    watchEffect,
    useTabs,
    useMetas
  } from '#imports'

  const { table, ...props } = defineProps<{
    modelValue?: boolean
    table: TableType
  }>()

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

  const sysTableKey = ref('')

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

  const loadData = async () => {
    if (loading.value === true) { return }

    loading.value = true;
    await getMeta(table.id);
    await getTableColumnsKeyMap(table.id);
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
           width="600">
    <template #header>
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
    </template>

    <div class="mt-2">
      <div v-if="loading"
           class="py-30 w-120 flex justify-center">
        <a-spin />
      </div>
      <a-table v-else-if="!!metas[table.id]"
               :columns="columns"
               size="small"
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
      <div class="flex flex-row justify-end gap-x-2">
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
  </NcModal>
</template>
