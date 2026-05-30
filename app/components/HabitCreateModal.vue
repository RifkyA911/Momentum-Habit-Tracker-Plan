<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps<{
  modelValue: boolean
  mode?: 'create' | 'edit'
  initialData?: any
  isSubmitting?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const title = ref('')
const description = ref('')
const icon = ref('🚀')
const color = ref('#3b82f6')
const activeCategory = ref('fitness')
const isVisible = ref(false)
const titleInputRef = ref<HTMLInputElement | null>(null)

// Rich categorized icon collection
const iconCategories: Record<string, { label: string; emoji: string; icons: string[] }> = {
  fitness: {
    label: 'Fitness',
    emoji: '💪',
    icons: ['🏋️', '🏃', '🚴', '🧘', '⛹️', '🤸', '🏊', '🥊', '💪', '⚽', '🏀', '🎾']
  },
  learning: {
    label: 'Learning',
    emoji: '📚',
    icons: ['📖', '📝', '✏️', '🎓', '📚', '💡', '🧠', '💻', '🔬', '📐', '🗣️', '🌍']
  },
  wellness: {
    label: 'Wellness',
    emoji: '🧘',
    icons: ['💧', '😴', '🧖', '💆', '🫀', '💊', '🌿', '🍃', '☀️', '🛁', '🧴', '🫁']
  },
  creative: {
    label: 'Creative',
    emoji: '🎨',
    icons: ['🎨', '🎵', '🎸', '📸', '🎬', '✍️', '🎭', '🎹', '🖌️', '🪡', '📷', '🎼']
  },
  productivity: {
    label: 'Productivity',
    emoji: '⚡',
    icons: ['💰', '📊', '📈', '🗂️', '⏰', '📋', '🏆', '⚡', '🔑', '📧', '🎯', '✅']
  },
  lifestyle: {
    label: 'Lifestyle',
    emoji: '🏠',
    icons: ['🏠', '🧹', '🍳', '🛒', '🌱', '🐕', '👔', '🚗', '✈️', '🎮', '📱', '🎧']
  },
  nutrition: {
    label: 'Nutrition',
    emoji: '🍎',
    icons: ['🍎', '🥗', '🥤', '🥦', '🫐', '🥕', '🍵', '🥑', '🍊', '🥜', '🫘', '🍯']
  }
}

const colors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185',
]

const activeIcons = computed(() => {
  return iconCategories[activeCategory.value]?.icons || []
})

const isFormValid = computed(() => title.value.trim().length > 0)

watch(() => props.modelValue, async (isOpen) => {
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
      activeCategory.value = 'fitness'
    }
    // Trigger entrance animation
    await nextTick()
    requestAnimationFrame(() => {
      isVisible.value = true
    })
    // Focus title input after animation
    setTimeout(() => {
      titleInputRef.value?.focus()
    }, 400)
  } else {
    isVisible.value = false
  }
})

const submit = () => {
  if (!isFormValid.value || props.isSubmitting) return
  emit('submit', {
    ...(props.initialData?.id ? { id: props.initialData.id } : {}),
    title: title.value.trim(),
    description: description.value.trim(),
    icon: icon.value,
    color: color.value
  })
  // Don't close here — parent controls close after API success
}

