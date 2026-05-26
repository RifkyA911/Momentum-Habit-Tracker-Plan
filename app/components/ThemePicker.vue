<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { themeHex } = useTheme()
</script>

<template>
  <div class="flex items-center space-x-2">
    <label for="theme-color" class="text-sm font-medium text-gray-500 dark:text-gray-400">
      Theme:
    </label>
    <div class="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
      <input
        id="theme-color"
        type="color"
        v-model="themeHex"
        class="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
        title="Choose theme color"
      />
    </div>
  </div>
</template>
