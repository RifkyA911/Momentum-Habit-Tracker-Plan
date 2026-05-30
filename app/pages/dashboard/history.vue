<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const toast = useToast()
const habits = ref<any[]>([])
const isFetching = ref(true)
const daysLoaded = ref(10)
const observerTarget = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const fetchHabits = async () => {
  isFetching.value = true
  try {
    const h = await $fetch<any[]>('/api/habits')
    for (const habit of h) {
      habit.tasks = await $fetch(`/api/habits/${habit.id}/tasks`)
    }
    habits.value = h
  } catch (err) {
    console.error('Failed to load history', err)
    toast.add({ title: 'Error', description: 'Could not load history data', color: 'red' })
  } finally {
    isFetching.value = false
  }
}

// Helpers
const isSameDay = (d1Str: string, d2Str: string) => {
  if (!d1Str || !d2Str) return false
  const date1 = new Date(d1Str).toDateString()
  const date2 = new Date(d2Str).toDateString()
  return date1 === date2
}

const getTasksForDate = (habit: any, dateStr: string) => {
  const tasks = habit.tasks || []
  return tasks.filter((t: any) => {
    const isCompleted = t.completed && t.completedAt
    const completedOnThisDay = isCompleted && isSameDay(t.completedAt, dateStr)
    const active = !t.completed
    
    const createdTime = new Date(t.createdAt).getTime()
    const dayEndTime = new Date(dateStr + 'T23:59:59').getTime()
    
    return (active || completedOnThisDay) && (createdTime <= dayEndTime)
  })
}

// Timeline data
const historyDays = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < daysLoaded.value; i++) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    
    let totalTasks = 0
    let completedTasks = 0
    
    habits.value.forEach(habit => {
      const dayTasks = getTasksForDate(habit, dateStr)
      dayTasks.forEach((t: any) => {
        totalTasks++
        if (t.completedAt && isSameDay(t.completedAt, dateStr)) {
          completedTasks++
        }
      })
    })
    
    days.push({
      dateStr,
      dateFormatted: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      totalTasks,
      completedTasks
    })
  }
  return days
})

const isLoadingMore = ref(false)

const loadMore = () => {
  if (isFetching.value || isLoadingMore.value) return
  isLoadingMore.value = true
  
  // Simulate network delay for loading chunks smoothly
  setTimeout(() => {
    daysLoaded.value += 10
    isLoadingMore.value = false
  }, 500)
}

const toggleTaskOnDate = async (task: any, dateStr: string) => {
  const wasCompleted = task.completedAt && isSameDay(task.completedAt, dateStr)
  
  // Optimistic update locally
  task.completedAt = wasCompleted ? null : new Date(dateStr + 'T12:00:00').toISOString()
  task.completed = !wasCompleted

  try {
    if (wasCompleted) {
      await $fetch(`/api/habits/tasks/${task.id}`, {
        method: 'PATCH',
        body: { completed: false }
      })
    } else {
      await $fetch(`/api/habits/tasks/${task.id}`, {
        method: 'PATCH',
        body: {
          completed: true,
          completedAt: new Date(dateStr + 'T12:00:00').toISOString()
        }
      })
    }
  } catch (err) {
    // revert
    task.completedAt = wasCompleted ? new Date(dateStr + 'T12:00:00').toISOString() : null
    task.completed = wasCompleted
    toast.add({ title: 'Update failed', description: 'Unable to update task.', color: 'red' })
  }
}

import { watch } from 'vue'

watch(observerTarget, (el) => {
  if (el) {
    if (observer) observer.disconnect()
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    }, { rootMargin: '400px' })
    observer.observe(el)
  }
})

onMounted(() => {
  fetchHabits()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <UButton to="/dashboard" color="gray" variant="ghost" icon="i-lucide-arrow-left" class="mr-2 shrink-0" />
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-history" class="w-6 h-6 text-primary-500" />
          Full History
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Review your habits and consistency over time.</p>
      </div>
    </div>

    <!-- Loading State Initial -->
    <div v-if="isFetching" class="space-y-6">
      <USkeleton class="h-32 w-full rounded-2xl" v-for="i in 3" :key="i" />
    </div>

    <!-- Timeline -->
    <div v-else class="space-y-8 relative border-l-2 border-gray-200 dark:border-white/10 ml-5 pl-8 pb-8">
      
      <div v-for="day in historyDays" :key="day.dateStr" class="relative group is-active">
        
        <!-- Timeline Icon marker -->
        <div class="absolute -left-[2.75rem] top-2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-[#020617] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 shadow shrink-0" :class="day.completedTasks === day.totalTasks && day.totalTasks > 0 ? '!bg-primary-500 !text-white !border-primary-100 dark:!border-primary-900' : ''">
          <UIcon :name="day.totalTasks > 0 ? (day.completedTasks === day.totalTasks ? 'i-lucide-check' : 'i-lucide-circle-dashed') : 'i-lucide-minus'" class="w-4 h-4" />
        </div>

        <!-- Card content -->
        <div class="w-full bg-white dark:bg-[#0B0D0F] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
            <span class="font-semibold text-gray-800 dark:text-gray-200">
              {{ day.dateFormatted }}
            </span>
            <span v-if="day.totalTasks > 0" class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
              {{ day.completedTasks }} / {{ day.totalTasks }}
            </span>
          </div>

          <div v-if="habits.length === 0 || day.totalTasks === 0" class="py-4 text-center text-gray-400 text-sm italic">
            No active tasks.
          </div>

          <div v-else class="space-y-4">
            <div v-for="habit in habits" :key="habit.id">
              <div v-if="getTasksForDate(habit, day.dateStr).length > 0" class="space-y-1">
                <div class="flex items-center gap-2 mb-1.5 opacity-80">
                  <span class="text-sm">{{ habit.icon }}</span>
                  <span class="text-xs font-bold text-gray-800 dark:text-gray-200">{{ habit.title }}</span>
                </div>
                
                <div 
                  v-for="task in getTasksForDate(habit, day.dateStr)"
                  :key="task.id"
                  class="flex items-start gap-3 py-1 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ml-4"
                >
                  <div
                    class="shrink-0 w-4 h-4 rounded mt-0.5 border-2 flex items-center justify-center transition-all opacity-80"
                    :style="task.completedAt && isSameDay(task.completedAt, day.dateStr)
                      ? { backgroundColor: habit.color, borderColor: habit.color } 
                      : { borderColor: 'currentColor' }"
                    :class="!(task.completedAt && isSameDay(task.completedAt, day.dateStr)) 
                      ? 'text-gray-300 dark:text-gray-600' 
                      : 'text-white'"
                  >
                    <UIcon v-if="task.completedAt && isSameDay(task.completedAt, day.dateStr)" name="i-lucide-check" class="w-3 h-3" />
                  </div>

                  <span 
                    class="text-sm transition-colors leading-tight line-clamp-2"
                    :class="task.completedAt && isSameDay(task.completedAt, day.dateStr)
                      ? 'line-through text-gray-400' 
                      : 'text-gray-700 dark:text-gray-300'"
                  >
                    {{ task.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Infinite Scroll Trigger -->
      <div ref="observerTarget" class="py-8 flex justify-center h-20 items-center">
        <UIcon v-if="isLoadingMore" name="i-lucide-loader-2" class="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    </div>
  </div>
</template>
