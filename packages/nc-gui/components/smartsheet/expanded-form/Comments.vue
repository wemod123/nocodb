<script setup lang="ts">
  import type { VNodeRef } from '@vue/runtime-core'
  import type { AuditType } from 'nocodb-sdk'
  import { Icon } from '@iconify/vue'
  import { ref, timeAgo, useExpandedFormStoreOrThrow, useGlobal, useRoles, watch } from '#imports'

  const props = defineProps<{
    loading: boolean
  }>()

  const { locale } = useI18n()

  const { loadCommentsAndLogs, commentsAndLogs, saveComment: _saveComment, comment, updateComment, deleteComment } = useExpandedFormStoreOrThrow()

  const { isExpandedFormCommentMode } = storeToRefs(useConfigStore())

  const commentsWrapperEl = ref<HTMLDivElement>()

  const { user, appInfo } = useGlobal()

  const isExpandedFormLoading = computed(() => props.loading)

  const tab = ref<'comments' | 'audits'>('comments')

  const { isUIAllowed } = useRoles()

  const hasEditPermission = computed(() => isUIAllowed('commentEdit'))

  const editLog = ref<AuditType>()

  const isEditing = ref<boolean>(false)

  const commentInputDomRef = ref<HTMLInputElement>()

  // const focusInput: VNodeRef = (el) => (el as HTMLInputElement)?.focus()
  const focusInput = ref()

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onKeyEsc(event)
    } else if (event.key === 'Enter') {
      onKeyEnter(event)
    }
  }

  function onKeyEnter(event: KeyboardEvent) {
    event.stopImmediatePropagation()
    event.preventDefault()
    if (event.shiftKey) {
      editLog.value.description = editLog.value.description + '\n';
    } else {
      onEditComment()
    }
  }

  function onKeyEsc(event: KeyboardEvent) {
    event.stopImmediatePropagation()
    event.preventDefault()
    onCancel()
  }

  async function onEditComment() {
    if (!isEditing.value || !editLog.value) return
    await updateComment(editLog.value.id!, {
      description: editLog.value.description,
    })
    onStopEdit()
  }

  function onCancel() {
    if (!isEditing.value) return
    editLog.value = undefined
    onStopEdit()
  }

  function onStopEdit() {
    loadCommentsAndLogs()
    isEditing.value = false
    editLog.value = undefined
  }

  onKeyStroke('Enter', (event) => {
    if (isEditing.value) {
      onKeyEnter(event)
    }
  })

  const comments = computed(() => commentsAndLogs.value.filter((log) => log.op_type === 'COMMENT'))
  const audits = computed(() => commentsAndLogs.value.filter((log) => log.op_type !== 'COMMENT' && log.details))

  function editComment(log: AuditType) {
    editLog.value = log
    isEditing.value = true;
    setTimeout(() => {
      focusInput.value?.[0]?.focus();
    }, 300);
  }

  async function atDeleteComment(id: string) {
    await deleteComment(id);
    loadCommentsAndLogs();
  }

  const value = computed({
    get() {
      return editLog.value?.description?.substring(editLog.value?.description?.indexOf(':') + 1) ?? ''
    },
    set(val) {
      if (!editLog.value) return
      editLog.value.description = val
    },
  })

  function scrollComments() {
    if (commentsWrapperEl.value) commentsWrapperEl.value.scrollTop = commentsWrapperEl.value?.scrollHeight
  }

  const isSaving = ref(false)

  const saveComment = async (event: any) => {
    if (event.shiftKey) {
      return;
    }

    if (isSaving.value) return

    isSaving.value = true
    isCommenting.value = false
    commentInputDomRef.value?.blur();

    try {
      await _saveComment()

      scrollComments()
    } catch (e) {
      console.error(e)
    } finally {
      isSaving.value = false
    }
  }

  watch(commentsWrapperEl, () => {
    scrollComments()
  })

  const onClickAudit = () => {
    if (appInfo.value.ee) return

    tab.value = 'audits'
  }

  watch(commentInputDomRef, () => {
    if (commentInputDomRef.value && isExpandedFormCommentMode.value) {
      setTimeout(() => {
        commentInputDomRef.value?.focus()
        isExpandedFormCommentMode.value = false
      }, 400)
    }
  })

  const isCommenting = ref(false)
