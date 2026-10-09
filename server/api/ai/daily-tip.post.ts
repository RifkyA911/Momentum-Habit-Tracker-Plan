import { executeAICompletion, getAISettingsFromEvent, type AIProvider } from '../../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const completedToday = body?.completedCount ?? 0

  const userSettings = getAISettingsFromEvent(event)
  const preferredProvider = (body?.provider || userSettings.preferredProvider) as AIProvider | undefined
  const preferredModel = (body?.model || userSettings.preferredModel) as string | undefined

  const systemPrompt = `You are Momentum's intelligent habit coach. Give concise, actionable, and emotionally grounded advice on building sustainable habits. Maximum 2 sentences. No generic cliches or hashtags.`
  const userPrompt = `I have completed ${completedToday} habit tasks today. Give me ONE short, punchy, and engaging daily motivational tip based on this exact number. Be specific.`

  try {
    const result = await executeAICompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 160,
      preferredProvider,
      preferredModel,
      customOverrides: userSettings.customOverrides
    })

    return {
      tip: result.text.trim() || 'Every small action compounds into identity change.',
      _meta: {
        provider: result.provider,
        model: result.model
      }
    }
  } catch (error: any) {
    console.error('[AI] Daily tip error:', error)
    throw createError({
      statusCode: 500,
      message: error?.message || 'Failed to generate daily tip'
    })
  }
})
