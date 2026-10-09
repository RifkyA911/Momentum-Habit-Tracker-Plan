import { executeAICompletion, getAISettingsFromEvent, type AIProvider } from '../../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const habitData = body?.habitData

  if (!habitData) {
    throw createError({
      statusCode: 400,
      message: 'habitData is required for behavioral reflection'
    })
  }

  const userSettings = getAISettingsFromEvent(event)
  const preferredProvider = (body?.provider || userSettings.preferredProvider) as AIProvider | undefined
  const preferredModel = (body?.model || userSettings.preferredModel) as string | undefined

  const systemPrompt = `You are Momentum, a calm, premium, and emotionally intelligent behavioral reflection system. Your role is to observe user patterns and provide data-backed insights without being motivational or preachy.

Core principles:
- Be calm, reflective, and analytical
- Focus on data-driven observations
- Avoid gamification, hustle culture, or empty motivational quotes
- Keep insights concise (1-2 sentences maximum)
- Be supportive but objective

Analyze the user's habit completion data and provide ONE short, reflective observation about their behavioral patterns. The insight should be factual, specific to their data, and emotionally intelligent.`

  const userPrompt = `Here is my habit data from the last 30 days:

Total habits: ${habitData.totalHabits ?? 0}
Total completions: ${habitData.totalCompletions ?? 0}

Habit completion breakdown:
${Array.isArray(habitData.habitStats) ? habitData.habitStats.map((s: any) => `- ${s.habitTitle}: ${s.completedCount} completions`).join('\n') : 'N/A'}

Time of day patterns:
${habitData.timePatterns ? Object.entries(habitData.timePatterns).map(([time, count]) => `- ${time}: ${count} completions`).join('\n') : 'N/A'}

Day of week patterns:
${habitData.dayPatterns ? Object.entries(habitData.dayPatterns).map(([day, count]) => `- ${day}: ${count} completions`).join('\n') : 'N/A'}

Provide ONE short, reflective observation about my behavioral patterns based on this data.`

  try {
    const result = await executeAICompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 250,
      preferredProvider,
      preferredModel,
      customOverrides: userSettings.customOverrides
    })

    return {
      insight: result.text.trim() || 'You are consistently showing up for your habits.',
      _meta: {
        provider: result.provider,
        model: result.model
      }
    }
  } catch (error: any) {
    console.error('[AI] Reflection generation error:', error)
    throw createError({
      statusCode: 500,
      message: error?.message || 'Failed to generate behavioral reflection'
    })
  }
})
