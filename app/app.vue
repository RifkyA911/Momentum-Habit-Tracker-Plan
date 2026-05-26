<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'
useTheme()
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-[#F7F8FA] dark:bg-[#020617] text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-500/30">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>
