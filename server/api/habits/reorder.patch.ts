import { db } from '../../utils/db'
import { habit } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '../../utils/auth'

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
  const { habits } = body // Expecting array of { id: string, orderIndex: number }

  if (!Array.isArray(habits)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  await db.transaction(async (tx) => {
    for (const h of habits) {
      await tx.update(habit)
        .set({ orderIndex: h.orderIndex })
        .where(eq(habit.id, h.id))
    }
  })

  return { success: true }
})
