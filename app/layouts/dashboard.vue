<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const { data: session } = await authClient.useSession(useFetch)

const handleSignOut = async () => {
  await authClient.signOut()
  navigateTo('/login')
}

const userMenuItems = computed(() => [
  [{
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/dashboard/settings'
  }],
  [{
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    click: handleSignOut
  }]
])
</script>

<template>
  <div>
    <!-- Dashboard Top Navbar -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/dashboard" class="flex items-center space-x-2">
          <UIcon name="i-lucide-activity" class="w-6 h-6 text-emerald-500" />
          <span class="text-xl font-bold tracking-tight">Momentum</span>
        </NuxtLink>

        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Streak Counter -->
          <div class="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full text-sm font-medium">
            <UIcon name="i-lucide-flame" class="w-4 h-4" />
            <span class="hidden sm:inline">12 Day Streak</span>
            <span class="sm:hidden">12</span>
          </div>

          <UColorModeButton />

          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
          >
            <UAvatar
              :src="session?.user?.image || undefined"
              :alt="session?.user?.name || 'User'"
              size="sm"
              class="cursor-pointer ring-2 ring-gray-200 dark:ring-gray-700"
            />
          </UDropdown>
        </div>
      </div>
    </header>

    <!-- Dashboard Content Wrapper -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>
  </div>
</template>
