<script setup lang="ts">
definePageMeta({ layout: "default" });

// Use native useFetch to get session data during SSR and hydration
const { data: session } = await useFetch('/api/auth/get-session', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
})

// Heatmap data with real dates
const today = new Date()
const previewHeatmap = Array.from({ length: 28 }, (_, i) => {
  const date = new Date(today)
  date.setDate(date.getDate() - (27 - i))
  return {
    date: date.toISOString().split('T')[0],
    level: Math.floor(Math.random() * 5),
    label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  }
});
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Subtle Background Glow -->
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"
    ></div>

    <div class="max-w-5xl mx-auto px-6 pt-32 pb-20 text-center relative z-10">
      <!-- HERO SECTION -->
      <div
        class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium text-sm mb-6 border border-primary-500/20"
      >
        <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
        <span>Meet Momentum AI</span>
      </div>

      <h1
        class="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight"
      >
        Build momentum,<br />
        not motivation.
      </h1>

      <p
        class="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10"
      >
        AI-powered habit tracking designed for consistency. Minimal, fast, and
        driven by dopamine-fueled UX.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <template v-if="session?.user">
          <UButton
            to="/dashboard"
            color="black"
            size="xl"
            class="rounded-full px-8 w-full sm:w-auto font-medium"
            icon="i-lucide-arrow-right"
          >
            Go to Dashboard
          </UButton>
        </template>
        <template v-else>
          <UButton
            to="/login"
            color="black"
            size="xl"
            class="rounded-full px-8 w-full sm:w-auto font-medium"
            icon="i-simple-icons-google"
          >
            Continue with Google
          </UButton>
        </template>

        <UButton
          to="/demo"
          color="gray"
          variant="ghost"
          size="xl"
          class="rounded-full px-8 w-full sm:w-auto font-medium ring-1 ring-gray-200 dark:ring-gray-800"
        >
          View Demo
        </UButton>
      </div>

      <!-- INTERACTIVE HEATMAP PREVIEW -->
      <div
        class="mt-20 max-w-3xl mx-auto bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl shadow-primary-900/5"
      >
        <div class="text-left mb-6">
          <h3 class="font-semibold text-lg flex items-center space-x-2">
            <UIcon name="i-lucide-activity" class="w-5 h-5 text-primary-500" />
            <span>Consistency Heatmap</span>
          </h3>
          <p class="text-sm text-gray-500">Visualize your streak seamlessly.</p>
        </div>

        <div class="grid grid-cols-7 gap-1.5 sm:gap-2 justify-center">
          <div
            v-for="(day, index) in previewHeatmap"
            :key="index"
            class="group relative"
          >
            <div
              class="w-full aspect-square rounded-[4px] transition-all duration-300 hover:scale-110 cursor-pointer"
              :class="[
                day.level === 0 ? 'bg-gray-100 dark:bg-gray-800' : '',
                day.level === 1 ? 'bg-primary-200 dark:bg-primary-900/60' : '',
                day.level === 2 ? 'bg-primary-400 dark:bg-primary-700/80' : '',
                day.level === 3 ? 'bg-primary-500 dark:bg-primary-500' : '',
                day.level === 4 ? 'bg-primary-600 dark:bg-primary-400' : '',
              ]"
            />
            <!-- Tooltip -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-gray-900 dark:bg-gray-850 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-white/10">
              <span class="font-medium">{{ day.level > 0 ? `${day.level * 2} habits` : 'No habits' }}</span> completed on {{ day.label }}
              <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
            </div>
          </div>
        </div>
      </div>

      <!-- FEATURES & AI INSIGHT PREVIEW -->
      <div class="mt-32 text-left grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- AI Card Preview -->
        <div
          class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-[#020617] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          ></div>
          <UIcon name="i-lucide-brain" class="w-8 h-8 text-primary-500 mb-6" />
          <h3 class="text-2xl font-bold mb-4">
            AI Insights that understand you.
          </h3>
          <div class="space-y-3">
            <div
              class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm shadow-sm"
            >
              "You are 42% more consistent on weekdays. Try pairing your weekend
              habits with breakfast."
            </div>
            <div
              class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm shadow-sm opacity-80"
            >
              "Your strongest habit completion time is 8 PM."
            </div>
          </div>
        </div>

        <!-- Minimal Features -->
        <div class="p-8 flex flex-col justify-center">
          <h3 class="text-2xl font-bold mb-8">
            Everything you need. Nothing you don't.
          </h3>
          <ul class="space-y-6">
            <li class="flex items-center space-x-4">
              <div
                class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-zap" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  Instant check-ins
                </h4>
                <p class="text-sm text-gray-500">
                  Optimistic UI makes it feel instantaneous.
                </p>
              </div>
            </li>
            <li class="flex items-center space-x-4">
              <div
                class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-sparkles" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  AI insights
                </h4>
                <p class="text-sm text-gray-500">
                  Actionable advice powered by LLaMA 3.
                </p>
              </div>
            </li>
            <li class="flex items-center space-x-4">
              <div
                class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-flame" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  Streak tracking
                </h4>
                <p class="text-sm text-gray-500">
                  Don't break the chain. Build momentum.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- NEW SECTION: THE MOMENTUM METHOD (PHILOSOPHY & PILLARS) -->
      <div class="mt-32 text-left">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            The Momentum Method
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">
            Why traditional habit trackers fail, and how our behavioral-science-backed rhythm works.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl">
            <div class="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <UIcon name="i-lucide-heart-crack" class="w-6 h-6" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Ditch Shame Streaks</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Streaks should empower you, not hold you hostage. Momentum focuses on overall behavioral trends rather than penalizing you for a single missed day.
            </p>
          </div>

          <div class="bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl">
            <div class="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
              <UIcon name="i-lucide-hourglass" class="w-6 h-6" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Rhythm > Routine</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Align habits with your body's energy levels. The reflection engine maps your peak completion times to help you stack habits where they fit naturally.
            </p>
          </div>

          <div class="bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <UIcon name="i-lucide-fingerprint" class="w-6 h-6" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Calm & Privacy First</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              No invasive notifications, no pushy alerts, no social pressure. A quiet space designed for pure focus on building self-awareness.
            </p>
          </div>
        </div>
      </div>

      <!-- FINAL CTA -->
      <div class="mt-32 mb-20 text-center">
        <h2 class="text-3xl font-bold mb-8">Start building consistency.</h2>
        <template v-if="session?.user">
          <UButton
            to="/dashboard"
            color="black"
            size="xl"
            class="rounded-full px-10 font-medium"
            icon="i-lucide-arrow-right"
          >
            Go to Dashboard
          </UButton>
        </template>
        <template v-else>
          <UButton
            to="/login"
            color="black"
            size="xl"
            class="rounded-full px-10 font-medium"
            icon="i-simple-icons-google"
          >
            Continue with Google
          </UButton>
        </template>
      </div>
    </div>
  </div>
</template>
