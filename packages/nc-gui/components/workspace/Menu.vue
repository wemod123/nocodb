<script setup lang="ts">
  import { iconMap, } from '#imports'

  const { isMobileMode, pF } = useGlobal()

  const isExpanded = ref(false)

  const setExpand = () => {
    isExpanded.value = !isExpanded.value;
    pF.value?.event('expandToFull', isExpanded.value)
  }
</script>

<template>
  <div class="flex flex-row flex-grow pr-1 py-0.5 rounded-md w-full"
       style="max-width: calc(100% - 2.5rem)">
    <div class="flex-grow min-w-20">
      <div data-testid="nc-workspace-menu"
           class="flex capitalize font-bold text-lg text-slate-500 items-center nc-workspace-menu overflow-hidden py-1.25 pr-0.25 justify-center w-full ml-2">
        <div v-if="isMobileMode"
             class="flex items-center cursor-pointer justify-center"
             @click="pF?.event('back-to-mHome')">
          <component :is="iconMap.chevronLeft"
                     class="text-3xl w-10" />
        </div>
        <div v-else-if="pF"
             class="flex items-center cursor-pointer justify-center mr-1 hover:bg-slate-100 rounded-lg w-8 h-8"
             @click="setExpand">
          <svg xmlns="http://www.w3.org/2000/svg"
               width="20"
               height="20"
               viewBox="0 0 24 24">
            <path v-if="isExpanded"
                  d="M19 13H3v-2h16l-4-4l1.4-1.4l6.4 6.4l-6.4 6.4L15 17zM3 6h10v2H3zm10 10v2H3v-2z" />
            <path v-else
                  d="m5 13l4 4l-1.4 1.42L1.18 12L7.6 5.58L9 7l-4 4h16v2zm16-7v2H11V6zm0 10v2H11v-2z" />
          </svg>
        </div>
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
             @click="navigateTo('/')">
          <GeneralIcon icon="reload"
                       class="text-slate-400 text-sm text" />
        </div>
        <div class="flex flex-grow"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.nc-workspace-menu-item {
  @apply flex items-center pl-2 py-2 gap-2 text-sm hover:text-black;
}
</style>
