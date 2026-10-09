// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  runtimeConfig: {
    // Legacy Groq compatibility
    groqApiKey: process.env.GROQ_API_KEY,

    // AI Engine & Gateway (9Router, OpenRouter, Direct Providers)
    aiGatewayUrl: process.env.AI_GATEWAY_URL, // e.g. http://localhost:20128/v1 for 9Router
    aiGatewayKey: process.env.AI_GATEWAY_KEY,
    aiDefaultProvider: process.env.AI_DEFAULT_PROVIDER, // '9router' | 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'openrouter' | 'ollama'
    aiDefaultModel: process.env.AI_DEFAULT_MODEL,

    // Individual Provider Keys
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL,

    // Automation & Agent Integrations (n8n & Hermes)
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
    n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET,
    hermesApiKey: process.env.HERMES_API_KEY,

    // Auth & Database
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    public: {
      authorizedUserId: process.env.AUTHORIZED_USER_ID,
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
