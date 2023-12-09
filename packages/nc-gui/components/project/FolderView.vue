<script lang="ts" setup>
  import { useTitle } from '@vueuse/core'
  import NcLayout from '~icons/nc-icons/layout'
  const { openedProject } = storeToRefs(useBases())
  const { activeTables } = storeToRefs(useTablesStore())
  const { activeWorkspace, workspaceUserCount } = storeToRefs(useWorkspace())

  const { navigateToProjectPage } = useBase()

  const router = useRouter()
  const route = router.currentRoute

  const { $e } = useNuxtApp()

  /* const defaultBase = computed(() => {
    return openedProject.value?.sources?.[0]
  }) */

  const { isUIAllowed } = useRoles()

  const { base } = storeToRefs(useBase())

  const { projectPageTab } = storeToRefs(useConfigStore())

  const { isMobileMode } = useGlobal()

  const baseSettingsState = ref('')

  watch(
    () => route.value.query?.page,
    (newVal, oldVal) => {
      if (route.value.name !== 'index-typeOrId-baseId-index-index') return
      if (newVal && newVal !== oldVal) {
        if (newVal === 'collaborator') {
          projectPageTab.value = 'collaborator'
        } else if (newVal === 'data-source') {
          projectPageTab.value = 'data-source'
        } else {
          projectPageTab.value = 'allTable'
        }

        return
      }

      projectPageTab.value = 'allTable'
    },
    { immediate: true },
  )

  watch(projectPageTab, () => {
    $e(`a:project:view:tab-change:${projectPageTab.value}`)

    if (projectPageTab.value) {
      navigateToProjectPage({
        page: projectPageTab.value as any,
      })
    }
  })

  watch(
    () => openedProject.value?.title,
    () => {
      useTitle(`${openedProject.value?.title ?? activeWorkspace.value?.title ?? 'NocoDB'}`)
    },
  )
</script>

