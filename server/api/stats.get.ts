import { eq, and, sql, desc, count } from 'drizzle-orm'
import { db } from '../utils/db'
import { habit, habitTask, habitTaskCompletion } from '../db/schema'
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

  try {
    const today = new Date().toISOString().split('T')[0]!
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]!

    // Get all completions for the last 30 days
    const allCompletions = await db
      .select({
        date: habitTaskCompletion.date,
        habitId: habitTask.habitId,
        taskId: habitTaskCompletion.taskId,
      })
      .from(habitTaskCompletion)
      .innerJoin(habitTask, eq(habitTaskCompletion.taskId, habitTask.id))
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          eq(habitTaskCompletion.userId, effectiveUserId),
          sql`${habitTaskCompletion.date} >= ${thirtyDaysAgoStr}`
        )
      )

    // Get all tasks that existed in the last 30 days
    const allTasks = await db
      .select({
        id: habitTask.id,
        habitId: habitTask.habitId,
        createdAt: habitTask.createdAt,
      })
      .from(habitTask)
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          sql`${habitTask.createdAt} >= ${thirtyDaysAgo.toISOString()}::timestamp`
        )
      )

    // Calculate daily completion rates
    const dailyStats: Record<string, { total: number, completed: number }> = {}
    
    // Initialize all days from 30 days ago to today
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]!
      dailyStats[dateStr] = { total: 0, completed: 0 }
    }

    // Count tasks that existed on each day
    allTasks.forEach(task => {
      const taskDate = new Date(task.createdAt!).toISOString().split('T')[0]!
      for (const dateStr in dailyStats) {
        if (dateStr >= taskDate) {
          dailyStats[dateStr]!.total++
        }
      }
    })

    // Count completions on each day
    allCompletions.forEach(completion => {
      if (dailyStats[completion.date]) {
        dailyStats[completion.date]!.completed++
      }
    })

    // Calculate overall completion rate (average of daily rates)
    let totalDailyRate = 0
    let daysWithTasks = 0
    let perfectDays = 0

    Object.values(dailyStats).forEach(day => {
      if (day.total > 0) {
        const rate = day.completed / day.total
        totalDailyRate += rate
        daysWithTasks++
        if (rate === 1) perfectDays++
      }
    })

    const completionRate = daysWithTasks > 0 ? Math.round((totalDailyRate / daysWithTasks) * 100) : 0

    // Calculate streak (consecutive days with 100% completion)
    const sortedDates = Object.keys(dailyStats).sort()
    let currentStreak = 0
    let bestStreak = 0

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = sortedDates[i]
      const day = dailyStats[date]
      if (day.total > 0 && day.completed === day.total) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    // Calculate total tasks completed
    const totalCompleted = allCompletions.length

    // Calculate average tasks per day
    const avgTasksPerDay = daysWithTasks > 0 ? Math.round(totalCompleted / daysWithTasks) : 0

    // Find most productive hour (when most tasks are completed)
    const hourStats = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${habitTaskCompletion.completedAt} AT TIME ZONE 'UTC')`.as('hour'),
        count: sql<number>`count(*)`.as('count'),
      })
      .from(habitTaskCompletion)
      .innerJoin(habitTask, eq(habitTaskCompletion.taskId, habitTask.id))
      .innerJoin(habit, eq(habitTask.habitId, habit.id))
      .where(
        and(
          eq(habit.userId, effectiveUserId),
          eq(habitTaskCompletion.userId, effectiveUserId),
          sql`${habitTaskCompletion.date} >= ${thirtyDaysAgoStr}`
        )
      )
      .groupBy(sql`EXTRACT(HOUR FROM ${habitTaskCompletion.completedAt} AT TIME ZONE 'UTC')`)
      .orderBy(sql`count(*) DESC`)

    // Get hour distribution for visualization
    const hourDistribution: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      hourDistribution[i] = 0
    }
    hourStats.forEach(h => {
      hourDistribution[Math.floor(h.hour)] = h.count
    })

    const peakHour = hourStats.length > 0 ? Math.floor(hourStats[0].hour) : null
    let peakTime = 'N/A'
    let timeOfDay = 'N/A'
    
    if (peakHour !== null) {
      if (peakHour >= 5 && peakHour < 12) {
        timeOfDay = 'Morning'
        peakTime = `${peakHour} AM`
      } else if (peakHour >= 12 && peakHour < 17) {
        timeOfDay = 'Afternoon'
        peakTime = peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`
      } else if (peakHour >= 17 && peakHour < 21) {
        timeOfDay = 'Evening'
        peakTime = `${peakHour - 12} PM`
      } else {
        timeOfDay = 'Night'
        peakTime = peakHour === 0 ? '12 AM' : (peakHour < 12 ? `${peakHour} AM` : `${peakHour - 12} PM`)
      }
    }

    // Calculate habit-specific completion rates (daily-based)
    // Get all habits for the user
    const userHabits = await db
      .select({
        habitId: habit.id,
        habitTitle: habit.title,
        habitIcon: habit.icon,
        habitColor: habit.color,
      })
      .from(habit)
      .where(eq(habit.userId, effectiveUserId))

    const habitStats = []

    for (const h of userHabits) {
      // Get all tasks for this habit
      const habitTasks = await db
        .select({
          id: habitTask.id,
          createdAt: habitTask.createdAt,
        })
        .from(habitTask)
        .where(eq(habitTask.habitId, h.habitId!))

      // Calculate daily completion rate for this habit
      let totalDailyRate = 0
      let daysWithTasks = 0

      for (let i = 0; i < 30; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]!

        // Count tasks that existed on this day
        let tasksOnDay = 0
        habitTasks.forEach(task => {
          const taskDate = new Date(task.createdAt!).toISOString().split('T')[0]!
          if (dateStr >= taskDate) {
            tasksOnDay++
          }
        })

        if (tasksOnDay > 0) {
          // Count completions on this day for this habit
          const completionsOnDay = allCompletions.filter(
            c => c.date === dateStr && c.habitId === h.habitId
          ).length

          const dayRate = completionsOnDay / tasksOnDay
          totalDailyRate += dayRate
          daysWithTasks++
        }
      }

      const completionRate = daysWithTasks > 0 ? Math.round((totalDailyRate / daysWithTasks) * 100) : 0

      habitStats.push({
        habitId: h.habitId!,
        habitTitle: h.habitTitle,
        habitIcon: h.habitIcon,
        habitColor: h.habitColor,
        totalTasks: habitTasks.length,
        completedTasks: allCompletions.filter(c => c.habitId === h.habitId).length,
        completionRate
      })
    }

    // Find most consistent habit
    const mostConsistent = habitStats.length > 0 
      ? habitStats.reduce((best, current) => current.completionRate > best.completionRate ? current : best)
      : null

    return {
      completionRate,
      perfectDays,
      currentStreak,
      bestStreak,
      totalCompleted,
      avgTasksPerDay,
      peakTime,
      timeOfDay,
      peakHour,
      hourDistribution,
      habitStats,
      mostConsistent: mostConsistent?.habitTitle || 'N/A',
      mostConsistentRate: mostConsistent?.completionRate || 0
    }
  } catch (error: any) {
    console.error('Stats error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch stats'
    })
  }
})
