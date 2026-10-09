import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { habitTaskCompletion } from '../../db/schema'
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

  // Get all completions for user
  const completions = await db.select()
    .from(habitTaskCompletion)
    .where(eq(habitTaskCompletion.userId, session.user.id))

  if (completions.length === 0) {
    return { streak: 0 }
  }

  // Calculate streak from completions
  const counts: Record<string, number> = {}
  completions.forEach((c) => {
    if (c.date) {
      counts[c.date] = (counts[c.date] || 0) + 1
    }
  })

  const activeDates = new Set(Object.keys(counts).filter(d => (counts[d] ?? 0) > 0))
  
  let streak = 0
  const checkDate = new Date()
  const todayStr = checkDate.toISOString().split('T')[0]!
  
  const yesterday = new Date()
  yesterday.setDate(checkDate.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]!
  
  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return { streak: 0 }
  }
  
  let currentCheck = activeDates.has(todayStr) ? checkDate : yesterday
  
  while (true) {
    const dateStr = currentCheck.toISOString().split('T')[0]!
    if (activeDates.has(dateStr)) {
      streak++
      currentCheck.setDate(currentCheck.getDate() - 1)
    } else {
      break
    }
  }

  return { streak }
})
