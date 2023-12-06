<script setup lang="ts">
  import type { ComponentPublicInstance } from '@vue/runtime-core'
  import {
    extractSdkResponseErrorMsg,
    message,
    nextTick,
    reactive,
    useVModel,
    watchEffect,
  } from '#imports'

  interface Props {
    modelValue?: boolean
    baseId: string
    sourceId: string
    currentTitle: string
  }

  const { baseId, sourceId, currentTitle, ...props } = defineProps<Props>()

  const emit = defineEmits(['update:modelValue', 'updated'])

  const { $api, $state } = useNuxtApp()
  const baseURL = $api.instance.defaults.baseURL

  const basesStore = useBases()

  const dialogShow = useVModel(props, 'modelValue', emit)

  const inputEl = ref<ComponentPublicInstance>()

  const loading = ref(false)
  const formState = reactive({ title: currentTitle })

  watchEffect(
    () => {
      if (currentTitle) formState.title = currentTitle

      nextTick(() => {
        const input = inputEl.value?.$el as HTMLInputElement

        if (input) {
          input.setSelectionRange(0, formState.title.length)
          input.focus()
        }
      })
    },
    { flush: 'post' },
  )

  const renameTable = async () => {
    if (!(baseId && sourceId && currentTitle)) return
    if (!formState.title) return

    loading.value = true
    try {
      await $fetch(`/api/v1/db/meta/projects/${baseId}/bases/${sourceId}/name`, {
        baseURL,
        method: 'PATCH',
        headers: { 'xc-auth': $state.token.value as string },
        body: { alias: formState.title },
      })

      dialogShow.value = false

      await basesStore.loadProject(baseId!, true)

      dialogShow.value = false
    } catch (e: any) {
      message.error(await extractSdkResponseErrorMsg(e))
    }

    loading.value = false
  }
</script>

<template>
  <NcModal v-model:visible="dialogShow"
           size="small">
    <template #header>
      <div class="flex flex-row items-center gap-x-2">
        <svg xmlns="http://www.w3.org/2000/svg"
             width="22"
             height="22"
             viewBox="0 0 24 24">
          <g fill="none"
             stroke="#718097"
             stroke-linecap="round"
             stroke-linejoin="round"
             stroke-width="2">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            <circle cx="12"
                    cy="13"
                    r="2" />
            <path d="M12 15v5" />
          </g>
        </svg>
        {{ $t('title.renameWs') }}
      </div>
    </template>
    <div class="mt-2">
      <a-form :model="formState"
              name="create-new-table-form">
        <a-form-item>
          <a-input ref="inputEl"
                   v-model:value="formState.title"
                   class="nc-input-md"
                   hide-details
                   size="large"
                   :placeholder="$t('msg.info.enterTableName')"
                   @keydown.enter="() => renameTable()" />
        </a-form-item>
      </a-form>
      <div class="flex flex-row justify-end gap-x-2 mt-6">
        <NcButton type="secondary"
                  @click="dialogShow = false">{{ $t('general.cancel') }}</NcButton>

        <NcButton key="submit"
                  type="primary"
                  :disabled="!formState.title"
                  label="Rename Table"
                  loading-label="Renaming Table"
                  :loading="loading"
                  @click="() => renameTable()">
          {{ $t('title.renameWs') }}
          <template #loading> {{ $t('title.renameWs') }}</template>
        </NcButton>
      </div>
    </div>
  </NcModal>
</template>
