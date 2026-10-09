export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const config = useRuntimeConfig()
  const targetUrl = body.webhookUrl || config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL
  const secret = body.webhookSecret || config.n8nWebhookSecret || process.env.N8N_WEBHOOK_SECRET

  if (!targetUrl) {
    return {
      success: false,
      error: 'n8n Webhook URL is not configured. Please enter a URL first.'
    }
  }

  const startTime = Date.now()

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (secret) {
      headers['X-Momentum-Secret'] = secret
    }

    const res = await $fetch.raw(targetUrl, {
      method: 'POST',
      headers,
      body: {
        event: 'momentum.ping',
        source: 'Momentum Settings UI',
        timestamp: new Date().toISOString(),
        payload: {
          test: true,
          message: 'Webhook connectivity test successful from Momentum!'
        }
      },
      timeout: 8000
    })

    const latencyMs = Date.now() - startTime

    return {
      success: true,
      status: res.status,
      latencyMs,
      message: 'Successfully reached n8n Webhook!'
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime
    return {
      success: false,
      status: err.status || 500,
      latencyMs,
      error: err.data?.message || err.message || 'Failed to connect to n8n Webhook'
    }
  }
})
