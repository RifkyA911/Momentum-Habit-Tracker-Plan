import { eq, and, sql, desc, count } from 'drizzle-orm'
import { db } from '../utils/db'
import { habit, habitTask } from '../db/schema'
import { auth } from '../utils/auth'

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

  const effectiveUserId = session.user.id

  console.log('Using user ID:', effectiveUserId)

  try {
    // Calculate best streak
    const completedTasks = await db
      .select({
        date: sql<string>`DATE(${habitTask.completedAt})`.as('date'),
      })
      .from(habitTask)
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          eq(habitTask.completed, true)
        )
      )
      .orderBy(sql`DATE(${habitTask.completedAt}) DESC`)

    console.log('Completed tasks count:', completedTasks.length)
    console.log('Sample completed tasks:', completedTasks.slice(0, 3))

    const uniqueDates = new Set(completedTasks.map(t => t.date))
    const sortedDates = Array.from(uniqueDates).sort()

    let bestStreak = 0
    let currentStreak = 0
    let previousDate: string | null = null

    for (const date of sortedDates) {
      if (!previousDate) {
        currentStreak = 1
      } else {
        const prev = new Date(previousDate as string)
        const curr = new Date(date as string)
        const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
        } else {
          bestStreak = Math.max(bestStreak, currentStreak)
          currentStreak = 1
        }
      }
      previousDate = date
    }
    bestStreak = Math.max(bestStreak, currentStreak)

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString()

    const totalTasksLast30Days = await db
      .select({ count: count() })
      .from(habitTask)
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          sql`${habitTask.createdAt} >= ${thirtyDaysAgoISO}::timestamp`
        )
      )

    const completedTasksLast30Days = await db
      .select({ count: count() })
      .from(habitTask)
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          eq(habitTask.completed, true),
          sql`${habitTask.completedAt} >= ${thirtyDaysAgoISO}::timestamp`
        )
      )

    const totalTasksCount = totalTasksLast30Days[0]?.count ?? 0
    const completedTasksCount = completedTasksLast30Days[0]?.count ?? 0
    const completionRate = totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0

    // Find most consistent habit
    const habitStats = await db
      .select({
        habitId: habitTask.habitId,
        habitTitle: habit.title,
        completedCount: sql<number>`count(*)`.as('completedCount'),
      })
      .from(habitTask)
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          eq(habitTask.completed, true)
        )
      )
      .groupBy(habitTask.habitId, habit.title)
      .orderBy(sql`count(*) DESC`)
      .limit(1)

    const mostConsistent = habitStats.length > 0 && habitStats[0] ? habitStats[0].habitTitle : 'N/A'

    // Find peak time
    const timeStats = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${habitTask.completedAt})`.as('hour'),
        count: sql<number>`count(*)`.as('count'),
      })
      .from(habitTask)
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          eq(habitTask.completed, true)
        )
      )
      .groupBy(sql`EXTRACT(HOUR FROM ${habitTask.completedAt})`)
      .orderBy(sql`count(*) DESC`)
      .limit(1)

    let peakTime = 'N/A'
    if (timeStats.length > 0 && timeStats[0]) {
      const hour = Math.floor(timeStats[0].hour)
      if (hour >= 0 && hour < 12) peakTime = `${hour} AM`
      else if (hour === 12) peakTime = '12 PM'
      else peakTime = `${hour - 12} PM`
    }

    return {
      bestStreak,
      completionRate,
      mostConsistent,
      peakTime
    }
  } catch (error: any) {
    console.error('Stats error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch stats'
    })
  }
})
