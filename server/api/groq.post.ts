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
      model: 'llama3-8b-8192',
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
