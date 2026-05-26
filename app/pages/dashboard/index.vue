<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
import { authClient } from '~/utils/auth-client'
import { ref } from 'vue'

const { data: session } = await authClient.useSession(useFetch)

const isAnalyzing = ref(false)

const mockHabits = ref([
  { id: 1, title: 'Drink 2L Water', icon: 'i-lucide-droplet', color: 'text-blue-500', bg: 'bg-blue-500/10', completed: true },
  { id: 2, title: 'Read 20 Pages', icon: 'i-lucide-book-open', color: 'text-amber-500', bg: 'bg-amber-500/10', completed: false },
  { id: 3, title: 'Workout', icon: 'i-lucide-dumbbell', color: 'text-emerald-500', bg: 'bg-emerald-500/10', completed: false },
  { id: 4, title: 'Coding 1 Hour', icon: 'i-lucide-code-2', color: 'text-indigo-500', bg: 'bg-indigo-500/10', completed: true },
])

// Mock heatmap data generation
const generateHeatmap = () => {
  const days = []
  for (let i = 0; i < 90; i++) { // Last 90 days
    const level = Math.floor(Math.random() * 5) // 0 to 4
    days.push(level)
  }
  return days
}

const heatmapDays = generateHeatmap()

const toggleHabit = (habitId: number) => {
  const habit = mockHabits.value.find(h => h.id === habitId)
  if (habit) {
    habit.completed = !habit.completed
  }
}
</script>

<template>
  <div class="space-y-10">
    
    <!-- Welcome Header -->
    <header>
      <h1 class="text-3xl font-bold tracking-tight">
        Hey {{ session?.user?.name?.split(' ')[0] || 'there' }}, ready to build momentum? 🔥
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2">
        You have completed {{ mockHabits.filter(h => h.completed).length }} out of {{ mockHabits.length }} habits today.
      </p>
    </header>

    <!-- Habit List -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold flex items-center space-x-2">
        <UIcon name="i-lucide-list-todo" class="w-5 h-5 text-gray-400" />
        <span>Today's Habits</span>
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="habit in mockHabits" 
          :key="habit.id"
          class="group flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 cursor-pointer"
          :class="habit.completed ? 'opacity-70' : ''"
          @click="toggleHabit(habit.id)"
        >
          <div class="flex items-center space-x-4">
            <div :class="[habit.bg, habit.color, 'p-3 rounded-xl']">
              <UIcon :name="habit.icon" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-medium text-lg" :class="habit.completed ? 'line-through text-gray-400' : ''">
                {{ habit.title }}
              </h3>
            </div>
          </div>
          
          <div class="px-2">
            <!-- Oversized Checkbox visual representation -->
            <div 
              class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200"
              :class="habit.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'"
            >
              <UIcon v-if="habit.completed" name="i-lucide-check" class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Heatmap Visualization -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold flex items-center space-x-2">
        <UIcon name="i-lucide-activity" class="w-5 h-5 text-gray-400" />
        <span>Last 90 Days Activity</span>
      </h2>
      
      <div class="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] overflow-x-auto">
        <div class="flex flex-wrap gap-1.5 w-full min-w-min">
          <!-- Tooltip simulation could go here -->
          <div 
            v-for="(level, index) in heatmapDays" 
            :key="index"
            class="w-4 h-4 rounded-[2px] transition-colors duration-300"
            :class="[
              level === 0 ? 'bg-gray-100 dark:bg-gray-800/50' : '',
              level === 1 ? 'bg-emerald-200 dark:bg-emerald-900/60' : '',
              level === 2 ? 'bg-emerald-400 dark:bg-emerald-700/80' : '',
              level === 3 ? 'bg-emerald-500 dark:bg-emerald-500' : '',
              level === 4 ? 'bg-emerald-600 dark:bg-emerald-400' : ''
            ]"
            :title="`Activity level: ${level}`"
          ></div>
        </div>
        <div class="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>90 days ago</span>
          <div class="flex items-center space-x-1">
            <span>Less</span>
            <div class="w-3 h-3 rounded-[2px] bg-gray-100 dark:bg-gray-800/50"></div>
            <div class="w-3 h-3 rounded-[2px] bg-emerald-900/60"></div>
            <div class="w-3 h-3 rounded-[2px] bg-emerald-700/80"></div>
            <div class="w-3 h-3 rounded-[2px] bg-emerald-500"></div>
            <div class="w-3 h-3 rounded-[2px] bg-emerald-400"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Insights Panel Placeholder -->
    <section class="space-y-4 pt-4">
      <div class="relative overflow-hidden rounded-2xl p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.15)] group">
        <!-- Animated gradient border simulation -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
        
        <div class="relative p-6 bg-white dark:bg-[#0f172a] rounded-2xl h-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex-1 space-y-2">
            <div class="flex items-center space-x-2">
              <UIcon name="i-lucide-sparkles" class="w-5 h-5 text-emerald-500" />
              <h2 class="text-xl font-semibold">Momentum AI Insights</h2>
            </div>
            <p class="text-gray-500 dark:text-gray-400">
              Analyze your last week's consistency and get actionable, dopamine-driven feedback from LLaMA 3.
            </p>
          </div>
          
          <UButton 
            to="/groq-test"
            color="emerald" 
            variant="solid" 
            size="lg"
            class="shrink-0"
          >
            Analyze my Week
          </UButton>
        </div>
      </div>
    </section>

  </div>
</template>
