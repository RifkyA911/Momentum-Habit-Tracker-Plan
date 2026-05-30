<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  mode?: 'create' | 'edit'
  initialData?: any
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const title = ref('')
const description = ref('')
const icon = ref('🚀')
const color = ref('#3b82f6')

const icons = ['🚀', '🏋️', '📖', '💧', '🧘', '💻', '🎨', '🏃', '🥗', '✍️', '🎸', '💰', '🧹', '🌿', '💊']
const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.mode === 'edit' && props.initialData) {
      title.value = props.initialData.title
      description.value = props.initialData.description || ''
      icon.value = props.initialData.icon
      color.value = props.initialData.color
    } else {
      title.value = ''
      description.value = ''
      icon.value = '🚀'
      color.value = '#3b82f6'
    }
  }
})

const submit = () => {
  if (!title.value.trim()) return
  emit('submit', {
    ...(props.initialData?.id ? { id: props.initialData.id } : {}),
    title: title.value.trim(),
    description: description.value.trim(),
    icon: icon.value,
    color: color.value
  })
  emit('update:modelValue', false)
}

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="close" />
      
      <!-- Modal Content -->
      <div class="relative bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 overflow-y-auto">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold">{{ props.mode === 'edit' ? 'Edit Habit' : 'Create New Habit' }}</h2>
            <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" @click="close">
              <UIcon name="i-lucide-x" class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="submit" class="space-y-8">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon & Color</label>
              <div class="flex gap-4 items-start">
                <div 
                  class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-colors shadow-sm"
                  :style="{ backgroundColor: `${color}15`, border: `2px solid ${color}40`, color: color }"
                >
                  {{ icon }}
                </div>
                <div class="flex-1 space-y-3">
                  <div class="flex flex-wrap gap-2.5">
                    <button
                      v-for="i in icons"
                      :key="i"
                      type="button"
                      class="w-10 h-10 text-xl rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
                      :class="icon === i ? 'bg-gray-100 dark:bg-white/10 ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm' : ''"
                      @click="icon = i"
                    >
                      {{ i }}
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="c in colors"
                      :key="c"
                      type="button"
                      class="w-8 h-8 rounded-full transition-transform shadow-sm"
                      :class="color === c ? 'scale-110 ring-2 ring-offset-4 ring-offset-white dark:ring-offset-[#0B0D0F]' : ''"
                      :style="{ backgroundColor: c }"
                      @click="color = c"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input 
                v-model="title" 
                type="text"
                placeholder="e.g. Morning Workout" 
                class="w-full h-12 px-4 text-base rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
                autofocus
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
              <textarea 
                v-model="description" 
                placeholder="e.g. 30 mins cardio" 
                class="w-full min-h-[80px] p-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm resize-y"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
              <UButton color="gray" variant="ghost" size="lg" class="rounded-lg px-4" @click="close">Cancel</UButton>
              <UButton type="submit" color="primary" size="lg" class="rounded-lg px-6 font-semibold shadow-md" :disabled="!title.trim()">
                {{ props.mode === 'edit' ? 'Save Changes' : 'Create Habit' }}
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>
