import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { verification } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token } = body

  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  try {
    const verifications = await db.select()
      .from(verification)
      .where(eq(verification.value, token))
      .limit(1)

    if (!verifications.length) {
      return { valid: false, message: 'Invalid or expired reset link' }
    }

    const verificationRecord = verifications[0]!
    
    // Check if expired
    if (new Date(verificationRecord.expiresAt) < new Date()) {
      return { valid: false, message: 'Reset link has expired. Please request a new one.' }
    }

    return { valid: true }
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: 'Failed to verify reset link'
    })
  }
})
