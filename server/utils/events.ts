export type MomentumEventType = 
  | 'habit.created'
  | 'habit.updated'
  | 'habit.deleted'
  | 'task.completed'
  | 'task.uncompleted'
  | 'streak.milestone'
  | 'reflection.generated'

export interface MomentumEventPayload {
  event: MomentumEventType
  timestamp: string
  userId: string
  data: Record<string, any>
}

/**
 * Dispatch events asynchronously to n8n or external webhooks
 */
export async function dispatchEventToN8N(
  event: MomentumEventType,
  userId: string,
  data: Record<string, any>
): Promise<void> {
  const config = useRuntimeConfig()
  const webhookUrl = config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL

  if (!webhookUrl) {
    return
  }

  const payload: MomentumEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    userId,
    data
  }

  // Fire-and-forget async webhook to avoid blocking user interactions
  $fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Momentum-Event': event,
      'X-Momentum-Secret': config.n8nWebhookSecret || process.env.N8N_WEBHOOK_SECRET || 'momentum_secret'
    },
    body: payload,
    timeout: 5000
  }).catch((err) => {
    console.warn(`[Webhook] Failed to dispatch ${event} to n8n:`, err?.message || err)
  })
}
