<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

definePageMeta({ layout: 'auth', middleware: 'auth' })

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data, error: authError } = await authClient.signUp.email({
      name: name.value,
      email: email.value,
      password: password.value
    })
    if (authError) {
      error.value = authError.message || 'Registration failed'
    } else {
      navigateTo('/dashboard')
    }
  } catch (e: any) {
    error.value = e.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

const handleGoogleSignup = async () => {
  googleLoading.value = true
  try {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard'
    })
  } catch (e: any) {
    error.value = e.message || 'Google sign-up failed'
    googleLoading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0B0D0F] text-white">
    <!-- Ambient Background -->
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_40%)]"
    />
    <div
      class="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl"
    />

    <!-- Main Container -->
    <div class="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
      <!-- Left Side (Desktop Only) -->
      <div class="hidden flex-col justify-between border-r border-white/5 p-12 lg:flex">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 ring-1 ring-primary-500/20 backdrop-blur"
          >
            <UIcon name="i-lucide-activity" class="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <p class="font-semibold tracking-tight">Momentum</p>
            <p class="text-sm text-white/40">Start your journey</p>
          </div>
        </div>

        <!-- Hero -->
        <div class="max-w-xl">
          <h1 class="text-5xl font-semibold leading-[1.05] tracking-tight">
            Your journey to
            <span class="text-primary-400">consistency</span>
            starts here.
          </h1>

          <p class="mt-6 max-w-md text-lg leading-relaxed text-white/50">
            Join thousands who are building better habits with AI-powered insights, streak tracking, and community accountability.
          </p>

          <!-- Social proof -->
          <div class="mt-10 flex items-center gap-6">
            <div class="flex -space-x-3">
              <div
                v-for="i in 4"
                :key="i"
                class="h-10 w-10 rounded-full border-2 border-[#0B0D0F] bg-gradient-to-br from-primary-400 to-teal-600"
                :style="{ opacity: 1 - i * 0.15 }"
              />
            </div>
            <div>
              <p class="text-sm font-medium">2,400+ users</p>
              <p class="text-xs text-white/40">building momentum daily</p>
            </div>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-xl">
            <UIcon name="i-lucide-brain" class="h-5 w-5 text-primary-400 mb-2" />
            <p class="text-sm font-medium">AI Insights</p>
            <p class="text-xs text-white/40 mt-1">Powered by LLaMA 3</p>
          </div>
          <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-xl">
            <UIcon name="i-lucide-flame" class="h-5 w-5 text-primary-400 mb-2" />
            <p class="text-sm font-medium">Streak Tracking</p>
            <p class="text-xs text-white/40 mt-1">Don't break the chain</p>
          </div>
        </div>
      </div>

      <!-- Right Side (Register Form) -->
      <div class="flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div class="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 ring-1 ring-primary-500/20"
            >
              <UIcon name="i-lucide-activity" class="h-5 w-5 text-primary-400" />
            </div>
            <span class="text-lg font-semibold">Momentum</span>
          </div>

          <!-- Card -->
          <div class="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl">
            <div class="mb-8">
              <h2 class="text-3xl font-semibold tracking-tight">Create account</h2>
              <p class="mt-2 text-sm leading-relaxed text-white/45">
                Start building your momentum today. It only takes a minute.
              </p>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {{ error }}
            </div>

            <form class="space-y-5" @submit.prevent="handleRegister">
              <UFormGroup label="Full Name">
                <UInput
                  v-model="name"
                  type="text"
                  size="xl"
                  placeholder="John Doe"
                  color="white"
                  variant="outline"
                  :ui="{
                    rounded: 'rounded-2xl',
                    base: 'bg-white/5 border-white/10 text-white placeholder:text-white/25'
                  }"
                />
              </UFormGroup>

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

              <UFormGroup label="Password">
                <UInput
                  v-model="password"
                  type="password"
                  size="xl"
                  placeholder="••••••••"
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
                class="mt-2 rounded-2xl h-14 text-base font-medium"
              >
                Create Account
              </UButton>
            </form>

            <!-- Divider -->
            <div class="my-7 flex items-center gap-4">
              <div class="h-px flex-1 bg-white/10" />
              <span class="text-xs uppercase tracking-[0.25em] text-white/25">OR</span>
              <div class="h-px flex-1 bg-white/10" />
            </div>

            <!-- Google -->
            <UButton
              block
              size="xl"
              color="white"
              variant="soft"
              icon="i-simple-icons-google"
              class="h-14 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
              :loading="googleLoading"
              @click="handleGoogleSignup"
            >
              Sign up with Google
            </UButton>

            <!-- Footer -->
            <p class="mt-8 text-center text-sm text-white/40">
              Already have an account?
              <NuxtLink
                to="/login"
                class="font-medium text-primary-400 hover:text-primary-300"
              >
                Log in
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
