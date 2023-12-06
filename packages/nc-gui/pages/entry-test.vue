<script setup lang="ts">
  import { definePageMeta } from '#imports';
  import { connectToChild } from 'penpal'

  definePageMeta({
    title: 'Entry',
    hideHeader: true,
    hasSidebar: true,
    layout: false,
    public: true
  })

  const container = ref();
  const runEmbed = () => { };

  const embedFrame = (options: any) => {
    if (container.value) {
      container.value.innerHTML = ''

      const iframe = document.createElement('iframe');
      iframe.src = options.context
      iframe.setAttribute("allow", "clipboard-read; clipboard-write");
      if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
      ) {
        container.value.appendChild(iframe);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          container.value.appendChild(iframe);
        });
      }

      connectToChild({
        iframe,
        methods: {
          reload: () => { runEmbed(); },

          getEmbedConfig: () => options,

          updateUserToken: async () => { },

          event: (eventName: string, payload: any) => {
            console.log('Frame Event--- >>>', eventName, payload)
          }
        },
      });
    }
  }

  onMounted(() => {
    embedFrame({
      context: 'http://localhost:3000/#/entry',
      'xx': 'ff',
      lang: 'zh-Hans',
      email: 'few@jss',
      entryToken: '__token__eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJzc2pvIiwiaWF0IjoxNzAxNTkwMTA0fQ.QnO7NV88hvrV98bpM5ryNAtx33HD3o63KWZdiweNSWU'
    });
  })

</script>

<template>
  <div ref="container"
       class="w-full h-screen frame-container">
  </div>
</template>

<style>
.frame-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>