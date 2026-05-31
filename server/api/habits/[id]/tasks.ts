import { eq, desc, asc, and } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { habitTask, habitTaskCompletion } from '../../../db/schema'
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
    const today = new Date().toISOString().split('T')[0]!
    
    const tasks = await db.select()
      .from(habitTask)
      .where(eq(habitTask.habitId, habitId))
      .orderBy(asc(habitTask.orderIndex), desc(habitTask.createdAt))
    
    // Get completion status for today
    const taskIds = tasks.map(t => t.id)
    const completions = await db.select()
      .from(habitTaskCompletion)
      .where(and(
        eq(habitTaskCompletion.userId, session.user.id!),
        eq(habitTaskCompletion.date, today)
      ))
    
    const completionMap = new Map(completions.map(c => [c.taskId, c]))
    
    // Add completion status to each task
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      completed: completionMap.has(task.id),
      completedAt: completionMap.get(task.id)?.completedAt || null
    }))
    
    return tasksWithStatus
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
