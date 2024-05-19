<script setup lang="ts">
  import { message } from 'ant-design-vue'
  import { definePageMeta } from '#imports'
  import { setI18nLanguage } from '~/plugins/a.i18n'
  definePageMeta({
    public: true,
    requiresAuth: false,
    layout: 'shared-view',
  })

  const route = useRoute()
  const { drySignOut, lang } = useGlobal()
  const { loadSharedView } = useSharedView()

  const showPassword = ref(false)

  onMounted(async () => {
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

    try {
      drySignOut();
    } catch { }

    /** Set password with token if present */
    if (route.query.p_token) {
      try {
        await loadSharedView(route.params.viewId as string, route.query.p_token as string)
        return;
      } catch { }
    }

    try {
      await loadSharedView(route.params.viewId as string)
    } catch (e: any) {
      if (e?.response?.status === 403) {
        showPassword.value = true
      } else {
        message.error(await extractSdkResponseErrorMsg(e))
      }
    }
  })
</script>

<template>
  <div v-if="showPassword">
    <LazySharedViewAskPassword v-model="showPassword" />
  </div>
  <LazySharedViewGallery v-else />
</template>
