<script setup lang="ts">
definePageMeta({ layout: "default" });

// Use native useFetch to get session data during SSR and hydration
const { data: session } = await useFetch('/api/auth/get-session', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
})

// Demo heatmap pattern for visual showcase (deterministic, not random)
const heatmapShowcase = [
  0, 1, 2, 3, 4, 4, 3,
  2, 0, 1, 3, 4, 4, 4,
  3, 2, 0, 2, 3, 4, 3,
  1, 2, 3, 4, 4, 4, 4
]

// Intersection Observer for scroll-triggered animations
const observerCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible')
    }
  })
}

onMounted(() => {
  const observer = new IntersectionObserver(observerCallback, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  })

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<template>
  <div class="relative overflow-hidden landing-page">
    <!-- Animated Background Orbs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <!-- Floating Particles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
    </div>

    <div class="max-w-5xl mx-auto px-6 pt-32 pb-20 text-center relative z-10">
      <!-- HERO SECTION -->
      <div class="hero-badge inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium text-sm mb-6 border border-primary-500/20 shimmer-badge">
        <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
        <span>Meet Momentum AI</span>
      </div>

      <h1 class="hero-title text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
        <span class="hero-word hero-word-1">Build</span>
        <span class="hero-word hero-word-2">momentum,</span><br />
        <span class="hero-word hero-word-3">not</span>
        <span class="hero-word hero-word-4">motivation.</span>
      </h1>

      <p class="hero-subtitle text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
        AI-powered habit tracking designed for consistency. Minimal, fast, and
        driven by dopamine-fueled UX.
      </p>

      <div class="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
        <template v-if="session?.user">
          <UButton
            to="/dashboard"
            color="black"
            size="xl"
            class="rounded-full px-8 w-full sm:w-auto font-medium btn-glow"
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
            class="rounded-full px-8 w-full sm:w-auto font-medium btn-glow"
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
          class="rounded-full px-8 w-full sm:w-auto font-medium ring-1 ring-gray-200 dark:ring-gray-800 btn-subtle"
        >
          View Demo
        </UButton>
      </div>

      <!-- HEATMAP FEATURE SHOWCASE -->
      <div class="animate-on-scroll fade-up mt-20 max-w-3xl mx-auto">
        <div class="heatmap-showcase relative bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-primary-900/5 overflow-hidden">
          <!-- Decorative gradient sweep -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

          <div class="relative z-10">
            <!-- Section header -->
            <div class="flex items-center justify-between mb-2">
              <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold tracking-wide uppercase">
                <UIcon name="i-lucide-star" class="w-3.5 h-3.5" />
                <span>Signature Feature</span>
              </div>
            </div>

            <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 text-left">
              Consistency Heatmap
            </h3>
            <p class="text-base text-gray-500 dark:text-gray-400 text-left mb-8 max-w-xl leading-relaxed">
              See your progress come alive. Every completed habit paints a tile — the more consistent you are, the brighter your map glows. One glance tells you everything about your behavioral trends.
            </p>

            <!-- Animated heatmap demo grid -->
            <div class="grid grid-cols-7 gap-1.5 sm:gap-2 mb-8">
              <div
                v-for="(level, index) in heatmapShowcase"
                :key="index"
                class="heatmap-tile"
                :style="{ animationDelay: `${index * 60 + 800}ms` }"
              >
                <div
                  class="w-full aspect-square rounded-[5px] transition-all duration-300 hover:scale-125 hover:rounded-lg cursor-pointer hover:shadow-lg"
                  :class="[
                    level === 0 ? 'bg-gray-100 dark:bg-gray-800 hover:shadow-gray-200/50 dark:hover:shadow-gray-700/30' : '',
                    level === 1 ? 'bg-primary-200 dark:bg-primary-900/60 hover:shadow-primary-200/50' : '',
                    level === 2 ? 'bg-primary-400 dark:bg-primary-700/80 hover:shadow-primary-400/40' : '',
                    level === 3 ? 'bg-primary-500 dark:bg-primary-500 hover:shadow-primary-500/50' : '',
                    level === 4 ? 'bg-primary-600 dark:bg-primary-400 hover:shadow-primary-600/60 tile-pulse' : '',
                  ]"
                />
              </div>
            </div>

            <!-- Heatmap legend & benefits -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <!-- Legend -->
              <div class="flex items-center space-x-2 text-xs text-gray-400">
                <span>Less</span>
                <div class="flex space-x-1">
                  <div class="w-3 h-3 rounded-[3px] bg-gray-100 dark:bg-gray-800"></div>
                  <div class="w-3 h-3 rounded-[3px] bg-primary-200 dark:bg-primary-900/60"></div>
                  <div class="w-3 h-3 rounded-[3px] bg-primary-400 dark:bg-primary-700/80"></div>
                  <div class="w-3 h-3 rounded-[3px] bg-primary-500"></div>
                  <div class="w-3 h-3 rounded-[3px] bg-primary-600 dark:bg-primary-400"></div>
                </div>
                <span>More</span>
              </div>
              <!-- Benefit tags -->
              <div class="flex flex-wrap gap-2">
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  <UIcon name="i-lucide-eye" class="w-3 h-3" />
                  <span>At-a-glance insight</span>
                </span>
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  <UIcon name="i-lucide-trending-up" class="w-3 h-3" />
                  <span>Trend visualization</span>
                </span>
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  <UIcon name="i-lucide-trophy" class="w-3 h-3" />
                  <span>Motivating feedback</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FEATURES & AI INSIGHT PREVIEW -->
      <div class="mt-32 text-left grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- AI Card Preview -->
        <div class="animate-on-scroll fade-left">
          <div
            class="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-[#020617] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-500"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            <UIcon name="i-lucide-brain" class="w-8 h-8 text-primary-500 mb-6 icon-float" />
            <h3 class="text-2xl font-bold mb-4">
              AI Insights that understand you.
            </h3>
            <div class="space-y-3">
              <div
                class="ai-insight-card bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm shadow-sm"
              >
                "You are 42% more consistent on weekdays. Try pairing your weekend
                habits with breakfast."
              </div>
              <div
                class="ai-insight-card ai-insight-card-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm shadow-sm opacity-80"
              >
                "Your strongest habit completion time is 8 PM."
              </div>
            </div>
          </div>
        </div>

        <!-- Minimal Features -->
        <div class="animate-on-scroll fade-right">
          <div class="p-8 flex flex-col justify-center">
            <h3 class="text-2xl font-bold mb-8">
              Everything you need. Nothing you don't.
            </h3>
            <ul class="space-y-6">
              <li class="feature-item flex items-center space-x-4" style="animation-delay: 200ms;">
                <div
                  class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 feature-icon-ring"
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
              <li class="feature-item flex items-center space-x-4" style="animation-delay: 400ms;">
                <div
                  class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 feature-icon-ring"
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
              <li class="feature-item flex items-center space-x-4" style="animation-delay: 600ms;">
                <div
                  class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 feature-icon-ring"
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
      </div>

      <!-- THE MOMENTUM METHOD -->
      <div class="mt-32 text-left">
        <div class="animate-on-scroll fade-up text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            The Momentum Method
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">
            Why traditional habit trackers fail, and how our behavioral-science-backed rhythm works.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="animate-on-scroll fade-up stagger-1 group">
            <div class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/20">
              <div class="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <UIcon name="i-lucide-heart-crack" class="w-6 h-6" />
              </div>
              <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Ditch Shame Streaks</h4>
              <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Streaks should empower you, not hold you hostage. Momentum focuses on overall behavioral trends rather than penalizing you for a single missed day.
              </p>
            </div>
          </div>

          <div class="animate-on-scroll fade-up stagger-2 group">
            <div class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/5 hover:border-green-500/20">
              <div class="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <UIcon name="i-lucide-hourglass" class="w-6 h-6" />
              </div>
              <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Rhythm &gt; Routine</h4>
              <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Align habits with your body's energy levels. The reflection engine maps your peak completion times to help you stack habits where they fit naturally.
              </p>
            </div>
          </div>

          <div class="animate-on-scroll fade-up stagger-3 group">
            <div class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/20">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <UIcon name="i-lucide-fingerprint" class="w-6 h-6" />
              </div>
              <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Calm &amp; Privacy First</h4>
              <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                No invasive notifications, no pushy alerts, no social pressure. A quiet space designed for pure focus on building self-awareness.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- FINAL CTA -->
      <div class="animate-on-scroll fade-up mt-32 mb-20 text-center">
        <h2 class="text-3xl font-bold mb-8">Start building consistency.</h2>
        <template v-if="session?.user">
          <UButton
            to="/dashboard"
            color="black"
            size="xl"
            class="rounded-full px-10 font-medium btn-glow"
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
            class="rounded-full px-10 font-medium btn-glow"
            icon="i-simple-icons-google"
          >
            Continue with Google
          </UButton>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   BACKGROUND ORBS - Floating ambient glow
   ======================================== */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
}

