import { eq, and } from 'drizzle-orm'
import { db } from '../../utils/db'
import { user, account, verification } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, password } = body

  if (!token || !password) {
    throw createError({
      statusCode: 400,
      message: 'Token and password are required'
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Password must be at least 8 characters'
    })
  }

  try {
    const verifications = await db.select()
      .from(verification)
      .where(eq(verification.value, token))
      .limit(1)

    if (!verifications.length) {
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired reset link'
      })
    }

    const verificationRecord = verifications[0]!
    const email = verificationRecord.identifier

    // Check if expired
    if (new Date(verificationRecord.expiresAt) < new Date()) {
      throw createError({
        statusCode: 400,
        message: 'Reset link has expired. Please request a new one.'
      })
    }

    // Find user by email
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1)
    if (!users.length) {
      throw createError({
        statusCode: 400,
        message: 'User not found'
      })
    }

    const userId = users[0]!.id

    // Update account password (password is stored in account table for email/password auth)
    await db.update(account)
      .set({ 
        password: password,
        updatedAt: new Date()
      })
      .where(and(
        eq(account.userId, userId),
        eq(account.providerId, 'credential') // Only update credential-based accounts
      ))

    // Delete verification token
    await db.delete(verification)
      .where(eq(verification.id, verificationRecord.id))

    return { success: true, message: 'Password reset successful' }
  } catch (e: any) {
    if (e.statusCode) {
      throw e
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to reset password'
    })
  }
})
