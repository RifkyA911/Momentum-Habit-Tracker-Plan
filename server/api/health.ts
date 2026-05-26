import { db } from '../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Execute a simple query to test the connection
    const result = await db.execute(sql`SELECT 1 as connected`)
    
    return {
      status: 'success',
      message: 'Database connection successful',
      data: result
    }
  } catch (error: any) {
    setResponseStatus(event, 500)
    return {
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    }
  }
})
