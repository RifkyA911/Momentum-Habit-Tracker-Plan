import type { H3Event } from 'h3'

export type AIProvider = 
  | '9router' 
  | 'gemini' 
  | 'openai' 
  | 'anthropic' 
  | 'deepseek' 
  | 'groq' 
  | 'openrouter' 
  | 'ollama'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ProviderOverride {
  apiKey?: string
  baseUrl?: string
  model?: string
}

export interface AIExecutionOptions {
  messages: AIMessage[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
  preferredProvider?: AIProvider
  preferredModel?: string
  customOverrides?: Partial<Record<AIProvider, ProviderOverride>>
}

export interface AIExecutionResult {
  text: string
  provider: string
  model: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export interface ProviderConfig {
  provider: AIProvider
  isConfigured: boolean
  baseUrl?: string
  apiKey?: string
  defaultModel: string
}

export function getProviderConfigs(customOverrides?: Partial<Record<AIProvider, ProviderOverride>>): Record<AIProvider, ProviderConfig> {
  const config = useRuntimeConfig()
  const env = process.env

  const routerOverride = customOverrides?.['9router']
  const geminiOverride = customOverrides?.gemini
  const openaiOverride = customOverrides?.openai
  const anthropicOverride = customOverrides?.anthropic
  const deepseekOverride = customOverrides?.deepseek
  const groqOverride = customOverrides?.groq
  const openrouterOverride = customOverrides?.openrouter
  const ollamaOverride = customOverrides?.ollama

  return {
    '9router': {
      provider: '9router',
      isConfigured: Boolean(routerOverride?.apiKey || routerOverride?.baseUrl || config.aiGatewayUrl || env.AI_GATEWAY_URL),
      baseUrl: (routerOverride?.baseUrl || config.aiGatewayUrl || env.AI_GATEWAY_URL || 'http://localhost:20128/v1').replace(/\/+$/, ''),
      apiKey: routerOverride?.apiKey || config.aiGatewayKey || env.AI_GATEWAY_KEY || 'sk-9router-local',
      defaultModel: routerOverride?.model || config.aiDefaultModel || env.AI_DEFAULT_MODEL || 'llama-3.3-70b-versatile'
    },
    'gemini': {
      provider: 'gemini',
      isConfigured: Boolean(geminiOverride?.apiKey || config.geminiApiKey || env.GEMINI_API_KEY),
      baseUrl: (geminiOverride?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai').replace(/\/+$/, ''),
      apiKey: geminiOverride?.apiKey || config.geminiApiKey || env.GEMINI_API_KEY || '',
      defaultModel: geminiOverride?.model || 'gemini-2.0-flash'
    },
    'openai': {
      provider: 'openai',
      isConfigured: Boolean(openaiOverride?.apiKey || config.openaiApiKey || env.OPENAI_API_KEY),
      baseUrl: (openaiOverride?.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, ''),
      apiKey: openaiOverride?.apiKey || config.openaiApiKey || env.OPENAI_API_KEY || '',
      defaultModel: openaiOverride?.model || 'gpt-4o-mini'
    },
    'anthropic': {
      provider: 'anthropic',
      isConfigured: Boolean(anthropicOverride?.apiKey || config.anthropicApiKey || env.ANTHROPIC_API_KEY),
      baseUrl: (anthropicOverride?.baseUrl || 'https://api.anthropic.com/v1').replace(/\/+$/, ''),
      apiKey: anthropicOverride?.apiKey || config.anthropicApiKey || env.ANTHROPIC_API_KEY || '',
      defaultModel: anthropicOverride?.model || 'claude-3-5-haiku-20241022'
    },
    'deepseek': {
      provider: 'deepseek',
      isConfigured: Boolean(deepseekOverride?.apiKey || config.deepseekApiKey || env.DEEPSEEK_API_KEY),
      baseUrl: (deepseekOverride?.baseUrl || 'https://api.deepseek.com').replace(/\/+$/, ''),
      apiKey: deepseekOverride?.apiKey || config.deepseekApiKey || env.DEEPSEEK_API_KEY || '',
      defaultModel: deepseekOverride?.model || 'deepseek-chat'
    },
    'groq': {
      provider: 'groq',
      isConfigured: Boolean(groqOverride?.apiKey || config.groqApiKey || env.GROQ_API_KEY),
      baseUrl: (groqOverride?.baseUrl || 'https://api.groq.com/openai/v1').replace(/\/+$/, ''),
      apiKey: groqOverride?.apiKey || config.groqApiKey || env.GROQ_API_KEY || '',
      defaultModel: groqOverride?.model || 'llama-3.3-70b-versatile'
    },
    'openrouter': {
      provider: 'openrouter',
      isConfigured: Boolean(openrouterOverride?.apiKey || config.openrouterApiKey || env.OPENROUTER_API_KEY),
      baseUrl: (openrouterOverride?.baseUrl || 'https://openrouter.ai/api/v1').replace(/\/+$/, ''),
      apiKey: openrouterOverride?.apiKey || config.openrouterApiKey || env.OPENROUTER_API_KEY || '',
      defaultModel: openrouterOverride?.model || 'meta-llama/llama-3.3-70b-instruct'
    },
    'ollama': {
      provider: 'ollama',
      isConfigured: Boolean(ollamaOverride?.baseUrl || config.ollamaBaseUrl || env.OLLAMA_BASE_URL),
      baseUrl: (ollamaOverride?.baseUrl || config.ollamaBaseUrl || env.OLLAMA_BASE_URL || 'http://localhost:11434/v1').replace(/\/+$/, ''),
      apiKey: ollamaOverride?.apiKey || 'ollama',
      defaultModel: ollamaOverride?.model || 'llama3.2'
    }
  }
}

/**
 * Parses user AI preferences and keys stored in cookie or headers
 */
export function getAISettingsFromEvent(event: H3Event): {
  preferredProvider?: AIProvider
  preferredModel?: string
  customOverrides?: Partial<Record<AIProvider, ProviderOverride>>
} {
  const cookieVal = getCookie(event, 'momentum_ai_settings')
  if (!cookieVal) return {}

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieVal))
    const overrides: Partial<Record<AIProvider, ProviderOverride>> = {}

