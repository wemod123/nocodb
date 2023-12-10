<script lang="ts" setup>
  import { isColorDark, stringToColor } from '~/utils/colorsUtils'
  import find from 'lodash/find'
  const { baseUsers } = storeToRefs(useBases())
  const { getProjectUsers } = useBases();

  interface UserProfile {
    display_name?: string
    email?: string
    avatar?: string
  }

  const props = withDefaults(
    defineProps<{
      size?: 'small' | 'medium' | 'base' | 'large' | 'xlarge'
      user?: UserProfile
      email?: string
    }>(),
    {
      size: 'base'
    }
  )

  if (baseUsers.value?.length === 0) {
    await getProjectUsers({})
  }

  const theEmail = (props.user && props.user.email) || props.email
  const theUser = find(baseUsers.value, { email: theEmail })

  const displayName = computed(() => theUser?.display_name ?? '')
  const email = computed(() => theUser?.email ?? '')

  const backgroundColor = computed(() => {
    // in comments we need to generate user icon from email
    if (email.value.length) {
      return stringToColor(email.value)
    }

    return email.value ? stringToColor(email.value) : '#E9EDF3'
  })

  const usernameInitials = computed(() => {
    const displayNameSplit = displayName.value?.split(' ').filter((name) => name) ?? []

    if (displayNameSplit.length > 0) {
      if (displayNameSplit.length > 1) {
        return displayNameSplit[0][0] + displayNameSplit[1][0]
      } else {
        return displayName.value.slice(0, 2)
      }
    } else {
      return email.value?.split('@')[0].slice(0, 2)
    }
  })
</script>

<template>
  <div class="flex nc-user-avatar font-bold"
       :class="{
         'min-w-4 min-h-4 w-4 h-4': size === 'small',
         'min-w-6 min-h-6 w-6 h-6': size === 'medium',
         'min-w-8 min-h-8 w-8 h-8 !text-md': size === 'base',
         'min-w-20 min-h-20 w-20 h-20 !text-3xl': size === 'large',
         'min-w-26 min-h-26 w-26 h-26 !text-4xl': size === 'xlarge',
         'text-white': isColorDark(backgroundColor),
         'text-black': !isColorDark(backgroundColor),
       }"
       :style="{ backgroundColor }">
    <NuxtImg v-if="theUser?.avatar?.startsWith('https://')"
             :src="theUser.avatar"
             fit="cover" />
    <span v-else> {{ usernameInitials }}</span>
  </div>
</template>

<style lang="scss" scoped>
.nc-user-avatar {
  @apply rounded-full overflow-hidden text-xs flex items-center justify-center uppercase;
}
</style>
