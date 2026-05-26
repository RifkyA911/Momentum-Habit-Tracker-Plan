import { authClient } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  // If not authenticated and trying to access dashboard, redirect to login
  if (!session.value?.user && to.path.startsWith('/dashboard')) {
    return navigateTo('/login')
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (session.value?.user && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})
