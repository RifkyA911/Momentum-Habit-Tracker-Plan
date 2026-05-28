<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const toast = useToast()
const { data: session } = await useFetch('/api/auth/get-session', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
})

const isCreateModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingHabit = ref<any>(null)
const habits = ref<any[]>([])
const heatmapData = ref<{date: string, count: number}[]>([])
const isLoading = ref(true)
const isAnalyzing = ref(false)
const currentStreak = useState<number | null>('currentStreak', () => null)
const isReflectionModalOpen = ref(false)
const aiReflection = ref('')
const stats = ref({
  bestStreak: 0,
  completionRate: 0,
  mostConsistent: 'N/A',
  peakTime: 'N/A'
})

// Helper to check if a date string is today
const isToday = (dateStr: string) => {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear()
}

// Helper to calculate active streak from heatmap counts
const calculateStreak = (data: { date: string; count: number }[]) => {
  if (!data || data.length === 0) return 0
  const activeDates = new Set(
    data.filter(d => d.count > 0).map(d => d.date)
  )

  let streak = 0
  const checkDate = new Date()

  const todayStr = checkDate.toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(checkDate.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0
  }

  let currentCheck = activeDates.has(todayStr) ? checkDate : yesterday

  while (true) {
    const dateStr = currentCheck.toISOString().split('T')[0]
    if (activeDates.has(dateStr)) {
      streak++
      currentCheck.setDate(currentCheck.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// Drag and drop state for habits
const dragHabitIndex = ref<number | null>(null)
const dragOverHabitIndex = ref<number | null>(null)

const fetchHabits = async () => {
  try {
    const h = await $fetch<any[]>('/api/habits')

    // For each habit, fetch its tasks
    for (const habit of h) {
      habit.tasks = await $fetch(`/api/habits/${habit.id}/tasks`)
    }

    habits.value = h

    // Calculate heatmap data from completed tasks
    const counts: Record<string, number> = {}
    habits.value.forEach(habit => {
      habit.tasks.forEach((task: any) => {
        if (task.completed && task.completedAt) {
          const date = new Date(task.completedAt).toISOString().split('T')[0]
          counts[date] = (counts[date] || 0) + 1
        }
      })
    })

    heatmapData.value = Object.keys(counts).map(date => ({ date, count: counts[date] }))
    currentStreak.value = calculateStreak(heatmapData.value)
  } catch (error) {
    console.error('Error fetching habits:', error)
  } finally {
    isLoading.value = false
  }
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

const submitHabit = async (data: any) => {
  if (modalMode.value === 'create') {
    await $fetch('/api/habits', { method: 'POST', body: data })
    toast.add({ title: 'Habit created', description: `${data.icon} ${data.title} added successfully.`, color: 'green' })
  } else {
    await $fetch(`/api/habits/${data.id}`, { method: 'PATCH', body: data })
    toast.add({ title: 'Habit updated', description: 'Changes saved successfully.', color: 'green' })
  }
  fetchHabits()
}

const deleteHabit = async (id: string) => {
  await $fetch(`/api/habits/${id}`, { method: 'DELETE' })
  habits.value = habits.value.filter(h => h.id !== id)
  toast.add({ title: 'Habit deleted', description: 'The habit and its tasks were removed.', color: 'red' })
  fetchHabits()
}

const addTask = async (habitId: string, text: string) => {
  const task = await $fetch(`/api/habits/${habitId}/tasks`, { method: 'POST', body: { text } })
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) habit.tasks.unshift(task)
}

const toggleTask = async (task: any) => {
  const newCompleted = !task.completed
  task.completed = newCompleted
  task.completedAt = newCompleted ? new Date().toISOString() : null

  await $fetch(`/api/habits/tasks/${task.id}`, { method: 'PATCH', body: { completed: newCompleted } })
  fetchHabits()
}

const deleteTask = async (taskId: string) => {
  await $fetch(`/api/habits/tasks/${taskId}`, { method: 'DELETE' })
  for (const habit of habits.value) {
    habit.tasks = habit.tasks.filter((t: any) => t.id !== taskId)
  }
  fetchHabits()
}

const reorderTasks = async (habitId: string, fromIdx: number, toIdx: number) => {
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) {
    const tasks = [...habit.tasks]
    const [moved] = tasks.splice(fromIdx, 1)
    tasks.splice(toIdx, 0, moved)
    habit.tasks = tasks

    // Prepare payload
    const payload = tasks.map((t: any, index: number) => ({
      id: t.id,
      orderIndex: index
    }))

    // Save to DB in background
    $fetch('/api/habits/tasks/reorder', {
      method: 'PATCH',
      body: { tasks: payload }
    }).catch(err => {
      console.error('Failed to reorder tasks:', err)
      toast.add({ title: 'Reorder Failed', description: 'Failed to sync reorder to database.', color: 'red' })
      fetchHabits() // revert
    })
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

    // Prepare payload
    const payload = h.map((item, index) => ({
      id: item.id,
      orderIndex: index
    }))

    // Save to DB
    $fetch('/api/habits/reorder', {
      method: 'PATCH',
      body: { habits: payload }
    }).catch(err => {
      console.error('Failed to reorder habits:', err)
      toast.add({ title: 'Reorder Failed', description: 'Failed to sync habit order to database.', color: 'red' })
      fetchHabits() // revert
    })
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
      description: 'You complete 42% more habits after 7 PM. Weekend consistency drops slightly — consider reducing Saturday expectations.',
      color: 'primary',
      icon: 'i-lucide-eye',
      timeout: 8000
    })
  }, 2000)
}

