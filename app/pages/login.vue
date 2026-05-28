<script setup lang="ts">
import { authClient } from "~/utils/auth-client";

definePageMeta({
  layout: "auth",
  middleware: "auth",
});

const email = ref("");
const password = ref("");
const loading = ref(false);
const googleLoading = ref(false);
const error = ref("");

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    const { data, error: authError } = await authClient.signIn.email({
      email: email.value,
      password: password.value,
    });
    if (authError) {
      error.value = authError.message || "Invalid credentials";
    } else {
      window.location.href = "/dashboard";
    }
  } catch (e: any) {
    error.value = e.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  googleLoading.value = true;
  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  } catch (e: any) {
    error.value = e.message || "Google sign-in failed";
    googleLoading.value = false;
  }
};
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0B0D0F] text-white">
    <!-- Ambient Background -->
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,115,0,0.12),transparent_40%)]"
    />

    <div
      class="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl"
    />

    <!-- Main Container -->
    <div
      class="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-1"
    >
      <!-- Right Side (Login Form) -->
      <div class="flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div class="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 ring-1 ring-primary-500/20"
            >
              <UIcon
                name="i-lucide-activity"
                class="h-5 w-5 text-primary-400"
              />
            </div>

            <span class="text-lg font-semibold"> Momentum </span>
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
                Continue building your momentum and stay consistent today.
              </p>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {{ error }}
            </div>
            <form class="space-y-6" @submit.prevent="handleLogin">
              <!-- Email -->
              <div class="space-y-2 flex flex-col">
                <label class="text-sm font-medium text-white/70"> Email </label>
                <UInput
                  v-model="email"
                  type="email"
                  size="xl"
                  placeholder="hello@example.com"
                  variant="none"
                  :ui="{
                    wrapper: 'relative',
                    base: `
                    h-14
                    rounded-2xl
                    border
                    border-white/8
                    bg-white/[0.03]
                    px-4
                    text-white
                    placeholder:text-white/20
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    focus:border-primary-400/40
                    focus:bg-white/[0.05]
                    focus:ring-4
                    focus:ring-primary-500/10
                `,
                  }"
                />
              </div>

              <!-- Password -->
              <div class="space-y-2 flex flex-col">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-white/70">
                    Password
                  </label>
                </div>

                <UInput
                  v-model="password"
                  type="password"
                  size="xl"
                  placeholder="••••••••"
                  variant="none"
                  :ui="{
                    wrapper: 'relative',
                    base: `
                    h-14
                    rounded-2xl
                    border
                    border-white/8
                    bg-white/[0.03]
                    px-4
                    text-white
                    placeholder:text-white/20
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    focus:border-primary-400/40
                    focus:bg-white/[0.05]
                    focus:ring-4
                    focus:ring-primary-500/10
                `,
                  }"
                />
              </div>
              <NuxtLink
                to="/forgot-password"
                class="text-sm text-primary-400/80 transition hover:text-primary-300"
              >
                Forgot password?
              </NuxtLink>

              <!-- Button -->
              <UButton
                type="submit"
                block
                size="xl"
                :loading="loading"
                class="h-14 mt-4 rounded-2xl border-0 bg-primary-500 text-base font-semibold text-white transition-all duration-300 hover:bg-primary-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]"
              >
                Continue
              </UButton>
            </form>

            <!-- Divider -->
            <div class="my-7 flex items-center gap-4">
              <div class="h-px flex-1 bg-white/10" />
              <span class="text-xs uppercase tracking-[0.25em] text-white/25">
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
            <p class="mt-8 text-center text-sm text-white/40">
              Don't have an account?

              <NuxtLink
                to="/register"
                class="font-medium text-primary-400 hover:text-primary-300"
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
