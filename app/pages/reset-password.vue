<script setup lang="ts">

definePageMeta({ layout: 'auth', middleware: 'auth' })

const route = useRoute()
const token = route.query.token as string

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const isValidToken = ref(false)

// Verify token on mount
onMounted(async () => {
  if (!token) {
    error.value = 'Invalid reset link'
    return
  }

  try {
    const result = await $fetch('/api/auth/verify-reset-token', {
      method: 'POST',
      body: { token }
    })
    
    if (result.valid) {
      isValidToken.value = true
    } else {
      error.value = result.message || 'Invalid or expired reset link'
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to verify reset link'
  }
})

const handleReset = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token,
        password: password.value
      }
    })
    
    if (result.success) {
      success.value = true
    } else {
      error.value = result.message || 'Failed to reset password'
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to reset password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0B0D0F] text-white">
    <!-- Ambient Background -->
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%)]"
    />
    <div
      class="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl"
    />

    <!-- Main Container -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8 flex items-center justify-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 ring-1 ring-primary-500/20 backdrop-blur"
          >
            <UIcon name="i-lucide-activity" class="h-5 w-5 text-primary-400" />
          </div>
          <span class="text-lg font-semibold">Momentum</span>
        </div>

        <!-- Card -->
        <div class="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl">
          <!-- Back Link -->
          <NuxtLink
            to="/login"
            class="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6"
          >
            <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
            <span>Back to login</span>
          </NuxtLink>

          <div class="mb-8">
            <h2 class="text-3xl font-semibold tracking-tight">Reset password</h2>
            <p class="mt-2 text-sm leading-relaxed text-white/45">
              Enter your new password below.
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            class="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {{ error }}
          </div>

          <!-- Success Message -->
          <div
            v-if="success"
            class="rounded-2xl border border-primary-500/20 bg-primary-500/10 p-5 text-center"
          >
            <UIcon name="i-lucide-check-circle-2" class="h-10 w-10 mx-auto mb-3 text-primary-400" />
            <p class="font-medium text-primary-400">Password reset successful!</p>
            <p class="mt-1 text-sm text-white/40">You can now log in with your new password.</p>
            <NuxtLink
              to="/login"
              class="mt-4 inline-block text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              Go to login →
            </NuxtLink>
          </div>

          <!-- Form -->
          <template v-else-if="isValidToken">
            <form class="space-y-6" @submit.prevent="handleReset">
              <div class="space-y-2">
                <label class="text-sm font-medium text-white/80">New Password</label>
                <UInput
                  v-model="password"
                  type="password"
                  size="xl"
                  placeholder="••••••••"
                  color="white"
                  variant="outline"
                  class="w-full"
                  :ui="{
                    rounded: 'rounded-2xl',
                    base: 'bg-white/5 border-white/10 text-white placeholder:text-white/25',
                    wrapper: 'w-full'
                  }"
                />
                <p class="text-xs text-white/30">Must be at least 8 characters</p>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-white/80">Confirm Password</label>
                <UInput
                  v-model="confirmPassword"
                  type="password"
                  size="xl"
                  placeholder="••••••••"
                  color="white"
                  variant="outline"
                  class="w-full"
                  :ui="{
                    rounded: 'rounded-2xl',
                    base: 'bg-white/5 border-white/10 text-white placeholder:text-white/25',
                    wrapper: 'w-full'
                  }"
                />
              </div>

              <UButton
                type="submit"
                block
                size="xl"
                color="primary"
                :loading="loading"
                class="mt-4 rounded-2xl h-14 text-base font-semibold"
              >
                Reset Password
              </UButton>
            </form>
          </template>

          <!-- Loading State -->
          <div v-else-if="!error" class="text-center py-8">
            <UIcon name="i-lucide-loader-2" class="h-8 w-8 mx-auto animate-spin text-primary-400" />
            <p class="mt-3 text-sm text-white/40">Verifying reset link...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