</script>

<template>
  <div class="flex flex-col h-full w-full border-l">
    <div class="h-16 bg-white rounded-t-lg border-gray-200 border-b-1">
      <div class="flex flex-row gap-2 m-2 p-1 bg-slate-100 rounded-lg">
        <div v-e="['c:row-expand:comment']"
             class="tab flex-1 px-4 py-2 transition-all text-gray-600 cursor-pointer rounded-lg"
             :class="{
               'bg-white shadow !text-brand-500 !hover:text-brand-500': tab === 'comments' || appInfo.ee,
             }"
             @click="tab = 'comments'">
          <div class="tab-title nc-tab !font-normal">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="16"
                 height="16"
                 viewBox="0 0 24 24">
              <path fill="currentColor"
                    d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1S1 5.925 1 12c0 1.76.413 3.423 1.148 4.898c.195.392.26.84.147 1.263l-.655 2.448a1.43 1.43 0 0 0 1.75 1.751l2.45-.655a1.797 1.797 0 0 1 1.262.147A10.955 10.955 0 0 0 12 23Z"
                    opacity=".5" />
              <path fill="currentColor"
                    d="M10.9 12a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 0 0-2.2 0Zm-4.4 0a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 0 0-2.2 0Zm8.8 0a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 0 0-2.2 0Z" />
            </svg>
            {{ $t("title.activitiesNComments") }}
          </div>
        </div>

        <div v-e="['c:row-expand:audit']"
             class="tab flex-1 px-4 py-2 transition-all text-gray-600 cursor-pointer rounded-lg"
             :class="{
               'bg-white shadow !text-brand-500 !hover:text-brand-500': tab === 'audits',
             }"
             @click="onClickAudit">
          <div class="tab-title nc-tab !font-normal flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="16"
                 height="16"
                 viewBox="0 0 24 24">
              <path fill="currentColor"
                    d="M21 15.998v-6c0-2.828 0-4.242-.879-5.121C19.353 4.109 18.175 4.012 16 4H8c-2.175.012-3.353.109-4.121.877C3 5.756 3 7.17 3 9.998v6c0 2.829 0 4.243.879 5.122c.878.878 2.293.878 5.121.878h6c2.828 0 4.243 0 5.121-.878c.879-.88.879-2.293.879-5.122Z"
                    opacity=".5" />
              <path fill="currentColor"
                    d="M8 3.5A1.5 1.5 0 0 1 9.5 2h5A1.5 1.5 0 0 1 16 3.5v1A1.5 1.5 0 0 1 14.5 6h-5A1.5 1.5 0 0 1 8 4.5v-1Z" />
              <path fill="currentColor"
                    fill-rule="evenodd"
                    d="M6.25 10.5A.75.75 0 0 1 7 9.75h.5a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75Zm3.5 0a.75.75 0 0 1 .75-.75H17a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75ZM6.25 14a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75Zm3.5 0a.75.75 0 0 1 .75-.75H17a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm-3.5 3.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75Zm3.5 0a.75.75 0 0 1 .75-.75H17a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z"
                    clip-rule="evenodd" />
            </svg>
            <span>{{ $t("title.updatesRecords") }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="h-[calc(100%-4rem)]"
         :class="{
           'pb-1': tab !== 'comments' && !appInfo.ee,
         }">
      <div v-if="isExpandedFormLoading"
           class="flex flex-col h-full">
        <GeneralLoader class="!mt-16"
                       size="xlarge" />
      </div>
      <div v-else-if="tab === 'comments'"
           class="flex flex-col h-full">
        <div v-if="comments.length === 0"
             class="flex flex-col my-1 text-center justify-center h-full">
          <div class="flex justify-center text-3xl !text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="40"
                 height="40"
                 viewBox="0 0 24 24">
              <g fill="none"
                 stroke="currentColor">
                <path stroke-width="1.5"
                      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.634 1.634 0 0 1 1.149.133A9.958 9.958 0 0 0 12 22Z" />
                <path stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.009m3.982 0H12m3.991 0H16"
                      opacity=".5" />
              </g>
            </svg>
          </div>
          <div class="text-center my-6 text-slate-500">{{ $t('activity.addComment') }}</div>
        </div>
        <div v-else
             ref="commentsWrapperEl"
             class="flex flex-col h-full py-2 pl-2 pr-1 space-y-2 nc-scrollbar-md">
          <div v-for="log of comments"
               :key="log.id">
            <div class="group gap-2 border-gray-200">
              <div class="flex flex-col p-3 gap-2 relative">
                <div class="flex gap-2">
                  <div class="flex flex-1 items-center gap-2 max-h-9 min-h-9">
                    <GeneralUserIcon size="base"
                                     :email="log.user" />
                    <div class="flex flex-col">
                      <span class="truncate font-bold max-w-42">
                        {{ log.display_name ?? log.user.split('@')[0] ?? 'Shared source' }}
                      </span>
                      <div v-if="log.id !== editLog?.id"
                           class="text-xs text-gray-400">
                        {{ log.created_at !== log.updated_at ? `Edited ${timeAgo(log.updated_at, locale?.startsWith('zh')
                          ? 'zh-cn' : 'en')}` : timeAgo(log.created_at, locale?.startsWith('zh') ? 'zh-cn' : 'en') }}
                      </div>
                    </div>
                  </div>
                  <NcTooltip placement="top">
                    <template #title>
                      <span class="px-2 py-2 text-amber-300 font-bold">
                        {{ $t('general.delete') }}
                      </span>
                    </template>
                    <NcButton v-if="log.user === user!.email && !editLog"
                              type="default"
                              class="!px-2 hover:!border-red-500 !border-transparent opacity-0 group-hover:opacity-100 transition-all"
                              size="sm"
                              @click="atDeleteComment(log.id)">
                      <Icon class="iconify !text-red-500"
                            icon="iconamoon:trash-bold" />
                    </NcButton>
                  </NcTooltip>

                  <NcButton v-if="log.user === user!.email && !editLog"
                            type="default"
                            class="!px-2 hover:!border-indigo-500 !border-transparent opacity-0 group-hover:opacity-100 transition-all"
                            size="sm"
                            @click="editComment(log)">
                    <Icon class="iconify !text-indigo-500"
                          icon="lucide:pen" />
                  </NcButton>

                </div>
                <div v-if="log.id === editLog?.id"
                     class="relative">
                  <textarea ref="focusInput"
                            v-model="value"
                            rows="6"
                            class="px-2 pt-1 !pb-4 w-full bg-white rounded-lg border-none nc-scrollbar-md outline-gray-200"
                            @keydown.stop="onKeyDown($event)" />
                  <div class="text-xs text-slate-400 pl-1">{{ $t("labels.inputToolTip1") }}</div>
                </div>

                <div v-else
                     class="text-sm text-gray-700 bg-white border-gray-100 border-1 rounded-r-xl rounded-bl-2xl px-3 py-2"
                     v-html="log.description.substring(log.description.indexOf(':') + 1)?.replace(/\n/g, '<br>')" />
                <div v-if="log.id === editLog?.id"
                     class="flex justify-end gap-1 absolute right-3 top-3">
                  <NcButton type="secondary"
                            size="sm"
                            class="!rounded-md"
                            @click="onCancel">
                    {{ $t("general.cancel") }}
                  </NcButton>
                  <NcButton v-e="['a:row-expand:comment:save']"
                            size="sm"
                            class="!rounded-md"
                            @click="onEditComment">
                    {{ $t("general.save") }}
                  </NcButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="hasEditPermission"
             class="p-3 bg-slate-100 gap-2 flex">
          <div :class="[isCommenting ? 'h-24 pb-7 border-indigo-500' : 'h-12 border-gray-200']"
               class="flex relative border-1 flex-row w-full transition-all bg-white p-2 gap-2 rounded-lg">
            <GeneralUserIcon class="!w-10"
                             :email="user?.email" />
            <a-textarea ref="commentInputDomRef"
                        v-model:value="comment"
                        class="!rounded-lg border-1 scrollbar-thin-dull bg-white !pr-2 !pl-1 !border-gray-200 nc-comment-box !outline-none"
                        :placeholder="$t('labels.inputComment')"
                        data-testid="expanded-form-comment-input"
                        :bordered="false"
                        :rows="1"
                        style="resize: none;"
                        @focus="isCommenting = true"
                        @blur="isCommenting = false"
                        @keyup.enter.prevent="saveComment">
            </a-textarea>
            <NcButton v-e="['a:row-expand:comment:save']"
                      size="sm"
                      class="!w-7"
                      :loading="isSaving"
                      :disabled="!isSaving && !comment.length"
                      :icon-only="isSaving"
                      @click="saveComment">
              <GeneralIcon v-if="!isSaving"
                           icon="send" />
            </NcButton>
            <div v-if="isCommenting"
                 class="absolute bottom-1 left-3 text-xs text-slate-400">
              {{ $t("labels.inputToolTip") }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="tab === 'audits'"
           ref="commentsWrapperEl"
           class="flex flex-col h-full nc-scrollbar-md !overflow-y-auto">
        <template v-if="audits.length === 0">
          <div class="flex flex-col text-center justify-center h-full gap-3 pb-24">
            <div class="flex items-center justify-center text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg"
                   width="3em"
                   height="3em"
                   viewBox="0 0 24 24">
                <g fill="none"
                   stroke="currentColor"
                   stroke-linecap="round"
                   stroke-width="1.5">
                  <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2" />
                  <path stroke-linejoin="round"
                        d="M12 9v4h4"
                        opacity="0.5" />
                  <circle cx="12"
                          cy="12"
                          r="10"
                          stroke-dasharray=".5 3.5"
                          opacity="0.5" />
                </g>
              </svg>
            </div>
            <div class="text-center my-1 text-slate-500">{{ $t("msg.changesOfThisRecord") }}</div>
          </div>
        </template>

        <div v-for="log of audits"
             :key="log.id"
             class="nc-audit-item">
          <div class="flex flex-col p-4 gap-3">
            <div class="flex justify-between">
              <div class="flex items-center gap-2">
                <GeneralUserIcon :email="log.user" />
                <div class="flex flex-col">
                  <span class="truncate font-bold max-w-50">
                    {{ log.display_name ?? log.user.split('@')[0].slice(0, 2) ?? 'Shared source' }}
                  </span>
                  <div v-if="log.id !== editLog?.id"
                       class="text-xs font-normal text-gray-500">
                    {{ timeAgo(log.created_at, locale?.startsWith('zh') ? 'zh-cn' : 'en') }}
                  </div>
                </div>
              </div>
            </div>
            <div v-dompurify-html="log.details"
                 class="text-sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab {
  @apply max-w-1/2;
}

.nc-audit-item {
  @apply border-b-1 gap-3 border-gray-200;
}

.nc-audit-item:last-child {
  @apply border-b-0;
}

.tab .tab-title {
  @apply min-w-0 flex justify-center gap-2 font-semibold items-center;
  word-break: 'keep-all';
  white-space: 'nowrap';
  display: 'inline';
}

.text-decoration-line-through {
  text-decoration: line-through;
}

:deep(.red.lighten-4) {
  @apply bg-red-100 line-through;
}

:deep(.green.lighten-4) {
  @apply bg-green-200/60 !mr-3 !leading-6;
}</style>
