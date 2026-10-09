import { executeAICompletion, extractJSONFromAIResponse } from '../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // 1. Behavioral reflection request
    if (body.type === 'reflection' && body.habitData) {
      const { habitData } = body

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

      const result = await executeAICompletion({
        messages: [{ role: 'user', content: userPrompt }],
        systemPrompt,
        temperature: 0.7,
        maxTokens: 250,
        preferredProvider: body.provider,
        preferredModel: body.model
      })

      return {
        insight: result.text.trim() || 'You are consistently showing up for your habits.',
        _meta: { provider: result.provider, model: result.model }
      }
    }

    // 2. Habit template generation
    if (body.type === 'generate-habit' && body.prompt) {
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

      const result = await executeAICompletion({
        messages: [{ role: 'user', content: body.prompt }],
        systemPrompt,
        temperature: 0.7,
        maxTokens: 500,
        jsonMode: true,
        preferredProvider: body.provider,
        preferredModel: body.model
      })

      return extractJSONFromAIResponse(result.text)
    }

    // 3. Default chat / tip behavior
    const result = await executeAICompletion({
      messages: [{
        role: 'user',
        content: body.message || 'Give me a short tip for staying consistent.'
      }],
      systemPrompt: 'You are an AI habit tracker assistant named Momentum. Give concise, actionable advice on building good habits.',
      temperature: 0.7,
      maxTokens: 200,
      preferredProvider: body.provider,
      preferredModel: body.model
    })

    return {
      reply: result.text.trim() || 'Stay consistent and focus on progress over perfection.',
      _meta: { provider: result.provider, model: result.model }
    }
  } catch (error: any) {
    console.error('[AI] Unified API handler error:', error)
    throw createError({
      statusCode: 500,
      message: error?.message || 'Something went wrong with the AI service'
    })
  }
})
