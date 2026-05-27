<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
useTheme()

const isLoaded = ref(false)

onMounted(() => {
  // Wait a tiny bit for the useTheme composable to inject CSS variables into :root
  setTimeout(() => {
    isLoaded.value = true
  }, 50)
})
</script>

<template>
  <UApp>
    <!-- Loading Screen (FOUC Preventer) -->
    <div
      v-if="!isLoaded"
      class="fixed inset-0 z-[9999] bg-[#0B0D0F] flex items-center justify-center transition-opacity duration-500"
    >
      <div class="flex flex-col items-center space-y-4">
        <UIcon name="i-lucide-activity" class="w-12 h-12 text-primary-500 animate-pulse" />
      </div>
    </div>

    <div 
      class="min-h-screen bg-[#F7F8FA] dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-500/30 transition-opacity duration-700"
      :class="isLoaded ? 'opacity-100' : 'opacity-0'"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>
