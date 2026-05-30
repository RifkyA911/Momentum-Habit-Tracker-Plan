<script setup lang="ts">
definePageMeta({ layout: "default" });
const config = useRuntimeConfig()

const AUTHORIZED_USER_ID = config.public.authorizedUserId ?? ''

// Get session
const { data: session } = await useFetch('/api/auth/get-session', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
})

// Check if user is authorized
const isAuthorized = session?.value?.user?.id === AUTHORIZED_USER_ID

console.log({
  runtime: config.public.authorizedUserId,
  env: process.env.AUTHORIZED_USER_ID,
  session: session?.value?.user?.id
})

// If not authorized, show 403
if (!isAuthorized) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden - You do not have permission to access this page'
  })
}

// Fetch feedback data
const { data: feedbackData } = await useFetch('/api/feedback')
</script>

<template>
  <div class="min-h-screen bg-[#F7F8FA] dark:bg-[#020617] p-8 mt-[80px]">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Feedback Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400">View and manage user feedback</p>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Feedback</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-if="!feedbackData || feedbackData.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No feedback submissions yet
              </td>
            </tr>
            <tr v-else v-for="item in feedbackData" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ new Date(item.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ item.name || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ item.email || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': item.category === 'bug',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': item.category === 'feature',
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': item.category === 'uiux',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': item.category === 'other'
                  }">
                  {{ item.category.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <div class="flex items-center">
                  <span v-for="star in 5" :key="star" class="text-yellow-400">
                    {{ star <= item.rating ? '★' : '☆' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-md">
                {{ item.feedback }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
