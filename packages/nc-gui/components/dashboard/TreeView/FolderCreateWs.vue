<script setup lang="ts">
  import { ProjectInj } from '#imports'

  const base = inject(ProjectInj)!

  const { entryConfig } = useGlobal()

  const showCreate = ref(false);
  const wsName = ref('')

  const openDialog = () => {
    showCreate.value = true;
  }

  const canCreateWs = computed(() => {
    return entryConfig.value?.subInfo?.ws > base.value.sources?.length!
  })

  const createWs = () => {

  }

  const upgrade = () => { }
</script>

<template>
  <div class="mr-2 opacity-60 hover:opacity-100 rounded-full w-6 h-6 hover:bg-violet-300/80 flex items-center justify-center hover:text-violet-500 cursor-pointer"
       @click.stop="openDialog">
    <GeneralIcon icon="plus" />
  </div>

  <a-modal v-model:visible="showCreate"
           :footer="null"
           @ok="createWs">
    <div class="pb-4 font-bold text-xl">{{ $t("activity.createWorkspace") }}</div>
    <a-input v-if="canCreateWs"
             v-model:value="wsName"
             placeholder="Basic usage" />
    <div class="flex-center flex-col">
      <GeneralUserIcon size="large"
                       color="#DBE2E8" />
      <div class="font-bold text-xl px-20 py-5 text-slate-500 text-center">
        {{ $t("labels.workspaceLimitReachInfo") }}
      </div>
      <div class="py-10" />
      <a-button type="primary"
                size="large"
                @click="upgrade">
        <div class="px-4">
          <MaterialSymbolsRocketLaunchOutline class="mr-2" />
          <span>{{ $t("labels.upgradeSubscription") }}</span>
        </div>
      </a-button>
    </div>

  </a-modal>
</template>

<style lang="scss">
.ant-modal-content {
  .ant-modal-close {
    right: 8px;
  }
}
</style>