import Groq from 'groq-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!config.groqApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Groq API Key is not configured'
    })
  }

  const groq = new Groq({
    apiKey: config.groqApiKey
  })

  try {
    // Check if this is a behavioral reflection request
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

Total habits: ${habitData.totalHabits}
Total completions: ${habitData.totalCompletions}

Habit completion breakdown:
${habitData.habitStats.map((s: any) => `- ${s.habitTitle}: ${s.completedCount} completions`).join('\n')}

Time of day patterns:
${Object.entries(habitData.timePatterns).map(([time, count]) => `- ${time}: ${count} completions`).join('\n')}

Day of week patterns:
${Object.entries(habitData.dayPatterns).map(([day, count]) => `- ${day}: ${count} completions`).join('\n')}

Provide ONE short, reflective observation about my behavioral patterns based on this data.`

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 200
      })

      return {
        insight: chatCompletion.choices[0]?.message?.content || 'Unable to generate insight at this time.'
      }
    }

    // Default chat behavior
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI habit tracker assistant named Momentum. Give concise, actionable advice on building good habits.'
        },
        {
          role: 'user',
          content: body.message || 'Give me a short tip for staying consistent.'
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 150
    })

    return {
      reply: chatCompletion.choices[0]?.message?.content || 'No response from Groq.'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Something went wrong with Groq'
    })
  }
})