.orb-1 {
  width: 500px;
  height: 500px;
  top: 5%;
  left: 20%;
  background: radial-gradient(circle, var(--color-primary-500), transparent 70%);
  animation: orb-drift-1 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  top: 40%;
  right: 10%;
  background: radial-gradient(circle, #a855f7, transparent 70%);
  animation: orb-drift-2 25s ease-in-out infinite;
}

.orb-3 {
  width: 350px;
  height: 350px;
  bottom: 10%;
  left: 30%;
  background: radial-gradient(circle, #3b82f6, transparent 70%);
  animation: orb-drift-3 22s ease-in-out infinite;
}

@keyframes orb-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(60px, -40px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.95); }
}

@keyframes orb-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-50px, 40px) scale(0.9); }
  66% { transform: translate(40px, -30px) scale(1.1); }
}

@keyframes orb-drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, -50px) scale(1.15); }
}

/* ========================================
   FLOATING PARTICLES
   ======================================== */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-primary-400);
  opacity: 0;
  animation: particle-float 12s ease-in-out infinite;
}

.particle-1 { top: 20%; left: 15%; animation-delay: 0s; animation-duration: 14s; }
.particle-2 { top: 60%; left: 80%; animation-delay: 2s; animation-duration: 11s; }
.particle-3 { top: 30%; left: 70%; animation-delay: 4s; animation-duration: 16s; }
.particle-4 { top: 70%; left: 25%; animation-delay: 6s; animation-duration: 13s; }
.particle-5 { top: 45%; left: 55%; animation-delay: 3s; animation-duration: 15s; }

