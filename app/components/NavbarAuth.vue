<script setup lang="ts">
import { authClient } from '~/utils/auth-client'
import { playSound } from '~/utils/sound'

// Use Nuxt's native useFetch to ensure SSR hydration works properly and passes cookies
const { data: session } = await useFetch('/api/auth/get-session', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
})

const handleSignOut = async () => {
  await authClient.signOut()
  window.location.href = '/' // Force full page reload to clear all states
}

const userMenuItems = computed(() => [
  [{
    label: 'Account',
    icon: 'i-lucide-user',
    to: '/dashboard/account',
    click: () => playSound('nav')
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/dashboard/settings',
    click: () => playSound('nav')
  }],
  [{
    label: 'Sign Out',
    icon: 'i-lucide-log-out',
    onSelect: handleSignOut,
    click: () => {
      playSound('nav')
      handleSignOut()
    }
  }]
])
</script>

<template>
  <div class="flex items-center space-x-3 sm:space-x-4">
    <UnifiedThemePicker />

    <!-- Logged In: Avatar + Dropdown -->
    <template v-if="session?.user">
      <UDropdownMenu
        :items="userMenuItems"
        :content="{ placement: 'bottom-end' }"
      >
        <UAvatar
          :src="session.user.image || undefined"
          :alt="session.user.name || 'User'"
          size="sm"
          class="cursor-pointer ring-2 ring-primary-500/30 hover:ring-primary-500/60 transition-all"
        />

        <template #item="{ item }">
          <div class="flex items-center gap-2">
            <UIcon :name="item.icon" class="w-4 h-4 text-gray-400" />
            <span>{{ item.label }}</span>
          </div>
        </template>
      </UDropdownMenu>
    </template>

    <!-- Not Logged In: Sign In button -->
    <template v-else>
      <UButton
        to="/login"
        color="black"
        variant="solid"
        class="rounded-full px-5"
        @click="playSound('nav')"
      >
        Sign In
      </UButton>
    </template>
  </div>
</template>
