export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Serialize and store into persistent cookie
  const payloadStr = encodeURIComponent(JSON.stringify(body))

  setCookie(event, 'momentum_ai_settings', payloadStr, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  return {
    success: true,
    message: 'AI & Integration settings saved successfully'
  }
})
