<script setup lang="ts">
  import {
    IsFormInj,
    IsPublicInj,
    MetaInj,
    ReloadViewDataHookInj,
    applyLanguageDirection,
    createError,
    createEventHook,
    definePageMeta,
    navigateTo,
    provide,
    reactive,
    ref,
    useI18n,
    useProvideSharedFormStore,
    useProvideSmartsheetStore,
    useRoute,
    useSidebar,
    watch,
  } from '#imports'
  import { setI18nLanguage } from '~/plugins/a.i18n'

  definePageMeta({
    public: true,
  })

  useSidebar('nc-left-sidebar', { hasSidebar: false })

  const route = useRoute()

  const { lang } = useGlobal()

  const { t } = useI18n()

  const { loadSharedView, sharedView, sharedViewMeta, meta, notFound, password, passwordDlg, passwordError } =
    useProvideSharedFormStore(route.params.viewId as string)

  onMounted(async () => {
    /** Set language if present */
    try {
      const locale = route.query.lang as string;
      if (locale === 'zh') {
        await setI18nLanguage('zh-Hans')
        lang.value = 'zh-Hans';
      } else {
        await setI18nLanguage('en')
        lang.value = 'en';
      }
    } catch { }

    /** Emit event if is loaded via iframe */
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'view-loaded' }, '*')
    }
  })

  await loadSharedView(route.query.p_token as string || route.query.p_code as string)

  if (!notFound.value) {
    provide(ReloadViewDataHookInj, createEventHook())
    provide(MetaInj, meta)
    provide(IsPublicInj, ref(true))
    provide(IsFormInj, ref(true))

    useProvideSmartsheetStore(sharedView, meta, true)

    applyLanguageDirection(sharedViewMeta.value.rtl ? 'rtl' : 'ltr')
  } else {
    navigateTo('/error/404')
    throw createError({ statusCode: 404, statusMessage: t('msg.pageNotFound') })
  }

  const form = reactive({
    password: '',
  })

  watch(
    () => form.password,
    () => {
      password.value = form.password
    },
  )
</script>

<template>
  <NuxtLayout>
    <NuxtPage v-if="!passwordDlg" />

    <a-modal v-model:visible="passwordDlg"
             :class="{ active: passwordDlg }"
             :closable="false"
             width="min(100%, 450px)"
             centered
             :footer="null"
             :mask-closable="false"
             wrap-class-name="nc-modal-shared-form-password-dlg"
             @close="passwordDlg = false">
      <div class="w-full flex flex-col gap-4 pt-4">
        <h2 class="text-xl text-center font-semibold">{{ $t('msg.inputYourPassphraseToContinue') }}</h2>

        <a-form layout="vertical"
                no-style
                :model="form"
                @finish="loadSharedView">
          <a-form-item name="password"
                       :rules="[{ required: true, message: $t('msg.error.signUpRules.passwdRequired') }]">
            <a-input-password v-model:value="form.password"
                              size="large"
                              :placeholder="$t('msg.enterPassword')" />
          </a-form-item>

          <Transition name="layout">
            <div v-if="passwordError"
                 class="mb-2 text-sm text-red-500">{{ $t(`msg.${passwordError}`) }}</div>
          </Transition>

          <!-- Unlock -->
          <div class="flex justify-end items-center">
            <button type="submit"
                    class="mt-4 bg-violet-500 px-4 py-2 text-white hover:bg-violet-600 transition-all flex items-center !rounded-lg">
              <component :is="iconMap.lock"
                         class="mr-2" />
              <span>{{ $t('general.unlock') }}</span>
            </button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
:deep(.nc-cell-attachment) {
  @apply p-0;

  .nc-attachment-cell {
    @apply px-4 min-h-[75px] w-full h-full;

    .nc-attachment {
      @apply md:(w-[50px] h-[50px]) lg:(w-[75px] h-[75px]) min-h-[50px] min-w-[50px];
    }

    .nc-attachment-cell-dropzone {
      @apply rounded bg-gray-400/75;
    }
  }
}

.nc-modal-shared-form-password-dlg {

  .ant-input-affix-wrapper,
  .ant-input {
    @apply !appearance-none my-1 border-1 border-solid border-primary border-opacity-50 rounded;
  }

  .password {
    input {
      @apply !border-none !m-0;
    }
  }
}
</style>
