<script setup lang="ts">
  import type { TableType } from 'nocodb-sdk'
  import type { ComponentPublicInstance } from '@vue/runtime-core'
  import {
    nextTick,
    useNuxtApp,
    useVModel,
    watchEffect,
    useTabs
  } from '#imports'

  const { tableMeta, ...props } = defineProps<{
    visible?: boolean
    tableMeta: TableType
  }>()

  const emits = defineEmits(['update:visible', 'change'])

  const { $api } = useNuxtApp()

  const dialogShow = useVModel(props, 'visible', emits)

  const inputEl = ref()

  const loading = ref(false)

  const displayName = ref('')

  watchEffect(
    () => {
      if (tableMeta?.meta?.displayName) {
        displayName.value = `${tableMeta.meta.displayName}`
      }
    },
    { flush: 'post' },
  )

  watch(() => dialogShow.value, () => {
    if (dialogShow.value) {
      nextTick(() => {
        if (inputEl.value) {
          inputEl.value.setSelectionRange(0, displayName.value.length)
          inputEl.value.focus()
        }
      })
    }
  })

  const cancel = () => {
    dialogShow.value = false
  }

  const { updateTab } = useTabs()

  const updateDisplayName = async () => {
    try {
      if (!tableMeta) {
        dialogShow.value = false
        return
      }
      tableMeta.meta = {
        ...((tableMeta.meta as object) || {}),
        displayName: displayName.value,
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
        {{ $t('title.updateDisplayName') }}
      </div>
    </template>
    <div class="mt-2">
      <a-input ref="inputEl"
               v-model:value="displayName"
               class="nc-input-md"
               hide-details
               size="large"
               :placeholder="$t('title.displayName')"
               @keydown.enter="() => updateDisplayName()" />
      <div class="flex flex-row justify-end gap-x-2 mt-6">
        <NcButton type="secondary"
                  @click="cancel()">{{ $t('general.cancel') }}</NcButton>
        <NcButton key="submit"
                  type="primary"
                  :disabled="!displayName || displayName === tableMeta?.meta?.displayName"
                  label="Rename Table"
                  loading-label="Renaming Table"
                  :loading="loading"
                  @click="updateDisplayName()">
          {{ $t('title.updateDisplayName') }}
        </NcButton>
      </div>
    </div>
  </NcModal>
</template>
