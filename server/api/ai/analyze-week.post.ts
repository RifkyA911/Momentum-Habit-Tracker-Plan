import { executeAICompletion, extractJSONFromAIResponse, type AIProvider } from '../../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const habitsSummary = body?.habitsSummary || []
  const weekStats = body?.weekStats || {}

  const systemPrompt = `You are Momentum's behavioral scientist. You analyze weekly habit patterns and detect meaningful behavioral signals.
Respond ONLY with a JSON object:
{
  "title": "Short title of the pattern (e.g. Evening Momentum Spike, Weekend Consistency Gap)",
  "description": "1-2 sentences explaining the detected pattern with actionable micro-advice."
}`

  const userPrompt = `Weekly Habit Data:
Active Habits: ${JSON.stringify(habitsSummary)}
Weekly Completion Patterns: ${JSON.stringify(weekStats)}

Identify the single most insightful behavioral pattern for this week.`

  try {
    const result = await executeAICompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.6,
      maxTokens: 250,
      jsonMode: true,
      preferredProvider: body?.provider as AIProvider | undefined,
      preferredModel: body?.model as string | undefined
    })

    const parsed = extractJSONFromAIResponse<{ title: string; description: string }>(result.text)

    return {
      title: parsed.title || 'Weekly Pattern Detected',
      description: parsed.description || 'Your consistency is stabilizing across your core habits.',
      _meta: {
        provider: result.provider,
        model: result.model
      }
    }
  } catch (error: any) {
    console.error('[AI] Weekly analysis error:', error)
    // Intelligent graceful fallback observation
    return {
      title: 'Consistency Pattern',
      description: 'You complete more habits on weekdays than weekends. Keep your micro-commitments realistic during busy periods.',
      _meta: { provider: 'fallback', model: 'deterministic' }
    }
  }
})