@keyframes particle-float {
  0%, 100% { opacity: 0; transform: translateY(0px) scale(1); }
  20% { opacity: 0.5; }
  50% { opacity: 0.3; transform: translateY(-80px) scale(1.5); }
  80% { opacity: 0.5; }
}

/* ========================================
   HERO ENTRANCE ANIMATIONS
   ======================================== */
.hero-badge {
  animation: hero-fade-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-word {
  display: inline-block;
  animation: hero-word-reveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-word-1 { animation-delay: 0.2s; }
.hero-word-2 { animation-delay: 0.35s; }
.hero-word-3 { animation-delay: 0.5s; }
.hero-word-4 { animation-delay: 0.65s; }

.hero-subtitle {
  animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both;
}

.hero-cta {
  animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both;
}

@keyframes hero-fade-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-word-reveal {
  from {
    opacity: 0;
    transform: translateY(40px) rotateX(20deg);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
    filter: blur(0);
  }
}

@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   SCROLL-TRIGGERED ANIMATIONS
   ======================================== */
.animate-on-scroll {
  will-change: transform, opacity;
}

.animate-on-scroll.fade-up {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.fade-left {
  opacity: 0;
  transform: translateX(-40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.fade-right {
  opacity: 0;
  transform: translateX(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translate(0, 0);
}

/* Stagger delays for cards */
.stagger-1 { transition-delay: 0ms; }
.stagger-2 { transition-delay: 150ms; }
.stagger-3 { transition-delay: 300ms; }

/* ========================================
   HEATMAP TILES ANIMATION
   ======================================== */
.heatmap-tile {
  animation: tile-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes tile-pop-in {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Subtle pulse on highest-level tiles */
.tile-pulse {
  animation: subtle-pulse 3s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
}

/* Heatmap showcase card hover glow */
.heatmap-showcase {
  transition: box-shadow 0.5s ease, border-color 0.5s ease;
}

.heatmap-showcase:hover {
  box-shadow: 0 25px 60px -12px rgba(var(--color-primary-500), 0.08),
              0 0 0 1px rgba(var(--color-primary-500), 0.05);
}

/* ========================================
   AI INSIGHT CARDS TYPING EFFECT
   ======================================== */
.ai-insight-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ai-insight-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

/* ========================================
   BUTTON EFFECTS
   ======================================== */
.btn-glow {
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.btn-subtle {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.btn-subtle:hover {
  transform: translateY(-1px);
}

/* ========================================
   FEATURE ITEMS
   ======================================== */
.feature-icon-ring {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover .feature-icon-ring {
  transform: scale(1.15);
  box-shadow: 0 0 20px rgba(var(--color-primary-500), 0.15);
}

/* ========================================
   ICON FLOAT
   ======================================== */
.icon-float {
  animation: icon-bob 4s ease-in-out infinite;
}

@keyframes icon-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>
