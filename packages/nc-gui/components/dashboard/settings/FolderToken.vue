<script setup lang="ts">
  import { useNuxtApp, useBases } from '#imports'

  const props = defineProps(['baseId'])
  const { basesList } = storeToRefs(useBases())
  const { $state, $api } = useNuxtApp()

  const tid = computed(() => {
    const base = basesList.value.find(base => base.id === props.baseId);
    return base?.title;
  })

  const xcToken = ref('-')
  const tokenType = 'Tw/Bndq7eQHjLBVlWpnGeLa3t+3zGiu'

  const getToken = async () => {
    xcToken.value = await $fetch(`/api/v1/auth/robot/apitoken/${tid.value}`, {
      baseURL: $api.instance.defaults.baseURL,
      method: 'GET',
      headers: { 'xc-auth': $state.token.value as string }
    }) as string;
  }

  onMounted(() => {
    nextTick(async () => {
      await getToken();
    })
  })

  const isCopiedId = ref('')

  const copyToken = (str: string) => {
    navigator?.clipboard?.writeText(str).then(
      () => {
        isCopiedId.value = str;
        setTimeout(() => {
          isCopiedId.value = ''
        }, 1500);
      },
      () => { }
    )
  }
</script>

<template>
  <div class="flex flex-row w-full">
    <div class="flex flex-col w-full">
      <div class="flex items-center py-4">
        <div class="w-32 text-slate-500 font-bold">xc-auth</div>
        <div class="w-64">{{ xcToken.slice(0, 18) }}******</div>
        <a-button size="small"
                  class="!rounded"
                  @click="copyToken(xcToken)">
          <div class="flex items-center">
            <span v-if="isCopiedId === xcToken"
                  class="min-w-5">✅</span>
            <component v-else
                       :is="iconMap.copy"
                       class="min-w-5" />
            {{ $t('general.copy') }}
          </div>
        </a-button>
      </div>
      <div class="flex items-center">
        <div class="w-32 text-slate-500 font-bold">xc-tokenkind</div>
        <div class="w-64">{{ tokenType.slice(0, 18) }}******</div>
        <a-button size="small"
                  class="!rounded"
                  @click="copyToken(tokenType)">
          <div class="flex items-center">
            <span v-if="isCopiedId === tokenType"
                  class="min-w-5">✅</span>
            <component v-else
                       :is="iconMap.copy"
                       class="min-w-5" />
            {{ $t('general.copy') }}
          </div>
        </a-button>
      </div>

      <div class="pt-8">
        <div class="font-bold text-slate-500 text-lg">📑Use tokens</div>
        <div class="pt-5">
          Include above tokens in request headers, that's it
        </div>
      </div>
    </div>
  </div>
</template>
