<script lang="ts" setup>
  import type { VNodeRef } from '@vue/runtime-core'
  import type { TableType, ViewType, ViewTypes } from 'nocodb-sdk'
  import type { WritableComputedRef } from '@vue/reactivity'
  import {
    IsLockedInj,
    isDefaultBase as _isDefaultBase,
    inject,
    message,
    onKeyStroke,
    useDebounceFn,
    useNuxtApp,
    useRoles,
    useVModel,
  } from '#imports'

  interface Props {
    view: ViewType
    table: TableType
    onValidate: (view: ViewType) => boolean | string
  }

  interface Emits {
    (event: 'update:view', data: Record<string, any>): void

    (event: 'selectIcon', icon: string): void

    (event: 'changeView', view: Record<string, any>): void

    (event: 'rename', view: ViewType, title: string | undefined): void

    (event: 'delete', view: ViewType): void

    (event: 'openModal', data: { type: ViewTypes; title?: string; copyViewId?: string; groupingFieldColumnId?: string }): void
  }

  const props = defineProps<Props>()

  const emits = defineEmits<Emits>()

  const vModel = useVModel(props, 'view', emits) as WritableComputedRef<ViewType & { alias?: string; is_default: boolean }>

  const { $e } = useNuxtApp()

  const { isMobileMode } = useGlobal()

  const { isUIAllowed } = useRoles()

  const base = inject(ProjectInj, ref())

  const { activeView } = storeToRefs(useViewsStore())

  const { getMeta } = useMetas()

  const table = computed(() => props.table)
  const injectedTable = ref(table.value)

  provide(ActiveViewInj, vModel)
  provide(MetaInj, injectedTable)

  const isLocked = inject(IsLockedInj, ref(false))

  const isDefaultBase = computed(() => {
    const source = base.value?.sources?.find((b) => b.id === vModel.value.source_id)
    if (!source) return false

    return _isDefaultBase(source)
  })

  const isDropdownOpen = ref(false)

  const isEditing = ref(false)
  /** Is editing the view name enabled */

  /** Helper to check if editing was disabled before the view navigation timeout triggers */
  const isStopped = ref(false)

  /** Original view title when editing the view name */
  const _title = ref<string | undefined>()

  /** Debounce click handler, so we can potentially enable editing view name {@see onDblClick} */
  const onClick = useDebounceFn(() => {
    if (isEditing.value || isStopped.value) return

    emits('changeView', vModel.value)
  }, 250)

  /** Enable editing view name on dbl click */
  function onDblClick() {
    if (isMobileMode.value) return
    if (!isUIAllowed('viewCreateOrEdit')) return

    if (!isEditing.value) {
      isEditing.value = true
      _title.value = vModel.value.title
      $e('c:view:rename', { view: vModel.value?.type })
    }
  }

  /** Handle keydown on input field */
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onKeyEsc(event)
    } else if (event.key === 'Enter') {
      onKeyEnter(event)
    }
  }

  /** Rename view when enter is pressed */
  function onKeyEnter(event: KeyboardEvent) {
    event.stopImmediatePropagation()
    event.preventDefault()

    onRename()
  }

  /** Disable renaming view when escape is pressed */
  function onKeyEsc(event: KeyboardEvent) {
    event.stopImmediatePropagation()
    event.preventDefault()

    onCancel()
  }

  onKeyStroke('Enter', (event) => {
    if (isEditing.value) {
      onKeyEnter(event)
    }
  })

  const theTargetItem = ref<HTMLElement>();

  watch(() => isEditing.value, () => {
    if (isEditing.value) {
      setTimeout(() => {
        const el = document.getElementById('focus-rename-input');
        el?.focus();
        el?.setSelectionRange(0, 100)
      }, 100);

    }
  })

  /** Rename a view */
  async function onRename() {
    isDropdownOpen.value = false
    if (!isEditing.value) return

    const isValid = props.onValidate({ ...vModel.value, title: _title.value! })

    if (isValid !== true) {
      message.error(isValid)

      onCancel()
      return
    }

    if (vModel.value.title === '' || vModel.value.title === _title.value) {
      onCancel()
      return
    }

    const originalTitle = vModel.value.title

    vModel.value.title = _title.value || ''

    emits('rename', vModel.value, originalTitle)

    onStopEdit()
  }

  /** Cancel renaming view */
  function onCancel() {
    if (!isEditing.value) return

    // vModel.value.title = _title || ''
    onStopEdit()
  }

  /** Stop editing view name, timeout makes sure that view navigation (click trigger) does not pick up before stop is done */
  function onStopEdit() {
    isStopped.value = true
    isEditing.value = false
    _title.value = ''

    setTimeout(() => {
      isStopped.value = false
    }, 250)
  }

  const onDelete = () => {
    isDropdownOpen.value = false

    emits('delete', vModel.value)
  }

  watch(isDropdownOpen, async () => {
    if (!isDropdownOpen.value) return

    injectedTable.value = (await getMeta(table.value.id!)) as any
  })
</script>

