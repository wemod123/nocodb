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
