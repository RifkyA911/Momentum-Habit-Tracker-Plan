<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

const toast = useToast()
const isCreateModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingHabit = ref<any>(null)
const habits = ref<any[]>([])
const heatmapData = ref<{date: string, count: number}[]>([])
const isLoading = ref(true)
const isAnalyzing = ref(false)

// Drag and drop state for habits
const dragHabitIndex = ref<number | null>(null)
const dragOverHabitIndex = ref<number | null>(null)

const LS_KEY = 'momentum-demo-habits'

const calculateHeatmap = () => {
  const counts: Record<string, number> = {}
  habits.value.forEach(habit => {
    habit.tasks.forEach((task: any) => {
      if (task.completed && task.completedAt) {
        const date = new Date(task.completedAt).toISOString().split('T')[0]
        counts[date] = (counts[date] || 0) + 1
      }
    })
  })

  // Also add some mock historical data to make the heatmap look alive
  const today = new Date()
  for(let i=1; i<90; i++) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dStr = d.toISOString().split('T')[0]
    if (!counts[dStr] && Math.random() > 0.5) {
      counts[dStr] = Math.floor(Math.random() * 4)
    }
  }

  heatmapData.value = Object.keys(counts).map(date => ({ date, count: counts[date] }))
}

// Helper to check if a date string is today
const isToday = (dateStr: string) => {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear()
}

// Computed property for tasks completed today
const tasksCompletedToday = computed(() => {
  let count = 0
  const today = new Date()
  habits.value.forEach(habit => {
    habit.tasks.forEach((task: any) => {
      if (task.completed && task.completedAt && isToday(task.completedAt)) {
        count++
      }
    })
  })
  return count
})

const saveDemo = () => {
  localStorage.setItem(LS_KEY, JSON.stringify(habits.value))
  calculateHeatmap()
}

const loadDemo = () => {
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      // Check if it's the old flat todo structure vs new habits structure
      if (parsed.length > 0 && parsed[0].title) {
        habits.value = parsed
      } else {
        throw new Error('Old structure')
      }
    } catch {
      initMockHabits()
    }
  } else {
    initMockHabits()
  }
  calculateHeatmap()
  isLoading.value = false
}

const initMockHabits = () => {
  habits.value = [
    {
      id: crypto.randomUUID(),
      title: 'Morning Routine',
      description: 'Start the day right',
      icon: '☕',
      color: '#f97316',
      tasks: [
        { id: crypto.randomUUID(), text: 'Drink 2 glasses of water', completed: false, completedAt: null },
        { id: crypto.randomUUID(), text: 'Stretch for 5 mins', completed: true, completedAt: new Date().toISOString() }
      ]
    }
  ]
  saveDemo()
}

const openCreateModal = () => {
  modalMode.value = 'create'
  editingHabit.value = null
  isCreateModalOpen.value = true
}

const openEditModal = (habit: any) => {
  modalMode.value = 'edit'
  editingHabit.value = habit
  isCreateModalOpen.value = true
}

const submitHabit = (data: any) => {
  if (modalMode.value === 'create') {
    habits.value.unshift({
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      icon: data.icon,
      color: data.color,
      tasks: []
    })
    toast.add({ title: 'Habit created', description: `${data.icon} ${data.title} added successfully.`, color: 'green' })
  } else {
    const idx = habits.value.findIndex(h => h.id === data.id)
    if (idx !== -1) {
      habits.value[idx].title = data.title
      habits.value[idx].description = data.description
      habits.value[idx].icon = data.icon
      habits.value[idx].color = data.color
      toast.add({ title: 'Habit updated', description: 'Changes saved successfully.', color: 'green' })
    }
  }
  saveDemo()
}

const deleteHabit = (id: string) => {
  habits.value = habits.value.filter(h => h.id !== id)
  toast.add({ title: 'Habit deleted', description: 'The habit and its tasks were removed.', color: 'red' })
  saveDemo()
}

const addTask = (habitId: string, text: string) => {
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) {
    habit.tasks.unshift({
      id: crypto.randomUUID(),
      text,
      completed: false,
      completedAt: null
    })
    saveDemo()
  }
}

