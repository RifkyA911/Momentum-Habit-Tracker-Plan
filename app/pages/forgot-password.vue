<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

definePageMeta({ layout: 'auth' })

const email = ref('')
const loading = ref(false)
const isSent = ref(false)
const error = ref('')

const handleReset = async () => {
  loading.value = true
  error.value = ''
  try {
    const { error: authError } = await authClient.forgetPassword({
      email: email.value,
      redirectTo: '/reset-password'
    })
    if (authError) {
      error.value = authError.message || 'Failed to send reset link'
    } else {
      isSent.value = true
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
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%)]"
    />
    <div
      class="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
    />

    <!-- Main Container -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8 flex items-center justify-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 ring-1 ring-blue-500/20 backdrop-blur"
          >
            <UIcon name="i-lucide-activity" class="h-5 w-5 text-blue-400" />
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
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <!-- Success Message -->
          <div
            v-if="isSent"
            class="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center"
          >
            <UIcon name="i-lucide-check-circle-2" class="h-10 w-10 mx-auto mb-3 text-emerald-400" />
            <p class="font-medium text-emerald-400">Reset link sent!</p>
            <p class="mt-1 text-sm text-white/40">Check your email for the reset link.</p>
            <NuxtLink
              to="/login"
              class="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Return to login →
            </NuxtLink>
          </div>

          <!-- Form -->
          <template v-else>
            <!-- Error Message -->
            <div
              v-if="error"
              class="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {{ error }}
            </div>

            <form class="space-y-5" @submit.prevent="handleReset">
              <UFormGroup label="Email">
                <UInput
                  v-model="email"
                  type="email"
                  size="xl"
                  placeholder="hello@example.com"
                  color="white"
                  variant="outline"
                  :ui="{
                    rounded: 'rounded-2xl',
                    base: 'bg-white/5 border-white/10 text-white placeholder:text-white/25'
                  }"
                />
              </UFormGroup>

              <UButton
                type="submit"
                block
                size="xl"
                color="primary"
                :loading="loading"
                class="rounded-2xl h-14 text-base font-medium"
              >
                Send Reset Link
              </UButton>
            </form>
          </template>

          <!-- Footer -->
          <p class="mt-8 text-center text-sm text-white/40">
            Remember your password?
            <NuxtLink
              to="/login"
              class="font-medium text-blue-400 hover:text-blue-300"
            >
              Log in
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
