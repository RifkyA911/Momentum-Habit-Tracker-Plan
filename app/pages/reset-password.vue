<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

definePageMeta({ layout: 'auth', middleware: 'auth' })

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleResetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const { error: authError } = await authClient.resetPassword({
      newPassword: password.value,
    })
    
    if (authError) {
      error.value = authError.message || 'Failed to reset password'
    } else {
      success.value = true
      setTimeout(() => {
        navigateTo('/login')
      }, 3000)
    }
  } catch (e: any) {
    error.value = e.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0B0D0F] text-white">
    <!-- Ambient Background -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%)]" />
    <div class="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl" />

    <!-- Main Container -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8 flex items-center justify-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 ring-1 ring-primary-500/20 backdrop-blur">
            <UIcon name="i-lucide-activity" class="h-5 w-5 text-primary-400" />
          </div>
          <span class="text-lg font-semibold">Momentum</span>
        </div>

        <!-- Card -->
        <div class="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl">
          <div class="mb-8">
            <h2 class="text-3xl font-semibold tracking-tight">Set new password</h2>
            <p class="mt-2 text-sm leading-relaxed text-white/45">
              Enter your new password below.
            </p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="rounded-2xl border border-primary-500/20 bg-primary-500/10 p-5 text-center">
            <UIcon name="i-lucide-check-circle-2" class="h-10 w-10 mx-auto mb-3 text-primary-400" />
            <p class="font-medium text-primary-400">Password reset successful!</p>
            <p class="mt-1 text-sm text-white/40">Redirecting to login...</p>
          </div>

          <!-- Form -->
          <template v-else>
            <!-- Error Message -->
            <div v-if="error" class="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {{ error }}
            </div>

            <form class="space-y-6" @submit.prevent="handleResetPassword">
              <!-- New Password -->
              <div class="space-y-2 flex flex-col">
                <label class="text-sm font-medium text-white/70"> New Password </label>
                <UInput
                  v-model="password"
                  type="password"
                  size="xl"
                  placeholder="••••••••"
                  variant="none"
                  :ui="{
                    wrapper: 'relative',
                    base: `
                    h-14 rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-white
                    placeholder:text-white/20 backdrop-blur-xl transition-all duration-300
                    focus:border-primary-400/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary-500/10
                `,
                  }"
                />
              </div>

              <!-- Confirm Password -->
              <div class="space-y-2 flex flex-col">
                <label class="text-sm font-medium text-white/70"> Confirm Password </label>
                <UInput
                  v-model="confirmPassword"
                  type="password"
                  size="xl"
                  placeholder="••••••••"
                  variant="none"
                  :ui="{
                    wrapper: 'relative',
                    base: `
                    h-14 rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-white
                    placeholder:text-white/20 backdrop-blur-xl transition-all duration-300
                    focus:border-primary-400/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary-500/10
                `,
                  }"
                />
              </div>

              <!-- Button -->
              <UButton
                type="submit"
                block
                size="xl"
                :loading="loading"
                class="h-14 mt-4 rounded-2xl border-0 bg-primary-500 text-base font-semibold text-white transition-all duration-300 hover:bg-primary-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]"
              >
                Reset Password
              </UButton>
            </form>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