<template>
  <a-menu-item class="nc-sidebar-node nc-sidebar-node-item !pl-10.5 !min-h-10 !max-h-10 !mb-0.25 select-none group text-gray-700 !flex !items-center !mt-0 hover:(!bg-slate-200 !text-gray-900) cursor-pointer"
               :data-testid="`view-sidebar-view-${vModel.alias || vModel.title}`"
               @dblclick.stop="onDblClick"
               @click="onClick">
    <div ref="theTargetItem"
         v-e="['a:view:open', { view: vModel.type }]"
         class="text-sm flex items-center w-full gap-1"
         data-testid="view-item">
      <!-- <div class="w-1.5 min-w-1.5 h-1.5 max-h-2 bg-slate-100 border-1 border-slate-300 rounded-full z-60" /> -->
      <div v-e="['c:view:emoji-picker']"
           class="flex min-w-6"
           :data-testid="`view-sidebar-drag-handle-${vModel.alias || vModel.title}`">
        <LazyGeneralEmojiPicker class="nc-table-icon"
                                :emoji="props.view?.meta?.icon"
                                size="small"
                                :clearable="true"
                                :readonly="isMobileMode"
                                @emoji-selected="emits('selectIcon', $event)">
          <template #default>
            <GeneralViewIcon :meta="props.view"
                             class="nc-view-icon"></GeneralViewIcon>
          </template>
        </LazyGeneralEmojiPicker>
      </div>

      <a-input v-if="isEditing"
               id="focus-rename-input"
               v-model:value="_title"
               class="!bg-white !pl-1 !border-0 !ring-0 !outline-transparent !border-transparent"
               :class="{
                 'font-medium': activeView?.id === vModel.id,
               }"
               autofocus
               @blur="onRename"
               @keydown.stop="onKeyDown($event)" />

      <div v-else
           class="nc-sidebar-node-title pl-1 text-ellipsis overflow-hidden select-none w-full"
           data-testid="sidebar-view-title"
           :class="{
             'font-medium': activeView?.id === vModel.id,
           }"
           :style="{ wordBreak: 'keep-all', whiteSpace: 'nowrap', display: 'inline' }">
        {{ vModel.alias || vModel.title }}
      </div>

      <div class="flex-1" />

      <NcTooltip v-if="!isEditing"
                 class="flex mr-4"
                 placement="topLeft">
        <template #title>
          <div class="pt-1 px-1">
            {{ $t('msg.viewEntifyMsg', { table: table.title, view: vModel.alias || vModel.title }) }}
          </div>
          <div class="p-1 flex items-center text-slate-200">
            <span>{{ $t('msg.viewMode') }}</span>
            <component class="!text-xs mx-0.5"
                       :class="{ 'text-orange-500': vModel.lock_type === 'locked' }"
                       :is="iconMap[vModel.lock_type === 'locked' ? 'lock' : 'users']" />
            <span>{{ $t(`msg.view_${vModel.lock_type}`) }}</span>
          </div>
        </template>
        <span class="text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg"
               width="1.3em"
               height="1.3em"
               viewBox="0 0 24 24">
            <path fill="currentColor"
                  d="M17 16.88c.56 0 1 .44 1 1s-.44 1-1 1s-1-.45-1-1s.44-1 1-1m0-3c2.73 0 5.06 1.66 6 4c-.94 2.34-3.27 4-6 4s-5.06-1.66-6-4c.94-2.34 3.27-4 6-4m0 1.5a2.5 2.5 0 0 0 0 5a2.5 2.5 0 0 0 0-5M18 3H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5.42c-.16-.32-.3-.66-.42-1c.12-.34.26-.68.42-1H4v-4h6v2.97c.55-.86 1.23-1.6 2-2.21V13h1.15c1.16-.64 2.47-1 3.85-1c1.06 0 2.07.21 3 .59V5c0-1.1-.9-2-2-2m-8 8H4V7h6zm8 0h-6V7h6z" />
          </svg>
        </span>
      </NcTooltip>

      <template v-if="!isEditing && !isLocked && isUIAllowed('viewCreateOrEdit')">
        <NcDropdown v-model:visible="isDropdownOpen"
                    overlay-class-name="!rounded-lg">
          <NcButton v-e="['c:view:option']"
                    type="text"
                    size="xxsmall"
                    class="mr-2 nc-sidebar-node-btn invisible !group-hover:visible nc-sidebar-view-node-context-btn"
                    :class="{
                      '!visible': isDropdownOpen,
                    }"
                    @click.stop="isDropdownOpen = !isDropdownOpen">
            <GeneralIcon icon="threeDotHorizontal"
                         class="text-xl w-4.75" />
          </NcButton>

          <template #overlay>
            <SmartsheetToolbarViewActionMenu :data-testid="`view-sidebar-view-actions-${vModel.alias || vModel.title}`"
                                             :view="vModel"
                                             :table="table"
                                             in-sidebar
                                             @close-modal="isDropdownOpen = false"
                                             @rename="onDblClick"
                                             @delete="onDelete" />
          </template>
        </NcDropdown>
      </template>
    </div>
  </a-menu-item>
</template>