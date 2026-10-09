<script setup lang="ts">
import { playSound } from '~/utils/sound'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const toast = useToast()
const activeTab = ref<'ai' | 'n8n' | 'hermes' | 'preferences'>('ai')

// Load user settings from server
const { data: settingsData, refresh: refreshSettings } = await useFetch<any>('/api/ai/user-settings')

const settings = ref({
  defaultProvider: '9router',
  defaultModel: 'llama-3.3-70b-versatile',
  providers: {
    '9router': { baseUrl: 'http://localhost:20128/v1', apiKey: '', model: 'llama-3.3-70b-versatile' },
    gemini: { apiKey: '', model: 'gemini-2.0-flash' },
    openai: { apiKey: '', model: 'gpt-4o-mini' },
    anthropic: { apiKey: '', model: 'claude-3-5-haiku-20241022' },
    deepseek: { apiKey: '', model: 'deepseek-chat' },
    groq: { apiKey: '', model: 'llama-3.3-70b-versatile' },
    openrouter: { apiKey: '', model: 'meta-llama/llama-3.3-70b-instruct' },
    ollama: { baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' }
  },
  serverConfigured: {} as Record<string, boolean>,
  n8n: {
    webhookUrl: '',
    webhookSecret: '',
    enabled: false
  },
  hermes: {
    apiKey: '',
    enabled: false
  },
  preferences: {
    soundEffects: true,
    compactMode: false
  }
})

// Initialize from fetched data
watchEffect(() => {
  if (settingsData.value) {
    if (settingsData.value.defaultProvider) settings.value.defaultProvider = settingsData.value.defaultProvider
    if (settingsData.value.defaultModel) settings.value.defaultModel = settingsData.value.defaultModel
    if (settingsData.value.providers) settings.value.providers = { ...settings.value.providers, ...settingsData.value.providers }
    if (settingsData.value.serverConfigured) settings.value.serverConfigured = settingsData.value.serverConfigured
    if (settingsData.value.n8n) settings.value.n8n = { ...settings.value.n8n, ...settingsData.value.n8n }
    if (settingsData.value.hermes) settings.value.hermes = { ...settings.value.hermes, ...settingsData.value.hermes }
  }
})

// Provider metadata definition
const providerList = [
  {
    id: '9router',
    name: '9Router Gateway',
    description: 'Local / VPS router with RTK prompt caching & smart failover (Recommended)',
    icon: 'i-lucide-router',
    color: 'purple',
    docs: 'http://localhost:20128/v1'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'High token quota & fast reasoning via Gemini 2.0 Flash / 1.5 Pro',
    icon: 'i-lucide-sparkles',
    color: 'blue',
    docs: 'https://aistudio.google.com'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    description: 'Industry benchmark models (GPT-4o, GPT-4o-mini)',
    icon: 'i-lucide-cpu',
    color: 'emerald',
    docs: 'https://platform.openai.com'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Top-tier nuanced behavioral insights (Claude 3.5 Sonnet / Haiku)',
    icon: 'i-lucide-bot',
    color: 'amber',
    docs: 'https://console.anthropic.com'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek API',
    description: 'Ultra cost-effective coding & reasoning (DeepSeek Chat / Reasoner)',
    icon: 'i-lucide-brain',
    color: 'cyan',
    docs: 'https://platform.deepseek.com'
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    description: 'Sub-second LPUs for instant responses (Llama 3.3 70B)',
    icon: 'i-lucide-zap',
    color: 'orange',
    docs: 'https://console.groq.com'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified multi-vendor API routing with auto fallback',
    icon: 'i-lucide-globe',
    color: 'indigo',
    docs: 'https://openrouter.ai'
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: '100% private on-device LLMs (Llama 3.2, Mistral, Qwen)',
    icon: 'i-lucide-hard-drive',
    color: 'teal',
    docs: 'http://localhost:11434'
  }
]

// State for test actions
const isTesting = ref<Record<string, boolean>>({})
const testResults = ref<Record<string, { success: boolean; latencyMs?: number; text?: string; error?: string }>>({})
const isSaving = ref(false)
const saveMessage = ref('')

// Test AI Provider Connection
const testProviderConnection = async (providerId: string) => {
  isTesting.value[providerId] = true
  testResults.value[providerId] = undefined as any
  playSound('tick')

  try {
    const provConfig = (settings.value.providers as any)[providerId] || {}
    const res = await $fetch<any>('/api/ai/test-connection', {
      method: 'POST',
      body: {
        provider: providerId,
        apiKey: provConfig.apiKey || undefined,
        baseUrl: provConfig.baseUrl || undefined,
        model: provConfig.model || undefined
      }
    })

    testResults.value[providerId] = res
    if (res.success) {
      playSound('success')
      toast.add({
        title: `${providerId.toUpperCase()} Connected!`,
        description: `Response received in ${res.latencyMs}ms (${res.model})`,
        color: 'success'
      })
    } else {
      playSound('uncheck')
      toast.add({
        title: `${providerId.toUpperCase()} Failed`,
        description: res.error || 'Connection failed',
        color: 'error'
      })
    }
  } catch (err: any) {
    testResults.value[providerId] = {
      success: false,
      error: err.data?.message || err.message || 'Connection error'
    }
    playSound('uncheck')
    toast.add({
      title: 'Connection Error',
      description: err.data?.message || err.message,
      color: 'error'
    })
  } finally {
    isTesting.value[providerId] = false
  }
}

// Test n8n Webhook Connection
const isTestingN8n = ref(false)
const n8nTestResult = ref<any>(null)
const testN8nConnection = async () => {
  isTestingN8n.value = true
  n8nTestResult.value = null
  playSound('tick')

  try {
    const res = await $fetch<any>('/api/integrations/n8n-test', {
      method: 'POST',
      body: {
        webhookUrl: settings.value.n8n.webhookUrl,
        webhookSecret: settings.value.n8n.webhookSecret
      }
    })
    testResults.value['n8n'] = res
    if (res.success) {
      playSound('success')
      toast.add({
        title: 'n8n Connected!',
        description: `Webhook responded in ${res.latencyMs}ms (Status: ${res.status})`,
        color: 'success'
      })
    } else {
      playSound('uncheck')
      toast.add({
        title: 'n8n Ping Failed',
        description: res.error,
        color: 'error'
      })
    }
  } catch (err: any) {
    n8nTestResult.value = { success: false, error: err.message }
    playSound('uncheck')
  } finally {
    isTestingN8n.value = false
  }
}

// Live Hermes Telemetry
const { data: hermesTelemetry, refresh: refreshHermes } = useFetch<any>('/api/agent/habits', {
  lazy: true
})

// Save All Settings
const handleSave = async () => {
  isSaving.value = true
  saveMessage.value = ''
  playSound('tick')

  try {
    await $fetch('/api/ai/user-settings', {
      method: 'POST',
      body: {
        defaultProvider: settings.value.defaultProvider,
        defaultModel: settings.value.defaultModel,
        providers: settings.value.providers,
        n8n: settings.value.n8n,
        hermes: settings.value.hermes
      }
    })

    // Also persist client-side copy for instant local use
    if (import.meta.client) {
      localStorage.setItem('momentum_ai_client_settings', JSON.stringify({
        defaultProvider: settings.value.defaultProvider,
        defaultModel: settings.value.defaultModel,
        providers: settings.value.providers
      }))
    }

    playSound('magic')
    toast.add({
      title: 'Settings Saved',
      description: 'Your AI models and integration preferences are now active!',
      color: 'success'
    })
    saveMessage.value = 'Saved successfully!'
    setTimeout(() => { saveMessage.value = '' }, 4000)
    await refreshSettings()
  } catch (err: any) {
    playSound('uncheck')
    toast.add({
      title: 'Failed to Save',
      description: err.message || 'An error occurred',
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

// Copy to Clipboard Helper
const copyToClipboard = async (text: string, label: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    playSound('tick')
    toast.add({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
      color: 'primary'
    })
  }
}

// Password Visibility Toggles
const showKey = ref<Record<string, boolean>>({})
const toggleShowKey = (id: string) => {
  showKey.value[id] = !showKey.value[id]
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <UIcon name="i-lucide-settings-2" class="w-8 h-8 text-primary-500" />
          Settings & Integrations Hub
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure 9Router, AI models, n8n automated webhooks, and Hermes Agent telemetry.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="saveMessage" class="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
          <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
          {{ saveMessage }}
        </span>
        <UButton
          color="primary"
          variant="solid"
          size="lg"
          icon="i-lucide-save"
          :loading="isSaving"
          class="rounded-xl px-6 shadow-sm"
          @click="handleSave"
        >
          Save Settings
        </UButton>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/[0.04] rounded-2xl border border-gray-200 dark:border-white/10 overflow-x-auto">
      <button
        type="button"
        @click="activeTab = 'ai'; playSound('nav')"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'ai' 
          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
      >
        <UIcon name="i-lucide-cpu" class="w-4 h-4" />
        AI Models & 9Router
      </button>

      <button
        type="button"
        @click="activeTab = 'n8n'; playSound('nav')"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'n8n' 
          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
      >
        <UIcon name="i-lucide-workflow" class="w-4 h-4" />
        n8n Automation
      </button>

      <button
        type="button"
        @click="activeTab = 'hermes'; playSound('nav'); refreshHermes()"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'hermes' 
          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
      >
        <UIcon name="i-lucide-brain" class="w-4 h-4" />
        Hermes Agent (Nous)
      </button>

      <button
        type="button"
        @click="activeTab = 'preferences'; playSound('nav')"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
        :class="activeTab === 'preferences' 
          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
      >
        <UIcon name="i-lucide-sliders" class="w-4 h-4" />
        Preferences & Sound
      </button>
    </div>

    <!-- ========================================== -->
    <!-- TAB 1: AI MODELS & 9ROUTER GATEWAY         -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'ai'" class="space-y-6">
      <!-- Default Provider Selector -->
      <UCard class="shadow-sm border border-gray-200 dark:border-white/10 rounded-3xl">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-primary-500" />
                Primary AI Engine
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Pilih model/gateway yang digunakan aplikasi secara default untuk Magic Create, Weekly Insights, dan Daily Tips.
              </p>
            </div>
            <UBadge color="primary" variant="subtle" size="md" class="capitalize">
              Active: {{ settings.defaultProvider }}
            </UBadge>
          </div>
        </template>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="prov in providerList"
            :key="prov.id"
            type="button"
            @click="settings.defaultProvider = prov.id; playSound('tick')"
            class="p-3.5 rounded-2xl border text-left transition-all duration-200 relative group flex flex-col justify-between"
            :class="settings.defaultProvider === prov.id
              ? 'border-primary-500 bg-primary-500/10 shadow-sm ring-2 ring-primary-500/40'
              : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02]'"
          >
            <div class="flex items-center justify-between w-full mb-2">
              <UIcon :name="prov.icon" class="w-5 h-5" :class="settings.defaultProvider === prov.id ? 'text-primary-500' : 'text-gray-400'" />
              <span
                v-if="settings.serverConfigured[prov.id] || (settings.providers as any)[prov.id]?.apiKey"
                class="w-2 h-2 rounded-full bg-emerald-500"
                title="Configured"
              />
              <span
                v-else
                class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"
                title="Not configured"
              />
            </div>
            <div>
              <p class="font-bold text-sm text-gray-900 dark:text-white leading-tight">{{ prov.name }}</p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ (settings.providers as any)[prov.id]?.model || 'Default' }}</p>
            </div>
          </button>
        </div>
      </UCard>

      <!-- Provider Details & Key Configuration -->
      <div class="space-y-4">
        <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-key" class="w-4 h-4 text-primary-500" />
          Provider API Credentials & Gateway Endpoints
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="prov in providerList"
            :key="prov.id"
            class="p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between"
            :class="settings.defaultProvider === prov.id
              ? 'bg-primary-500/[0.03] border-primary-500/40 shadow-sm'
              : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/10'"
          >
            <!-- Top Card Header -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2.5">
                  <div class="p-2 rounded-xl bg-gray-100 dark:bg-white/10">
                    <UIcon :name="prov.icon" class="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-gray-900 dark:text-white">{{ prov.name }}</h4>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{{ prov.description }}</p>
                  </div>
                </div>

                <UBadge
                  v-if="settings.serverConfigured[prov.id]"
                  color="success"
                  variant="subtle"
                  size="xs"
                >
                  Env Configured
                </UBadge>
                <UBadge
                  v-else-if="(settings.providers as any)[prov.id]?.apiKey"
                  color="primary"
                  variant="subtle"
                  size="xs"
                >
                  Custom Key
                </UBadge>
                <UBadge
                  v-else
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  Unset
                </UBadge>
              </div>

              <!-- Form Fields -->
              <div class="space-y-3 mt-4">
                <!-- Gateway URL (For 9Router / Ollama) -->
                <div v-if="prov.id === '9router' || prov.id === 'ollama'" class="space-y-1">
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Base Gateway URL</label>
                  <UInput
                    v-model="(settings.providers as any)[prov.id].baseUrl"
                    type="text"
                    size="sm"
                    :placeholder="prov.docs"
                    icon="i-lucide-link"
                    class="w-full"
                  />
                </div>

                <!-- API Key Field -->
                <div v-if="prov.id !== 'ollama'" class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">API Key</label>
                    <a :href="prov.docs" target="_blank" class="text-[11px] text-primary-500 hover:underline">Get Key ↗</a>
                  </div>
                  <div class="relative">
                    <UInput
                      v-model="(settings.providers as any)[prov.id].apiKey"
                      :type="showKey[prov.id] ? 'text' : 'password'"
                      size="sm"
                      placeholder="sk-..."
                      icon="i-lucide-lock"
                      class="w-full pr-9"
                    />
                    <button
                      type="button"
                      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      @click="toggleShowKey(prov.id)"
                    >
                      <UIcon :name="showKey[prov.id] ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Model Override -->
                <div class="space-y-1">
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Default Model</label>
                  <UInput
                    v-model="(settings.providers as any)[prov.id].model"
                    type="text"
                    size="sm"
                    placeholder="Model identifier (e.g. gpt-4o-mini)"
                    icon="i-lucide-cpu"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Card Bottom Test Action -->
            <div class="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2">
              <div class="text-xs">
                <span v-if="testResults[prov.id]?.success" class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <UIcon name="i-lucide-check-circle" class="w-3.5 h-3.5" />
                  {{ testResults[prov.id]?.latencyMs }}ms OK
                </span>
                <span v-else-if="testResults[prov.id] && !testResults[prov.id]?.success" class="text-rose-500 font-semibold truncate block max-w-[140px]" :title="testResults[prov.id]?.error">
                  {{ testResults[prov.id]?.error }}
                </span>
                <span v-else class="text-gray-400 text-[11px]">Ready to test</span>
              </div>

              <UButton
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-lucide-play"
                :loading="isTesting[prov.id]"
                @click="testProviderConnection(prov.id)"
              >
                Test Ping
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 2: N8N AUTOMATION                      -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'n8n'" class="space-y-6">
      <!-- Outbound Webhooks -->
      <UCard class="shadow-sm border border-gray-200 dark:border-white/10 rounded-3xl">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-send" class="w-5 h-5 text-rose-500" />
                Outbound Event Webhooks (Momentum ➔ n8n)
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Kirim event instan ke n8n setiap kali tugas selesai (<code class="text-primary-500">task.completed</code>), habit dibuat, atau streak tercapai.
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-200">n8n Webhook Target URL</label>
            <UInput
              v-model="settings.n8n.webhookUrl"
              type="text"
              placeholder="http://localhost:5678/webhook/momentum-events"
              icon="i-lucide-webhook"
              class="w-full"
            />
            <p class="text-[11px] text-gray-400">Buat Webhook Node di n8n dengan method POST.</p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-200">Webhook Secret Header (X-Momentum-Secret)</label>
            <UInput
              v-model="settings.n8n.webhookSecret"
              type="password"
              placeholder="Secret string untuk otentikasi webhook"
              icon="i-lucide-shield-check"
              class="w-full"
            />
          </div>

          <div class="pt-2 flex items-center justify-between">
            <span v-if="n8nTestResult" class="text-xs font-semibold flex items-center gap-1.5" :class="n8nTestResult.success ? 'text-emerald-500' : 'text-rose-500'">
              <UIcon :name="n8nTestResult.success ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'" class="w-4 h-4" />
              {{ n8nTestResult.success ? `Webhook Responded in ${n8nTestResult.latencyMs}ms (HTTP ${n8nTestResult.status})` : n8nTestResult.error }}
            </span>
            <span v-else class="text-xs text-gray-400">Pastikan n8n workflow Anda sudah aktif (*Active/Listening*).</span>

            <UButton
              color="primary"
              variant="soft"
              icon="i-lucide-send"
              :loading="isTestingN8n"
              @click="testN8nConnection"
            >
              Send Test Webhook
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Inbound Webhook (WhatsApp / Telegram Bot) -->
      <UCard class="shadow-sm border border-gray-200 dark:border-white/10 rounded-3xl">
        <template #header>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-bot" class="w-5 h-5 text-emerald-500" />
              Inbound Actions: WhatsApp & Telegram Bot (n8n ➔ Momentum)
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Izinkan bot WhatsApp/Telegram Anda untuk mencentang kebiasaan langsung dari ruang chat!
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Momentum Inbound Endpoint</p>
              <p class="text-sm font-mono font-bold text-gray-900 dark:text-white mt-1">/api/integrations/n8n</p>
            </div>
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-copy"
              @click="copyToClipboard('/api/integrations/n8n', 'Endpoint URL')"
            >
              Copy Endpoint
            </UButton>
          </div>

          <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Aksi Bot yang Didukung:</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 space-y-1">
                <span class="text-xs font-mono font-bold text-primary-500">get_today_summary</span>
                <p class="text-xs text-gray-500">Membaca daftar task yang tersisa hari ini untuk user.</p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 space-y-1">
                <span class="text-xs font-mono font-bold text-emerald-500">complete_task</span>
                <p class="text-xs text-gray-500">Mencentang task via ID atau pencarian judul mirip (*fuzzy title search*).</p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 space-y-1">
                <span class="text-xs font-mono font-bold text-purple-500">create_habit</span>
                <p class="text-xs text-gray-500">Membuat habit dan task baru langsung dari pesan chat bot.</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- ========================================== -->
    <!-- TAB 3: HERMES AGENT (NOUS RESEARCH)        -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'hermes'" class="space-y-6">
      <UCard class="shadow-sm border border-gray-200 dark:border-white/10 rounded-3xl">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-activity" class="w-5 h-5 text-amber-500" />
                Nous Research Hermes Cognitive Agent
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Agen otonom bimbingan psikologi perilaku yang memantau ritme biologis, konsistensi, dan risiko kejenuhan (*burnout*).
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Hermes Telemetry Endpoint</p>
              <p class="text-sm font-mono font-bold text-gray-900 dark:text-white mt-1">/api/agent/habits</p>
            </div>
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-copy"
              @click="copyToClipboard('/api/agent/habits', 'Hermes Telemetry Endpoint')"
            >
              Copy Telemetry URL
            </UButton>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-200">Hermes Bearer Secret Key</label>
            <UInput
              v-model="settings.hermes.apiKey"
              type="password"
              placeholder="Kunci rahasia untuk otorisasi request Hermes"
              icon="i-lucide-key"
              class="w-full"
            />
          </div>

          <!-- Live Telemetry Inspector Card -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Live Telemetry Data (Current User):</h4>
              <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-refresh-cw" @click="() => refreshHermes()">Refresh</UButton>
            </div>

            <div v-if="hermesTelemetry?.telemetry" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                <p class="text-[11px] text-gray-500 uppercase font-semibold">Completion 7D</p>
                <p class="text-xl font-bold text-primary-500 mt-1">{{ hermesTelemetry.telemetry.completionRate7d }}%</p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                <p class="text-[11px] text-gray-500 uppercase font-semibold">Drop-Off Day</p>
                <p class="text-xl font-bold text-rose-500 mt-1">{{ hermesTelemetry.telemetry.dropOffDay }}</p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                <p class="text-[11px] text-gray-500 uppercase font-semibold">Peak Productivity</p>
                <p class="text-xl font-bold text-emerald-500 capitalize mt-1">{{ hermesTelemetry.telemetry.productiveTimeOfDay }}</p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                <p class="text-[11px] text-gray-500 uppercase font-semibold">Burnout Risk</p>
                <p class="text-xl font-bold capitalize mt-1" :class="hermesTelemetry.telemetry.burnoutRisk === 'high' ? 'text-rose-500' : 'text-emerald-500'">
                  {{ hermesTelemetry.telemetry.burnoutRisk }}
                </p>
              </div>
            </div>

            <div v-if="hermesTelemetry?.coachingDirective" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <span class="font-bold block mb-1">Hermes Coaching Directive:</span>
              {{ hermesTelemetry.coachingDirective }}
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- ========================================== -->
    <!-- TAB 4: APP PREFERENCES                     -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'preferences'" class="space-y-6">
      <UCard class="shadow-sm border border-gray-200 dark:border-white/10 rounded-3xl">
        <template #header>
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-volume-2" class="w-5 h-5 text-primary-500" />
              Audio Haptics & Sound Feedback
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Efek suara procedural Web Audio yang memberikan kepuasan sensori saat menyelesaikan kebiasaan.
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">Enable Audio Effects</p>
              <p class="text-xs text-gray-500">Play pleasant micro-tones on click, complete, and streaks.</p>
            </div>
            <USwitch v-model="settings.preferences.soundEffects" />
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
            <p class="text-xs font-semibold text-gray-600 dark:text-gray-300">Uji Coba Suara Prosedural:</p>
            <div class="flex flex-wrap gap-2">
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-play" @click="playSound('tick')">
                Sound 'tick'
              </UButton>
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-play" @click="playSound('success')">
                Sound 'success'
              </UButton>
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-play" @click="playSound('magic')">
                Sound 'magic'
              </UButton>
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-play" @click="playSound('uncheck')">
                Sound 'uncheck'
              </UButton>
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-play" @click="playSound('pop')">
                Sound 'pop'
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
