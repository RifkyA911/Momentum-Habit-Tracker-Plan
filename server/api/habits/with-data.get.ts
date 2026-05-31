import { eq, and, desc, sql, inArray } from 'drizzle-orm'
import { db } from '../../utils/db'
import { habit, habitTask, habitTaskCompletion } from '../../db/schema'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers
  })

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const userId = session.user.id

  try {
    // Fetch all habits for the user
    const habitsData = await db
      .select()
      .from(habit)
      .where(eq(habit.userId, userId))
      .orderBy(desc(habit.createdAt))

    if (!habitsData.length) {
      return { habits: [], completions: [] }
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]!

    // Fetch tasks for all habits
    const allTasks = await db
      .select()
      .from(habitTask)
      .where(inArray(habitTask.habitId, habitsData.map(h => h.id)))

    // Fetch today's completions for all tasks
    const todayCompletions = await db
      .select()
      .from(habitTaskCompletion)
      .where(
        and(
          eq(habitTaskCompletion.userId, userId),
          eq(habitTaskCompletion.date, today)
        )
      )

    // Fetch all completions for heatmap (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]!

    const allCompletions = await db
      .select({
        id: habitTaskCompletion.id,
        taskId: habitTaskCompletion.taskId,
        habitId: habitTask.habitId,
        date: habitTaskCompletion.date,
        completedAt: habitTaskCompletion.completedAt
      })
      .from(habitTaskCompletion)
      .innerJoin(habitTask, eq(habitTaskCompletion.taskId, habitTask.id))
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, userId),
          eq(habitTaskCompletion.userId, userId),
          sql`${habitTaskCompletion.date} >= ${thirtyDaysAgoStr}`
        )
      )

    // Group tasks by habitId and add completion status
    const tasksByHabit = allTasks.reduce((acc, task) => {
      const habitId = task.habitId!
      if (!acc[habitId]) {
        acc[habitId] = []
      }
      const completion = todayCompletions.find(c => c.taskId === task.id)
      acc[habitId].push({
        ...task,
        completed: !!completion,
        completedAt: completion?.completedAt || null
      })
      return acc
    }, {} as Record<string, any[]>)

    // Attach tasks to habits
    const habitsWithTasks = habitsData.map(habit => ({
      ...habit,
      tasks: tasksByHabit[habit.id!] || []
    }))

    return {
      habits: habitsWithTasks,
      completions: allCompletions
    }
  } catch (error: any) {
    console.error('Error fetching habits with data:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch habits'
    })
  }
})
