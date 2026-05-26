export default defineNuxtRouteMiddleware(async (to) => {
  // Use native Nuxt useFetch to properly handle SSR and pass cookies
  const { data: session } = await useFetch('/api/auth/get-session', {
    headers: useRequestHeaders(['cookie']) as Record<string, string>
  })

  // If not authenticated and trying to access dashboard, redirect to login
  if (!session.value && to.path.startsWith('/dashboard')) {
    return navigateTo('/login')
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  const authPages = ['/login', '/register', '/forgot-password']
  if (session.value && authPages.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
