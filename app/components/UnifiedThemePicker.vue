<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { themeHex } = useTheme()
const colorMode = useColorMode()

const primaryColors = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Black', hex: '#000000' }
]

const colorModes = [
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'System', value: 'system', icon: 'i-lucide-monitor' }
]
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-end', strategy: 'absolute' }">
    <UButton
      icon="i-lucide-palette"
      color="gray"
      variant="ghost"
      aria-label="Theme settings"
      class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    />

    <template #content>
      <div class="p-4 w-72 bg-white dark:bg-[#0B0D0F] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl">
        <!-- Primary Color Section -->
        <div class="mb-6">
          <div class="flex items-center gap-1.5 mb-3">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">Primary</span>
            <UIcon name="i-lucide-help-circle" class="w-3.5 h-3.5 text-gray-400" />
          </div>
          
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="color in primaryColors"
              :key="color.hex"
              @click="themeHex = color.hex"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              :class="themeHex === color.hex ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'"
            >
              <div 
                class="w-3 h-3 rounded-full" 
                :style="{ backgroundColor: color.name === 'Black' ? (colorMode.value === 'dark' ? '#fff' : '#000') : color.hex }" 
              />
              {{ color.name }}
            </button>
          </div>
        </div>

        <!-- Color Mode Section -->
        <div>
          <div class="flex items-center gap-1.5 mb-3">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">Color Mode</span>
            <UIcon name="i-lucide-help-circle" class="w-3.5 h-3.5 text-gray-400" />
          </div>
          
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="mode in colorModes"
              :key="mode.value"
              @click="colorMode.preference = mode.value"
              class="flex items-center justify-center gap-2 px-2 py-2 rounded-lg border text-xs font-medium transition-colors"
              :class="colorMode.preference === mode.value ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'"
            >
              <UIcon :name="mode.icon" class="w-4 h-4" />
              {{ mode.label }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
