<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const settings = ref({
  emailNotifications: true,
  marketingEmails: false,
  weeklyDigest: true,
  compactMode: false,
  soundEffects: true
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Preferences</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your Momentum experience.</p>
    </div>

    <div class="space-y-6">
      <!-- Appearance & UI -->
      <UCard class="shadow-sm">
        <template #header>
          <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">Interface Settings</h2>
          <p class="text-sm leading-6 text-gray-500 dark:text-gray-400">Adjust how the app looks and feels.</p>
        </template>

        <div class="space-y-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Compact Mode</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Reduce spacing and fit more content on screen.</p>
            </div>
            <USwitch v-model="settings.compactMode" disabled />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Sound Effects</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Play sounds when completing a habit.</p>
            </div>
            <USwitch v-model="settings.soundEffects" disabled />
          </div>
        </div>
      </UCard>

      <!-- Notifications -->
      <UCard class="shadow-sm">
        <template #header>
          <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">Notifications</h2>
          <p class="text-sm leading-6 text-gray-500 dark:text-gray-400">Choose what we can send to your inbox.</p>
        </template>

        <div class="space-y-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Email Reminders</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Daily reminders for your incomplete habits.</p>
            </div>
            <USwitch v-model="settings.emailNotifications" disabled />
          </div>
          
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Weekly Digest</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">A weekly summary of your consistency and momentum.</p>
            </div>
            <USwitch v-model="settings.weeklyDigest" disabled />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Product Updates</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">News, updates, and helpful tips from the team.</p>
            </div>
            <USwitch v-model="settings.marketingEmails" disabled />
          </div>
        </div>
        
        <template #footer>
           <p class="text-xs text-gray-500 text-center">Settings are currently in preview mode (Coming Soon).</p>
        </template>
      </UCard>
    </div>
  </div>
</template>
