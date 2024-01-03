<script setup lang="ts">
  import { ProjectInj, navigateTo } from '#imports'

  const base = inject(ProjectInj)!

  const { entryConfig, pF } = useGlobal()

  const showCreate = ref(false);
  const wsName = ref('')
  const loading = ref(false)

  const openDialog = () => {
    showCreate.value = true;
  }

  const canCreateWs = computed(() => {
    return entryConfig.value?.ws! > base.value.sources?.length! - 1
  })

  const createWs = async () => {
    if (entryConfig.value?.services && wsName.value) {
      loading.value = true;
      await $fetch(`${entryConfig.value.services?.baseApi?.baseURL}${entryConfig.value.services?.baseApi?.createWsPath}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${entryConfig.value?.entryToken?.replace('__token__', '')}` },
        body: { alias: wsName.value },
      })
      setTimeout(() => {
        loading.value = false;
        navigateTo('/')
      }, 1000);
    }
  }

  const upgrade = () => {
    pF.value?.event('showUpgradePanel')
  }
</script>

<template>
  <div class="mr-2 opacity-60 hover:opacity-100 transition rounded-full w-6 h-6 hover:bg-violet-300/80 flex items-center justify-center hover:text-violet-500 cursor-pointer"
       @click.stop="openDialog">
    <GeneralIcon icon="plus" />
  </div>

  <GeneralModal v-model:visible="showCreate"
                :footer="null"
                size="small"
                closable
                @ok="createWs">
    <div class="flex flex-col items-center pt-8 justify-center">
      <div class="pb-4 font-bold text-xl">{{ $t("activity.createWorkspace") }}</div>
      <div v-if="canCreateWs"
           class="flex pt-8 flex-col items-center pb-10 max-w-[220px]">
        <div class="flex justify-start w-full pl-1 text-slate-500">
          {{ $t("general.name") }}
        </div>
        <a-input v-model:value="wsName"
                 size="large"
                 required
                 :disabled="loading"
                 class="nc-input-md"
                 :placeholder="$t('general.name')" />
        <div class="py-6" />
        <a-button type="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!wsName"
                  class="!rounded-lg"
                  @click="createWs()">
          <div v-if="!loading"
               class="px-4 flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="20"
                 height="20"
                 viewBox="0 0 24 24">
              <path fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m-3-3h6m5 7a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
            <span class="pl-2">{{ $t("activity.createWorkspace") }}</span>
          </div>
        </a-button>
      </div>
      <div v-else
           class="flex pt-8 flex-col items-center pb-10">
        <GeneralUserIcon size="large"
                         is-sys
                         color="#DBE2E8" />
        <div class="font-bold text-xl px-20 py-10 text-slate-500 text-center">
          {{ $t("msg.workspaceLimitReachInfo") }}
        </div>
        <div class="py-10" />
        <a-button type="primary"
                  size="large"
                  class="!rounded-lg"
                  @click="upgrade">
          <div class="px-4 flex justify-center items-center">
            <MaterialSymbolsRocketLaunchOutline class="mr-2" />
            <span>{{ $t("msg.upgradeSubscription") }}</span>
          </div>
        </a-button>
      </div>
    </div>
  </GeneralModal>
</template>

<style lang="scss">
.ant-modal-content {
  .ant-modal-close {
    right: 8px;
  }
}
</style>