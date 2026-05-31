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

// Rotating phrases for hero section
const phrases = [
  "Motivation Is Overrated",
  "Motivation Doesn't Last",
  "Motivation Is a Lie",
  "Stop Waiting for Motivation",
  "Motivation Won't Save You",
  "Discipline Beats Motivation",
  "Motivation Fades. Systems Stay.",
  "Motivation Is Temporary. Habits Are Permanent.",
  "Forget Motivation. Build Habits.",
  "Motivation Gets You Started. Habits Keep You Going.",
  "Motivation Fades. Habits Stay.",
  "Stop Waiting for Motivation."
]

const currentPhraseIndex = ref(0)
const isTransitioning = ref(false)
const currentWords = computed(() => phrases[currentPhraseIndex.value].split(' '))

const rotatePhrase = () => {
  isTransitioning.value = true
  setTimeout(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % phrases.length
    setTimeout(() => {
      isTransitioning.value = false
    }, 100)
  }, 300)
}

onMounted(() => {
  setInterval(rotatePhrase, 3000)
})

// Feedback form state
const feedbackForm = ref({
  rating: 0,
  name: '',
  email: '',
  category: '',
  feedback: ''
})

const isSubmitting = ref(false)
const showThankYouModal = ref(false)

const submitFeedback = async () => {
  isSubmitting.value = true

  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        rating: feedbackForm.value.rating,
        name: feedbackForm.value.name,
        email: feedbackForm.value.email,
        category: feedbackForm.value.category,
        feedback: feedbackForm.value.feedback
      }
    })

    isSubmitting.value = false
    showThankYouModal.value = true

    // Play tada sound
    playTadaSound()
  } catch (error) {
    console.error('Failed to submit feedback:', error)
    isSubmitting.value = false
  }
}

const playTadaSound = () => {
  // Use Web Audio API to create a simple success sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.error('Failed to play sound:', error)
  }
}

