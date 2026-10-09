<script setup lang="ts">
const prompt = ref('')
const response = ref('')
const activeProvider = ref('')
const activeModel = ref('')
const loading = ref(false)
const errorMsg = ref('')

const { data: providersInfo } = await useFetch<any>('/api/ai/providers')

async function askAI() {
  if (!prompt.value.trim() || loading.value) return

  loading.value = true
  errorMsg.value = ''
  response.value = ''
  activeProvider.value = ''
  activeModel.value = ''

  try {
    const data = await $fetch<any>('/api/ai/chat', {
      method: 'POST',
      body: { message: prompt.value }
    })
    response.value = data.reply
    activeProvider.value = data._meta?.provider || 'Unknown'
    activeModel.value = data._meta?.model || 'Unknown'
  } catch (err: any) {
    errorMsg.value = err.data?.message || err.message || 'Error communicating with AI Gateway'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-8 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-cpu" class="w-8 h-8 text-primary-500" />
          <span>Universal AI Gateway Test</span>
        </h1>
        <p class="text-gray-500 mt-2">
          Test any connected model: 9Router, Google Gemini, OpenAI, Claude, DeepSeek, Groq, or Ollama.
        </p>
      </div>

      <div v-if="providersInfo" class="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-xl px-4 py-2 text-xs">
        <p class="font-semibold text-primary-700 dark:text-primary-300">Default Router</p>
        <p class="text-gray-600 dark:text-gray-400 capitalize">{{ providersInfo.defaultProvider }} ({{ providersInfo.defaultModel }})</p>
      </div>
    </div>

    <!-- Connected Providers Pills -->
    <div v-if="providersInfo?.providers" class="flex flex-wrap gap-2 pt-2">
      <span
        v-for="p in providersInfo.providers"
        :key="p.provider"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        :class="p.isConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'"
      >
        <span class="w-2 h-2 rounded-full" :class="p.isConfigured ? 'bg-emerald-500' : 'bg-gray-400'" />
        {{ p.provider }}
      </span>
    </div>

    <div class="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Ask Momentum Habit Assistant:</label>
        <input 
          v-model="prompt" 
          placeholder="e.g. How do I build a habit of waking up at 5 AM without burning out?"
          class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          @keyup.enter="askAI"
        />
      </div>

      <UButton 
        :loading="loading" 
        @click="askAI"
        color="primary"
        variant="solid"
        size="lg"
        class="rounded-xl px-6"
      >
        Generate Insight
      </UButton>
    </div>

    <div v-if="errorMsg" class="p-4 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 text-sm">
      {{ errorMsg }}
    </div>

    <div v-if="response || loading" class="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 mt-6 min-h-[120px]">
      <div v-if="loading" class="flex items-center space-x-2 text-gray-500">
        <UIcon name="i-lucide-loader-2" class="animate-spin w-5 h-5 text-primary-500" />
        <span>Querying AI Engine & Router...</span>
      </div>
      <div v-else class="space-y-4">
        <div class="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
          <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
          <span>Served by <strong>{{ activeProvider }}</strong> using model <strong>{{ activeModel }}</strong></span>
        </div>
        <div class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {{ response }}
        </div>
      </div>
    </div>
  </div>
</template>
