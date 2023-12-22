<script setup lang="ts">
  import type { TableType } from 'nocodb-sdk'
  import {
    nextTick,
    useNuxtApp,
    useVModel,
    watchEffect,
    useTabs
  } from '#imports'

  const { tableMeta, ...props } = defineProps<{
    modelValue?: boolean
    tableMeta: TableType
  }>()

  const emits = defineEmits(['update:modelValue', 'change'])

  const { $api } = useNuxtApp()

  const dialogShow = useVModel(props, 'modelValue', emits)

  const inputEl = ref()

  const loading = ref(false)

  const sysTableKey = ref('')

  watchEffect(
    () => {
      if (tableMeta?.meta?.sysTableKey) {
        sysTableKey.value = `${tableMeta.meta.sysTableKey}`
      }
    },
    { flush: 'post' },
  )

  watch(() => dialogShow.value, () => {
    if (dialogShow.value) {
      nextTick(() => {
        if (inputEl.value) {
          inputEl.value.setSelectionRange(0, sysTableKey.value.length)
          inputEl.value.focus()
        }
      })
    }
  })

  const cancel = () => {
    dialogShow.value = false;
    emits('update:modelValue', false)
  }

  const { updateTab } = useTabs()

  const updateSysTableKey = async () => {
    try {
      if (!tableMeta) {
        dialogShow.value = false
        return
      }
      tableMeta.meta = {
        ...((tableMeta.meta as object) || {}),
        sysTableKey: sysTableKey.value,
      }

      updateTab({ id: tableMeta.id }, { meta: tableMeta.meta })

      await $api.dbTable.update(tableMeta.id as string, {
        meta: tableMeta.meta,
      })

      emits('change')

      dialogShow.value = false
    } catch (e) {
      message.error(await extractSdkResponseErrorMsg(e))
    }
  }
</script>

<template>
  <NcModal v-model:visible="dialogShow"
           size="small">
    <template #header>
      <div class="flex flex-row items-center gap-x-2">
        <GeneralIcon icon="table" />
        {{ $t('title.updateSystemTableKey') }}
      </div>
    </template>
    <div class="mt-2">
      <a-input ref="inputEl"
               v-model:value="sysTableKey"
               class="nc-input-md"
               hide-details
               size="large"
               :placeholder="$t('title.sysTableKey')"
               @keydown.enter="() => updateSysTableKey()" />
      <div class="flex flex-row justify-end gap-x-2 mt-6">
        <NcButton type="secondary"
                  @click="cancel()">{{ $t('general.cancel') }}</NcButton>
        <NcButton key="submit"
                  type="primary"
                  :disabled="!sysTableKey || sysTableKey === tableMeta?.meta?.sysTableKey"
                  label="Rename Table"
                  loading-label="Renaming Table"
                  :loading="loading"
                  @click="updateSysTableKey()">
          {{ $t('title.updateSystemTableKey') }}
        </NcButton>
      </div>
    </div>
  </NcModal>
</template>
