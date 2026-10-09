import { getAvailableProviders } from '../../utils/ai'

export default defineEventHandler(() => {
  const providers = getAvailableProviders()
  const config = useRuntimeConfig()
  
  return {
    defaultProvider: config.aiDefaultProvider || process.env.AI_DEFAULT_PROVIDER || '9router',
    defaultModel: config.aiDefaultModel || process.env.AI_DEFAULT_MODEL || 'llama-3.3-70b-versatile',
    gatewayUrl: config.aiGatewayUrl || process.env.AI_GATEWAY_URL || 'http://localhost:20128/v1',
    providers
  }
})
