<script setup lang="ts">
const props = defineProps<{
  mode: 'live' | 'demo'
}>()

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

const newTodoText = ref('')
const todos = ref<Todo[]>([])
const loading = ref(false)
const editingId = ref<string | null>(null)
const editText = ref('')

// --- LocalStorage helpers for demo mode ---
const LS_KEY = 'momentum-demo-todos'

const loadDemoTodos = () => {
  if (import.meta.server) return
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    todos.value = JSON.parse(raw)
  }
}

const saveDemoTodos = () => {
  if (import.meta.server) return
  localStorage.setItem(LS_KEY, JSON.stringify(todos.value))
}

// --- API helpers for live mode ---
const fetchTodos = async () => {
  if (props.mode === 'demo') {
    loadDemoTodos()
    return
  }
  loading.value = true
  try {
    const data = await $fetch<Todo[]>('/api/todos')
    todos.value = data
  } catch (e) {
    console.error('Failed to fetch todos', e)
  } finally {
    loading.value = false
  }
}

const addTodo = async () => {
  const text = newTodoText.value.trim()
  if (!text) return

  if (props.mode === 'demo') {
    const t: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    todos.value.unshift(t)
    saveDemoTodos()
    newTodoText.value = ''
    return
  }

  try {
    const t = await $fetch<Todo>('/api/todos', {
      method: 'POST',
      body: { text }
    })
    todos.value.unshift(t)
    newTodoText.value = ''
  } catch (e) {
    console.error('Failed to add todo', e)
  }
}

const toggleTodo = async (todo: Todo) => {
  const newCompleted = !todo.completed

  // Optimistic update
  todo.completed = newCompleted
  todo.updatedAt = new Date().toISOString()

  if (props.mode === 'demo') {
    saveDemoTodos()
    return
  }

  try {
    await $fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      body: { completed: newCompleted }
    })
  } catch (e) {
    // Rollback
    todo.completed = !newCompleted
    console.error('Failed to toggle todo', e)
  }
}

const startEdit = (todo: Todo) => {
  editingId.value = todo.id
  editText.value = todo.text
}

const saveEdit = async (todo: Todo) => {
  const text = editText.value.trim()
  if (!text) return

  const oldText = todo.text
  todo.text = text
  todo.updatedAt = new Date().toISOString()
  editingId.value = null

  if (props.mode === 'demo') {
    saveDemoTodos()
    return
  }

  try {
    await $fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      body: { text }
    })
  } catch (e) {
    todo.text = oldText
    console.error('Failed to update todo', e)
  }
}

const cancelEdit = () => {
  editingId.value = null
  editText.value = ''
}

const deleteTodo = async (id: string) => {
  const idx = todos.value.findIndex(t => t.id === id)
  if (idx === -1) return

  const removed = todos.value.splice(idx, 1)[0]

  if (props.mode === 'demo') {
    saveDemoTodos()
    return
  }

  try {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
  } catch (e) {
    // Rollback
    todos.value.splice(idx, 0, removed)
    console.error('Failed to delete todo', e)
  }
}

const completedCount = computed(() => todos.value.filter(t => t.completed).length)

onMounted(() => {
  fetchTodos()
})
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-lucide-list-todo" class="w-5 h-5 text-primary-500" />
          <span>Todo List</span>
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ completedCount }}/{{ todos.length }} completed
        </p>
      </div>
      <div 
        v-if="mode === 'demo'" 
        class="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 font-medium"
      >
        Demo Mode
      </div>
    </div>

    <!-- Add Todo -->
    <form @submit.prevent="addTodo" class="flex gap-2">
      <input
        v-model="newTodoText"
        type="text"
        placeholder="Add a new task..."
        class="flex-1 h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all text-sm"
      />
      <UButton
        type="submit"
        icon="i-lucide-plus"
        size="md"
        class="rounded-xl h-11 px-4 bg-primary-500 hover:bg-primary-400 text-white shrink-0"
        :disabled="!newTodoText.trim()"
      >
        Add
      </UButton>
    </form>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-primary-500 animate-spin" />
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="!todos.length" 
      class="text-center py-12 rounded-2xl border border-dashed border-gray-200 dark:border-white/10"
    >
      <UIcon name="i-lucide-inbox" class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p class="text-sm text-gray-400 dark:text-gray-500">No tasks yet. Add one above!</p>
    </div>

    <!-- Todo Items -->
    <TransitionGroup 
      v-else
      name="list"
      tag="ul" 
      class="space-y-2"
    >
      <li
        v-for="t in todos"
        :key="t.id"
        class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-primary-500/20 dark:hover:border-primary-500/20 transition-all"
      >
        <!-- Checkbox -->
        <button
          @click="toggleTodo(t)"
          class="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
          :class="t.completed 
            ? 'bg-primary-500 border-primary-500 text-white' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'"
        >
          <UIcon v-if="t.completed" name="i-lucide-check" class="w-3 h-3" />
        </button>

        <!-- Text / Edit -->
        <div class="flex-1 min-w-0">
          <template v-if="editingId === t.id">
            <input
              v-model="editText"
              @keydown.enter="saveEdit(t)"
              @keydown.escape="cancelEdit"
              class="w-full bg-transparent border-b border-primary-500/50 text-sm text-gray-900 dark:text-white outline-none py-0.5"
              autofocus
            />
          </template>
          <template v-else>
            <span 
              class="text-sm transition-all"
              :class="t.completed 
                ? 'line-through text-gray-400 dark:text-gray-500' 
                : 'text-gray-800 dark:text-gray-200'"
            >
              {{ t.text }}
            </span>
          </template>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <template v-if="editingId === t.id">
            <button 
              @click="saveEdit(t)" 
              class="p-1.5 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors"
            >
              <UIcon name="i-lucide-check" class="w-4 h-4" />
            </button>
            <button 
              @click="cancelEdit" 
              class="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 transition-colors"
            >
              <UIcon name="i-lucide-x" class="w-4 h-4" />
            </button>
          </template>
          <template v-else>
            <button 
              @click="startEdit(t)" 
              class="p-1.5 rounded-lg hover:bg-primary-500/10 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <UIcon name="i-lucide-pencil" class="w-4 h-4" />
            </button>
            <button 
              @click="deleteTodo(t.id)" 
              class="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
            >
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </button>
          </template>
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
