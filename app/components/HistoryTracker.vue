<script setup lang="ts">
import { ref, computed } from 'vue'
import { playSound } from '~/utils/sound'

const props = defineProps<{
  habits: any[]
}>()

const emit = defineEmits(['refresh'])
const toast = useToast()

// Selected date YYYY-MM-DD
const selectedDate = ref(new Date().toISOString().split('T')[0])

// Helper to check if dates are same day
const isSameDay = (d1Str: string, d2Str: string) => {
  if (!d1Str || !d2Str) return false
  const date1 = new Date(d1Str).toDateString()
  const date2 = new Date(d2Str).toDateString()
  return date1 === date2
}

// Get relevant tasks for a specific date
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

// Generate last 14 days
const recentDays = computed(() => {
  const days = []
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Calculate stats for this specific day
    let totalTasks = 0
    let completedTasks = 0

    props.habits.forEach(habit => {
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
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      totalTasks,
      completedTasks,
      ratio: totalTasks === 0 ? 0 : completedTasks / totalTasks
    })
  }

  return days
})

// Current day selection details
const selectedDayData = computed(() => {
  return recentDays.value.find(d => d.dateStr === selectedDate.value)
})

// Toggling a task on a specific historical date
const togglingTaskIds = ref<string[]>([])

const toggleTaskOnDate = async (task: any) => {
  const dateStr = selectedDate.value
  const wasCompleted = task.completedAt && isSameDay(task.completedAt, dateStr)
  try {
    if (wasCompleted) {
      // Uncheck
      togglingTaskIds.value.push(task.id)
      await $fetch(`/api/habits/tasks/${task.id}`, {
        method: 'PATCH',
        body: { completed: false }
      })
    } else {
      // Check
      togglingTaskIds.value.push(task.id)
      await $fetch(`/api/habits/tasks/${task.id}`, {
        method: 'PATCH',
        body: {
          completed: true,
          completedAt: new Date(dateStr + 'T12:00:00')
        }
      })
    }
    toast.add({
      title: wasCompleted ? 'Task unchecked' : 'Task completed',
      description: `${wasCompleted ? 'Uncompleted' : 'Completed'} "${task.text}" for ${dateStr}.`,
      color: wasCompleted ? 'gray' : 'green'
    })
    emit('refresh')
  } catch (err) {
    console.error('Failed to toggle task history:', err)
    toast.add({
      title: 'Update failed',
      description: 'Unable to update task history in database.',
      color: 'red'
    })
  } finally {
    togglingTaskIds.value = togglingTaskIds.value.filter(id => id !== task.id)
    playSound('click')
  }
}
</script>

<template>
  <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <div class="flex flex-col md:flex-row md:items-center items-start gap-2">
          <div class="space-x-2 inline-flex items-center  ">
            <UIcon name="i-lucide-history" class="w-6 h-6 text-primary-500" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">History Tracker</h3>
          </div>
          <span
            class="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full font-medium ml-2">Last
            14 Days</span>
        </div>
      </div>
      <UButton to="/dashboard/history" color="primary" variant="soft" size="sm" icon="i-lucide-arrow-right" trailing
        @click="playSound('nav')">View All</UButton>
    </div>

    <!-- Horizontal scrollable day list -->
    <div class="flex items-center gap-3 overflow-x-auto pb-4 mb-6 select-none scrollbar-thin">
      <button v-for="d in recentDays" :key="d.dateStr"
        class="flex flex-col items-center justify-between p-3 rounded-2xl min-w-[64px] h-[92px] border transition-all shrink-0"
        :class="selectedDate === d.dateStr
          ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10'
          : 'bg-gray-50 dark:bg-white/[0.01] hover:bg-gray-100 dark:hover:bg-white/5 border-gray-150 dark:border-white/5 text-gray-700 dark:text-gray-300'"
        @click="selectedDate = d.dateStr; playSound('nav')">
        <span class="text-[10px] uppercase tracking-wider font-semibold opacity-70">{{ d.dayName }}</span>
        <span class="text-lg font-bold leading-none my-1">{{ d.dayNum }}</span>

        <!-- Status indicator dot/ratio -->
        <div class="flex items-center justify-center">
          <span v-if="d.totalTasks === 0" class="text-[10px] opacity-40">none</span>
          <span v-else class="text-[10px] font-medium"
            :class="selectedDate === d.dateStr ? 'text-white/90' : 'text-primary-500'">
            {{ d.completedTasks }} / {{ d.totalTasks }}
          </span>
        </div>
      </button>
    </div>

    <!-- Selected Day Details & Tasks -->
    <div class="bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
        <span class="font-semibold text-gray-800 dark:text-gray-200">
          Tasks for {{ new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long', month: 'short', day:
              'numeric', year: 'numeric'
          }) }}
        </span>
        <span v-if="selectedDayData && selectedDayData.totalTasks > 0" class="text-xs text-gray-400">
          {{ selectedDayData.completedTasks }} of {{ selectedDayData.totalTasks }} completed
        </span>
      </div>

      <!-- If no habits/tasks at all -->
      <div v-if="props.habits.length === 0" class="py-8 text-center text-gray-400 text-sm">
        No habits or tasks defined yet. Add some habits above to start tracking!
      </div>

      <!-- List of habits & tasks -->
      <div v-else class="space-y-6">
        <div v-for="habit in props.habits" :key="habit.id" class="space-y-2">
          <!-- Habit sub-header -->
          <div class="flex items-center gap-2">
            <span class="text-base">{{ habit.icon }}</span>
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ habit.title }}</span>
          </div>

          <!-- Tasks list for this habit -->
          <div class="pl-7 space-y-1">
            <div v-for="task in getTasksForDate(habit, selectedDate)" :key="task.id"
              class="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors">
              <!-- Checkbox -->
              <button @click="toggleTaskOnDate(task)"
                class="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all" :style="task.completedAt && isSameDay(task.completedAt, selectedDate)
                  ? { backgroundColor: habit.color, borderColor: habit.color }
                  : { borderColor: 'currentColor' }" :disabled="togglingTaskIds.includes(task.id)" :class="!(task.completedAt && isSameDay(task.completedAt, selectedDate))
                    ? 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
                    : 'text-white'">
                <UIcon v-if="togglingTaskIds.includes(task.id)" name="i-lucide-loader-2"
                  class="w-3 h-3 text-primary-500 animate-spin" />
                <UIcon v-else-if="task.completedAt && isSameDay(task.completedAt, selectedDate)" name="i-lucide-check"
                  class="w-3 h-3" />
              </button>

              <!-- Text -->
              <span class="text-sm transition-colors" :class="task.completedAt && isSameDay(task.completedAt, selectedDate)
                ? 'line-through text-gray-400'
                : 'text-gray-700 dark:text-gray-300'">
                {{ task.text }}
              </span>
            </div>

            <!-- Fallback if habit has tasks but none existed at selected date -->
            <div v-if="getTasksForDate(habit, selectedDate).length === 0" class="text-xs text-gray-400 italic py-1">
              No tasks existed on this date.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
