<script lang="ts" setup>
  const workspaceStore = useWorkspace()

  const { isWorkspaceLoading } = storeToRefs(workspaceStore)
  const { isSuper, baseRoles } = useRoles()
  const { isSharedBase } = storeToRefs(useBase())

  const { isMobileMode, entryConfig } = useGlobal()

  const treeViewDom = ref<HTMLElement>()

  const isTreeViewOnScrollTop = ref(false)

  const checkScrollTopMoreThanZero = () => {
    if (isMobileMode.value) return

    if (treeViewDom.value) {
      if (treeViewDom.value.scrollTop > 0) {
        isTreeViewOnScrollTop.value = true
      } else {
        isTreeViewOnScrollTop.value = false
      }
    }
    return false
  }

  onMounted(() => {
    treeViewDom.value?.addEventListener('scroll', checkScrollTopMoreThanZero)
  })

  onUnmounted(() => {
    treeViewDom.value?.removeEventListener('scroll', checkScrollTopMoreThanZero)
  })
</script>

<template>
  <div class="nc-sidebar flex flex-col bg-white outline-r-1 outline-gray-100 select-none w-full h-full"
       :style="{
         outlineWidth: '1px',
       }">
    <div class="flex flex-col">
      <DashboardSidebarHeader />

      <DashboardSidebarTopSection v-if="!isSharedBase" />
    </div>
    <div ref="treeViewDom"
         class="flex flex-col pb-8 nc-scrollbar-dark-md flex-grow xs:(border-transparent pt-2 pr-2)"
         :class="{
           'border-t-1': !isSharedBase,
           'border-transparent': !isTreeViewOnScrollTop,
           'pt-0.25': isSharedBase,
         }">
      <DashboardTreeView v-if="!isWorkspaceLoading && isSuper" />
      <DashboardTreeViewFolders v-else />
    </div>
    <div v-if="entryConfig?.entryToken"
         class="h-10 border-t flex items-center px-5 gap-2">
      <div v-if="baseRoles?.commenter === true"
           class="flex items-center bg-slate-100 rounded-lg">
        <div class="flex items-center justify-center p-1 bg-gradient-to-t from-sky-500 to-indigo-500 rounded-lg">
          <GeneralIcon icon="edit"
                       class="text-indigo-100 text-xs text-white" />
        </div>
        <span class="text-xs pl-2 pr-2">{{ $t("title.readOnlyWs") }}</span>
      </div>
      <div v-else-if="baseRoles?.editor === true"
           class="flex items-center bg-slate-100 rounded-lg">
        <div class="flex items-center justify-center p-1 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-lg">
          <GeneralIcon icon="edit"
                       class="text-indigo-100 text-xs text-white" />
        </div>
        <span class="text-xs pl-2 pr-2">{{ $t("title.readWriteWs") }}</span>
      </div>
    </div>
    <div v-if="!isSharedBase && isSuper">
      <DashboardSidebarUserInfo />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nc-sidebar-top-button {
  @apply flex flex-row mx-1 px-3.5 rounded-md items-center py-0.75 my-0.5 gap-x-2 hover:bg-gray-200 cursor-pointer;
}
</style>