    if (parsed.providers) {
      for (const [key, val] of Object.entries(parsed.providers)) {
        const item = val as any
        if (item && (item.apiKey || item.baseUrl || item.model)) {
          overrides[key as AIProvider] = {
            apiKey: item.apiKey,
            baseUrl: item.baseUrl,
            model: item.model
          }
        }
      }
    }

    return {
      preferredProvider: parsed.defaultProvider as AIProvider,
      preferredModel: parsed.defaultModel,
      customOverrides: overrides
    }
  } catch {
    return {}
  }
}

/**
 * Universal OpenAI-compatible chat completion caller
 */
async function callOpenAICompatible(
  provider: ProviderConfig,
  model: string,
  messages: AIMessage[],
  options: AIExecutionOptions
): Promise<AIExecutionResult> {
  const url = `${provider.baseUrl}/chat/completions`

  const payload: Record<string, any> = {
    model,
    messages: options.systemPrompt 
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 800
  }

  if (options.jsonMode) {
    payload.response_format = { type: 'json_object' }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (provider.apiKey) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`
  }

  // OpenRouter required referral headers
  if (provider.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://momentum.app'
    headers['X-Title'] = 'Momentum Habit Tracker'
  }

  const response = await $fetch<any>(url, {
    method: 'POST',
    headers,
    body: payload,
    timeout: 35000
  })

  const text = response?.choices?.[0]?.message?.content || ''
  
  return {
    text,
    provider: provider.provider,
    model: response?.model || model,
    usage: {
      promptTokens: response?.usage?.prompt_tokens,
      completionTokens: response?.usage?.completion_tokens,
      totalTokens: response?.usage?.total_tokens
    }
  }
}

/**
 * Anthropic Messages API caller
 */
async function callAnthropic(
  provider: ProviderConfig,
  model: string,
  messages: AIMessage[],
  options: AIExecutionOptions
): Promise<AIExecutionResult> {
  const url = `${provider.baseUrl}/messages`

  const systemMessage = options.systemPrompt || ''
  const anthropicMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))

  const payload: Record<string, any> = {
    model,
    messages: anthropicMessages,
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.7
  }

  if (systemMessage) {
    payload.system = systemMessage
  }

  const response = await $fetch<any>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey || '',
      'anthropic-version': '2023-06-01'
    },
    body: payload,
    timeout: 35000
  })

  const textBlock = response?.content?.find((c: any) => c.type === 'text')
  const text = textBlock?.text || ''

  return {
    text,
    provider: 'anthropic',
    model: response?.model || model,
    usage: {
      promptTokens: response?.usage?.input_tokens,
      completionTokens: response?.usage?.output_tokens,
      totalTokens: (response?.usage?.input_tokens || 0) + (response?.usage?.output_tokens || 0)
    }
  }
}

/**
 * Executes an AI completion with automatic multi-tier fallback
 */
export async function executeAICompletion(options: AIExecutionOptions): Promise<AIExecutionResult> {
  const configs = getProviderConfigs(options.customOverrides)
  const config = useRuntimeConfig()
  const defaultProvider = (config.aiDefaultProvider || process.env.AI_DEFAULT_PROVIDER || '9router') as AIProvider

  // Candidate providers ordered by preference
  const prioritizedProviders: AIProvider[] = []

  if (options.preferredProvider && configs[options.preferredProvider]?.isConfigured) {
    prioritizedProviders.push(options.preferredProvider)
  }

  if (configs[defaultProvider]?.isConfigured && !prioritizedProviders.includes(defaultProvider)) {
    prioritizedProviders.push(defaultProvider)
  }

  // Fallback chain across other configured providers
  const standardPriority: AIProvider[] = [
    '9router',
    'gemini',
    'openai',
    'anthropic',
    'deepseek',
    'groq',
    'openrouter',
    'ollama'
  ]

  for (const p of standardPriority) {
    if (configs[p]?.isConfigured && !prioritizedProviders.includes(p)) {
      prioritizedProviders.push(p)
    }
  }

  if (prioritizedProviders.length === 0) {
    throw createError({
      statusCode: 500,
      message: 'No AI providers are configured. Please enter your API Key or 9Router Gateway URL in Settings or .env.'
    })
  }

  let lastError: any = null

  for (const providerKey of prioritizedProviders) {
    const prov = configs[providerKey]
    const modelToUse = (providerKey === options.preferredProvider && options.preferredModel)
      ? options.preferredModel
      : (options.preferredModel || prov.defaultModel)

    try {
      if (providerKey === 'anthropic') {
        return await callAnthropic(prov, modelToUse, options.messages, options)
      } else {
        return await callOpenAICompatible(prov, modelToUse, options.messages, options)
      }
    } catch (err: any) {
      console.warn(`[AI Engine] Provider '${providerKey}' failed: ${err.message || err}. Cascading to next fallback...`)
      lastError = err
    }
  }

  throw createError({
    statusCode: 502,
    message: `All AI providers failed. Last error from ${lastError?.name || 'unknown'}: ${lastError?.message || lastError}`
  })
}

/**
 * Robust JSON extraction from LLM response
 */
export function extractJSONFromAIResponse<T = any>(rawText: string): T {
  let cleaned = rawText.trim()

  // Remove markdown code fences ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  }

  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Attempt to extract innermost JSON object {...}
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0]) as T
    }
    throw new Error(`Failed to parse AI output into valid JSON: ${cleaned.slice(0, 100)}...`)
  }
}

/**
 * Returns summary of all supported and currently configured providers
 */
export function getAvailableProviders(customOverrides?: Partial<Record<AIProvider, ProviderOverride>>) {
  const configs = getProviderConfigs(customOverrides)
  return Object.values(configs).map(c => ({
    provider: c.provider,
    isConfigured: c.isConfigured,
    defaultModel: c.defaultModel,
    baseUrl: c.baseUrl
  }))
}
