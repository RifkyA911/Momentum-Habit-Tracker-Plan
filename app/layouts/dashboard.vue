<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

const { data: session } = authClient.useSession()
const currentStreak = useState<number | null>('currentStreak', () => null)

onMounted(async () => {
  if (currentStreak.value === null) {
    try {
      const stats = await $fetch('/api/habits/stats')
      currentStreak.value = stats.streak
    } catch (e) {
      currentStreak.value = 0
    }
  }
})
</script>

<template>
  <div>
    <!-- Dashboard Top Navbar -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <UIcon name="i-lucide-activity" class="w-6 h-6 text-primary-500 shrink-0" />
          <span class="hidden sm:inline text-xl font-bold tracking-tight">Momentum</span>
        </NuxtLink>

        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Streak Counter -->
          <div v-if="currentStreak !== null" class="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-primary-500/10 text-primary-500 rounded-full text-sm font-medium shimmer-badge">
            <UIcon name="i-lucide-flame" class="w-4 h-4 text-orange-500" />
            <span>{{ currentStreak }} Day Streak</span>
          </div>
          <div v-else class="hidden sm:flex w-28 h-8 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse shrink-0" />

          <NavbarAuth />
        </div>
      </div>
    </header>

    <!-- Dashboard Content Wrapper -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>
  </div>
</template>
