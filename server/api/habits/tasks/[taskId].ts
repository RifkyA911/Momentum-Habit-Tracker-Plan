import { eq, and } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { habitTask, habit, habitTaskCompletion } from '../../../db/schema'
import { auth } from '../../../utils/auth'
import { nanoid } from 'nanoid'

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

  if (!taskRow?.length || taskRow[0]?.habitUserId !== session.user.id) {
    throw createError({
      statusCode: 404,
      message: 'Task not found'
    })
  }

  const method = event.method

  if (method === 'PATCH') {
    const body = await readBody(event)

    // Update task text if provided
    if (body.text !== undefined) {
      const updated = await db.update(habitTask)
        .set({ text: body.text })
        .where(eq(habitTask.id, taskId))
        .returning()
      return updated[0]
    }

    // Handle completion status
    if (body.completed !== undefined) {
      const date = body.date || new Date().toISOString().split('T')[0]!
      
      if (body.completed) {
        // Insert completion record for the specified date
        await db.insert(habitTaskCompletion).values({
          id: nanoid(),
          taskId,
          userId: session.user.id,
          date: date,
          completedAt: new Date()
        } as any)
      } else {
        // Delete completion record for the specified date
        await db.delete(habitTaskCompletion)
          .where(and(
            eq(habitTaskCompletion.taskId, taskId),
            eq(habitTaskCompletion.userId, session.user.id!),
            eq(habitTaskCompletion.date, date)
          ))
      }
      
      // Return the task with completion status
      const task = await db.select().from(habitTask).where(eq(habitTask.id, taskId)).limit(1)
      return task[0]
    }

    return { success: true }
  }

  if (method === 'DELETE') {
    await db.delete(habitTask).where(eq(habitTask.id, taskId))
    return { success: true }
  }
})
