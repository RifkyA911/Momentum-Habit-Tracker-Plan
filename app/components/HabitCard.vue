<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  habit: any
  tasks: any[]
  mode: 'live' | 'demo'
}>()

const emit = defineEmits(['addTask', 'toggleTask', 'deleteTask', 'deleteHabit', 'editHabit', 'reorderTasks', 'dragHabitStart'])

const newTaskText = ref('')
const isAdding = ref(false)

const completedCount = computed(() => props.tasks.filter(t => t.completed).length)
const progress = computed(() => props.tasks.length === 0 ? 0 : (completedCount.value / props.tasks.length) * 100)

const submitTask = () => {
  if (!newTaskText.value.trim()) return
  emit('addTask', props.habit.id, newTaskText.value.trim())
  newTaskText.value = ''
  isAdding.value = false
}

// --- Drag & Drop for tasks within this card ---
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const onDragStart = (idx: number, e: DragEvent) => {
  dragIndex.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }
}

const onDragOver = (idx: number, e: DragEvent) => {
  e.preventDefault()
  dragOverIndex.value = idx
}

const onDragLeave = () => {
  dragOverIndex.value = null
}

const onDrop = (idx: number) => {
  if (dragIndex.value !== null && dragIndex.value !== idx) {
    const draggedTask = props.tasks[dragIndex.value]
    const targetTask = props.tasks[idx]
    if (draggedTask && targetTask) {
      emit('reorderTasks', props.habit.id, draggedTask.id, targetTask.id)
    }
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

const onDragEnd = () => {
  dragIndex.value = null
  dragOverIndex.value = null
}

// --- Habit-level drag (header only) ---
const headerRef = ref<HTMLElement | null>(null)

const onHeaderDragStart = (e: DragEvent) => {
  emit('dragHabitStart', e)
}
</script>

<template>
  <div class="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:border-gray-300 dark:hover:border-white/10 transition-colors">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <!-- Drag handle for habit reorder -->
        <div
          draggable="true"
          @dragstart="onHeaderDragStart"
          class="flex items-center justify-center w-6 shrink-0 cursor-grab active:cursor-grabbing self-stretch rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          title="Drag to reorder"
        >
          <UIcon name="i-lucide-grip-vertical" class="w-4 h-4 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" />
        </div>

        <div 
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shrink-0"
          :style="{ backgroundColor: `${props.habit.color}15`, borderColor: `${props.habit.color}30`, color: props.habit.color }"
        >
          {{ props.habit.icon }}
        </div>
        <div class="min-w-0">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white line-clamp-1" :title="props.habit.title">{{ props.habit.title }}</h3>
          <p class="text-sm text-gray-500 line-clamp-1">{{ props.habit.description || 'No description' }}</p>
        </div>
      </div>
      
      <UPopover :popper="{ placement: 'bottom-end' }">
        <UButton color="gray" variant="ghost" icon="i-lucide-more-vertical" @mousedown.stop />
        <template #content>
          <div class="p-1 min-w-[140px]">
            <UButton 
              color="gray" 
              variant="ghost" 
              block 
              icon="i-lucide-pencil"
              class="justify-start mb-1"
              @click="emit('editHabit', props.habit)"
            >
              Edit Habit
            </UButton>
            <UButton 
              color="red" 
              variant="ghost" 
              block 
              icon="i-lucide-trash-2"
              class="justify-start"
              @click="emit('deleteHabit', props.habit.id)"
            >
              Delete Habit
            </UButton>
          </div>
        </template>
      </UPopover>
    </div>

    <!-- Progress -->
    <div class="mb-4">
      <div class="flex justify-between text-xs font-medium mb-1.5" :style="{ color: props.habit.color }">
        <span>Progress</span>
        <span>{{ completedCount }}/{{ props.tasks.length }} tasks</span>
      </div>
      <div class="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500 ease-out" :style="{ width: `${progress}%`, backgroundColor: props.habit.color }" />
      </div>
    </div>

    <!-- Task List with Drag & Drop -->
    <div class="space-y-0.5 mb-4">
      <div 
        v-for="(task, idx) in props.tasks" 
        :key="task.id"
        draggable="true"
        @dragstart="onDragStart(idx, $event)"
        @dragover="onDragOver(idx, $event)"
        @dragleave="onDragLeave"
        @drop="onDrop(idx)"
        @dragend="onDragEnd"
        class="group flex items-center gap-2.5 py-1.5 px-2 rounded-xl transition-all cursor-default"
        :class="[
          dragOverIndex === idx ? 'bg-primary-50 dark:bg-primary-900/20 border-t-2 border-primary-400' : 'hover:bg-gray-50 dark:hover:bg-white/5',
          dragIndex === idx ? 'opacity-40' : 'opacity-100'
        ]"
      >
        <!-- Drag handle -->
        <UIcon name="i-lucide-grip-vertical" class="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />

        <!-- Checkbox -->
        <button
          @click="emit('toggleTask', task)"
          class="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5"
          :style="task.completed ? { backgroundColor: props.habit.color, borderColor: props.habit.color } : { borderColor: 'currentColor' }"
          :class="!task.completed ? 'text-gray-300 dark:text-gray-600 hover:text-gray-400' : 'text-white'"
        >
          <UIcon v-if="task.completed" name="i-lucide-check" class="w-3 h-3" />
        </button>

        <!-- Task text -->
        <span 
          class="flex-1 text-sm transition-colors line-clamp-2 leading-tight"
          :class="task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'"
          :title="task.text"
        >
          {{ task.text }}
        </span>

        <!-- Delete -->
        <button 
          @click="emit('deleteTask', task.id)"
          class="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all shrink-0"
          title="Delete task"
        >
          <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Add Task -->
    <div v-if="!isAdding">
      <button
        class="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-dashed border-gray-200 dark:border-white/10 rounded-xl hover:border-gray-300 dark:hover:border-white/20 transition-colors"
        @click="isAdding = true"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4" />
        <span>Add a task</span>
      </button>
    </div>
    <form v-else @submit.prevent="submitTask" class="flex gap-2">
      <input
        v-model="newTaskText"
        type="text"
        placeholder="What to do?"
        class="flex-1 h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] outline-none focus:border-primary-500 shadow-sm"
        autofocus
        @blur="!newTaskText.trim() && (isAdding = false)"
      />
      <UButton type="submit" :style="{ backgroundColor: props.habit.color }" class="text-white rounded-xl px-3 hover:opacity-90 shadow-sm" icon="i-lucide-check" />
    </form>
  </div>
</template>