const closeThankYouModal = () => {
  showThankYouModal.value = false
  // Reset form
  feedbackForm.value = {
    rating: 0,
    name: '',
    email: '',
    category: '',
    feedback: ''
  }
}
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
      <div class="orb orb-4"></div>
      <div class="orb orb-5"></div>
    </div>

    <!-- Floating Particles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
      <div class="particle particle-6"></div>
      <div class="particle particle-7"></div>
      <div class="particle particle-8"></div>
      <div class="particle particle-9"></div>
      <div class="particle particle-10"></div>
      <div class="particle particle-11"></div>
      <div class="particle particle-12"></div>
      <div class="particle particle-13"></div>
      <div class="particle particle-14"></div>
      <div class="particle particle-15"></div>
    </div>

    <section class="max-w-5xl mx-auto px-6 pt-32 pb-32 text-center relative z-10 animate-on-scroll fade-up">
      <!-- HERO SECTION -->
      <div
        class="hero-badge inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium text-sm mb-6 border border-primary-500/20 shimmer-badge">
        <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
        <span>Meet Momentum AI</span>
      </div>

      <h1
        class="hero-title text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white  leading-tight">
        Build Your
      </h1>
      <h1
        class="hero-title text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
        Momentum
      </h1>

      <p class="hero-subtitle text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-4">
        AI-powered habit tracking with behavioral insights, smart templates, and dopamine-fueled UX. Build systems that
        last.
      </p>

      <p class="text-base text-gray-400 dark:text-gray-500 max-w-2xl mx-auto mb-6">
        Stop relying on fleeting motivation. Create sustainable habits through intelligent systems, behavioral science,
        and consistent action.
      </p>

      <div class="rotating-phrase-container mb-10 h-[70px] md:h-auto">
        <div class="rotating-phrase-text inline-flex flex-wrap justify-center gap-2"
          :class="{ 'phrase-out': isTransitioning, 'phrase-in': !isTransitioning }">
          <span v-for="(word, index) in currentWords" :key="`${currentPhraseIndex}-${index}`"
            class="word-animate text-sm md:text-base font-semibold" :class="{ 'word-visible': !isTransitioning }"
            :style="{ animationDelay: `${index * 50}ms` }">
            {{ word }}
          </span>
        </div>
      </div>

      <div class="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
        <template v-if="session?.user">
          <UButton to="/dashboard" color="black" size="xl"
            class="text-center justify-center rounded-full px-8 w-full sm:w-auto font-medium btn-glow"
            icon="i-lucide-arrow-right">
            Go to Dashboard
          </UButton>
        </template>
        <template v-else>
          <UButton to="/login" color="black" size="xl"
            class="text-center justify-center rounded-full px-8 w-full sm:w-auto font-medium btn-glow"
            icon="i-simple-icons-google">
            Continue with Google
          </UButton>
        </template>

        <UButton to="/demo" color="neutral" variant="ghost" size="xl"
          class="text-center justify-center rounded-full px-8 w-full sm:w-auto font-medium ring-1 ring-gray-200 dark:ring-gray-800 btn-subtle">
          View Demo
        </UButton>
      </div>
    </section>

    <!-- SIGNATURE FEATURES -->
    <section class="max-w-5xl mx-auto px-6 animate-on-scroll fade-up mt-20">
      <div class="text-center mb-12">
        <div
          class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold tracking-wide uppercase mb-4">
          <UIcon name="i-lucide-star" class="w-3.5 h-3.5" />
          <span>Signature Features</span>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">What makes Momentum different</h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Three powerful features designed to help you build
          lasting habits.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Feature 1: Consistency Heatmap -->
        <div class="animate-on-scroll fade-up stagger-1">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:-translate-y-1 transition-all duration-500 hover:shadow-lg">
            <div class="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4">
              <UIcon name="i-lucide-grid-3x3" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Consistency Heatmap</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Visualize your progress with GitHub-style heatmap. Every completed habit paints a tile — see your
              behavioral
              patterns at a glance.
            </p>
            <!-- Mini heatmap demo -->
            <div class="grid grid-cols-7 gap-1 mb-4">
              <div v-for="(level, index) in heatmapShowcase.slice(0, 14)" :key="index"
                class="aspect-square rounded-[3px]" :class="[
                  level === 0 ? 'bg-gray-100 dark:bg-gray-800' : '',
                  level === 1 ? 'bg-primary-200 dark:bg-primary-900/60' : '',
                  level === 2 ? 'bg-primary-400 dark:bg-primary-700/80' : '',
                  level === 3 ? 'bg-primary-500' : '',
                  level === 4 ? 'bg-primary-600 dark:bg-primary-400' : '',
                ]" />
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <span>Less</span>
              <div class="flex gap-0.5">
                <div class="w-2 h-2 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                <div class="w-2 h-2 rounded-sm bg-primary-200 dark:bg-primary-900/60"></div>
                <div class="w-2 h-2 rounded-sm bg-primary-500"></div>
                <div class="w-2 h-2 rounded-sm bg-primary-600 dark:bg-primary-400"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        <!-- Feature 2: AI Behavioral Insights -->
        <div class="animate-on-scroll fade-up stagger-2">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:-translate-y-1 transition-all duration-500 hover:shadow-lg">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <UIcon name="i-lucide-brain" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">AI Behavioral Insights</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Get personalized reflections on your habit patterns. AI analyzes your last 30 days to provide calm,
              data-backed insights without motivational fluff.
            </p>
            <!-- AI insight preview -->
            <div
              class="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-xs mb-3">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <p class="text-gray-600 dark:text-gray-300">"You're 42% more consistent on weekdays. Try pairing weekend
                  habits with breakfast."</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <UIcon name="i-lucide-check-circle" class="w-3 h-3" />
              <span>Powered by LLaMA 3</span>
            </div>
          </div>
        </div>

        <!-- Feature 3: Magic Create -->
        <div class="animate-on-scroll fade-up stagger-3">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:-translate-y-1 transition-all duration-500 hover:shadow-lg">
            <div class="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4">
              <UIcon name="i-lucide-wand-2" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Magic Create</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Describe your goal, and AI generates complete habit templates with tasks. No more blank page anxiety — get
              started in seconds.
            </p>
            <!-- Magic create preview -->
            <div class="mb-3">
              <div
                class="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-3 rounded-xl border border-pink-100 dark:border-pink-800/30">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xl">🏋️</span>
                  <span class="font-semibold text-gray-900 dark:text-white text-sm">Morning Workout</span>
                </div>
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div class="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                    <span>15 min Stretch</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div class="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                    <span>Pushups set</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <UIcon name="i-lucide-zap" class="w-3 h-3" />
              <span>Instant habit templates</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section class="max-w-5xl mx-auto px-6 mt-32 text-left">
      <div class="animate-on-scroll fade-up text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Everything you need. Nothing you don't.
        </h2>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          Designed for focus, speed, and consistency.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Feature 1: Drag & Drop -->
        <div class="animate-on-scroll fade-up stagger-1 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-6 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-grip-vertical" class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Drag & Drop Reordering</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Organize habits and tasks intuitively. Drag to reorder your daily routine to match your workflow.
            </p>
          </div>
        </div>

        <!-- Feature 2: Sound Effects -->
        <div class="animate-on-scroll fade-up stagger-2 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-6 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/5 hover:border-green-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-volume-2" class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Dopamine Sound Effects</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Satisfying audio feedback for every action. Success sounds, magic effects, and navigation cues make
              tracking
              feel rewarding.
            </p>
          </div>
        </div>

        <!-- Feature 3: Progress Tracking -->
        <div class="animate-on-scroll fade-up stagger-3 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-6 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-bar-chart-2" class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Progress Tracking</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Visual progress bars for each habit. See completion rates at a glance and celebrate your daily wins.
            </p>
          </div>
        </div>

        <!-- Feature 4: Streak Tracking -->
        <div class="animate-on-scroll fade-up stagger-1 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-6 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-flame" class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Smart Streak Tracking</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Track your consistency without the shame. Momentum focuses on trends, not punishing you for missed days.
            </p>
          </div>
        </div>

        <!-- Feature 5: History Tracker -->
        <div class="animate-on-scroll fade-up stagger-2 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-6 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-pink-500/5 hover:border-pink-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-history" class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">History Timeline</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              View and edit past completions. Toggle tasks on any date to correct mistakes or log forgotten activities.
            </p>
          </div>
        </div>

        <!-- Feature 6: Momentum Stats -->
        <div class="animate-on-scroll fade-up stagger-3 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-6 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-trophy" class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Momentum Stats</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Best streak, completion rate, most consistent habit, peak performance time — data-driven insights to
              optimize
              your routine.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- THE MOMENTUM METHOD -->
    <section class="max-w-5xl mx-auto px-6 mt-32 text-left">
      <div class="animate-on-scroll fade-up text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          The Momentum Method
        </h2>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          AI-powered behavioral science meets dopamine-fueled design. Here's why Momentum works.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="animate-on-scroll fade-up stagger-1 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-brain" class="w-6 h-6" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI-Powered Reflection</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Traditional trackers show data. Momentum shows patterns. AI analyzes your behavior to provide calm,
              actionable
              insights without motivational fluff.
            </p>
          </div>
        </div>

        <div class="animate-on-scroll fade-up stagger-2 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/5 hover:border-green-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-zap" class="w-6 h-6" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Dopamine-Fueled UX</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Sound effects, instant feedback, and satisfying interactions make tracking feel rewarding. Build positive
              associations with habit completion.
            </p>
          </div>
        </div>

        <div class="animate-on-scroll fade-up stagger-3 group">
          <div
            class="h-full bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-gray-150 dark:border-gray-800 p-8 rounded-3xl hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/20">
            <div
              class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <UIcon name="i-lucide-shield-check" class="w-6 h-6" />
            </div>
            <h4 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">No Shame, No Pressure</h4>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              No invasive notifications, no social pressure, no guilt trips. A calm, private space designed for genuine
              self-improvement at your own pace.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="max-w-5xl mx-auto px-6 animate-on-scroll fade-up mt-32 mb-20 text-center">
      <h2 class="text-3xl font-bold mb-4">Start building consistency.</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        A simple habit tracker designed to help you build better habits through consistency and behavioral insights.
      </p>
      <template v-if="session?.user">
        <UButton to="/dashboard" color="black" size="xl" class="rounded-full px-10 font-medium btn-glow"
          icon="i-lucide-arrow-right">
          Go to Dashboard
        </UButton>
      </template>
      <template v-else>
        <UButton to="/login" color="black" size="xl" class="rounded-full px-10 font-medium btn-glow"
          icon="i-simple-icons-google">
          Continue with Google
        </UButton>
      </template>
    </section>

    <!-- FEEDBACK SECTION -->
    <section class="max-w-4xl mx-auto px-6 animate-on-scroll fade-up mt-32 mb-20">
      <div class="text-center mb-12">
        <div
          class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold tracking-wide uppercase mb-4">
          <UIcon name="i-lucide-message-square" class="w-3.5 h-3.5" />
          <span>Feedback</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          We'd Love to Hear From You
        </h2>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          Help us improve Momentum by sharing your thoughts.
        </p>
      </div>

      <div
        class="bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 shadow-lg">
        <form @submit.prevent="submitFeedback" class="space-y-6">
          <!-- Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              ⭐ Rate Your Experience
            </label>
            <div class="flex gap-2">
              <button v-for="star in 5" :key="star" type="button" @click="feedbackForm.rating = star"
                class="w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
                :class="star <= feedbackForm.rating ? 'bg-yellow-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'">
                <UIcon :name="star <= feedbackForm.rating ? 'i-lucide-star' : 'i-lucide-star'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name <span class="text-red-500">*</span>
            </label>
            <UInput v-model="feedbackForm.name" type="text" placeholder="Your name" size="lg" class="w-full" required />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <UInput v-model="feedbackForm.email" type="email" placeholder="your@email.com" size="lg" class="w-full"
              required />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <USelect v-model="feedbackForm.category" :items="[
              { label: 'Bug', value: 'bug' },
              { label: 'Feature Request', value: 'feature' },
              { label: 'UI/UX', value: 'uiux' },
              { label: 'Other', value: 'other' }
            ]" placeholder="Select a category" size="lg" class="w-full" />
          </div>

          <!-- Feedback -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback
            </label>
            <UTextarea v-model="feedbackForm.feedback" placeholder="Share your thoughts..." :rows="4" size="lg"
              class="w-full" />
          </div>

          <!-- Submit Button -->
          <div class="flex justify-center">
            <UButton type="submit" color="primary" size="xl" :loading="isSubmitting" :disabled="isSubmitting"
              class="rounded-full px-10 py-4 font-medium">
              Submit Feedback
            </UButton>
          </div>
        </form>
      </div>
    </section>

    <!-- THANK YOU MODAL -->
    <UModal v-model:open="showThankYouModal">
      <template #content>

        <UCard>
          <div class="relative p-8 md:p-12 text-center">
            <!-- Close button -->
            <button @click="closeThankYouModal"
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <UIcon name="i-lucide-x" class="w-4 h-4 text-gray-500" />
            </button>

            <!-- Success Icon -->
            <div
              class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
              <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-green-500" />
            </div>

            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Thank You! 🎉
            </h3>

            <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Your feedback has been successfully submitted. We appreciate you taking the time to help us improve
              Momentum. Your insights are invaluable in shaping the future of our product.
            </p>

            <div class="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 mb-6">
              <p class="text-sm text-primary-700 dark:text-primary-300">
                <UIcon name="i-lucide-sparkles" class="w-4 h-4 inline mr-1" />
                We'll review your feedback and get back to you if needed.
              </p>
            </div>

            <UButton @click="closeThankYouModal" color="primary" size="lg" class="rounded-full px-8 font-medium">
              Close
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- FIREWORKS CONTAINER -->
    <div v-if="showThankYouModal" class="fireworks-container fixed inset-0 pointer-events-none z-[200]">
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="firework"></div>
      <div class="confetti"></div>
      <div class="confetti"></div>
      <div class="confetti"></div>
      <div class="confetti"></div>
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
  filter: blur(100px);
  opacity: 0.2;
}

