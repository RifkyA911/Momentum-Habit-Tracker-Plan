import { eq, desc, asc } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { habitTask } from '../../../db/schema'
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

  const habitId = getRouterParam(event, 'id')
  if (!habitId) {
    throw createError({
      statusCode: 400,
      message: 'Habit ID is required'
    })
  }

  const method = event.method

  if (method === 'GET') {
    const tasks = await db.select()
      .from(habitTask)
      .where(eq(habitTask.habitId, habitId))
      .orderBy(asc(habitTask.orderIndex), desc(habitTask.createdAt))
    
    return tasks
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.text) {
      throw createError({
        statusCode: 400,
        message: 'Text is required'
      })
    }

    const newTask = await db.insert(habitTask).values({
      id: crypto.randomUUID(),
      habitId,
      text: body.text
    }).returning()

    return newTask[0]
  }
})
