import { eq, and } from 'drizzle-orm'
import { db } from '../../utils/db'
import { habit } from '../../db/schema'
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

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Habit ID is required'
    })
  }

  const method = event.method

  if (method === 'PATCH') {
    const body = await readBody(event)

    const updated = await db.update(habit)
      .set({
        ...(body.title !== undefined && { title: body.title }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.description !== undefined && { description: body.description }),
        updatedAt: new Date()
      })
      .where(and(eq(habit.id, id), eq(habit.userId, session.user.id)))
      .returning()

    if (!updated.length) {
      throw createError({
        statusCode: 404,
        message: 'Habit not found'
      })
    }

    return updated[0]
  }

  if (method === 'DELETE') {
    const deleted = await db.delete(habit)
      .where(and(eq(habit.id, id), eq(habit.userId, session.user.id)))
      .returning()

    if (!deleted.length) {
      throw createError({
        statusCode: 404,
        message: 'Habit not found'
      })
    }

    return { success: true }
  }
})
