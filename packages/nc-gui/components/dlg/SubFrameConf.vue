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
  const runtimeConfig = useRuntimeConfig()

  const loading = ref(false)
  const refreshing = ref(false)

  const set_loadSubFrame = ref(activeView?.value?.meta?.loadSubFrame || false)
  const set_subFramePath = ref(activeView?.value?.meta?.subFramePath || '')

  const saveViewMeta = async () => {
    loading.value = true;

    const meta = activeView.value?.meta as any;
    const updateMeta = typeof meta === 'object'
      ? {
        ...meta,
        loadSubFrame: set_loadSubFrame.value,
        subFramePath: set_subFramePath.value
      } : {
        loadSubFrame: set_loadSubFrame.value,
        subFramePath: set_subFramePath.value
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
    dataset.value = await $fetch(`/api/v1/table/${activeView.value?.fk_model_id}/dataset/meta`, {
      baseURL: runtimeConfig.public.ncDatasetApiBaseUrl,
      method: 'GET',
      headers: { 'xc-auth': $state.token.value as string }
    }) as string;
  }

  const refreshDataset = async () => {
    refreshing.value = true;
    await $fetch(`/api/v1/table/${activeView.value?.fk_model_id}/dataset/refresh`, {
      baseURL: runtimeConfig.public.ncDatasetApiBaseUrl,
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

    const jsonString = JSON.stringify(dataset.value, null, 2);
    return jsonString.split('\n');
  })
</script>

<template>
  <NcModal v-model:visible="dialogShow"
           size="large"
           width="600"
           no-padding>
    <div class="p-8 min-w-120 max-w-150">
      <div class="flex flex-col w-full pb-4">
        <div class="text-lg font-semibold mb-4">Sub Frame Configuration</div>
        <div class="flex flex-col">
          <div class="flex flex-col gap-y-2">
            <div class="text-sm text-gray-500">Load Sub Frame Or Not</div>
            <div class="inline">
              <a-switch v-model:checked="set_loadSubFrame" />
            </div>
          </div>
          <div class="flex flex-col gap-y-2 pt-4">
            <div class="text-sm text-gray-500">Sub Frame Absolute Path</div>
            <a-input v-model:value="set_subFramePath" />
          </div>
        </div>
      </div>
      <div class="rounded-lg bg-slate-100 px-4 py-2">
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
        <div class="font-mono max-w-[500px] py-4">
          <div v-if="!dataSetRender || dataSetRender.length === 0">
            Dataset is not available, click refresh dataset to initilize dataset, the initializtion may take a while.
          </div>
          <div v-for="(line, i) in dataSetRender"
               :class="{ 'pl-2': i === 0 || i === dataSetRender.length - 1 }">
            {{ line }}
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
