import { db } from '../utils/db'
import { feedback } from '../db/schema'
import { nanoid } from 'nanoid'
import { auth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { rating, name, email, category, feedback: feedbackText } = body
    
    // Validate required fields
    if (!name || !email || !category || !feedbackText || rating === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }
    
    // Map category string to lowercase value
    const categoryMap: Record<string, string> = {
      'Bug': 'bug',
      'Feature Request': 'feature',
      'UI/UX': 'uiux',
      'Other': 'other'
    }
    
    const categoryValue = categoryMap[category] || category.toLowerCase()
    
    // Get session to get user ID (optional)
    const session = await auth.api.getSession({
      headers: event.headers
    })
    
    const newFeedback = await db.insert(feedback).values({
      id: nanoid(),
      userId: session?.user?.id || null,
      name,
      email,
      category: categoryValue,
      rating,
      feedback: feedbackText,
      createdAt: new Date()
    }).returning()
    
    return { success: true, data: newFeedback[0] }
  } catch (error: any) {
    console.error('Feedback submission error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to submit feedback'
    })
  }
})
