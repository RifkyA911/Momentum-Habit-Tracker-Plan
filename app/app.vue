<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

const isAppLoading = ref(true)

useTheme()

onMounted(() => {
  // Hide loading screen after a longer delay to ensure theme is ready
  setTimeout(() => {
    isAppLoading.value = false
  }, 1500)
})

const colors = ['bg-primary-500/30', 'bg-purple-500/30', 'bg-pink-500/30', 'bg-blue-500/30', 'bg-cyan-500/30', 'bg-teal-500/30', 'bg-indigo-500/30']
</script>

<template>
  <!-- Global Loading Screen -->
  <div v-if="isAppLoading" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F7F8FA] dark:bg-[#020617] overflow-hidden">
    <!-- Star Trail Background -->
    <div class="absolute inset-0 pointer-events-none">
      <div v-for="i in 30" :key="i" class="absolute w-1 h-1 rounded-full animate-pulse"
        :class="colors[Math.floor(Math.random() * colors.length)]"
        :style="{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${1 + Math.random() * 2}s`
        }"
      />
    </div>

    <!-- Flat Design Hills -->
    <div class="absolute bottom-0 left-0 right-0 pointer-events-none">
      <div class="absolute bottom-0 left-0 w-full h-32 bg-primary-500/10 rounded-t-[50%] translate-y-1/2" />
      <div class="absolute bottom-0 left-0 w-2/3 h-24 bg-purple-500/10 rounded-t-[50%] translate-y-1/3" />
      <div class="absolute bottom-0 right-0 w-1/2 h-20 bg-pink-500/10 rounded-t-[50%] translate-y-1/4" />
    </div>

    <!-- Activity Icon (Bouncing Ball) -->
    <UIcon name="i-lucide-activity" class="w-10 h-10 text-primary-500 relative z-10 animate-bounce" />
  </div>

  <UApp>
    <div v-if="!isAppLoading" class="min-h-screen bg-[#F7F8FA] dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-500/30">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>
