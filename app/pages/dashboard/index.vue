<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { playSound, startLoadingSound, stopLoadingSound } from '../../utils/sound'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const toast = useToast()
const { data: session } = await useFetch('/api/auth/get-session', {
  headers: import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
})

const isCreateModalOpen = ref(false)
const isMagicModalOpen = ref(false)
const magicPrompt = ref('')
const isGeneratingMagic = ref(false)
const magicError = ref<string | null>(null)
const magicSuggestions = [
  "I want to become a morning person and start exercising before work",
  "I need to read more books and learn new skills consistently",
  "I want to meditate daily to reduce stress and improve focus",
  "I need to drink more water and stay hydrated throughout the day",
  "I want to practice gratitude and journal every evening"
]
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
const isTipModalOpen = ref(false)
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
    const data = await $fetch<{ habits: any[], completions: any[] }>('/api/habits/with-data')
    habits.value = data.habits

    // Calculate heatmap data from completions
    const counts: Record<string, number> = {}
    data.completions.forEach((completion: any) => {
      const d = new Date(completion.completedAt)
      const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      counts[date] = (counts[date] || 0) + 1
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
  playSound('pop')
  modalMode.value = 'create'
  editingHabit.value = null
  isCreateModalOpen.value = true
}

const openEditModal = (habit: any) => {
  playSound('pop')
  modalMode.value = 'edit'
  editingHabit.value = habit
  isCreateModalOpen.value = true
}

const openMagicModal = () => {
  playSound('magic')
  magicPrompt.value = ''
  magicError.value = null
  isMagicModalOpen.value = true
}

const useSuggestion = (suggestion: string) => {
  magicPrompt.value = suggestion
  magicError.value = null
}

const generateMagicHabit = async () => {
  if (!magicPrompt.value.trim() || isGeneratingMagic.value) return
  
  isGeneratingMagic.value = true
  magicError.value = null
  startLoadingSound()
  try {
    const aiData = await $fetch<any>('/api/groq', {
      method: 'POST',
      body: { type: 'generate-habit', prompt: magicPrompt.value }
    })
    
    // Submitting to habits API
    isCreatingHabit.value = true
    const created = await $fetch<any>('/api/habits', { method: 'POST', body: aiData })
    await fetchHabits()
    if (created?.id) {
      newlyCreatedHabitId.value = created.id
      setTimeout(() => { newlyCreatedHabitId.value = null }, 1200)
    }
    stopLoadingSound()
    playSound('epic_magic')
    toast.add({ title: 'Magic Habit Created! ✨', description: `${aiData.icon} ${aiData.title} is ready for you.`, color: 'purple' })
    isMagicModalOpen.value = false
  } catch (error: any) {
    stopLoadingSound()
    console.error('Failed to generate magic habit:', error)
    
    // Detailed error handling
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      magicError.value = 'API authentication failed. Please check your GROQ_API_KEY in .env file.'
    } else if (error?.statusCode === 429) {
      magicError.value = 'API rate limit exceeded. Please try again in a few moments.'
    } else if (error?.statusCode === 500) {
      magicError.value = 'AI service is temporarily unavailable. Please try again later.'
    } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      magicError.value = 'Network error. Please check your internet connection.'
    } else {
      magicError.value = 'Failed to generate habit. You can try again or create manually.'
    }
    
    toast.add({ 
      title: 'Generation Failed', 
      description: magicError.value, 
      color: 'error'
    })
  } finally {
    isGeneratingMagic.value = false
    isCreatingHabit.value = false
    stopLoadingSound()
  }
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
      playSound('success')
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
      playSound('pop')
      toast.add({ title: 'Habit updated ✨', description: 'Changes saved successfully.', color: 'green' })
    } catch (error: any) {
      console.error('Failed to submit habit:', error)
      toast.add({ title: 'Something went wrong', description: error?.data?.message || 'Failed to save habit. Please try again.', color: 'red' })
    }
  }
}

const deleteHabit = async (id: string) => {
  playSound('uncheck')
  await $fetch(`/api/habits/${id}`, { method: 'DELETE' })
  habits.value = habits.value.filter(h => h.id !== id)
  toast.add({ title: 'Habit deleted', description: 'The habit and its tasks were removed.', color: 'red' })
  fetchHabits()
}

const addTask = async (habitId: string, text: string) => {
  const task = await $fetch(`/api/habits/${habitId}/tasks`, { method: 'POST', body: { text } })
  const habit = habits.value.find(h => h.id === habitId)
  if (habit) habit.tasks.unshift(task)
  playSound('pop')
}

