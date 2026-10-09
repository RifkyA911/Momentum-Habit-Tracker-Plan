import { eq, and, sql, inArray } from 'drizzle-orm'
import { db } from '../../utils/db'
import { habit, habitTask, habitTaskCompletion, user } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedKey = config.hermesApiKey || process.env.HERMES_API_KEY

  const authHeader = getHeader(event, 'authorization') || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const customKey = getHeader(event, 'x-hermes-key') || getQuery(event).key

  if (expectedKey && bearerToken !== expectedKey && customKey !== expectedKey) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized: Invalid Hermes Agent API Key'
    })
  }

  const queryUserId = getQuery(event).userId as string | undefined
  let targetUserId = queryUserId

  if (!targetUserId) {
    const defaultUser = await db.select().from(user).limit(1)
    if (!defaultUser.length) {
      throw createError({ statusCode: 404, message: 'No registered user found' })
    }
    targetUserId = defaultUser[0]!.id
  }

  const habits = await db.select().from(habit).where(eq(habit.userId, targetUserId))
  const habitIds = habits.map(h => h.id)

  const tasks = habitIds.length > 0
    ? await db.select().from(habitTask).where(inArray(habitTask.habitId, habitIds))
    : []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]!

  const completions = await db.select({
    id: habitTaskCompletion.id,
    taskId: habitTaskCompletion.taskId,
    date: habitTaskCompletion.date,
    completedAt: habitTaskCompletion.completedAt,
    habitId: habitTask.habitId
  })
    .from(habitTaskCompletion)
    .innerJoin(habitTask, eq(habitTaskCompletion.taskId, habitTask.id))
    .where(
      and(
        eq(habitTaskCompletion.userId, targetUserId),
        sql`${habitTaskCompletion.date} >= ${thirtyDaysAgoStr}`
      )
    )

  // Day of week analysis (0 = Sun, 6 = Sat)
  const dayCounts: Record<string, number> = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  }
  const timeBuckets: { morning: number; afternoon: number; evening: number; night: number } = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  }

  completions.forEach((c) => {
    if (c.completedAt) {
      const d = new Date(c.completedAt)
      const day = d.toLocaleDateString('en-US', { weekday: 'long' })
      if (dayCounts[day] !== undefined) dayCounts[day]++

      const hour = d.getHours()
      if (hour >= 5 && hour < 12) timeBuckets.morning++
      else if (hour >= 12 && hour < 17) timeBuckets.afternoon++
      else if (hour >= 17 && hour < 22) timeBuckets.evening++
      else timeBuckets.night++
    }
  })

  // Detect drop-off day (the day with lowest completions)
  let lowestDay = 'Sunday'
  let minCount = Infinity
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count < minCount) {
      minCount = count
      lowestDay = day
    }
  }

  return {
    agentProtocol: 'hermes-v1',
    timestamp: new Date().toISOString(),
    userContext: {
      userId: targetUserId,
      totalActiveHabits: habits.length,
      totalCompletions30Days: completions.length
    },
    telemetry: {
      habits: habits.map(h => ({
        id: h.id,
        title: h.title,
        icon: h.icon,
        taskCount: tasks.filter(t => t.habitId === h.id).length
      })),
      dayOfWeekPatterns: dayCounts,
      timeOfDayPatterns: timeBuckets,
      behavioralSignals: {
        weakestDay: lowestDay,
        weakestDayCompletions: minCount,
        burnoutRisk: minCount === 0 ? 'medium' : 'low'
      }
    }
  }
})
