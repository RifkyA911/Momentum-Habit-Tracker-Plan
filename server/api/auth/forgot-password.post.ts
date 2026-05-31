import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { user, verification } from '../../db/schema'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'Email is required'
    })
  }

  // Find user by email
  const users = await db.select().from(user).where(eq(user.email, email)).limit(1)
  
  if (!users.length) {
    // Don't reveal if email exists or not for security
    return { success: true, message: 'If the email exists, a reset link has been sent' }
  }

  const userRecord = users[0]

  // Generate reset token
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

  // Store verification token
  await db.insert(verification).values({
    id: nanoid(),
    identifier: email,
    value: token,
    expiresAt: expiresAt,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  // Send email using Resend
  const resendApiKey = useRuntimeConfig().resendApiKey
  
  if (!resendApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Email service not configured',
    })
  }

  const resetUrl = `${process.env.VITE_BETTER_AUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        from: 'Momentum <onboarding@resend.dev>', // Use Resend's default domain for testing
        to: email,
        subject: 'Reset Your Password - Momentum',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset Your Password</h2>
              <p>Hi ${userRecord.name || 'there'},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p>${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <div class="footer">
                <p>Momentum - Build Better Habits</p>
              </div>
            </div>
          </body>
          </html>
        `
      }
    })
  } catch (error: any) {
    console.error('Failed to send email:', error)
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      data: error.data
    })
    
    let errorMessage = 'Failed to send reset email'
    if (error.message?.includes('401') || error.statusCode === 401) {
      errorMessage = 'Invalid Resend API key. Please check your RESEND_API_KEY in .env file.'
    } else if (error.message?.includes('422') || error.statusCode === 422) {
      errorMessage = 'Invalid email address or sender domain not verified in Resend.'
    } else if (error.message?.includes('network') || error.name === 'FetchError') {
      errorMessage = 'Network error. Please check your internet connection and verify RESEND_API_KEY is set.'
    }
    
    throw createError({
      statusCode: 500,
      message: errorMessage,
      data: { originalError: error.message }
    })
  }

  return { success: true, message: 'Reset link sent to your email' }
})
