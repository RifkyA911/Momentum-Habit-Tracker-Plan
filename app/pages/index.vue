<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Mock heatmap data for preview
const previewHeatmap = Array.from({ length: 28 }, () => Math.floor(Math.random() * 5))
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Subtle Background Glow -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

    <div class="max-w-5xl mx-auto px-6 pt-32 pb-20 text-center relative z-10">
      
      <!-- HERO SECTION -->
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-6 border border-emerald-500/20">
        <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
        <span>Meet Momentum AI</span>
      </div>

      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
        Build momentum,<br>
        not motivation.
      </h1>

      <p class="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
        AI-powered habit tracking designed for consistency. Minimal, fast, and driven by dopamine-fueled UX.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <UButton 
          to="/login"
          color="black"
          size="xl"
          class="rounded-full px-8 w-full sm:w-auto font-medium"
        >
          Continue with Google
        </UButton>
        
        <UButton 
          to="/dashboard"
          color="gray"
          variant="ghost"
          size="xl"
          class="rounded-full px-8 w-full sm:w-auto font-medium ring-1 ring-gray-200 dark:ring-gray-800"
        >
          View Demo
        </UButton>
      </div>

      <!-- INTERACTIVE HEATMAP PREVIEW -->
      <div class="mt-20 max-w-3xl mx-auto bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl shadow-emerald-900/5">
        <div class="text-left mb-6">
          <h3 class="font-semibold text-lg flex items-center space-x-2">
            <UIcon name="i-lucide-activity" class="w-5 h-5 text-emerald-500" />
            <span>Consistency Heatmap</span>
          </h3>
          <p class="text-sm text-gray-500">Visualize your streak seamlessly.</p>
        </div>

        <div class="flex flex-wrap gap-2 justify-center">
          <div 
            v-for="(level, index) in previewHeatmap" 
            :key="index"
            class="w-6 h-6 sm:w-8 sm:h-8 rounded-[4px] transition-all duration-300 hover:scale-110 cursor-pointer"
            :class="[
              level === 0 ? 'bg-gray-100 dark:bg-gray-800' : '',
              level === 1 ? 'bg-emerald-200 dark:bg-emerald-900/60' : '',
              level === 2 ? 'bg-emerald-400 dark:bg-emerald-700/80' : '',
              level === 3 ? 'bg-emerald-500 dark:bg-emerald-500' : '',
              level === 4 ? 'bg-emerald-600 dark:bg-emerald-400' : ''
            ]"
          ></div>
        </div>
      </div>

      <!-- FEATURES & AI INSIGHT PREVIEW -->
      <div class="mt-32 text-left grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- AI Card Preview -->
        <div class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-[#020617] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <UIcon name="i-lucide-brain" class="w-8 h-8 text-emerald-500 mb-6" />
          <h3 class="text-2xl font-bold mb-4">AI Insights that understand you.</h3>
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm shadow-sm">
              "You are 42% more consistent on weekdays. Try pairing your weekend habits with breakfast."
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm shadow-sm opacity-80">
              "Your strongest habit completion time is 8 PM."
            </div>
          </div>
        </div>

        <!-- Minimal Features -->
        <div class="p-8 flex flex-col justify-center">
          <h3 class="text-2xl font-bold mb-8">Everything you need. Nothing you don't.</h3>
          <ul class="space-y-6">
            <li class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-zap" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">Instant check-ins</h4>
                <p class="text-sm text-gray-500">Optimistic UI makes it feel instantaneous.</p>
              </div>
            </li>
            <li class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-sparkles" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">AI insights</h4>
                <p class="text-sm text-gray-500">Actionable advice powered by LLaMA 3.</p>
              </div>
            </li>
            <li class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <UIcon name="i-lucide-flame" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">Streak tracking</h4>
                <p class="text-sm text-gray-500">Don't break the chain. Build momentum.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- FINAL CTA -->
      <div class="mt-32 mb-20 text-center">
        <h2 class="text-3xl font-bold mb-8">Start building consistency.</h2>
        <UButton 
          to="/login"
          color="black"
          size="xl"
          class="rounded-full px-10 font-medium"
          icon="i-simple-icons-google"
        >
          Continue with Google
        </UButton>
      </div>

    </div>
  </div>
</template>
