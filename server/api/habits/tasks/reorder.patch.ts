import { db } from '../../../utils/db'
import { habitTask } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers
  })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const { tasks } = body // Expecting array of { id: string, orderIndex: number }

  if (!Array.isArray(tasks)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  // Update order for each task
  // Since drizzle doesn't easily support bulk update with different values per row, we can run them in a loop or transaction
  await db.transaction(async (tx) => {
    for (const task of tasks) {
      await tx.update(habitTask)
        .set({ orderIndex: task.orderIndex })
        .where(eq(habitTask.id, task.id))
    }
  })

  return { success: true }
})