const close = () => {
  if (props.isSubmitting) return
  isVisible.value = false
  setTimeout(() => {
    emit('update:modelValue', false)
  }, 250)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.modelValue" class="habit-modal-root fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        class="habit-modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        :class="isVisible ? 'opacity-100' : 'opacity-0'"
        @click="close"
      />

      <!-- Modal Content -->
      <div
        class="habit-modal-content relative w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] transition-all duration-400"
        :class="isVisible ? 'habit-modal-enter-active' : 'habit-modal-enter'"
      >
        <!-- Gradient border glow -->
        <div class="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br opacity-60 blur-[0.5px]" :style="{ background: `linear-gradient(135deg, ${color}40, ${color}15, transparent 60%)` }" />
        
        <div class="relative bg-white dark:bg-[#0c1222] border border-white/10 rounded-[27px] shadow-2xl shadow-black/20 flex flex-col max-h-[92vh]">
          
          <!-- Header with live preview -->
          <div class="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ props.mode === 'edit' ? 'Edit Habit' : 'Create New Habit' }}
              </h2>
              <button
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 hover:rotate-90"
                @click="close"
                :disabled="isSubmitting"
              >
                <UIcon name="i-lucide-x" class="w-5 h-5" />
              </button>
            </div>

            <!-- Live Preview Card -->
            <div
              class="habit-preview-card flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-500"
              :style="{
                backgroundColor: `${color}08`,
                borderColor: `${color}20`,
              }"
            >
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300 shadow-sm"
                :style="{
                  backgroundColor: `${color}15`,
                  border: `1.5px solid ${color}30`,
                  boxShadow: `0 4px 12px ${color}15`
                }"
              >
                <span class="habit-preview-icon">{{ icon }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="font-semibold text-sm transition-colors duration-300 truncate"
                  :style="{ color: title.trim() ? undefined : `${color}60` }"
                  :class="title.trim() ? 'text-gray-900 dark:text-white' : ''"
                >
                  {{ title.trim() || 'Your habit name...' }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                  {{ description.trim() || 'Add a description' }}
                </p>
              </div>
              <div
                class="w-2 h-8 rounded-full shrink-0 transition-all duration-300"
                :style="{ backgroundColor: `${color}40` }"
              />
            </div>
          </div>

          <!-- Scrollable Form Body -->
          <div class="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar">
            <form @submit.prevent="submit" class="space-y-6">

              <!-- Icon Picker -->
              <div class="form-field" style="--field-delay: 0">
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Choose Icon
                </label>

                <!-- Category tabs -->
                <div class="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar-h">
                  <button
                    v-for="(cat, key) in iconCategories"
                    :key="key"
                    type="button"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0"
                    :class="activeCategory === key
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'"
                    @click="activeCategory = key as string"
                  >
                    <span class="text-sm">{{ cat.emoji }}</span>
                    <span>{{ cat.label }}</span>
                  </button>
                </div>

                <!-- Icons grid -->
                <div class="grid grid-cols-6 gap-1.5">
                  <button
                    v-for="(i, idx) in activeIcons"
                    :key="`${activeCategory}-${i}`"
                    type="button"
                    class="icon-grid-item w-full aspect-square text-xl rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    :class="icon === i
                      ? 'bg-gray-100 dark:bg-white/10 ring-2 ring-gray-300 dark:ring-gray-600 shadow-md scale-105'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'"
                    :style="{ animationDelay: `${idx * 30}ms` }"
                    @click="icon = i"
                  >
                    {{ i }}
                  </button>
                </div>
              </div>

              <!-- Color Picker -->
              <div class="form-field" style="--field-delay: 1">
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Theme Color
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(c, idx) in colors"
                    :key="c"
                    type="button"
                    class="color-dot w-7 h-7 rounded-full transition-all duration-200 hover:scale-125 relative"
                    :class="color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0c1222]' : 'hover:shadow-lg'"
                    :style="{
                      backgroundColor: c,
                      ringColor: c,
                      boxShadow: color === c ? `0 0 16px ${c}50` : undefined,
                      animationDelay: `${idx * 25}ms`
                    }"
                    @click="color = c"
                  >
                    <Transition name="check-pop">
                      <UIcon
                        v-if="color === c"
                        name="i-lucide-check"
                        class="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow-sm"
                      />
                    </Transition>
                  </button>
                </div>
              </div>

              <!-- Title -->
              <div class="form-field" style="--field-delay: 2">
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Habit Name <span class="text-red-400">*</span>
                </label>
                <input
                  ref="titleInputRef"
                  v-model="title"
                  type="text"
                  placeholder="e.g. Morning Workout, Read 30 mins..."
                  class="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] outline-none focus:border-transparent focus:ring-2 transition-all duration-200 shadow-sm placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  :style="{ '--tw-ring-color': `${color}40` }"
                  :disabled="isSubmitting"
                />
              </div>

              <!-- Description -->
              <div class="form-field" style="--field-delay: 3">
                <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Description
                  <span class="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  v-model="description"
                  placeholder="Brief note about this habit..."
                  rows="2"
                  class="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] outline-none focus:border-transparent focus:ring-2 transition-all duration-200 shadow-sm resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  :style="{ '--tw-ring-color': `${color}40` }"
                  :disabled="isSubmitting"
                />
              </div>
            </form>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
            <div class="flex items-center justify-between gap-3">
              <button
                type="button"
                class="px-5 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-200"
                @click="close"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button
                type="button"
                class="habit-submit-btn relative px-7 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
                :style="{
                  backgroundColor: color,
                  boxShadow: isFormValid && !isSubmitting ? `0 4px 20px ${color}40, 0 0 0 0 ${color}00` : undefined
                }"
                :disabled="!isFormValid || isSubmitting"
                @click="submit"
              >
                <!-- Shimmer effect -->
                <div v-if="isFormValid && !isSubmitting" class="btn-shimmer" />
                
                <span v-if="isSubmitting" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating...</span>
                </span>
                <span v-else class="flex items-center gap-2">
                  <UIcon :name="props.mode === 'edit' ? 'i-lucide-save' : 'i-lucide-plus'" class="w-4 h-4" />
                  <span>{{ props.mode === 'edit' ? 'Save Changes' : 'Create Habit' }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ========================================
   MODAL ENTRANCE ANIMATION
   ======================================== */
.habit-modal-enter {
  opacity: 0;
  transform: scale(0.92) translateY(20px);
}

.habit-modal-enter-active {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.habit-modal-content {
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ========================================
   LIVE PREVIEW ANIMATIONS
   ======================================== */
.habit-preview-icon {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.habit-preview-card:hover .habit-preview-icon {
  transform: scale(1.15) rotate(-5deg);
}

/* ========================================
   ICON GRID ITEM POP-IN
   ======================================== */
.icon-grid-item {
  animation: icon-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: var(--delay, 0ms);
}

@keyframes icon-pop-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ========================================
   COLOR DOT ENTRANCE
   ======================================== */
.color-dot {
  animation: color-fade-in 0.3s ease both;
}

@keyframes color-fade-in {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ========================================
   CHECK MARK POP TRANSITION
   ======================================== */
.check-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.check-pop-leave-active {
  transition: all 0.15s ease;
}
.check-pop-enter-from {
  opacity: 0;
  transform: scale(0);
}
.check-pop-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* ========================================
   FORM FIELD STAGGER
   ======================================== */
.form-field {
  animation: field-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--field-delay, 0) * 80ms + 200ms);
}

@keyframes field-slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   SUBMIT BUTTON SHIMMER
   ======================================== */
.btn-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.2) 45%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.2) 55%,
    transparent 70%
  );
  animation: shimmer-slide 3s ease-in-out infinite;
}

@keyframes shimmer-slide {
  0% { transform: translateX(-120%); }
  30% { transform: translateX(120%); }
  100% { transform: translateX(120%); }
}

.habit-submit-btn:not(:disabled):hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.habit-submit-btn:not(:disabled):active {
  transform: translateY(0) scale(0.98);
}

/* ========================================
   CUSTOM SCROLLBAR
   ======================================== */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 99px;
}

.custom-scrollbar-h::-webkit-scrollbar {
  height: 3px;
}
.custom-scrollbar-h::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-h::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.15);
  border-radius: 99px;
}
</style>
