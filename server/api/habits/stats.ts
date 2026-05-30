import { eq, inArray } from 'drizzle-orm'
import { db } from '../../utils/db'
import { habit, habitTask } from '../../db/schema'
import { auth } from '../../utils/auth'

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

  const userHabits = await db.select().from(habit).where(eq(habit.userId, session.user.id))
  if (userHabits.length === 0) {
    return { streak: 0 }
  }

  const habitIds = userHabits.map(h => h.id)
  
  const tasks = await db.select().from(habitTask).where(inArray(habitTask.habitId, habitIds))

  // Calculate streak
  const counts: Record<string, number> = {}
  tasks.forEach((task) => {
    if (task.completed && task.completedAt) {
      const date = new Date(task.completedAt).toISOString().split('T')[0]
      counts[date] = (counts[date] || 0) + 1
    }
  })

  const activeDates = new Set(Object.keys(counts).filter(d => counts[d] > 0))
  
  let streak = 0
  const checkDate = new Date()
  const todayStr = checkDate.toISOString().split('T')[0]
  
  const yesterday = new Date()
  yesterday.setDate(checkDate.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return { streak: 0 }
  }
  
  let currentCheck = activeDates.has(todayStr) ? checkDate : yesterday
  
  while (true) {
    const dateStr = currentCheck.toISOString().split('T')[0]
    if (activeDates.has(dateStr)) {
      streak++
      currentCheck.setDate(currentCheck.getDate() - 1)
    } else {
      break
    }
  }

  return { streak }
})
