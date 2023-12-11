<script setup lang="ts">
  import { definePageMeta, iconMap, useGlobal, useApi } from '#imports';
  import { setI18nLanguage } from '~/plugins/a.i18n'
  import { connectToParent } from 'penpal';

  definePageMeta({
    title: 'Base tables',
    hideHeader: true,
    hasSidebar: true,
    layout: false,
    public: true
  })

  const route = useRoute()
  const { signIn, drySignOut, lang, refreshToken } = useGlobal()
  const { api } = useApi({ useGlobalInstance: true })

  const hasError = ref('');
  let parentFrame: any;

  const runEntry = () => {
    hasError.value = '';
    drySignOut();

    const connection = connectToParent({ methods: {} });

    connection.promise.then((parent: any) => {
      parentFrame = parent;
      parent.event('mounted');

      /** Get Embed Config */
      parent.getEmbedConfig()
        .then(async (params: EntryConfig) => {
          if (params.lang) {
            await setI18nLanguage(params.lang)
            lang.value = params.lang
          }

          if (!(params.entryToken)) {
            hasError.value = 'unAuthed';
          } else {
            /** Login User */
            api.auth.signin({
              email: params.email,
              password: params.entryToken
            }).then(async ({ token }) => {
              parent.event('initialized');

              if (token) {
                signIn(token!, {
                  ...params,
                  parentFrame: parent
                });

                await navigateTo({
                  path: '/',
                  query: route.query,
                })

                try {
                  localStorage.setItem('nocodb-gui-v2', JSON.stringify({
                    ...JSON.parse(localStorage.getItem('nocodb-gui-v2') as string),
                    lang: params.lang
                  }))
                } catch (e) { }
              } else {
                hasError.value = 'unAuthed'
              }
            }).catch(err => {
              hasError.value = 'unAuthed';
            })
          }
        })
        .catch((err: Error) => {
          hasError.value = err.toString()
        })
        .finally(()=>{
          parentFrame && parentFrame.event('initialized');
        })
    });
  }

  onMounted(() => {
    runEntry();
  })
</script>

<template>
  <div class="w-full h-full flex-col flex justify-center items-center">
    <div v-if="hasError === 'unAuthed'"
         style="width:300px;"
         class="flex flex-col items-center justify-center py-4">
      <component :is="iconMap.acl"
                 class="text-4xl text-orange-500" />
      <div class="py-3 text-slate-400">
        {{ $t('msg.notAuthorized') }}
      </div>
      <button class="scaling-btn bg-opacity-100"
              @click="parentFrame.reload();">
        <span class="flex items-center gap-2">
          <component :is="iconMap.reload" />
          {{ $t('general.reload') }}
        </span>
      </button>
    </div>
    <div v-else>{{ $t('general.loading') }}</div>
  </div>
</template>