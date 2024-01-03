<script lang="ts" setup>
  import { iconMap } from '#imports'

  defineProps(['meta'])
</script>

<template>
  <LazyGeneralEmojiPicker v-if="meta?.meta?.icon"
                          :data-testid="`nc-emoji-${meta?.meta?.icon}`"
                          class="text-lg"
                          size="small"
                          :emoji="meta?.meta?.icon"
                          readonly />

  <component :is="iconMap.eye"
             v-else-if="meta?.type === 'view'"
             class="w-5 mx-0.75" />
  <component :is="iconMap.table"
             v-else
             class="w-5 mx-0.5" />
</template>
