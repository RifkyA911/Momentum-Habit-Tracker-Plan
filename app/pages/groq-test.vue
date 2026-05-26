<script setup lang="ts">
const prompt = ref('')
const response = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function askGroq() {
  if (!prompt.value.trim()) return

  loading.value = true
  errorMsg.value = ''
  response.value = ''

  try {
    const data = await $fetch('/api/groq', {
      method: 'POST',
      body: { message: prompt.value }
    })
    response.value = data.reply
  } catch (err: any) {
    errorMsg.value = err.data?.message || err.message || 'Error communicating with Groq API'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-8 space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Groq AI Test</h1>
      <p class="text-gray-500 mt-2">Test LLaMA 3 generation powered by Groq.</p>
    </div>

    <div class="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <UFormGroup label="Ask Momentum AI:" name="prompt">
        <UInput 
          v-model="prompt" 
          placeholder="e.g. How do I build a habit of waking up at 5 AM?"
          @keyup.enter="askGroq"
        />
      </UFormGroup>

      <UButton 
        :loading="loading" 
        @click="askGroq"
        color="primary"
        variant="solid"
      >
        Generate Insight
      </UButton>
    </div>

    <div v-if="errorMsg" class="p-4 bg-red-50 text-red-600 rounded-lg">
      {{ errorMsg }}
    </div>

    <div v-if="response || loading" class="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mt-6 min-h-[100px]">
      <div v-if="loading" class="flex items-center space-x-2 text-gray-500">
        <UIcon name="i-lucide-loader-2" class="animate-spin w-5 h-5" />
        <span>Thinking fast...</span>
      </div>
      <div v-else class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
        {{ response }}
      </div>
    </div>
  </div>
</template>