.orb-1 {
  width: 600px;
  height: 600px;
  top: -7%;
  left: 5%;
  background: radial-gradient(circle, var(--color-primary-500), transparent 70%);
  animation: orb-drift-1 20s ease-in-out infinite;
}

.orb-2 {
  width: 500px;
  height: 500px;
  top: 30%;
  right: -18%;
  background: radial-gradient(circle, #a855f7, transparent 70%);
  animation: orb-drift-2 25s ease-in-out infinite;
}

.orb-3 {
  width: 450px;
  height: 450px;
  bottom: -20%;
  left: 18%;
  background: radial-gradient(circle, #3b82f6, transparent 70%);
  animation: orb-drift-3 22s ease-in-out infinite;
}

.orb-4 {
  width: 400px;
  height: 400px;
  top: 50%;
  left: -10%;
  background: radial-gradient(circle, #ec4899, transparent 70%);
  animation: orb-drift-4 28s ease-in-out infinite;
}

.orb-5 {
  width: 350px;
  height: 350px;
  bottom: 10%;
  right: 5%;
  background: radial-gradient(circle, #14b8a6, transparent 70%);
  animation: orb-drift-5 24s ease-in-out infinite;
}

@keyframes orb-drift-1 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(60px, -40px) scale(1.1);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.95);
  }
}

@keyframes orb-drift-2 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(-50px, 40px) scale(0.9);
  }

  66% {
    transform: translate(40px, -30px) scale(1.1);
  }
}

