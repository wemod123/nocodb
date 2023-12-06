<script lang="ts" setup>
import tinycolor from 'tinycolor2'
import { UITypes } from 'nocodb-sdk'
import Table from './Table.vue'
import GroupBy from './GroupBy.vue'
import GroupByTable from './GroupByTable.vue'
import GroupByLabel from './GroupByLabel.vue'
import { GROUP_BY_VARS, computed, ref } from '#imports'
import type { Group, Row } from '#imports'

const props = defineProps<{
  group: Group

  loadGroups: (params?: any, group?: Group) => Promise<void>
  loadGroupData: (group: Group, force?: boolean) => Promise<void>
  loadGroupPage: (group: Group, p: number) => Promise<void>
  groupWrapperChangePage: (page: number, groupWrapper?: Group) => Promise<void>

  redistributeRows?: (group?: Group) => void

  viewWidth?: number
  scrollLeft?: number
  fullPage?: boolean

  depth?: number
  maxDepth?: number

  rowHeight?: number
  expandForm?: (row: Row, state?: Record<string, any>, fromToolbar?: boolean) => void
}>()

const emits = defineEmits(['update:paginationData'])

const vGroup = useVModel(props, 'group', emits)

const { isViewDataLoading, isPaginationLoading } = storeToRefs(useViewsStore())

const reloadViewDataHook = inject(ReloadViewDataHookInj, createEventHook())

const _depth = props.depth ?? 0

const wrapper = ref<HTMLElement | undefined>()

const scrollable = ref<HTMLElement | undefined>()

const tableHeader = ref<HTMLElement | undefined>()

const fullPage = computed<boolean>(() => {
  return props.fullPage ?? (tableHeader.value?.offsetWidth ?? 0) > (props.viewWidth ?? 0)
})

const _activeGroupKeys = ref<string[] | string>()

const activeGroups = computed<string[]>(() => {
  if (!_activeGroupKeys.value) return []
  if (Array.isArray(_activeGroupKeys.value)) {
    return _activeGroupKeys.value.map((k) => k.replace('group-panel-', ''))
  } else {
    return [_activeGroupKeys.value.replace('group-panel-', '')]
  }
})

const oldActiveGroups = ref<string[]>([])

const findAndLoadSubGroup = (key: any) => {
  key = Array.isArray(key) ? key : [key]
  if (key.length > 0 && vGroup.value.children) {
    if (!oldActiveGroups.value.includes(key[key.length - 1])) {
      const k = key[key.length - 1].replace('group-panel-', '')
      const grp = vGroup.value.children[k]
      if (grp) {
        if (grp.nested) {
          if (!grp.children?.length) props.loadGroups({}, grp)
        } else {
          if (!grp.rows?.length) props.loadGroupData(grp)
        }
      }
    }
  }
  oldActiveGroups.value = key
}

const reloadViewDataHandler = () => {
  if (vGroup.value.nested) {
    props.loadGroups({}, vGroup.value)
  } else {
    props.loadGroupData(vGroup.value, true)
  }
}

onBeforeUnmount(async () => {
  reloadViewDataHook?.off(reloadViewDataHandler)
})

reloadViewDataHook?.on(reloadViewDataHandler)

watch(
  [() => vGroup.value.key],
  async (n, o) => {
    if (n !== o) {
      isViewDataLoading.value = true
      isPaginationLoading.value = true

      if (vGroup.value.nested) {
        await props.loadGroups({}, vGroup.value)
      } else {
        await props.loadGroupData(vGroup.value, true)
      }

      isViewDataLoading.value = false
      isPaginationLoading.value = false
    }
  },
  { immediate: true },
)

if (vGroup.value.root === true) provide(ScrollParentInj, wrapper)

const _scrollLeft = ref<number>()
const scrollBump = computed<number>(() => {
  if (vGroup.value.root === true) {
    return _scrollLeft.value ?? 0
  } else {
    if (props.scrollLeft && props.viewWidth && scrollable.value) {
      const scrollWidth = scrollable.value.scrollWidth + 12 + 12
      if (props.scrollLeft + props.viewWidth > scrollWidth) {
        return scrollWidth - props.viewWidth
      }
      return Math.max(Math.min(scrollWidth - props.viewWidth, (props.scrollLeft ?? 0) - 12), 0)
    }
    return 0
  }
})

const onScroll = (e: Event) => {
  if (!vGroup.value.root) return
  _scrollLeft.value = (e.target as HTMLElement).scrollLeft
}

