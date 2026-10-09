import { eq, and, sql, inArray } from 'drizzle-orm'
import { db } from '../../utils/db'
import { habit, habitTask, habitTaskCompletion, user } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedSecret = config.n8nWebhookSecret || process.env.N8N_WEBHOOK_SECRET

  // Validate authorization
  const receivedSecret = getHeader(event, 'x-momentum-secret') || getHeader(event, 'x-api-key') || getQuery(event).secret

  if (expectedSecret && receivedSecret !== expectedSecret) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid n8n webhook secret'
    })
  }

  const body = await readBody(event)
  const action = body?.action || 'get_today_summary'
  let targetUserId = body?.userId

  // If no userId supplied, fallback to first user or authorized user
  if (!targetUserId) {
    const defaultUser = await db.select().from(user).limit(1)
    if (!defaultUser.length) {
      throw createError({ statusCode: 404, message: 'No registered user found in system' })
    }
    targetUserId = defaultUser[0]!.id
  }

  const today = new Date().toISOString().split('T')[0]!

  switch (action) {
    case 'get_today_summary': {
      const habits = await db.select().from(habit).where(eq(habit.userId, targetUserId))
      const habitIds = habits.map(h => h.id)
      
      const tasks = habitIds.length > 0 
        ? await db.select().from(habitTask).where(inArray(habitTask.habitId, habitIds))
        : []

      const completions = await db.select()
        .from(habitTaskCompletion)
        .where(
          and(
            eq(habitTaskCompletion.userId, targetUserId),
            eq(habitTaskCompletion.date, today)
          )
        )

      const completedTaskIds = new Set(completions.map(c => c.taskId))

      const habitSummaries = habits.map(h => {
        const hTasks = tasks.filter(t => t.habitId === h.id)
        const completedCount = hTasks.filter(t => completedTaskIds.has(t.id)).length
        return {
          id: h.id,
          title: h.title,
          icon: h.icon,
          totalTasks: hTasks.length,
          completedTasks: completedCount,
          isFullyCompleted: hTasks.length > 0 && completedCount === hTasks.length,
          tasks: hTasks.map(t => ({
            id: t.id,
            text: t.text,
            completed: completedTaskIds.has(t.id)
          }))
        }
      })

      return {
        date: today,
        totalHabits: habits.length,
        totalTasks: tasks.length,
        completedTasksToday: completions.length,
        habits: habitSummaries
      }
    }

    case 'complete_task': {
      const { taskId, taskName } = body
      let resolvedTaskId = taskId

      // Search by task text if taskId is not directly provided
      if (!resolvedTaskId && taskName) {
        const habits = await db.select().from(habit).where(eq(habit.userId, targetUserId))
        const habitIds = habits.map(h => h.id)
        if (habitIds.length > 0) {
          const matchingTasks = await db.select()
            .from(habitTask)
            .where(
              and(
                inArray(habitTask.habitId, habitIds),
                sql`LOWER(${habitTask.text}) LIKE LOWER(${`%${taskName}%`})`
              )
            )
            .limit(1)

          if (matchingTasks.length > 0) {
            resolvedTaskId = matchingTasks[0]!.id
          }
        }
      }

      if (!resolvedTaskId) {
        throw createError({ statusCode: 400, message: 'taskId or matching taskName required' })
      }

      // Check if already completed today
      const existing = await db.select()
        .from(habitTaskCompletion)
        .where(
          and(
            eq(habitTaskCompletion.taskId, resolvedTaskId),
            eq(habitTaskCompletion.userId, targetUserId),
            eq(habitTaskCompletion.date, today)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        return { success: true, message: 'Task was already completed today', completed: true }
      }

      await db.insert(habitTaskCompletion).values({
        id: crypto.randomUUID(),
        taskId: resolvedTaskId,
        userId: targetUserId,
        date: today,
        completedAt: new Date()
      })

      // Dispatch event to n8n outbound
      await dispatchEventToN8N('task.completed', targetUserId, { taskId: resolvedTaskId, date: today, source: 'n8n_inbound' })

      return { success: true, message: 'Task marked as completed', taskId: resolvedTaskId, date: today }
    }

    case 'create_habit': {
      const { title, icon, color, description, tasks } = body
      if (!title) {
        throw createError({ statusCode: 400, message: 'title is required' })
      }

      const habitId = crypto.randomUUID()
      await db.insert(habit).values({
        id: habitId,
        userId: targetUserId,
        title,
        icon: icon || '🎯',
        color: color || '#3b82f6',
        description: description || null
      })

      if (Array.isArray(tasks) && tasks.length > 0) {
        await db.insert(habitTask).values(
          tasks.map((t: string, idx: number) => ({
            id: crypto.randomUUID(),
            habitId,
            text: t,
            orderIndex: idx
          }))
        )
      }

      await dispatchEventToN8N('habit.created', targetUserId, { habitId, title, source: 'n8n_inbound' })

      return { success: true, habitId, title }
    }

    default:
      throw createError({ statusCode: 400, message: `Unknown action: ${action}` })
  }
})