<template>
  <div class="h-full nc-base-view">
    <div class="flex flex-row pl-2 pr-2 border-b-1 border-gray-200 justify-between w-full"
         :class="{ 'nc-table-toolbar-mobile': isMobileMode, 'h-[var(--topbar-height)]': !isMobileMode }">
      <div class="flex flex-row items-center gap-x-3 w-full">
        <GeneralOpenLeftSidebarBtn />
        <div class="flex flex-row items-center h-full gap-x-2.5 w-full">
          <svg xmlns="http://www.w3.org/2000/svg"
               height="22"
               width="22"
               viewBox="0 0 512 512">
            <path class="fa-secondary"
                  opacity="0.4"
                  fill="#6366f1"
                  d="M336.4 12.9C400.2 34 453 79.5 483.5 138.4c5.2 10.1-2.5 21.6-13.8 21.6H265.2c-12.3 0-20-13.3-13.9-24l67-116c3.6-6.3 11.1-9.4 18-7.1zM0 256c0-50.9 14.9-98.3 40.5-138.2c6.1-9.5 19.9-8.6 25.6 1.2L168.2 296c6.2 10.7-1.5 24-13.9 24H20.5c-7.3 0-13.7-4.9-15.2-12.1C1.8 291.2 0 273.8 0 256zM256 512c-4 0-7.9-.1-11.9-.3c-11.3-.5-17.5-12.9-11.8-22.8L334.5 312c6.2-10.7 21.6-10.7 27.7 0l66.9 115.9c3.6 6.3 2.6 14.3-2.9 19.2C381.1 487.5 321.4 512 256 512z" />
            <path class="fa-primary"
                  opacity="1"
                  fill="#6366f1"
                  d="M256 0c4 0 7.9 .1 11.9 .3c11.3 .5 17.4 12.9 11.8 22.8L177.5 200c-6.2 10.7-21.6 10.7-27.7 0L82.8 84.1c-3.6-6.3-2.6-14.3 2.9-19.2C130.9 24.5 190.6 0 256 0zM193.6 492c-3.6 6.3-11.1 9.4-18 7.1C111.8 478 59 432.5 28.5 373.6C23.3 363.5 31 352 42.3 352H246.8c12.3 0 20 13.3 13.9 24l-67 116zm277.9-97.8c-6.1 9.5-19.9 8.6-25.6-1.2L343.8 216c-6.2-10.7 1.5-24 13.9-24H491.5c7.3 0 13.7 4.9 15.2 12.1c3.5 16.8 5.3 34.1 5.3 51.9c0 50.9-14.9 98.3-40.5 138.2z" />
          </svg>
          <div class="flex font-medium text-lg text-slate-500 capitalize">
            {{ $t("title.workspaceHome") }}
          </div>
          <a-dropdown trigger="click" >
            <div class="flex p-1 hover:bg-slate-200/90 cursor-pointer bg-slate-200/50 rounded-lg items-center text-slate-500 font-normal">
              <GeneralIcon icon="help"
                           class="text-slate-400 text" />
            </div>
            <template #overlay>
              <div class="rounded max-w-[400px] shadow-lg p-5 bg-white border-1 text-slate-500 border-slate-200">
                <div class="font-bold text-lg">✨ {{ $t("title.aboutWorkspace") }}</div>
                <div>
                  {{ $t("title.aboutWorkspaceMsg") }}
                </div>
                <div class="font-bold text-lg pt-5">✨ {{ $t("title.tables") }}</div>
                <div>
                  {{ $t("title.aboutTablesMsg") }}
                </div>
                <div class="font-bold text-lg pt-5">✨ {{ $t("objects.views") }}</div>
                <div>
                  {{ $t("title.aboutViewsMsg") }}
                </div>
              </div>
            </template>
          </a-dropdown>
          <div class="flex-grow" />
          <div v-if="isUIAllowed('sourceCreate')"
               style="width:320px"
               class="pt-3.25">
            <a-tabs v-model:activeKey="projectPageTab"
                    class="w-full justify-end"
                    size="small"
                    centered>
              <a-tab-pane key="allTable">
                <template #tab>
                  <div class="tab-title"
                       data-testid="proj-view-tab__all-tables">
                    <GeneralIcon icon="table" />
                    <div>{{ $t('labels.allTables') }}</div>
                    <div class="tab-info"
                         :class="{
                           'bg-primary-selected': projectPageTab === 'allTable',
                           'bg-gray-50': projectPageTab !== 'allTable',
                         }">
                      {{ activeTables.length }}
                    </div>
                  </div>
                </template>
              </a-tab-pane>
              <a-tab-pane key="collaborator">
                <template #tab>
                  <div class="tab-title"
                       data-testid="proj-view-tab__access-settings">
                    <GeneralIcon icon="users"
                                 class="!h-3.5 !w-3.5" />
                    <div>{{ $t('labels.members') }}</div>
                    <div v-if="workspaceUserCount"
                         class="tab-info"
                         :class="{
                           'bg-primary-selected': projectPageTab === 'collaborator',
                           'bg-gray-50': projectPageTab !== 'collaborator',
                         }">
                      {{ workspaceUserCount }}
                    </div>
                  </div>
                </template>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </div>
    </div>
    <div class="flex nc-base-view-tab bg-slate-100/50"
         :style="{
           height: 'calc(100% - var(--topbar-height))',
         }">
      <ProjectFolderAllTables v-if="projectPageTab === 'allTable'" />
      <ProjectFolderAccessSettings v-else-if="projectPageTab === 'collaborator'" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.ant-tabs-content) {
  @apply !h-full;
}

:deep(.ant-tabs-nav) {
  @apply !mb-0;
}

.tab-title {
  @apply flex flex-row items-center gap-x-2 px-2;
}

:deep(.ant-tabs-tab .tab-title) {
  @apply text-gray-500;
}

:deep(.ant-tabs-tab-active .tab-title) {
  @apply text-primary;
}

.tab-info {
  @apply flex pl-1.25 px-1.5 py-0.75 rounded-md text-xs;
}
</style>
