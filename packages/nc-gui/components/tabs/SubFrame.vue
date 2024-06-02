<script setup lang="ts">
  import { connectToChild } from 'penpal'
  const { entryConfig } = useGlobal()

  const previewToken = ref('')
  const usePreviewToken = ref(false)

  const frameContainer = ref();

  const isError = ref(false);

  const runEmbed = () => {
    if (!(entryConfig?.value?.subFrameToken || previewToken.value)) return;

    embedContent(entryConfig?.value?.subFrameToken || previewToken.value)
  }

  const embedContent = (options: any) => {
    if (frameContainer.value) {
      frameContainer.value.innerHTML = ''

      const iframe = document.createElement('iframe');
      iframe.src = options.frameSrc
      iframe.setAttribute("allow", "clipboard-read; clipboard-write");
      if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
      ) {
        frameContainer.value.appendChild(iframe);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          frameContainer.value.appendChild(iframe);
        });
      }

      connectToChild({
        iframe,
        methods: {
          reload: () => {
            runEmbed();
          },

          requestEmbedConfig: () => options,

          event: (eventName: string, payload?: any) => {
            // console.log('event--->>>', eventName, payload)
            switch (eventName) {
              case 'error':
                isError.value = payload ?? 'Error'
                break;

              default:
                break;
            }
          }
        },
      })
    }
  }

  onMounted(() => {
    nextTick(() => {
      runEmbed()
    })
  })
</script>


<template>
  <div v-if="entryConfig?.subFrameToken || (previewToken && usePreviewToken)"
       class="w-full h-full relatvie">
    <div ref="frameContainer"
         class="z-0 overflow-hidden frame-container">
      <div v-if="isError"
           class="flex w-full h-full justify-center items-center gap-4 flex-col">
        <div>{{ $t("msg.info.errorPleaseClickReloadToRetry") }}</div>
        <NcButton @click="runEmbed()">
          {{ $t("general.reload") }}
        </NcButton>
      </div>
      <div v-else>
        <div class="absolute top-0 left-0 w-full h-full bg-gray-100 bg-opacity-50 z-10 flex justify-center items-center">
          <a-spin size="large" />
        </div>
      </div>
    </div>
  </div>

  <div v-else
       class="p-10">
    <div class="text-lg font-semibold mb-4">Sub Frame Token For Preview</div>
    <a-textarea v-model:value="previewToken"
                :rows="4" />
    <NcButton type="primary"
              class="mt-4"
              @click="[usePreviewToken = true, runEmbed()]">
      Use Prevvie Token
    </NcButton>
  </div>
</template>

<style>
.frame-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.frame-container iframe {
  border: none;
  width: 100%;
  height: 100%;
  outline: none;
  margin: 0;
  padding: 0;
}
</style>