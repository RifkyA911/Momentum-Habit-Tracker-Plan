import { eq, asc, desc } from 'drizzle-orm'
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

  const method = event.method

  if (method === 'GET') {
    const habits = await db.select()
      .from(habit)
      .where(eq(habit.userId, session.user.id))
      .orderBy(asc(habit.orderIndex), desc(habit.createdAt))
    
    return habits
  }

  if (method === 'POST') {
    const body = await readBody(event)
    
    if (!body.title || !body.icon || !body.color) {
      throw createError({
        statusCode: 400,
        message: 'Title, icon, and color are required'
      })
    }

    const newHabit = await db.insert(habit).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: body.title,
      icon: body.icon,
      color: body.color,
      description: body.description || null
    }).returning()

    if (body.tasks && Array.isArray(body.tasks) && body.tasks.length > 0) {
      const tasksToInsert = body.tasks.map((taskText: string, index: number) => ({
        id: crypto.randomUUID(),
        habitId: newHabit[0].id,
        text: taskText,
        orderIndex: index
      }))
      await db.insert(habitTask).values(tasksToInsert)
    }

    return newHabit[0]
  }
})
