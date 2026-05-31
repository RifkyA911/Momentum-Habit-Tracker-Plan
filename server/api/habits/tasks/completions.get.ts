import { eq, and, desc } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { habitTaskCompletion, habitTask } from '../../../db/schema'
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

  // Get all completions with task info
  const completions = await db.select({
    id: habitTaskCompletion.id,
    taskId: habitTaskCompletion.taskId,
    userId: habitTaskCompletion.userId,
    date: habitTaskCompletion.date,
    completedAt: habitTaskCompletion.completedAt,
    habitId: habitTask.habitId
  })
    .from(habitTaskCompletion)
    .innerJoin(habitTask, eq(habitTaskCompletion.taskId, habitTask.id))
    .where(eq(habitTaskCompletion.userId, session.user.id!))
    .orderBy(desc(habitTaskCompletion.completedAt))

  return completions
})
