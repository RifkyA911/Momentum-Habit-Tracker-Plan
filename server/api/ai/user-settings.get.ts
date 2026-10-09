import { getAvailableProviders, getProviderConfigs } from '../../utils/ai'

export default defineEventHandler((event) => {
  const cookieVal = getCookie(event, 'momentum_ai_settings')
  const config = useRuntimeConfig()
  const defaultProvider = config.aiDefaultProvider || process.env.AI_DEFAULT_PROVIDER || '9router'
  const defaultModel = config.aiDefaultModel || process.env.AI_DEFAULT_MODEL || 'llama-3.3-70b-versatile'
  const gatewayUrl = config.aiGatewayUrl || process.env.AI_GATEWAY_URL || 'http://localhost:20128/v1'

  let savedSettings: any = null
  if (cookieVal) {
    try {
      savedSettings = JSON.parse(decodeURIComponent(cookieVal))
    } catch {
      savedSettings = null
    }
  }

  const serverConfigs = getProviderConfigs()

  return {
    defaultProvider: savedSettings?.defaultProvider || defaultProvider,
    defaultModel: savedSettings?.defaultModel || defaultModel,
    providers: savedSettings?.providers || {
      '9router': { baseUrl: gatewayUrl, apiKey: '', model: defaultModel },
      gemini: { apiKey: '', model: 'gemini-2.0-flash' },
      openai: { apiKey: '', model: 'gpt-4o-mini' },
      anthropic: { apiKey: '', model: 'claude-3-5-haiku-20241022' },
      deepseek: { apiKey: '', model: 'deepseek-chat' },
      groq: { apiKey: '', model: 'llama-3.3-70b-versatile' },
      openrouter: { apiKey: '', model: 'meta-llama/llama-3.3-70b-instruct' },
      ollama: { baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' }
    },
    serverConfigured: {
      '9router': serverConfigs['9router'].isConfigured,
      gemini: serverConfigs.gemini.isConfigured,
      openai: serverConfigs.openai.isConfigured,
      anthropic: serverConfigs.anthropic.isConfigured,
      deepseek: serverConfigs.deepseek.isConfigured,
      groq: serverConfigs.groq.isConfigured,
      openrouter: serverConfigs.openrouter.isConfigured,
      ollama: serverConfigs.ollama.isConfigured
    },
    n8n: savedSettings?.n8n || {
      webhookUrl: config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || '',
      webhookSecret: config.n8nWebhookSecret || process.env.N8N_WEBHOOK_SECRET || '',
      enabled: Boolean(config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL)
    },
    hermes: savedSettings?.hermes || {
      apiKey: config.hermesApiKey || process.env.HERMES_API_KEY || '',
      enabled: Boolean(config.hermesApiKey || process.env.HERMES_API_KEY)
    }
  }
})