@keyframes orb-drift-3 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(50px, -50px) scale(1.15);
  }
}

@keyframes orb-drift-4 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(40px, 30px) scale(1.05);
  }

  66% {
    transform: translate(-20px, -40px) scale(0.95);
  }
}

@keyframes orb-drift-5 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(-30px, 20px) scale(1.1);
  }
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

.particle-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
  animation-duration: 14s;
}

.particle-2 {
  top: 60%;
  left: 80%;
  animation-delay: 2s;
  animation-duration: 11s;
}

.particle-3 {
  top: 30%;
  left: 70%;
  animation-delay: 4s;
  animation-duration: 16s;
}

.particle-4 {
  top: 70%;
  left: 25%;
  animation-delay: 6s;
  animation-duration: 13s;
}

.particle-5 {
  top: 45%;
  left: 55%;
  animation-delay: 3s;
  animation-duration: 15s;
}

.particle-6 {
  top: 15%;
  left: 85%;
  animation-delay: 1s;
  animation-duration: 12s;
}

.particle-7 {
  top: 75%;
  left: 45%;
  animation-delay: 5s;
  animation-duration: 17s;
}

.particle-8 {
  top: 35%;
  left: 10%;
  animation-delay: 7s;
  animation-duration: 14s;
}

.particle-9 {
  top: 55%;
  left: 90%;
  animation-delay: 2.5s;
  animation-duration: 11s;
}

