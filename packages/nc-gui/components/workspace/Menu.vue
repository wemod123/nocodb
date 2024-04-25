<script setup lang="ts">
  const { pF } = useGlobal()
  const { isMobileMode } = useGlobal()
</script>

<template>
  <div class="flex flex-row flex-grow pr-1 py-0.5 rounded-md w-full"
       style="max-width: calc(100% - 2.5rem)">
    <div class="flex-grow min-w-20"
         :class="{ 'pl-12': isMobileMode }">
      <div data-testid="nc-workspace-menu"
           class="flex capitalize font-bold text-lg text-slate-500 items-center nc-workspace-menu overflow-hidden py-1.25 pr-0.25 justify-center w-full ml-2">
        <svg xmlns="http://www.w3.org/2000/svg"
             height="20"
             width="20"
             viewBox="0 0 512 512">
          <path class="fa-secondary"
                opacity="0.4"
                fill="#6366f1"
                d="M464 104c0-13.3-10.7-24-24-24L72 80c-13.3 0-24 10.7-24 24s10.7 24 24 24l368 0c13.3 0 24-10.7 24-24zM416 24c0-13.3-10.7-24-24-24L120 0C106.7 0 96 10.7 96 24s10.7 24 24 24l272 0c13.3 0 24-10.7 24-24z" />
          <path class="fa-primary"
                opacity="1"
                fill="#6366f1"
                d="M448 160c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64l384 0z" />
        </svg>
        <span class="pl-2 truncate">{{ $t("general.baseTable") }}</span>
        <div class="flex p-1 hover:bg-slate-200/90 ml-2 cursor-pointer bg-slate-200/50 rounded-lg items-center text-slate-500 font-normal"
             @click="pF?.event('reload')">
          <GeneralIcon icon="reload"
                       class="text-slate-400 text-sm text" />
        </div>
        <div class="flex flex-grow" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.nc-workspace-menu-item {
  @apply flex items-center pl-2 py-2 gap-2 text-sm hover:text-black;
}
</style>