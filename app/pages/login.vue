<script setup lang="ts">
import { authClient } from '~/utils/auth-client'

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data, error: authError } = await authClient.signIn.email({
      email: email.value,
      password: password.value
    })
    if (authError) {
      error.value = authError.message || 'Invalid credentials'
    } else {
      navigateTo('/dashboard')
    }
  } catch (e: any) {
    error.value = e.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  try {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard'
    })
  } catch (e: any) {
    error.value = e.message || 'Google sign-in failed'
    googleLoading.value = false
  }
}
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden bg-[#0B0D0F] text-white"
  >
    <!-- Ambient Background -->
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,115,0,0.12),transparent_40%)]"
    />

    <div
      class="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl"
    />

    <!-- Main Container -->
    <div
      class="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2"
    >
      <!-- Left Side (Desktop Only) -->
      <div
        class="hidden flex-col justify-between border-r border-white/5 p-12 lg:flex"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-500/20 backdrop-blur"
          >
            <UIcon
              name="i-lucide-activity"
              class="h-5 w-5 text-orange-400"
            />
          </div>

          <div>
            <p class="font-semibold tracking-tight">Momentum</p>
            <p class="text-sm text-white/40">
              AI-powered consistency
            </p>
          </div>
        </div>

        <!-- Hero -->
        <div class="max-w-xl">
          <h1
            class="text-5xl font-semibold leading-[1.05] tracking-tight"
          >
            Build momentum,
            <span class="text-orange-400">
              not motivation.
            </span>
          </h1>

          <p
            class="mt-6 max-w-md text-lg leading-relaxed text-white/50"
          >
            A modern habit tracking experience designed to help
            you stay consistent with visual progress, streaks,
            and AI-powered behavioral insights.
          </p>

          <!-- Fake Stats -->
          <div class="mt-10 flex items-center gap-8">
            <div>
              <p class="text-3xl font-semibold">92%</p>
              <p class="mt-1 text-sm text-white/40">
                Weekly consistency
              </p>
            </div>

            <div>
              <p class="text-3xl font-semibold">184</p>
              <p class="mt-1 text-sm text-white/40">
                Active streak
              </p>
            </div>
          </div>
        </div>

        <!-- Heatmap Preview -->
        <div
          class="rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div class="mb-5 flex items-center justify-between">
            <div>
              <p class="font-medium">Consistency Heatmap</p>
              <p class="text-sm text-white/40">
                Last 6 months activity
              </p>
            </div>

            <div
              class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
            >
              +18% improvement
            </div>
          </div>

          <div class="grid grid-cols-12 gap-2">
            <div
              v-for="i in 84"
              :key="i"
              class="aspect-square rounded-md"
              :class="[
                i % 7 === 0
                  ? 'bg-orange-500/80'
                  : i % 5 === 0
                  ? 'bg-orange-500/40'
                  : i % 3 === 0
                  ? 'bg-orange-500/20'
                  : 'bg-white/5'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Right Side (Login Form) -->
      <div
        class="flex items-center justify-center p-6 lg:p-12"
      >
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div
            class="mb-8 flex items-center justify-center gap-3 lg:hidden"
          >
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-500/20"
            >
              <UIcon
                name="i-lucide-activity"
                class="h-5 w-5 text-orange-400"
              />
            </div>

            <span class="text-lg font-semibold">
              Momentum
            </span>
          </div>

          <!-- Card -->
          <div
            class="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl"
          >
            <div class="mb-8">
              <h2 class="text-3xl font-semibold tracking-tight">
                Welcome back
              </h2>

              <p class="mt-2 text-sm leading-relaxed text-white/45">
                Continue building your momentum and stay
                consistent today.
              </p>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {{ error }}
            </div>

            <form
              class="space-y-5"
              @submit.prevent="handleLogin"
            >
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
                <template #help>
                  <div class="mt-2 flex justify-end">
                    <NuxtLink
                      to="/forgot-password"
                      class="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      Forgot password?
                    </NuxtLink>
                  </div>
                </template>

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
                Continue
              </UButton>
            </form>

            <!-- Divider -->
            <div class="my-7 flex items-center gap-4">
              <div class="h-px flex-1 bg-white/10" />
              <span
                class="text-xs uppercase tracking-[0.25em] text-white/25"
              >
                OR
              </span>
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
              @click="handleGoogleLogin"
            >
              Continue with Google
            </UButton>

            <!-- Footer -->
            <p
              class="mt-8 text-center text-sm text-white/40"
            >
              Don't have an account?

              <NuxtLink
                to="/register"
                class="font-medium text-orange-400 hover:text-orange-300"
              >
                Create account
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
