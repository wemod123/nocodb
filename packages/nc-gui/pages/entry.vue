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
  const { signIn, drySignOut, lang } = useGlobal()
  const { api } = useApi({ useGlobalInstance: true })

  const hasError = ref('');
  let parentFrame: any;

  const runEntry = () => {
    hasError.value = '';
    drySignOut();

    const connection = connectToParent({
      methods: {
        goToRoute: (path: string, options: any) => navigateTo(path, options),
      }
    });

    connection.promise.then((parent: any) => {
      parentFrame = parent;

      /** Get Embed Config */
      parent.getEmbedConfig()
        .then(async (configs: string) => {
          const params = JSON.parse(configs) as EntryConfig;

          parent.event('mounted');

          if (params.lang) {
            const setLang = params.lang.includes('zh') ? 'zh-Hans' : 'en';
            await setI18nLanguage(setLang)
            lang.value = setLang;
          }

          if (!(params.entryToken)) {
            hasError.value = 'unAuthed';
          } else {
            /** Login User */
            api.auth.signin({
              email: params.email,
              password: params.entryToken
            }).then(async ({ token }) => {

              if (token) {
                signIn(token!, params, parent);

                if (params.scope?.paths && params.scope.paths.length > 0) {
                  await navigateTo(params.targetRoute || params.scope.paths[0])
                } else {
                  await navigateTo({
                    path: '/',
                    query: route.query,
                  })
                }

                try {
                  localStorage.setItem('nocodb-gui-v2', JSON.stringify({
                    ...JSON.parse(localStorage.getItem('nocodb-gui-v2') as string),
                    lang: params.lang
                  }))
                } catch (e) { }
              } else {
                hasError.value = 'unAuthed'
              }

              parent.event('initialized');

            }).catch(err => {
              hasError.value = 'unAuthed';
            })
          }
        })
        .catch((err: Error) => {
          console.log('error', err)
          hasError.value = err.toString()
        })
        .finally(() => {
          parentFrame && parentFrame.event('loaded');
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
              @click="parentFrame?.reload();">
        <span class="flex items-center gap-2">
          <component :is="iconMap.reload" />
          {{ $t('general.reload') }}
        </span>
      </button>
    </div>
    <div v-else
         class="flex flex-col justify-center items-center text-slate-400">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg"
             width="2em"
             height="2em"
             viewBox="0 0 24 24">
          <path fill="currentColor"
                d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
                opacity="0.5" />
          <path fill="currentColor"
                d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z">
            <animateTransform attributeName="transform"
                              dur="1s"
                              from="0 12 12"
                              repeatCount="indefinite"
                              to="360 12 12"
                              type="rotate" />
          </path>
        </svg>
      </div>
      <div class="pt-1 pl-1">
        {{ $t('general.loading') }}
      </div>
    </div>
  </div>
</template>