import { eq } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { habitTask, habit } from '../../../db/schema'
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

  const taskId = getRouterParam(event, 'taskId')
  if (!taskId) {
    throw createError({
      statusCode: 400,
      message: 'Task ID is required'
    })
  }

  // Ensure the task belongs to a habit owned by the user
  const taskRow = await db.select({ habitUserId: habit.userId })
    .from(habitTask)
    .innerJoin(habit, eq(habitTask.habitId, habit.id))
    .where(eq(habitTask.id, taskId))
    .limit(1)

  if (!taskRow.length || taskRow[0].habitUserId !== session.user.id) {
    throw createError({
      statusCode: 404,
      message: 'Task not found'
    })
  }

  const method = event.method

  if (method === 'PATCH') {
    const body = await readBody(event)

    const updated = await db.update(habitTask)
      .set({
        ...(body.text !== undefined && { text: body.text }),
        ...(body.completed !== undefined && { 
          completed: body.completed,
          completedAt: body.completed 
            ? (body.completedAt ? new Date(body.completedAt) : new Date()) 
            : null 
        }),
        updatedAt: new Date()
      })
      .where(eq(habitTask.id, taskId))
      .returning()

    return updated[0]
  }

  if (method === 'DELETE') {
    await db.delete(habitTask).where(eq(habitTask.id, taskId))
    return { success: true }
  }
})
