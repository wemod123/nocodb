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
  const { signIn, signOut, lang } = useGlobal()
  const { api, isLoading, error } = useApi({ useGlobalInstance: true })

  const hasError = ref('')

  const runEntry = () => {
    hasError.value = '';
    signOut();

    const connection = connectToParent({ methods: {} });

    connection.promise.then((parent: any) => {
      parent.event('mounted');

      /** Get Embed Config */
      parent.getEmbedConfig()
        .then(async (params: EntryConfig) => {
          console.log('---params---', params)

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
      <button class="scaling-btn bg-opacity-100">
        <span class="flex items-center gap-2">
          <component :is="iconMap.reload" />
          {{ $t('general.reload') }}
        </span>
      </button>
    </div>
    <div v-else>{{ $t('general.loading') }}</div>
  </div>
</template>