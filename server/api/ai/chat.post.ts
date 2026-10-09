import { executeAICompletion, getAISettingsFromEvent, type AIProvider } from '../../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const message = body?.message || 'Give me a short tip for staying consistent.'

  const userSettings = getAISettingsFromEvent(event)
  const preferredProvider = (body?.provider || userSettings.preferredProvider) as AIProvider | undefined
  const preferredModel = (body?.model || userSettings.preferredModel) as string | undefined

  try {
    const result = await executeAICompletion({
      messages: [{ role: 'user', content: message }],
      systemPrompt: 'You are Momentum, a calm, emotionally intelligent habit coach. Give concise, practical advice on habit consistency.',
      temperature: 0.7,
      maxTokens: 300,
      preferredProvider,
      preferredModel,
      customOverrides: userSettings.customOverrides
    })

    return {
      reply: result.text.trim(),
      _meta: {
        provider: result.provider,
        model: result.model
      }
    }
  } catch (error: any) {
    console.error('[AI] Chat error:', error)
    throw createError({
      statusCode: 500,
      message: error?.message || 'Failed to process AI chat request'
    })
  }
})