// a method to parse group key if grouped column type is LTAR or Lookup
// in these 2 scenario it will return json array or `___` separated value
const parseKey = (group) => {
  const key = group.key.toString()

  // parse json array key if it's a lookup or link to another record
  if ((key && group.column?.uidt === UITypes.Lookup) || group.column?.uidt === UITypes.LinkToAnotherRecord) {
    try {
      const parsedKey = JSON.parse(key)
      return parsedKey
    } catch {
      // if parsing try to split it by `___` (for sqlite)
      return key.split('___')
    }
  }
  return [key]
}

const shouldRenderCell = (column) =>
  [UITypes.Lookup, UITypes.Attachment, UITypes.Barcode, UITypes.QrCode, UITypes.Links].includes(column?.uidt)

const showTooltip = ref(false)
const checkMouseMove = (evt: MouseEvent)=>{
  const diff = window.innerHeight - (evt.y || evt.clientY || evt.pageY)
  showTooltip.value =  (diff < 52 && diff > 41)
}
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <div
      ref="wrapper"
      class="flex flex-col h-full w-full nc-scrollbar-x-lg overflow-auto bg-slate-100/60"
      :style="`${!vGroup.root && vGroup.nested ? 'padding-left: 12px; padding-right: 12px;' : ''}`"
      @scroll="onScroll"
      @mousemove="checkMouseMove"
    >
      <div
        ref="scrollable"
        class="flex flex-col h-full"
        :class="{ 'my-2': vGroup.root !== true }"
        :style="`${vGroup.root === true ? 'width: fit-content' : 'width: 100%'}`"
      >
        <div v-if="vGroup.root === true" class="flex sticky top-0 z-5">
          <div
            class="bumper mb-2 bg-slate-100"
            style="border-color: #e7e7e9; border-bottom-width: 1px"
            :style="{ 'padding-left': `${(maxDepth || 1) * 13}px` }"
          ></div>
          <Table ref="tableHeader" class="mb-2" :data="[]" :header-only="true" />
        </div>
        <div :class="{ 'px-[12px] pb-4': vGroup.root === true }">
          <a-collapse
            v-model:activeKey="_activeGroupKeys"
            class="!bg-transparent w-full nc-group-wrapper"
            :bordered="false"
            destroy-inactive-panel
            @change="findAndLoadSubGroup"
          >
            <a-collapse-panel
              v-for="[i, grp] of Object.entries(vGroup?.children ?? [])"
              :key="`group-panel-${i}`"
              class="!border-1 nc-group rounded"
              :class="{ 'mb-4': vGroup.children && +i !== vGroup.children.length - 1 }"
              :style="`background: rgb(${245 - _depth * 10}, ${245 - _depth * 10}, ${245 - _depth * 10})`"
              :show-arrow="false"
            >
              <template #header>
                <div class="flex !sticky left-[15px]">
                  <div class="flex items-center">
                    <span role="img" aria-label="right" class="anticon anticon-right ant-collapse-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" 
                           width="12" 
                           height="12" 
                           viewBox="0 0 512 512"
                           :style="`${activeGroups.includes(i) ? 'transform: rotate(90deg)' : ''}`">
                        <path fill="#93A3C4" 
                                 d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440Z"/>
                      </svg>
                    </span>
                  </div>
                  <div class="flex items-center">
                    <div class="flex flex-col">
                      <div class="flex gap-2">
                        <div class="text-xs nc-group-column-title text-slate-500">{{ grp.column.title }}</div>
                        <div class="text-xs text-gray-400 nc-group-row-count">{{ $t('msg.totalXItems',{ x: grp.count }) }}</div>
                      </div>
                      <div class="flex mt-1">
                        <template v-if="grp.column.uidt === 'MultiSelect'">
                          <span
                            v-for="[tagIndex, tag] of Object.entries(grp.key.split(','))"
                            :key="`panel-tag-${grp.column.id}-${tag}`"
                            class="font-bold text-xs"
                          >
                            <!-- <span
                              class="nc-group-value"
                              :style="{
                                'color': tinycolor.isReadable(grp.color.split(',')[+tagIndex] || '#ccc', '#fff', {
                                  level: 'AA',
                                  size: 'large',
                                })
                                  ? '#fff'
                                  : tinycolor
                                      .mostReadable(grp.color.split(',')[+tagIndex] || '#ccc', ['#0b1d05', '#fff'])
                                      .toHex8String(),
                                'font-size': '14px',
                                'font-weight': 500,
                              }"
                            >
                              {{ tag in GROUP_BY_VARS.VAR_TITLES ? GROUP_BY_VARS.VAR_TITLES[tag] : tag }}
                            </span> -->
                            {{ tag in GROUP_BY_VARS.VAR_TITLES ? GROUP_BY_VARS.VAR_TITLES[tag] : tag }}
                          </span>
                        </template>
                        <div
                          v-else-if="!(grp.key in GROUP_BY_VARS.VAR_TITLES) && shouldRenderCell(grp.column)"
                          class="flex min-w-[100px] flex-wrap"
                        >
                          <template v-for="(val, ind) of parseKey(grp)" :key="ind">
                            <GroupByLabel v-if="val" :column="grp.column" :model-value="val" />
                            <span v-else class="text-gray-400">No mapped value</span>
                          </template>
                        </div>
                        <a-tag
                          v-else
                          :key="`panel-tag-${grp.column.id}-${grp.key}`"
                          class="!py-0 !px-[12px]"
                          :class="`${grp.column.uidt === 'SingleSelect' ? '!rounded' : '!rounded-[6px]'}`"
                          :color="grp.color"
                        >
                          <span
                            class="nc-group-value"
                            :style="{
                              'color': tinycolor.isReadable(grp.color || '#ccc', '#fff', {
                                level: 'AA',
                                size: 'large',
                              })
                                ? '#fff'
                                : tinycolor.mostReadable(grp.color || '#ccc', ['#0b1d05', '#fff']).toHex8String(),
                              'font-size': '14px',
                              'font-weight': 500,
                            }"
                          >
                            <template v-if="grp.key in GROUP_BY_VARS.VAR_TITLES">{{
                              GROUP_BY_VARS.VAR_TITLES[grp.key]
                            }}</template>
                            <template v-else>
                              {{ parseKey(grp)?.join(', ') }}
                            </template>
                          </span>
                        </a-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <GroupByTable
                v-if="!grp.nested && grp.rows"
                :group="grp"
                :load-groups="loadGroups"
                :load-group-data="loadGroupData"
                :load-group-page="loadGroupPage"
                :group-wrapper-change-page="groupWrapperChangePage"
                :row-height="rowHeight"
                :redistribute-rows="redistributeRows"
                :expand-form="expandForm"
                :pagination-fixed-size="fullPage ? props.viewWidth : undefined"
                :pagination-hide-sidebars="true"
                :scroll-left="props.scrollLeft || _scrollLeft"
                :view-width="viewWidth"
                :scrollable="scrollable"
                :full-page="fullPage"
              />
              <GroupBy
                v-else
                :group="grp"
                :load-groups="loadGroups"
                :load-group-data="loadGroupData"
                :load-group-page="loadGroupPage"
                :group-wrapper-change-page="groupWrapperChangePage"
                :row-height="rowHeight"
                :redistribute-rows="redistributeRows"
                :expand-form="expandForm"
                :view-width="viewWidth"
                :depth="_depth + 1"
                :scroll-left="scrollBump"
                :full-page="fullPage"
              />
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
    </div>
    <LazySmartsheetPagination
      v-if="vGroup.root"
      v-model:pagination-data="vGroup.paginationData"
      align-count-on-right
      custom-label="groups"
      show-api-timing
      :change-page="(p: number) => groupWrapperChangePage(p, vGroup)"
      :style="`${props.depth && props.depth > 0 ? 'border-radius: 0 0 4px 4px !important;' : ''}`"
    ></LazySmartsheetPagination>
    <LazySmartsheetPagination
      v-else
      v-model:pagination-data="vGroup.paginationData"
      align-count-on-right
      custom-label="groups"
      show-api-timing
      :change-page="(p: number) => groupWrapperChangePage(p, vGroup)"
      :hide-sidebars="true"
      :style="`${props.depth && props.depth > 0 ? 'border-radius: 0 0 4px 4px !important;' : ''}margin-left: ${scrollBump}px;`"
      :fixed-size="fullPage ? props.viewWidth : undefined"
    ></LazySmartsheetPagination>
    <div v-if="showTooltip" class="absolute right-[40%] bottom-15 bg-slate-700 text-slate-50 rounded-lg border-1 px-3 py-2">
      {{ $t("msg.scrollHMsg") }}
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.ant-collapse-content > .ant-collapse-content-box) {
  padding: 0px !important;
  border-radius: 0 0 4px 4px !important;
}

:deep(.ant-collapse-item > .ant-collapse-header) {
  border-radius: 4px !important;
  background: white;
}

:deep(.ant-collapse-item-active > .ant-collapse-header) {
  border-radius: 4px 4px 0 0 !important;
  background: white;
  border-bottom: solid 1px lightgray;
}

:deep(.ant-collapse-borderless > .ant-collapse-item:last-child) {
  border-radius: 4px !important;
}

:deep(.ant-collapse > .ant-collapse-item:last-child) {
  border-radius: 4px !important;
}
</style>