const toggleTask = (task: any) => {
  task.completed = !task.completed
  task.completedAt = task.completed ? new Date().toISOString() : null
  saveDemo()
}

const deleteTask = (taskId: string) => {
  for (const habit of habits.value) {
    habit.tasks = habit.tasks.filter((t: any) => t.id !== taskId)
  }
  saveDemo()
}

const reorderTasks = (habitId: string, fromIdx: number, toIdx: number) => {
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) {
    const tasks = [...habit.tasks]
    const [moved] = tasks.splice(fromIdx, 1)
    tasks.splice(toIdx, 0, moved)
    habit.tasks = tasks
    saveDemo()
  }
}

// --- Habit Drag & Drop ---
const onDragHabitStart = (idx: number, e: DragEvent) => {
  dragHabitIndex.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }
}

const onDragHabitOver = (idx: number, e: DragEvent) => {
  e.preventDefault()
  dragOverHabitIndex.value = idx
}

const onDragHabitLeave = () => {
  dragOverHabitIndex.value = null
}

const onHabitDrop = (idx: number) => {
  if (dragHabitIndex.value !== null && dragHabitIndex.value !== idx) {
    const fromIdx = dragHabitIndex.value
    const h = [...habits.value]
    const [moved] = h.splice(fromIdx, 1)
    h.splice(idx, 0, moved)
    habits.value = h
    saveDemo()
  }
  dragHabitIndex.value = null
  dragOverHabitIndex.value = null
}

const onDragHabitEnd = () => {
  dragHabitIndex.value = null
  dragOverHabitIndex.value = null
}

const analyzeWeek = () => {
  isAnalyzing.value = true
  setTimeout(() => {
    isAnalyzing.value = false
    toast.add({ 
      title: 'Pattern Detected', 
      description: 'Reading is currently your most stable habit. Your consistency tends to dip on Saturdays.', 
      color: 'primary',
      icon: 'i-lucide-eye',
      timeout: 8000
    })
  }, 1500)
}

onMounted(() => {
  loadDemo()
})
</script>

