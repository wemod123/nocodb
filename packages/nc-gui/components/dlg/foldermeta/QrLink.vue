
<script setup lang="ts">
  import { useQRCode } from '@vueuse/integrations/useQRCode'
  import { useVModel, iconMap } from '#imports'

  const { qrLink, ...props } = defineProps<{
    modelValue?: boolean
    qrLink: any
  }>()

  const qrCodeLarge = useQRCode(qrLink.url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    rendererOpts: {
      quality: 1,
    },
    width: 320,
  })

  const emits = defineEmits(['update:modelValue'])

  const dialogShow = useVModel(props, 'modelValue', emits)

  const atOk = () => {
    dialogShow.value = false;
    emits('update:modelValue', false)
  }
</script>

<template>
  <NcModal v-model:visible="dialogShow"
           size="small">
    <template #header>
      <div class="flex flex-row w-full items-center gap-x-2">
        <GeneralIcon icon="table" />
        <span class="flex-1">{{ qrLink?.title }}</span>
        <div class="hover:bg-slate-100 cursor-pointer rounded w-10 h-10 flex items-center justify-center"
             @click="atOk()">
          <component :is="iconMap.close" />
        </div>
      </div>
    </template>

    <div class="mt-2 px-8">
      <img :src="qrCodeLarge" />
      <div class="pt-4 leading-5">
        💡 {{ $t("title.qrCodeScanMsg") }}
      </div>
      <div class="flex flex-row justify-end gap-x-2">
        <a :href="qrCodeLarge"
           :download="`${qrLink.title}.png`">
          {{ $t("general.download") }}
        </a>
      </div>
    </div>
  </NcModal>
</template>
