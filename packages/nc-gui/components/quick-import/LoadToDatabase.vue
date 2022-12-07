<script setup lang="ts">
import { useQuickImportStoreOrThrow } from '#imports'

const { importedTables } = useQuickImportStoreOrThrow()!

const selectedTables = ref<Record<string, boolean>>({})

importedTables.value.forEach((t) => {
  selectedTables.value[t.id!] = false
})

function append() {
  // TODO:
}

function merge() {
  // TODO:
}

function overwrite() {
  // TODO:
}
</script>

<template>
  <a-row class="p-[20px]" :gutter="16">
    <a-col :span="8">
      <a-card :title="$t('activity.quickImport.loadToDataBase.append')" class="nc-import-action-button" @click="append">
        <p>{{ $t('activity.quickImport.loadToDataBase.appendDesc') }}</p>
      </a-card>
    </a-col>
    <a-col :span="8">
      <a-card :title="$t('activity.quickImport.loadToDataBase.merge')" class="nc-import-action-button" @click="merge">
        <p>{{ $t('activity.quickImport.loadToDataBase.mergeDesc') }}</p>
      </a-card>
    </a-col>
    <a-col :span="8">
      <a-card :title="$t('activity.quickImport.loadToDataBase.overwrite')" class="nc-import-action-button" @click="overwrite">
        <p>{{ $t('activity.quickImport.loadToDataBase.overwriteDesc') }}</p>
      </a-card>
    </a-col>
  </a-row>
  <a-row class="p-[20px]">
    <a-col :span="24">
      <a-list item-layout="horizontal" :data-source="importedTables">
        <template #renderItem="{ item }">
          <a-list-item class="cursor-pointer">
            <a-list-item-meta>
              <template #title>
                <div class="flex items-center py-1">
                  <MdiTableLarge class="text-sm text-primary" />
                  {{ item.title }}
                </div>
              </template>
              <template #avatar>
                <a-checkbox v-model:checked="selectedTables[item.id]" />
              </template>
              <template #description>
                Created At: {{ item.created_at }} <br />
                Last Modified At: {{ item.updated_at }}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-col>
  </a-row>
</template>

<style lang="scss">
.nc-import-action-button {
  @apply shadow-md shadow-gray-400 ring-opacity-100 cursor-pointer;
}
</style>
