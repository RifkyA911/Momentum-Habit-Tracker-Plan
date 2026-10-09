import { executeAICompletion, extractJSONFromAIResponse, type AIProvider } from '../../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const prompt = body?.prompt

  if (!prompt || typeof prompt !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Prompt is required'
    })
  }

  const systemPrompt = `You are an AI that generates habit tracking templates. The user will give you a goal or topic. You must respond with ONLY a valid JSON object, no markdown formatting, no explanations. 
Format:
{
  "title": "Short catchy title (max 3 words)",
  "icon": "One single relevant emoji",
  "color": "A vibrant hex color code (e.g. #3b82f6)",
  "description": "Short motivational description",
  "tasks": ["Task 1", "Task 2", "Task 3"]
}
Limit tasks to 3-5 specific, actionable items.`

  try {
    const result = await executeAICompletion({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
      jsonMode: true,
      preferredProvider: body?.provider as AIProvider | undefined,
      preferredModel: body?.model as string | undefined
    })

    const parsed = extractJSONFromAIResponse<{
      title: string
      icon: string
      color: string
      description: string
      tasks: string[]
    }>(result.text)

    // Ensure fallback fields exist
    return {
      title: parsed.title || 'New Habit',
      icon: parsed.icon || '🎯',
      color: parsed.color || '#3b82f6',
      description: parsed.description || '',
      tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : ['Daily Practice'],
      _meta: {
        provider: result.provider,
        model: result.model
      }
    }
  } catch (error: any) {
    console.error('[AI] Habit generation error:', error)
    throw createError({
      statusCode: 500,
      message: error?.message || 'Failed to generate habit template'
    })
  }
})
