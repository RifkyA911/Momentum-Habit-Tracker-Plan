import { db } from '../utils/db'
import { feedback } from '../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const allFeedback = await db.select().from(feedback).orderBy(desc(feedback.createdAt))
    return allFeedback
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch feedback'
    })
  }
})
