/* eslint-disable @typescript-eslint/indent */
<script setup lang="ts">
  import { useNuxtApp, useVModel, iconMap } from '#imports'

  const props = defineProps<{ modelValue?: boolean }>()
  const emits = defineEmits(['update:modelValue'])
  const dialogShow = useVModel(props, 'modelValue', emits)
  const close = () => {
    dialogShow.value = false;
    emits('update:modelValue', false)
  }

  const { activeView } = storeToRefs(useViewsStore())

  const { $state, $api } = useNuxtApp()

  const loading = ref(false)
  const refreshing = ref(false)

  const set_loadSubFrame = ref(activeView?.value?.meta?.loadSubFrame || false)
  const set_subFramePath = ref(activeView?.value?.meta?.subFramePath || '')
  const set_asPageId = ref(activeView?.value?.meta?.asPageId || '')

  const saveViewMeta = async () => {
    loading.value = true;

    const meta = activeView.value?.meta as any;
    const updateMeta = typeof meta === 'object'
      ? {
        ...meta,
        loadSubFrame: set_loadSubFrame.value,
        subFramePath: set_subFramePath.value,
        asPageId: set_asPageId.value
      } : {
        loadSubFrame: set_loadSubFrame.value,
        subFramePath: set_subFramePath.value,
        asPageId: set_asPageId.value
      };

    activeView.value.meta = updateMeta;

    await $api.dbView.update(activeView.value!.id!, {
      meta: updateMeta,
    })

    loading.value = false;

    close();
  }

  const dataset = ref();
  const getDatasetStatus = async () => {
    dataset.value = await $fetch(`/api/v2/datasets/${activeView.value?.fk_model_id}/meta`, {
      baseURL: $api.instance.defaults.baseURL,
      method: 'GET',
      headers: { 'xc-auth': $state.token.value as string }
    }) as string;
  }

  const refreshDataset = async () => {
    refreshing.value = true;
    dataset.value = await $fetch(`/api/v2/datasets/${activeView.value?.fk_model_id}/refresh`, {
      baseURL: $api.instance.defaults.baseURL,
      method: 'PATCH',
      headers: { 'xc-auth': $state.token.value as string }
    });
    refreshing.value = false;
  }

  onMounted(() => {
    nextTick(async () => {
      await getDatasetStatus();
    })
  })

  const dataSetRender = computed(() => {
    if (typeof dataset.value !== 'object') return [];
    if (Object.keys(dataset.value).length === 0) return [];

    const showData = dataset.value.dataset_last_refreshed ?
      {
        status: dataset.value.last_status,
        message: dataset.value.message,
        rows: dataset.value.dataset_stats.records,
        refreshed: new Date(dataset.value.dataset_last_refreshed).toLocaleString(),
      } : dataset.value;

    const jsonString = JSON.stringify(showData, null, 2);
    return jsonString.split('\n').map((line) => {
      const [key, ...value] = line.split(':');
      return [key, value.join(':')]
    });
  })
</script>

<template>
  <NcModal v-model:visible="dialogShow"
           size="large"
           width="600"
           no-padding>
    <div class="p-8 min-w-120 max-w-200">
      <div class="flex flex-col w-full pb-4">
        <div class="text-lg font-semibold mb-4">Sub Frame Configuration</div>
        <div class="flex flex-col">
          <div class="flex flex-col gap-y-2">
            <div class="text-sm text-gray-500 font-bold">Load Sub Frame</div>
            <div class="text-xs text-gray-400">Replace the Grid view with a embed content, the embeded content will use
              the table data as a dataset</div>
            <div class="inline">
              <a-switch v-model:checked="set_loadSubFrame" />
            </div>
          </div>
          <div class="flex flex-col gap-y-2 pt-6">
            <div class="text-sm text-gray-500 font-bold">Sub Frame Absolute Path</div>
            <div class="text-xs text-gray-400 -mt-1">If target is embed a full and absolute path</div>
            <a-input v-model:value="set_subFramePath" />
          </div>
          <div class="flex flex-col gap-y-2 pt-6">
            <div class="text-sm text-gray-500 font-bold">AS App Page ID</div>
            <div class="text-xs text-gray-400 -mt-1">If target is AS app, copy the pageId(without prefix) to here</div>
            <a-input v-model:value="set_asPageId" />
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-slate-100 pl-4 pr-2 py-2">
        <div class="flex items-center">
          <span class="font-bold flex-1">
            Dataset Status
          </span>
          <NcButton size="xs"
                    type="secondary"
                    :disabled="refreshing || dataset?.refreshing === true"
                    :loading="refreshing || dataset?.refreshing === true"
                    @click="refreshDataset">
            <component v-if="!(refreshing || dataset?.refreshing === true)"
                       :is="iconMap.reload"
                       class="mr-2" />
            Refresh Dataset
          </NcButton>
        </div>
        <div class="max-w-[600px] py-4 min-h-40 max-h-60 overflow-y-auto">
          <div v-if="!dataSetRender || dataSetRender.length === 0">
            Dataset is not ready for table [{{ activeView._ptn }}], click refresh dataset to initilize dataset, the
            initializtion may take a while.
          </div>
          <div v-for="(line, i) in dataSetRender.slice(1, dataSetRender.length - 1)"
               class="text-xs"
               style="font-family: monospace;">
            <span class="text-gray-500 bg-slate-200 rounded px-1">{{ line[0].replace(/"/g, '') }}</span>:
            <span>{{ line[1] }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-row justify-end gap-x-2 mt-4">
        <NcButton type="secondary"
                  @click="close()">{{ $t('general.cancel') }}</NcButton>
        <NcButton key="submit"
                  type="primary"
                  label="Rename Table"
                  loading-label="Renaming Table"
                  :loading="loading"
                  @click="saveViewMeta()">
          {{ $t('general.save') }}
        </NcButton>
      </div>
    </div>
  </NcModal>
</template>
