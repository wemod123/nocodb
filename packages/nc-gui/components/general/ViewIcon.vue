<script lang="ts" setup>
import { Icon as IcIcon } from '@iconify/vue'
import type { TableType } from 'nocodb-sdk'
import { toRef, viewIcons } from '#imports'

const props = defineProps<{
  meta: TableType
  ignoreColor?: boolean
}>()

const isEmoji = (i: string)=>{
  return /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u.test(i)
}

const viewMeta = toRef(props, 'meta')
</script>

<template>
  <span v-if="viewMeta?.meta?.icon && isEmoji(viewMeta?.meta?.icon)">
    {{ viewMeta?.meta?.icon }}
  </span>
  <IcIcon
    v-else-if="viewMeta?.meta?.icon"
    :data-testid="`nc-icon-${viewMeta?.meta?.icon}`"
    class="text-[16px]"
    :icon="viewMeta?.meta?.icon"
  />
  <component
    :is="viewIcons[viewMeta.type]?.icon"
    v-else-if="viewMeta?.type"
    class="nc-view-icon group-hover"
    :style="{
      color: !props.ignoreColor ? viewIcons[viewMeta.type]?.color : undefined,
      fontWeight: 500,
    }"
  />
</template>

<style>
.nc-view-icon {
  font-size: 1.05rem;
}
</style>