<template>
  <div class="space-y-8 pb-10">
    <!-- Demo Badge -->
    <div class="flex items-center justify-center mb-8 px-4">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs sm:text-sm font-medium text-center">
        <UIcon name="i-lucide-play" class="w-4 h-4 shrink-0" />
        <span class="truncate">Demo Mode — Data stored in your browser</span>
      </div>
    </div>

    <header class="mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Hey there, ready to build momentum? 🔥</h1>
        <p class="text-gray-500 dark:text-gray-400">Track your habits, stay consistent, and let AI guide you.</p>
      </header>

      <div v-if="isLoading" class="space-y-10">
        <USkeleton class="h-16 w-full rounded-3xl" />
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <USkeleton class="h-[300px] w-full rounded-3xl" />
          <USkeleton class="h-[300px] w-full rounded-3xl" />
          <USkeleton class="h-[300px] w-full rounded-3xl" />
        </div>
      </div>

      <div v-else class="space-y-10">

        <!-- Header Info: Full Width Today's Progress -->
        <div>
          <div class="relative overflow-hidden bg-gradient-to-br from-primary-600 to-purple-600 rounded-[32px] p-8 sm:p-10 text-white shadow-xl shadow-primary-500/20 flex flex-col justify-center">
            <!-- Animated Background Elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute bottom-0 left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div class="flex-1">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md mb-6 border border-white/20 shadow-sm">
                  <UIcon name="i-lucide-activity" class="w-4 h-4 text-white" />
                  <span class="text-xs font-bold uppercase tracking-wider text-white">Today's Progress</span>
                </div>

                <h2 class="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight text-white">
                  <template v-if="tasksCompletedToday === 0">Ready to start?</template>
                  <template v-else-if="tasksCompletedToday <= 2">Good start! 👍</template>
                  <template v-else-if="tasksCompletedToday <= 4">Great momentum! 🚀</template>
                  <template v-else>Unstoppable! 🔥</template>
                </h2>

                <p class="text-primary-100 text-lg max-w-lg mb-8 opacity-90 leading-relaxed">
                  <template v-if="tasksCompletedToday === 0">You haven't completed any tasks yet. Pick an easy one to get the ball rolling.</template>
                  <template v-else-if="tasksCompletedToday <= 2">You've completed {{ tasksCompletedToday }} tasks today. Keep the chain going!</template>
                  <template v-else-if="tasksCompletedToday <= 4">You're on fire with {{ tasksCompletedToday }} tasks done. Consistency is the key to mastery.</template>
                  <template v-else>You've crushed {{ tasksCompletedToday }} tasks today! Take a moment to celebrate your discipline.</template>
                </p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="flex -space-x-3">
                  <div v-for="i in Math.min(tasksCompletedToday, 5)" :key="i" class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-primary-500 flex items-center justify-center animate-bounce shadow-md" :style="{ animationDelay: `${i * 100}ms` }">
                    <UIcon name="i-lucide-check" class="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <div v-if="tasksCompletedToday === 0" class="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center border-dashed">
                    <UIcon name="i-lucide-hourglass" class="w-5 h-5 text-white/50" />
                  </div>
                </div>
                <span v-if="tasksCompletedToday > 5" class="text-base font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">+{{ tasksCompletedToday - 5 }} more</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Momentum AI Section -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-brain-circuit" class="w-6 h-6 text-primary-500" />
            <span>Momentum AI</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            <!-- Behavioral Insights Card -->
            <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-[1px] h-full flex flex-col">
              <div class="relative bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 flex-1 flex flex-col h-full">
                <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

                <div class="flex flex-col h-full z-10 relative">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="relative shrink-0">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                        <UIcon name="i-lucide-sparkles" class="w-7 h-7 text-white animate-bounce" />
                      </div>
                      <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                      <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                        Behavioral Insights
                      </h3>
                      <p class="text-xs text-gray-500 font-medium">Powered by Groq AI</p>
                    </div>
                  </div>

                  <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                    Discover hidden patterns in your habits. Our AI analyzes your last 30 days of activity to deliver personalized, data-driven reflections.
                  </p>

                  <UButton
                    color="primary"
                    variant="solid"
                    size="lg"
                    class="w-full justify-center rounded-xl py-3 group relative overflow-hidden"
                    @click="analyzeWeek"
                  >
                    <span class="relative z-10 flex items-center gap-2">
                      <UIcon name="i-lucide-wand-2" class="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Generate Deep Insight
                    </span>
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Daily Tip Card -->
            <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-400 p-[1px] h-full flex flex-col group transition-transform duration-500">
              <div class="relative bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 flex-1 flex flex-col h-full overflow-hidden">
                <div class="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

                <div class="flex flex-col h-full z-10 relative">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="relative shrink-0">
                      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:-rotate-12 transition-transform duration-300">
                        <UIcon name="i-lucide-bot" class="w-7 h-7 text-white" />
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-400 rounded-full animate-bounce" />
                    </div>
                    <div>
                      <h3 class="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                        Daily Tip
                      </h3>
                      <p class="text-xs text-gray-500 font-medium uppercase tracking-widest">Quick Motivation</p>
                    </div>
                  </div>

                  <div class="flex-1 flex flex-col justify-center relative z-10">
                    <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                      Need a quick boost or advice based on your progress today? Our AI can give you personalized motivation.
                    </p>

                    <UButton
                      color="info"
                      variant="solid"
                      size="lg"
                      class="w-full justify-center rounded-xl py-3 group/btn relative overflow-hidden mt-auto"
                      @click="analyzeWeek"
                    >
                      <span class="relative z-10 flex items-center gap-2">
                        <UIcon name="i-lucide-message-circle" class="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
                        Get Daily Tip
                      </span>
                      <div class="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Section: Your Habits -->
        <div class="space-y-6">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h2 class="text-2xl font-bold flex items-center gap-2">
                <UIcon name="i-lucide-layers" class="w-6 h-6 text-primary-500" />
                <span>Your Habits</span>
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Demo Mode — Data disimpan di browser Anda</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="relative group rounded-full p-[2px] transition-all duration-300 hover:scale-105"
                @click="analyzeWeek"
              >
                <!-- Animated gradient border -->
                <div class="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-70 group-hover:opacity-100 group-hover:animate-pulse blur-[1px] transition-opacity duration-300"></div>

                <!-- Button content -->
                <div class="relative flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#0c1222] rounded-full text-purple-600 dark:text-purple-400 font-medium overflow-hidden shadow-sm">
                  <UIcon name="i-lucide-wand-2" class="w-5 h-5 group-hover:animate-bounce" />
                  <span class="relative z-10">Magic Create</span>

                  <!-- Inner glow on hover -->
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </button>
              <UButton
                color="primary"
                variant="solid"
                icon="i-lucide-plus"
                class="rounded-full px-6 py-2.5 shadow-sm"
                size="lg"
                @click="openCreateModal"
              >
                New Habit
              </UButton>
            </div>
          </div>

          <div v-if="habits.length === 0" class="py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/[0.01]">
            <UIcon name="i-lucide-folder-plus" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 class="text-xl font-bold mb-2">No habits yet</h3>
            <p class="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-sm mx-auto">Create your first habit category to start tracking your daily progress.</p>
            <UButton color="neutral" @click="openCreateModal" size="xl" class="rounded-full px-8 shadow-md">Create Habit</UButton>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div
              v-for="(habit, idx) in habits" 
              :key="habit.id"
              draggable="true"
              @dragstart="onDragHabitStart(idx, $event)"
              @dragover="onDragHabitOver(idx, $event)"
              @dragleave="onDragHabitLeave"
              @drop="onHabitDrop(idx)"
              @dragend="onDragHabitEnd"
              class="transition-all duration-200 cursor-grab active:cursor-grabbing h-full"
              :class="[
                dragOverHabitIndex === idx ? 'scale-105 opacity-80 shadow-xl ring-2 ring-primary-500 rounded-3xl' : '',
                dragHabitIndex === idx ? 'opacity-40 scale-95' : 'opacity-100'
              ]"
            >
              <HabitCard 
                :habit="habit"
                :tasks="habit.tasks"
                mode="demo"
                class="h-full"
                @add-task="addTask"
                @toggle-task="toggleTask"
                @delete-task="deleteTask"
                @delete-habit="deleteHabit"
                @edit-habit="openEditModal"
                @reorder-tasks="reorderTasks"
              />
            </div>
          </div>
        </div>

        <!-- Section: Momentum Stats -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-bar-chart-2" class="w-6 h-6 text-primary-500" />
            <span>Momentum Stats</span>
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Best Streak</span>
              <span class="text-3xl font-bold text-gray-900 dark:text-white">12 days</span>
            </div>
            <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completion Rate</span>
              <span class="text-3xl font-bold text-gray-900 dark:text-white">84%</span>
            </div>
            <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Most Consistent</span>
              <span class="text-3xl font-bold text-gray-900 dark:text-white">Reading</span>
            </div>
            <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Peak Time</span>
              <span class="text-3xl font-bold text-gray-900 dark:text-white">8 PM</span>
            </div>
          </div>
        </div>

        <!-- Section: Consistency -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-activity" class="w-6 h-6 text-primary-500" />
            <span>Consistency</span>
          </h2>
          <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm overflow-hidden">
            <GitHubHeatmap :data="heatmapData" />
          </div>
        </div>

        <!-- Section: Behavioral Reflections (CTA for Demo) -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-brain-circuit" class="w-6 h-6 text-primary-500" />
            <span>Behavioral Reflections</span>
          </h2>
          <div class="bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-white/[0.03] dark:to-white/[0.01] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-10 shadow-sm text-center">
            <UIcon name="i-lucide-line-chart" class="w-10 h-10 text-primary-500 mx-auto mb-4" />
            <h3 class="text-2xl font-bold mb-3">Discover your momentum.</h3>
            <p class="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Sign in to persist your data, unlock behavioral pattern analysis, and track consistency across all your devices.</p>
            <UButton
              color="neutral"
              variant="solid"
              size="xl"
              class="rounded-full px-8 font-semibold shadow-md"
              to="/login"
            >
              Continue to Login
            </UButton>
          </div>
        </div>

      </div>

      <!-- Modals -->
      <HabitCreateModal
        v-model="isCreateModalOpen"
        :mode="modalMode"
        :initial-data="editingHabit"
        @submit="submitHabit"
      />
  </div>
</template>
