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

export interface AIExecutionOptions {
  messages: AIMessage[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
  preferredProvider?: AIProvider
  preferredModel?: string
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

interface ProviderConfig {
  provider: AIProvider
  isConfigured: boolean
  baseUrl?: string
  apiKey?: string
  defaultModel: string
}

function getProviderConfigs(): Record<AIProvider, ProviderConfig> {
  const config = useRuntimeConfig()
  const env = process.env

  return {
    '9router': {
      provider: '9router',
      isConfigured: Boolean(config.aiGatewayUrl || env.AI_GATEWAY_URL),
      baseUrl: (config.aiGatewayUrl || env.AI_GATEWAY_URL || 'http://localhost:20128/v1').replace(/\/+$/, ''),
      apiKey: config.aiGatewayKey || env.AI_GATEWAY_KEY || 'sk-9router-local',
      defaultModel: config.aiDefaultModel || env.AI_DEFAULT_MODEL || 'llama-3.3-70b-versatile'
    },
    'gemini': {
      provider: 'gemini',
      isConfigured: Boolean(config.geminiApiKey || env.GEMINI_API_KEY),
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: config.geminiApiKey || env.GEMINI_API_KEY || '',
      defaultModel: 'gemini-2.0-flash'
    },
    'openai': {
      provider: 'openai',
      isConfigured: Boolean(config.openaiApiKey || env.OPENAI_API_KEY),
      baseUrl: 'https://api.openai.com/v1',
      apiKey: config.openaiApiKey || env.OPENAI_API_KEY || '',
      defaultModel: 'gpt-4o-mini'
    },
    'anthropic': {
      provider: 'anthropic',
      isConfigured: Boolean(config.anthropicApiKey || env.ANTHROPIC_API_KEY),
      baseUrl: 'https://api.anthropic.com/v1',
      apiKey: config.anthropicApiKey || env.ANTHROPIC_API_KEY || '',
      defaultModel: 'claude-3-5-haiku-20241022'
    },
    'deepseek': {
      provider: 'deepseek',
      isConfigured: Boolean(config.deepseekApiKey || env.DEEPSEEK_API_KEY),
      baseUrl: 'https://api.deepseek.com',
      apiKey: config.deepseekApiKey || env.DEEPSEEK_API_KEY || '',
      defaultModel: 'deepseek-chat'
    },
    'groq': {
      provider: 'groq',
      isConfigured: Boolean(config.groqApiKey || env.GROQ_API_KEY),
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: config.groqApiKey || env.GROQ_API_KEY || '',
      defaultModel: 'llama-3.3-70b-versatile'
    },
    'openrouter': {
      provider: 'openrouter',
      isConfigured: Boolean(config.openrouterApiKey || env.OPENROUTER_API_KEY),
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: config.openrouterApiKey || env.OPENROUTER_API_KEY || '',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct'
    },
    'ollama': {
      provider: 'ollama',
      isConfigured: Boolean(config.ollamaBaseUrl || env.OLLAMA_BASE_URL),
      baseUrl: (config.ollamaBaseUrl || env.OLLAMA_BASE_URL || 'http://localhost:11434/v1').replace(/\/+$/, ''),
      apiKey: 'ollama',
      defaultModel: 'llama3.2'
    }
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

  // 9Router & OpenRouter extra telemetry headers
  if (provider.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://momentum-habits.app'
    headers['X-Title'] = 'Momentum Habit Tracker'
  }

  const response = await $fetch<any>(url, {
    method: 'POST',
    headers,
    body: payload,
    timeout: 30000
  })

  const text = response?.choices?.[0]?.message?.content || ''
  
  return {
    text: typeof text === 'string' ? text : JSON.stringify(text),
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
 * Native Anthropic Claude caller
 */
async function callAnthropic(
  provider: ProviderConfig,
  model: string,
  messages: AIMessage[],
  options: AIExecutionOptions
): Promise<AIExecutionResult> {
  const url = `${provider.baseUrl}/messages`

  // Anthropic requires system prompt outside of the messages array
  const systemPrompt = options.systemPrompt || 
    messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n')

  const userAssistantMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

  const payload: Record<string, any> = {
    model,
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.7,
    messages: userAssistantMessages
  }

  if (systemPrompt) {
    payload.system = systemPrompt
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
  const configs = getProviderConfigs()
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
      message: 'No AI providers are configured. Please set AI_GATEWAY_URL, GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_API_KEY, or GROQ_API_KEY in .env.'
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
      console.warn(`[AI Gateway] Provider ${providerKey} (${modelToUse}) failed: ${err.message}. Trying next fallback...`)
      lastError = err
    }
  }

  throw createError({
    statusCode: 502,
    message: `All configured AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
  })
}

/**
 * Safely parse JSON from LLM output (removes markdown backticks if present)
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
export function getAvailableProviders() {
  const configs = getProviderConfigs()
  return Object.values(configs).map(c => ({
    provider: c.provider,
    isConfigured: c.isConfigured,
    defaultModel: c.defaultModel,
    baseUrl: c.baseUrl ? c.baseUrl.replace(/:[0-9]+/, '') : undefined
  }))
}