const togglingTaskIds = ref<string[]>([])

const toggleTask = async (task: any) => {
  if (togglingTaskIds.value.includes(task.id)) return
  
  togglingTaskIds.value.push(task.id)
  const newCompleted = !task.completed
  
  startLoadingSound()
  try {
    await $fetch(`/api/habits/tasks/${task.id}`, { method: 'PATCH', body: { completed: newCompleted } })
    
    stopLoadingSound()
    if (newCompleted) playSound('success')
    else playSound('uncheck')
    
    task.completed = newCompleted
    task.completedAt = newCompleted ? new Date().toISOString() : null
    
    if (newCompleted) {
      toast.add({ title: 'Task Completed! 🎯', description: `Awesome job completing "${task.text}"!`, color: 'green' })
    }
    
    fetchHabits()
    fetchStats()
  } catch (error) {
    stopLoadingSound()
    console.error('Failed to toggle task:', error)
    toast.add({ title: 'Error', description: 'Failed to update task. Please try again.', color: 'red' })
  } finally {
    stopLoadingSound()
    togglingTaskIds.value = togglingTaskIds.value.filter(id => id !== task.id)
  }
}

const deleteTask = async (taskId: string) => {
  playSound('uncheck')
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
  playSound('pop')
  isGeneratingSuggestion.value = true
  dailySuggestion.value = ''
  isTipModalOpen.value = true
  startLoadingSound()
  try {
    const response = await $fetch<any>('/api/groq', {
      method: 'POST',
      body: { 
        message: `I have completed ${tasksCompletedToday.value} habit tasks today. Give me ONE short, punchy, and engaging daily motivational tip based on this exact number. Be specific. Maximum 2 sentences. Do not use hashtags.`
      }
    })
    stopLoadingSound()
    playSound('magic')
    dailySuggestion.value = response.reply || 'No response from AI.'
  } catch (e) {
    stopLoadingSound()
    console.error('Failed to get suggestion:', e)
    dailySuggestion.value = 'Oops, AI is taking a quick nap. Try again later!'
  } finally {
    stopLoadingSound()
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
  playSound('pop')
  isReflectionModalOpen.value = true
  isAnalyzing.value = true
  aiReflection.value = ''
  startLoadingSound()
  try {
    // Fetch all completions for the last 30 days
    const completions = await $fetch<any[]>('/api/habits/tasks/completions')
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Filter completions from last 30 days
    const recentCompletions = completions.filter((c: any) => new Date(c.completedAt) >= thirtyDaysAgo)
    
    // Build habit title map
    const habitTitleMap = new Map(habits.value.map(h => [h.id, h.title]))
    
    // Calculate habit stats
    const habitStats: Record<string, number> = {}
    recentCompletions.forEach((completion: any) => {
      const habitTitle = habitTitleMap.get(completion.habitId) || 'Unknown'
      habitStats[habitTitle] = (habitStats[habitTitle] || 0) + 1
    })

    const habitStatsArray = Object.entries(habitStats).map(([habitTitle, completedCount]) => ({
      habitTitle,
      completedCount
    }))

    // Calculate time patterns
    const timePatterns: Record<string, number> = {}
    recentCompletions.forEach((completion: any) => {
      if (completion.completedAt) {
        const hour = new Date(completion.completedAt).getHours()
        const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
        timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1
      }
    })

    // Calculate day patterns
    const dayPatterns: Record<string, number> = {}
    recentCompletions.forEach((completion: any) => {
      if (completion.completedAt) {
        const day = new Date(completion.completedAt).toLocaleDateString('en-US', { weekday: 'long' })
        dayPatterns[day] = (dayPatterns[day] || 0) + 1
      }
    })

    const habitData = {
      totalHabits: habits.value.length,
      totalCompletions: recentCompletions.length,
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
    
    stopLoadingSound()
    playSound('magic')
    aiReflection.value = result.insight
  } catch (e) {
    stopLoadingSound()
    console.error('AI reflection error:', e)
    aiReflection.value = 'Sorry, AI could not analyze your data right now.'
  } finally {
    stopLoadingSound()
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
      <USkeleton class="h-36 w-full rounded-3xl" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <USkeleton class="h-[300px] w-full rounded-3xl" />
        <USkeleton class="h-[300px] w-full rounded-3xl" />
        <!-- <USkeleton class="h-[300px] w-full rounded-3xl" /> -->
      </div>
    </div>

    <div v-else class="space-y-10">

      <!-- Header Info: Full Width Today's Progress -->
      <div class="animate-fade-up stagger-2">
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
      
      <!-- AI Intelligence Center (Unified Layout) -->
      <div class="animate-fade-up stagger-3 space-y-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-brain-circuit" class="w-6 h-6 text-primary-500" />
          <span>Momentum AI</span>
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          <!-- Deep Reflections Card -->
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-[1px] h-full flex flex-col">
            <div class="relative bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 flex-1 flex flex-col h-full">
              <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
              
              <div class="flex flex-col h-full z-10 relative">
                <div class="flex items-center gap-4 mb-6">
                  <div class="relative shrink-0">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:-translate-y-1 transition-transform">
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
                  @click="openReflectionModal"
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

          <!-- Daily Suggestion Card -->
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
                    color="blue" 
                    variant="solid" 
                    size="lg"
                    class="w-full justify-center rounded-xl py-3 group/btn relative overflow-hidden mt-auto bg-cyan-500! hover:bg-cyan-600! text-white! dark:text-black!"
                    @click="fetchDailySuggestion"
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

      <hr class="my-8 border-gray-200 dark:border-gray-800" />

      <!-- Section: Your Habits -->
      <div class="animate-fade-up stagger-3 space-y-6">
        <div class="flex md:flex-row flex-col gap-4 items-start md:items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold flex items-center gap-2">
              <UIcon name="i-lucide-layers" class="w-6 h-6 text-primary-500" />
              <span>Your Habits</span>
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 10 habits • Max 20 tasks per habit</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="relative group rounded-full p-[2px] transition-all duration-300 hover:scale-105"
              @click="openMagicModal"
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
              :toggling-task-ids="togglingTaskIds"
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

      <hr class="my-8 border-gray-200 dark:border-gray-800" />

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
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-calendar-check" class="w-6 h-6 text-primary-500" />
          <span>Your History</span>
        </h2>
        <HistoryTracker :habits="habits" @refresh="fetchHabits" />
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

    <!-- AI Reflection Modal -->
    <Teleport to="body">
      <div v-if="isReflectionModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          @click="isReflectionModalOpen = false"
        />
        <div class="relative w-full max-w-xl overflow-hidden flex flex-col bg-white dark:bg-[#0c1222] border border-white/10 rounded-[28px] shadow-2xl shadow-primary-500/10 animate-fade-up">
          <div class="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-primary-500/30 to-purple-500/30 opacity-60 blur-[1px] pointer-events-none" />
          
          <div class="relative p-8 z-10">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">AI Analysis</h3>
              <button
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                @click="isReflectionModalOpen = false"
              >
                <UIcon name="i-lucide-x" class="w-6 h-6" />
              </button>
            </div>

            <!-- Analyzing State -->
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
                <div class="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-500/10 dark:to-purple-500/10 rounded-2xl p-6 border border-primary-100 dark:border-primary-500/20 text-left">
                  <p class="text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                    {{ aiReflection }}
                  </p>
                </div>
                <UButton
                  color="primary"
                  variant="solid"
                  size="lg"
                  class="rounded-xl px-8 font-semibold w-full justify-center py-3"
                  @click="isReflectionModalOpen = false"
                >
                  Got It
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Daily Tip Modal -->
    <Teleport to="body">
      <div v-if="isTipModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          @click="isTipModalOpen = false"
        />
        <div class="relative w-full max-w-xl overflow-hidden flex flex-col bg-white dark:bg-[#0c1222] border border-white/10 rounded-[28px] shadow-2xl shadow-blue-500/10 animate-fade-up">
          <div class="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-blue-500/30 to-teal-500/30 opacity-60 blur-[1px] pointer-events-none" />
          
          <div class="relative p-8 z-10">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Daily Tip</h3>
              <button
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                @click="isTipModalOpen = false"
              >
                <UIcon name="i-lucide-x" class="w-6 h-6" />
              </button>
            </div>

            <!-- Analyzing State -->
            <div v-if="isGeneratingSuggestion" class="flex flex-col items-center gap-6 py-8">
              <div class="relative">
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center animate-pulse">
                  <UIcon name="i-lucide-message-circle" class="w-12 h-12 text-white animate-spin" />
                </div>
                <div class="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
              </div>
              <div class="text-center space-y-2">
                <h3 class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
                  Generating Motivation
                </h3>
                <p class="text-gray-500 dark:text-gray-400">
                  Our AI is writing a punchy tip based on your {{ tasksCompletedToday }} completed tasks today...
                </p>
              </div>
              <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
                <div class="w-3 h-3 rounded-full bg-cyan-500 animate-bounce delay-100" />
                <div class="w-3 h-3 rounded-full bg-teal-500 animate-bounce delay-200" />
              </div>
            </div>
            
            <!-- Result State -->
            <div v-else class="flex flex-col items-center gap-6 py-4">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-bounce">
                <UIcon name="i-lucide-bot" class="w-10 h-10 text-white" />
              </div>
              <div class="text-center space-y-4 w-full">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Quick Motivation
                </h3>
                <div class="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-500/10 dark:to-teal-500/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-500/20 text-left">
                  <p class="text-xl text-gray-800 dark:text-gray-100 leading-relaxed font-semibold italic text-center">
                    "{{ dailySuggestion }}"
                  </p>
                </div>
                
                <div class="flex gap-3 w-full">
                  <UButton
                    color="gray"
                    variant="soft"
                    size="lg"
                    class="rounded-xl flex-1 justify-center py-3"
                    @click="fetchDailySuggestion"
                  >
                    <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2" />
                    Get Another
                  </UButton>
                  <UButton
                    color="blue"
                    variant="solid"
                    size="lg"
                    class="rounded-xl flex-1 justify-center py-3 !bg-cyan-500 hover:!bg-cyan-600"
                    @click="isTipModalOpen = false"
                  >
                    Got It
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Magic Habit Modal -->
    <Teleport to="body">
      <div v-if="isMagicModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          @click="isMagicModalOpen = false"
        />

        <!-- Modal Content -->
        <div class="relative w-full max-w-xl overflow-hidden flex flex-col bg-white dark:bg-[#0c1222] border border-white/10 rounded-[28px] shadow-2xl shadow-purple-500/10 animate-fade-up">
          
          <!-- Gradient border glow -->
          <div class="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-purple-500/30 to-pink-500/30 opacity-60 blur-[1px] pointer-events-none" />
          
          <div class="relative p-8 z-10">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-500/20 dark:to-fuchsia-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">
                  <UIcon name="i-lucide-wand-2" class="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h3 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Magic Create</h3>
                  <p class="text-sm text-gray-500 mt-1">Tell Groq your goal, and we'll generate the perfect plan.</p>
                </div>
              </div>
              <button
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 hover:rotate-90"
                @click="isMagicModalOpen = false"
                :disabled="isGeneratingMagic"
              >
                <UIcon name="i-lucide-x" class="w-6 h-6" />
              </button>
            </div>

            <form @submit.prevent="generateMagicHabit" class="space-y-6">
              <!-- Error State -->
              <div v-if="magicError" class="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-red-800 dark:text-red-300">{{ magicError }}</p>
                    <div class="flex gap-2 mt-3">
                      <button
                        type="button"
                        @click="generateMagicHabit"
                        class="text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        type="button"
                        @click="isMagicModalOpen = false; openCreateModal()"
                        class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Create Manually
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Suggestion Prompts -->
              <div v-if="!magicPrompt && !magicError" class="space-y-2">
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Start</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(suggestion, index) in magicSuggestions"
                    :key="index"
                    type="button"
                    @click="useSuggestion(suggestion)"
                    class="text-xs px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 transition-all duration-200 hover:scale-105"
                  >
                    {{ suggestion.slice(0, 40) }}{{ suggestion.length > 40 ? '...' : '' }}
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Goal or Story</label>
                <UTextarea 
                  v-model="magicPrompt"
                  placeholder="e.g. I want to become a morning person and start exercising before work..."
                  :rows="4"
                  autofocus
                  class="w-full"
                  :ui="{ base: 'transition-all duration-300 focus:ring-2 focus:ring-purple-500/50' }"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">Be specific about your goals for better results ✨</p>
              </div>
              
              <div class="flex md:flex-row flex-col items-center justify-center gap-3 pt-2">
                <!-- <UButton color="neutral" variant="outline" size="lg" class="rounded-xl px-6 py-2.5" @click="isMagicModalOpen = false" :disabled="isGeneratingMagic">Cancel</UButton> -->
                <button 
                  type="submit" 
                  class="relative group rounded-xl p-[2px] transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isGeneratingMagic"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="relative flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[10px] font-semibold">
                    <UIcon v-if="isGeneratingMagic" name="i-lucide-loader-2" class="w-5 h-5 animate-spin" />
                    <UIcon v-else name="i-lucide-sparkles" class="w-5 h-5 group-hover:animate-bounce" />
                    <span>{{ isGeneratingMagic ? 'Generating Magic...' : 'Generate Habit' }}</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
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