const fetchStats = async () => {
  try {
    const data = await $fetch('/api/stats')
    stats.value = data
  } catch (e) {
    console.error('Failed to fetch stats:', e)
  }
}

const openReflectionModal = async () => {
  isReflectionModalOpen.value = true
  isAnalyzing.value = true
  aiReflection.value = ''
  try {
    // Gather habit data from existing habits array
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let completedTasks: any[] = []
    habits.value.forEach(habit => {
      habit.tasks.forEach((task: any) => {
        if (task.completed && task.completedAt && new Date(task.completedAt) >= thirtyDaysAgo) {
          completedTasks.push({
            habitTitle: habit.title,
            text: task.text,
            completedAt: task.completedAt
          })
        }
      })
    })

    // Calculate habit stats
    const habitStats: Record<string, number> = {}
    completedTasks.forEach(task => {
      habitStats[task.habitTitle] = (habitStats[task.habitTitle] || 0) + 1
    })

    const habitStatsArray = Object.entries(habitStats).map(([habitTitle, completedCount]) => ({
      habitTitle,
      completedCount
    }))

    // Calculate time patterns
    const timePatterns: Record<string, number> = {}
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours()
        const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
        timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1
      }
    })

    // Calculate day patterns
    const dayPatterns: Record<string, number> = {}
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'long' })
        dayPatterns[day] = (dayPatterns[day] || 0) + 1
      }
    })

    const habitData = {
      totalHabits: habits.value.length,
      totalCompletions: completedTasks.length,
      habitStats: habitStatsArray,
      timePatterns,
      dayPatterns
    }

    const result = await $fetch('/api/groq', {
      method: 'POST',
      body: {
        type: 'reflection',
        habitData
      }
    })

    aiReflection.value = result.insight
  } catch (e) {
    console.error('AI reflection error:', e)
    aiReflection.value = 'Sorry, AI could not analyze your data right now.'
  } finally {
    isAnalyzing.value = false
  }
}

onMounted(() => {
  fetchHabits()
  fetchStats()
})
</script>

