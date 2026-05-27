<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'default' })

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
  <div class="relative overflow-hidden">
    <!-- Ambient Background -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
      <!-- Demo Badge -->
      <div class="flex items-center justify-center mb-8 px-4">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs sm:text-sm font-medium text-center">
          <UIcon name="i-lucide-play" class="w-4 h-4 shrink-0" />
          <span class="truncate">Demo Mode — Data disimpan di browser Anda</span>
        </div>
      </div>

      <header class="text-center mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Explore Momentum</h1>
        <p class="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Coba fitur tracker dan heatmap. Buat kategori kebiasaan dan tambahkan task di dalamnya.</p>
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

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              color="black" 
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
  </div>
</template>
