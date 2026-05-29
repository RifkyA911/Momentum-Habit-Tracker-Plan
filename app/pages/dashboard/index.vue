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
const isSubmittingHabit = ref(false)
const isCreatingHabit = ref(false)
const newlyCreatedHabitId = ref<string | null>(null)
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
  // Close instantly for snappy feel
  isCreateModalOpen.value = false 

  if (modalMode.value === 'create') {
    isCreatingHabit.value = true
    try {
      const created = await $fetch<any>('/api/habits', { method: 'POST', body: data })
      await fetchHabits()
      if (created?.id) {
        newlyCreatedHabitId.value = created.id
        setTimeout(() => { newlyCreatedHabitId.value = null }, 1200)
      }
      toast.add({ title: 'Habit created! 🎉', description: `${data.icon} ${data.title} added successfully.`, color: 'green' })
    } catch (error: any) {
      console.error('Failed to submit habit:', error)
      toast.add({ title: 'Something went wrong', description: error?.data?.message || 'Failed to save habit. Please try again.', color: 'red' })
    } finally {
      isCreatingHabit.value = false
    }
  } else {
    try {
      await $fetch(`/api/habits/${data.id}`, { method: 'PATCH', body: data })
      await fetchHabits()
      toast.add({ title: 'Habit updated ✨', description: 'Changes saved successfully.', color: 'green' })
    } catch (error: any) {
      console.error('Failed to submit habit:', error)
      toast.add({ title: 'Something went wrong', description: error?.data?.message || 'Failed to save habit. Please try again.', color: 'red' })
    }
  }
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

const reorderTasks = async (habitId: string, fromTaskId: string, toTaskId: string) => {
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) {
    const fromIdx = habit.tasks.findIndex((t: any) => t.id === fromTaskId)
    const toIdx = habit.tasks.findIndex((t: any) => t.id === toTaskId)

    if (fromIdx === -1 || toIdx === -1) return

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
  if (dragHabitIndex.value === null) return
  e.preventDefault()
  dragOverHabitIndex.value = idx
}

const onDragHabitLeave = () => {
  dragOverHabitIndex.value = null
}