<template>
  <div class="space-y-8 pb-10">
    <header>
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        Hey {{ session?.user?.name?.split(' ')[0] || 'there' }}, ready to build momentum? 🔥
      </h1>
      <p class="text-gray-500 dark:text-gray-400">Track your habits, stay consistent, and let AI guide you.</p>
    </header>

    <div v-if="isLoading" class="space-y-10">
      <USkeleton class="h-16 w-full rounded-3xl" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <USkeleton class="h-[300px] w-full rounded-3xl" />
        <USkeleton class="h-[300px] w-full rounded-3xl" />
        <USkeleton class="h-[300px] w-full rounded-3xl" />
      </div>
    </div>

    <div v-else class="space-y-10">

      <!-- Header Info -->
      <div class="bg-primary-500/10 border border-primary-500/20 text-primary-700 dark:text-primary-400 px-6 py-4 rounded-3xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-check-circle-2" class="w-6 h-6" />
          <span class="font-medium text-lg">You have completed {{ heatmapData.length > 0 ? heatmapData[heatmapData.length-1].count : 0 }} tasks today!</span>
        </div>
        <span class="text-sm font-medium opacity-80">Keep the momentum going 🔥</span>
      </div>

      <!-- Section: Your Habits -->
      <div class="space-y-6">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-layers" class="w-6 h-6 text-primary-500" />
            <span>Your Habits</span>
          </h2>
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-plus"
            class="rounded-full px-6 shadow-sm"
            size="lg"
            @click="openCreateModal"
          >
            New Habit
          </UButton>
        </div>

        <div v-if="habits.length === 0" class="py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/[0.01]">
          <UIcon name="i-lucide-folder-plus" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 class="text-xl font-bold mb-2">No habits yet</h3>
          <p class="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-sm mx-auto">Create your first habit category to start tracking your daily progress.</p>
          <UButton color="black" @click="openCreateModal" size="xl" class="rounded-full px-8 shadow-md">Create Habit</UButton>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="(habit, idx) in habits"
            :key="habit.id"
            @dragover="onDragHabitOver(idx, $event)"
            @dragleave="onDragHabitLeave"
            @drop="onHabitDrop(idx)"
            @dragend="onDragHabitEnd"
            class="transition-all duration-200 h-full"
            :class="[
              dragOverHabitIndex === idx ? 'scale-105 opacity-80 shadow-xl ring-2 ring-primary-500 rounded-3xl' : '',
              dragHabitIndex === idx ? 'opacity-40 scale-95' : 'opacity-100'
            ]"
          >
            <HabitCard
              :habit="habit"
              :tasks="habit.tasks.filter((t: any) => !t.completed || (t.completedAt && isToday(t.completedAt)))"
              mode="live"
              class="h-full"
              @add-task="addTask"
              @toggle-task="toggleTask"
              @delete-task="deleteTask"
              @delete-habit="deleteHabit"
              @edit-habit="openEditModal"
              @reorder-tasks="reorderTasks"
              @drag-habit-start="onDragHabitStart(idx, $event)"
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
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.bestStreak }} days</span>
          </div>
          <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completion Rate</span>
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.completionRate }}%</span>
          </div>
          <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Most Consistent</span>
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.mostConsistent }}</span>
          </div>
          <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Peak Time</span>
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.peakTime }}</span>
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

      <!-- Section: History Tracker -->
      <div class="space-y-6">
        <HistoryTracker :habits="habits" @refresh="fetchHabits" />
      </div>

      <!-- Section: Behavioral Reflections -->
      <div class="space-y-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-brain-circuit" class="w-6 h-6 text-primary-500" />
          <span>Behavioral Reflections</span>
        </h2>
        
        <!-- Main Card -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-[1px]">
          <div class="relative bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10">
            <!-- Animated Background Elements -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            
            <div class="relative flex flex-col lg:flex-row items-center gap-8">
              <!-- Left: Icon & Text -->
              <div class="flex-1 text-center lg:text-left">
                <div class="flex items-center justify-center lg:justify-start gap-4 mb-4">
                  <div class="relative">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25 animate-bounce">
                      <UIcon name="i-lucide-sparkles" class="w-8 h-8 text-white" />
                    </div>
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                    <div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full" />
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                      AI-Powered Insights
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Powered by Groq AI
                    </p>
                  </div>
                </div>
                <p class="text-gray-600 dark:text-gray-300 text-base leading-relaxed max-w-xl">
                  Discover hidden patterns in your habits. Our AI analyzes your last 30 days of activity to deliver personalized, data-driven reflections that help you understand your behavior better.
                </p>
                
                <!-- Feature Pills -->
                <div class="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 rounded-full">
                    <UIcon name="i-lucide-clock" class="w-4 h-4 text-primary-500" />
                    <span class="text-xs font-medium text-primary-600 dark:text-primary-400">Time Patterns</span>
                  </div>
                  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-full">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4 text-purple-500" />
                    <span class="text-xs font-medium text-purple-600 dark:text-purple-400">Day Analysis</span>
                  </div>
                  <div class="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-500/10 rounded-full">
                    <UIcon name="i-lucide-trending-up" class="w-4 h-4 text-pink-500" />
                    <span class="text-xs font-medium text-pink-600 dark:text-pink-400">Trend Detection</span>
                  </div>
                </div>
              </div>
              
              <!-- Right: CTA Button -->
              <div class="shrink-0">
                <UButton
                  color="primary"
                  variant="solid"
                  size="xl"
                  class="rounded-2xl px-8 py-4 font-bold text-lg shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105 group"
                  :loading="isAnalyzing"
                  @click="openReflectionModal"
                >
                  <template #leading>
                    <UIcon name="i-lucide-wand-2" class="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </template>
                  Generate Insight
                </UButton>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal -->
        <UModal 
          v-model="isReflectionModalOpen" 
          :ui="{ 
            container: 'flex items-center justify-center',
            background: 'bg-black/50 backdrop-blur-sm'
          }"
        >
          <UCard class="relative bg-white mx-auto dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full border-0">
            <!-- Close Button -->
            <UButton
              icon="i-lucide-x"
              color="gray"
              variant="ghost"
              size="lg"
              class="absolute top-4 right-4 z-10"
              @click="isReflectionModalOpen = false"
            />
            
            <!-- Content -->
            <div class="p-8 md:p-10">
              <!-- Loading State -->
              <div v-if="isAnalyzing" class="flex flex-col items-center gap-6 py-8">
                <div class="relative">
                  <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center animate-pulse">
                    <UIcon name="i-lucide-brain-circuit" class="w-12 h-12 text-white animate-spin" />
                  </div>
                  <div class="absolute inset-0 rounded-full border-4 border-primary-500/20 animate-ping" />
                </div>
                <div class="text-center space-y-2">
                  <h3 class="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    Analyzing Your Patterns
                  </h3>
                  <p class="text-gray-500 dark:text-gray-400">
                    Our AI is examining your last 30 days of habit data...
                  </p>
                </div>
                <!-- Progress Dots -->
                <div class="flex gap-2">
                  <div class="w-3 h-3 rounded-full bg-primary-500 animate-bounce" />
                  <div class="w-3 h-3 rounded-full bg-purple-500 animate-bounce delay-100" />
                  <div class="w-3 h-3 rounded-full bg-pink-500 animate-bounce delay-200" />
                </div>
              </div>
              
              <!-- Result State -->
              <div v-else class="flex flex-col items-center gap-6 py-4">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 animate-bounce">
                  <UIcon name="i-lucide-sparkles" class="w-10 h-10 text-white" />
                </div>
                <div class="text-center space-y-4 w-full">
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                    Your AI Reflection
                  </h3>
                  <div class="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-500/10 dark:to-purple-500/10 rounded-2xl p-6 border border-primary-100 dark:border-primary-500/20">
                    <p class="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                      {{ aiReflection }}
                    </p>
                  </div>
                  <UButton
                    color="primary"
                    variant="solid"
                    size="lg"
                    class="rounded-xl px-8 font-semibold"
                    @click="isReflectionModalOpen = false"
                  >
                    Got It
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </UModal>
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