.particle-10 {
  top: 80%;
  left: 15%;
  animation-delay: 4.5s;
  animation-duration: 16s;
}

.particle-11 {
  top: 25%;
  left: 40%;
  animation-delay: 6.5s;
  animation-duration: 13s;
}

.particle-12 {
  top: 65%;
  left: 60%;
  animation-delay: 1.5s;
  animation-duration: 15s;
}

.particle-13 {
  top: 40%;
  left: 30%;
  animation-delay: 3.5s;
  animation-duration: 12s;
}

.particle-14 {
  top: 85%;
  left: 70%;
  animation-delay: 5.5s;
  animation-duration: 17s;
}

.particle-15 {
  top: 50%;
  left: 5%;
  animation-delay: 7.5s;
  animation-duration: 14s;
}

@keyframes particle-float {

  0%,
  100% {
    opacity: 0;
    transform: translateY(0px) scale(1);
  }

  20% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.3;
    transform: translateY(-80px) scale(1.5);
  }

  80% {
    opacity: 0.5;
  }
}

/* ========================================
   HERO ENTRANCE ANIMATIONS
   ======================================== */
.hero-badge {
  animation: hero-fade-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-title {
  animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.hero-subtitle {
  animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

.hero-cta {
  animation: hero-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
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
.stagger-1 {
  transition-delay: 0ms;
}

.stagger-2 {
  transition-delay: 150ms;
}

.stagger-3 {
  transition-delay: 300ms;
}

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

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.75;
  }
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

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

/* ========================================
   ROTATING PHRASE ANIMATION
   ======================================== */
.rotating-phrase-container {
  min-height: 2rem;
}

.rotating-phrase-text {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.rotating-phrase-text.phrase-out {
  opacity: 0;
  transform: translateY(-8px);
}

.rotating-phrase-text.phrase-in {
  opacity: 1;
  transform: translateY(0);
}

.word-animate {
  opacity: 0;
  color: var(--color-primary-500);
  animation: word-fade-in 0.4s ease forwards;
}

.word-animate.word-visible {
  opacity: 1;
}

@keyframes word-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   FIREWORKS ANIMATION
   ======================================== */
.firework {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: firework-explode 1.5s ease-out forwards;
}

@keyframes firework-explode {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0);
  }
}

/* Create multiple firework particles */
.fireworks-container::before,
.fireworks-container::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: firework-particle 1s ease-out infinite;
}

.fireworks-container::before {
  background: #ff6b6b;
  top: 20%;
  left: 30%;
  box-shadow: 0 0 20px #ff6b6b, 0 0 40px #ff6b6b;
}

.fireworks-container::after {
  background: #4ecdc4;
  top: 40%;
  right: 25%;
  animation-delay: 0.5s;
  box-shadow: 0 0 20px #4ecdc4, 0 0 40px #4ecdc4;
}

/* Additional firework bursts */
.fireworks-container .firework {
  position: absolute;
  animation: firework-burst 1.2s ease-out forwards;
}

.fireworks-container .firework:nth-child(1) {
  top: 15%;
  left: 20%;
  background: #ffd93d;
  box-shadow: 0 0 30px #ffd93d, 0 0 60px #ffd93d;
  animation-delay: 0.1s;
}

.fireworks-container .firework:nth-child(2) {
  top: 60%;
  right: 15%;
  background: #6bcb77;
  box-shadow: 0 0 30px #6bcb77, 0 0 60px #6bcb77;
  animation-delay: 0.3s;
}

.fireworks-container .firework:nth-child(3) {
  bottom: 20%;
  left: 40%;
  background: #4d96ff;
  box-shadow: 0 0 30px #4d96ff, 0 0 60px #4d96ff;
  animation-delay: 0.5s;
}

.fireworks-container .firework:nth-child(4) {
  top: 30%;
  right: 40%;
  background: #ff6b6b;
  box-shadow: 0 0 30px #ff6b6b, 0 0 60px #ff6b6b;
  animation-delay: 0.7s;
}

.fireworks-container .firework:nth-child(5) {
  bottom: 40%;
  right: 30%;
  background: #ffd93d;
  box-shadow: 0 0 30px #ffd93d, 0 0 60px #ffd93d;
  animation-delay: 0.9s;
}

@keyframes firework-burst {
  0% {
    opacity: 1;
    transform: scale(0);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(2);
  }
}

/* Confetti effect */
.fireworks-container .confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  animation: confetti-fall 3s ease-out forwards;
}

.fireworks-container .confetti:nth-child(6) {
  top: 10%;
  left: 10%;
  background: #ff6b6b;
  animation-delay: 0.2s;
}

.fireworks-container .confetti:nth-child(7) {
  top: 15%;
  right: 15%;
  background: #ffd93d;
  animation-delay: 0.4s;
}

.fireworks-container .confetti:nth-child(8) {
  bottom: 15%;
  left: 15%;
  background: #6bcb77;
  animation-delay: 0.6s;
}

.fireworks-container .confetti:nth-child(9) {
  bottom: 10%;
  right: 10%;
  background: #4d96ff;
  animation-delay: 0.8s;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }

  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}
</style>
