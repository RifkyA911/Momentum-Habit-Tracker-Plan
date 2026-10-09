import { executeAICompletion, type AIProvider } from '../../utils/ai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const provider = (body.provider || '9router') as AIProvider
  const apiKey = body.apiKey as string | undefined
  const baseUrl = body.baseUrl as string | undefined
  const model = body.model as string | undefined

  const startTime = Date.now()

  try {
    const result = await executeAICompletion({
      messages: [{ role: 'user', content: 'Say "CONNECTED" in one word.' }],
      preferredProvider: provider,
      preferredModel: model,
      maxTokens: 10,
      temperature: 0.1,
      customOverrides: {
        [provider]: { apiKey, baseUrl, model }
      }
    })

    const latencyMs = Date.now() - startTime

    return {
      success: true,
      provider: result.provider,
      model: result.model,
      text: result.text.trim(),
      latencyMs
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime
    return {
      success: false,
      provider,
      error: err.data?.message || err.message || 'Connection test failed',
      latencyMs
    }
  }
})
