<script setup lang="ts">
  import { navigateTo, useDark, useRoute, useRouter, useSharedFormStoreOrThrow, useTheme, watch } from '#imports'

  const { sharedViewMeta } = useSharedFormStoreOrThrow()

  const isDark = useDark()

  const { setTheme } = useTheme()

  const route = useRoute()

  const router = useRouter()

  watch(
    () => sharedViewMeta.value.withTheme,
    (hasTheme) => {
      if (hasTheme && sharedViewMeta.value.theme) setTheme(sharedViewMeta.value.theme)
    },
    { immediate: true },
  )

  const onClick = () => {
    isDark.value = !isDark.value
  }

  const shouldRedirect = (to: string) => {
    if (sharedViewMeta.value.surveyMode) {
      if (!to.includes('survey')) navigateTo(`/nc/form/${route.params.viewId}/survey`)
    } else {
      if (to.includes('survey')) navigateTo(`/nc/form/${route.params.viewId}`)
    }
  }

  shouldRedirect(route.name as string)

  router.afterEach((to) => shouldRedirect(to.name as string))
</script>

<template>
  <div
       class="bg-slate-100 nc-scrollbar-md overflow-y-auto overflow-x-hidden flex flex-col items-center color-transition nc-form-view relative h-[100vh]">
    <NuxtPage />

    <!-- <div
      class="color-transition flex items-center justify-center cursor-pointer absolute top-4 md:top-15 right-4 md:right-15 rounded-full p-2 bg-white dark:(bg-slate-600) shadow hover:(ring-1 ring-accent ring-opacity-100)"
      @click="onClick"
    >
      <Transition name="slide-left" duration="250" mode="out-in">
        <MaterialSymbolsDarkModeOutline v-if="isDark" />
        <MaterialSymbolsLightModeOutline v-else />
      </Transition>
    </div> -->
  </div>
</template>

<style lang="scss">
html,
body,
h1,
h2,
h3,
h4,
h5,
h6,
p {
  @apply dark:text-white color-transition;
}

.nc-form-view {
  .nc-cell:not(.nc-cell-singleselect) {
    @apply !bg-slate-100/70 transition;
    @apply bg-slate-100/80;

    &:hover {
      @apply !border-slate-400/60;
    }

    &:focus-within {
      @apply !border-violet-500
    }

    *:not(.ant-tag, .ant-tag *) {
      @apply !bg-slate-100/70;
    }

    &.nc-cell-singlelinetext {
      input {
        @apply !pl-0
      }
    }

    &.nc-cell-checkbox {
      @apply color-transition !pl-0;

      .nc-icon {
        @apply !text-2xl;
      }

      .nc-cell-hover-show {
        opacity: 100 !important;

        div {
          background-color: transparent !important;
        }
      }
    }

    &.nc-input {
      @apply w-full rounded p-2 min-h-[44px] flex items-center;

      .duration-cell-wrapper {
        @apply w-full;

        input {
          &::placeholder {
            @apply text-gray-400;
          }
        }
      }

      input,
      textarea,
      &.nc-virtual-cell,
      >div {
        @apply bg-white;

        .ant-btn {
          @apply dark:(bg-slate-300);
        }

        .chip {
          @apply dark:(bg-slate-700 text-white);
        }
      }

      textarea {
        @apply px-4 py-2 rounded;

        &:focus {
          box-shadow: none !important;
        }
      }
    }


    .nc-attachment-cell>div {
      @apply dark:(bg-slate-100);
    }
  }
}

.nc-form-column-label {
  >* {
    @apply dark:text-slate-300;
  }
}
</style>