const onHabitDrop = (idx: number) => {
  if (dragHabitIndex.value === null) return
  if (dragHabitIndex.value !== idx) {
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

const tasksCompletedToday = computed(() => {
  let count = 0
  habits.value.forEach(habit => {
    habit.tasks.forEach((task: any) => {
      if (task.completed && task.completedAt && isToday(task.completedAt)) {
        count++
      }
    })
  })
  return count
})

const isGeneratingSuggestion = ref(false)
const dailySuggestion = ref('')

const fetchDailySuggestion = async () => {
  if (isGeneratingSuggestion.value) return
  isGeneratingSuggestion.value = true
  dailySuggestion.value = ''
  try {
    const response = await $fetch<any>('/api/groq', {
      method: 'POST',
      body: { 
        message: `I have completed ${tasksCompletedToday.value} habit tasks today. Give me ONE short, punchy, and engaging daily motivational tip based on this exact number. Be specific. Maximum 2 sentences. Do not use hashtags.`
      }
    })
    dailySuggestion.value = response.reply || 'No response from AI.'
  } catch (e) {
    console.error('Failed to get suggestion:', e)
    dailySuggestion.value = 'Oops, AI is taking a quick nap. Try again later!'
  } finally {
    isGeneratingSuggestion.value = false
  }
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
    <header class="animate-fade-up stagger-1">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        Hey {{ session?.user?.name?.split(' ')[0] || 'there' }}, ready to build momentum? 🔥
      </h1>
      <p class="text-gray-500 dark:text-gray-400">Track your habits, stay consistent, and let AI guide you.</p>
    </header>

    <div v-if="isLoading" class="space-y-10 animate-fade-up stagger-2">
      <USkeleton class="h-16 w-full rounded-3xl" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <USkeleton class="h-[300px] w-full rounded-3xl" />
        <USkeleton class="h-[300px] w-full rounded-3xl" />
        <USkeleton class="h-[300px] w-full rounded-3xl" />
      </div>
    </div>

    <div v-else class="space-y-10">

      <!-- Header Info & AI Suggestion -->
      <div class="animate-fade-up stagger-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Daily Progress Banner -->
        <div class="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary-600 to-purple-600 rounded-[32px] p-8 sm:p-10 text-white shadow-xl shadow-primary-500/20 flex flex-col justify-center">
          <!-- Animated Background Elements -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="relative z-10">
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
            
            <div class="flex items-center gap-3">
              <div class="flex -space-x-3">
                <div v-for="i in Math.min(tasksCompletedToday, 5)" :key="i" class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-primary-500 flex items-center justify-center animate-bounce shadow-md" :style="{ animationDelay: `${i * 100}ms` }">
                  <UIcon name="i-lucide-check" class="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <div v-if="tasksCompletedToday === 0" class="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center border-dashed">
                  <UIcon name="i-lucide-hourglass" class="w-4 h-4 text-white/50" />
                </div>
              </div>
              <span v-if="tasksCompletedToday > 5" class="text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">+{{ tasksCompletedToday - 5 }} more</span>
            </div>
          </div>
        </div>

        <!-- Groq AI Daily Suggestion -->
        <div class="md:col-span-1 bg-white dark:bg-[#0c1222] border border-gray-200 dark:border-white/5 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none">
            <UIcon name="i-lucide-bot" class="w-32 h-32 text-primary-500 -mt-6 -mr-6 rotate-12" />
          </div>
          
          <div class="flex items-center gap-3 mb-6 relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-lg">AI Assistant</h3>
              <p class="text-xs font-medium text-primary-500 uppercase tracking-widest">Powered by Groq</p>
            </div>
          </div>
          
          <div class="flex-1 flex flex-col justify-center relative z-10">
            <template v-if="!dailySuggestion && !isGeneratingSuggestion">
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center leading-relaxed">
                Need a quick boost or advice based on your progress today?
              </p>
              <UButton 
                color="black" 
                variant="solid" 
                size="lg"
                class="w-full justify-center rounded-xl py-3 group-hover:-translate-y-1 transition-transform shadow-md"
                @click="fetchDailySuggestion"
              >
                Ask for a Tip
              </UButton>
            </template>
            
            <template v-else-if="isGeneratingSuggestion">
              <div class="flex flex-col items-center justify-center py-6 space-y-4">
                <div class="relative">
                  <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                    <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-primary-500 animate-spin" />
                  </div>
                  <div class="absolute inset-0 rounded-full border-2 border-primary-500/40 animate-ping"></div>
                </div>
                <span class="text-xs font-semibold text-primary-500 animate-pulse uppercase tracking-widest">Thinking...</span>
              </div>
            </template>
            
            <template v-else>
              <div class="bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-2xl p-5 mb-4 shadow-inner">
                <p class="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium italic text-center">
                  "{{ dailySuggestion }}"
                </p>
              </div>
              <UButton 
                color="gray" 
                variant="ghost" 
                size="sm"
                icon="i-lucide-refresh-cw"
                class="w-full justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                @click="fetchDailySuggestion"
              >
                Get another one
              </UButton>
            </template>
          </div>
        </div>
      </div>

      <!-- Section: Your Habits -->
      <div class="animate-fade-up stagger-3 space-y-6">
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

        <div v-if="habits.length === 0 && !isCreatingHabit" class="py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/[0.01]">
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
              dragHabitIndex === idx ? 'opacity-40 scale-95' : 'opacity-100',
              newlyCreatedHabitId === habit.id ? 'habit-card-entrance' : ''
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
          
          <!-- Skeleton for new habit -->
          <div v-if="isCreatingHabit" class="h-full habit-card-entrance">
            <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-sm h-full flex flex-col gap-4">
              <div class="flex gap-3">
                <USkeleton class="w-12 h-12 rounded-2xl shrink-0" />
                <div class="space-y-2 flex-1 pt-1">
                  <USkeleton class="h-4 w-1/2" />
                  <USkeleton class="h-3 w-1/3" />
                </div>
              </div>
              <USkeleton class="h-2 w-full mt-2" />
              <div class="space-y-2 mt-2">
                <USkeleton class="h-8 w-full rounded-xl" />
                <USkeleton class="h-8 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Momentum Stats -->
      <div class="animate-fade-up stagger-4 space-y-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-2" class="w-6 h-6 text-primary-500" />
          <span>Momentum Stats</span>
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Best Streak -->
          <div class="group relative bg-white dark:bg-[#0c1222] border border-gray-200 dark:border-white/10 p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <!-- Background Icon Watermark -->
            <div class="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.02] group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <UIcon name="i-lucide-flame" class="w-32 h-32 text-orange-500 -mt-8 -mr-8 rotate-12" />
            </div>
            
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-orange-100 dark:border-orange-500/20">
                <UIcon name="i-lucide-flame" class="w-6 h-6" />
              </div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">Best Streak</span>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ stats.bestStreak }}</span>
                <span class="text-sm font-semibold text-orange-500">days</span>
              </div>
            </div>
          </div>

          <!-- Completion Rate -->
          <div class="group relative bg-white dark:bg-[#0c1222] border border-gray-200 dark:border-white/10 p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <!-- Background Icon Watermark -->
            <div class="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.02] group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <UIcon name="i-lucide-target" class="w-32 h-32 text-green-500 -mt-8 -mr-8 rotate-12" />
            </div>
            
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500 mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-green-100 dark:border-green-500/20">
                <UIcon name="i-lucide-target" class="w-6 h-6" />
              </div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">Completion Rate</span>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ stats.completionRate }}</span>
                <span class="text-sm font-semibold text-green-500">%</span>
              </div>
            </div>
          </div>

          <!-- Most Consistent -->
          <div class="group relative bg-white dark:bg-[#0c1222] border border-gray-200 dark:border-white/10 p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <!-- Background Icon Watermark -->
            <div class="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.02] group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <UIcon name="i-lucide-award" class="w-32 h-32 text-blue-500 -mt-8 -mr-8 rotate-12" />
            </div>
            
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 border border-blue-100 dark:border-blue-500/20">
                <UIcon name="i-lucide-award" class="w-6 h-6" />
              </div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">Most Consistent</span>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight line-clamp-1" :title="stats.mostConsistent">{{ stats.mostConsistent }}</span>
              </div>
            </div>
          </div>

          <!-- Peak Time -->
          <div class="group relative bg-white dark:bg-[#0c1222] border border-gray-200 dark:border-white/10 p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <!-- Background Icon Watermark -->
            <div class="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.02] group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
              <UIcon name="i-lucide-clock" class="w-32 h-32 text-purple-500 -mt-8 -mr-8 rotate-12" />
            </div>
            
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 border border-purple-100 dark:border-purple-500/20">
                <UIcon name="i-lucide-clock" class="w-6 h-6" />
              </div>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">Peak Focus Time</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ stats.peakTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Consistency -->
      <div class="animate-fade-up stagger-5 space-y-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-activity" class="w-6 h-6 text-primary-500" />
          <span>Consistency</span>
        </h2>
        <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-sm overflow-hidden">
          <GitHubHeatmap :data="heatmapData" />
        </div>
      </div>

      <!-- Section: History Tracker -->
      <div class="animate-fade-up stagger-6 space-y-6">
        <HistoryTracker :habits="habits" @refresh="fetchHabits" />
      </div>

      <!-- Section: Behavioral Reflections -->
      <div class="animate-fade-up stagger-7 space-y-6">
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
      :is-submitting="isSubmittingHabit"
      @submit="submitHabit"
    />
  </div>
</template>

<style scoped>
/* ========================================
   NEW HABIT CARD ENTRANCE ANIMATION
   ======================================== */
.habit-card-entrance {
  animation: habit-card-pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes habit-card-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
    filter: blur(4px);
  }
  60% {
    opacity: 1;
    transform: scale(1.03) translateY(-4px);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

/* ========================================
   STAGGERED FADE UP ANIMATIONS
   ======================================== */
.animate-fade-up {
  animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fade-up {
  from { 
    opacity: 0; 
    transform: translateY(24px); 
    filter: blur(4px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
    filter: blur(0); 
  }
}

.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 150ms; }
.stagger-3 { animation-delay: 250ms; }
.stagger-4 { animation-delay: 350ms; }
.stagger-5 { animation-delay: 450ms; }
.stagger-6 { animation-delay: 550ms; }
.stagger-7 { animation-delay: 650ms; }
</style>
