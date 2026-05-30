<script setup lang="ts">
import { computed, ref } from 'vue'
import { playSound } from '~/utils/sound'

const props = defineProps<{
  data: { date: string, count: number }[]
}>()

// Year filter
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i)

// Build a lookup map
const dataMap = computed(() => {
  const map: Record<string, number> = {}
  props.data.forEach(d => { map[d.date] = d.count })
  return map
})

// Generate grid for the selected year
const grid = computed(() => {
  const year = selectedYear.value
  const isCurrentYear = year === currentYear

  const startDate = new Date(year, 0, 1)
  const endDate = isCurrentYear ? new Date() : new Date(year, 11, 31)

  // Pad start to previous Sunday
  const startDay = startDate.getDay()
  const actualStart = new Date(startDate)
  actualStart.setDate(actualStart.getDate() - startDay)

  // Pad end to next Saturday
  const endDay = endDate.getDay()
  const actualEnd = new Date(endDate)
  if (endDay < 6) actualEnd.setDate(actualEnd.getDate() + (6 - endDay))

  const days: { date: string; count: number; dayOfWeek: number; jsDate: Date }[] = []
  const cursor = new Date(actualStart)
  while (cursor <= actualEnd) {
    const dateStr = cursor.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      count: dataMap.value[dateStr] || 0,
      dayOfWeek: cursor.getDay(),
      jsDate: new Date(cursor)
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
})

// Month labels
const monthLabels = computed(() => {
  const labels: { label: string; startCol: number; span: number }[] = []
  let currentMonth = -1
  let monthStart = 0

  grid.value.forEach((week, wIdx) => {
    const rep = week.find(d => d.jsDate.getFullYear() === selectedYear.value) || week[0]
    const m = rep.jsDate.getMonth()
    if (m !== currentMonth) {
      if (currentMonth !== -1) {
        labels.push({
          label: new Date(selectedYear.value, currentMonth, 1).toLocaleDateString('en-US', { month: 'short' }),
          startCol: monthStart,
          span: wIdx - monthStart
        })
      }
      currentMonth = m
      monthStart = wIdx
    }
  })
  if (currentMonth !== -1) {
    labels.push({
      label: new Date(selectedYear.value, currentMonth, 1).toLocaleDateString('en-US', { month: 'short' }),
      startCol: monthStart,
      span: grid.value.length - monthStart
    })
  }
  return labels.filter(l => l.span >= 2)
})

const totalWeeks = computed(() => grid.value.length)

const getLevel = (count: number) => {
  if (count === 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

// Use Tailwind classes so heatmap follows theme primary color
const levelClasses = [
  'bg-gray-200 dark:bg-gray-700/50',
  'bg-primary-200 dark:bg-primary-900/80',
  'bg-primary-300 dark:bg-primary-700',
  'bg-primary-400 dark:bg-primary-500',
  'bg-primary-500 dark:bg-primary-400',
]

const formatTooltip = (day: { date: string; count: number }) => {
  const d = new Date(day.date + 'T00:00:00')
  const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  if (day.count === 0) return `No tasks on ${formatted}`
  return `${day.count} task${day.count > 1 ? 's' : ''} on ${formatted}`
}
</script>

<template>
  <div class="flex items-stretch gap-4 w-full">
    <!-- Heatmap (left side) -->
    <div class="heatmap-area flex-1 min-w-0 overflow-x-auto pb-2">
      <!-- Month labels -->
      <div class="heatmap-months-grid mb-1" :style="{ gridTemplateColumns: `24px repeat(${totalWeeks}, 13px)` }">
        <div class="months-spacer" />
        <div
          v-for="ml in monthLabels"
          :key="ml.label + ml.startCol"
          class="month-segment"
          :style="{ gridColumnStart: ml.startCol + 2, gridColumnEnd: `span ${ml.span}` }"
        >
          {{ ml.label }}
        </div>
      </div>

      <!-- Grid -->
      <div class="heatmap-grid" :style="{ gridTemplateColumns: `24px repeat(${totalWeeks}, 13px)` }">
        <template v-for="dayIdx in 7" :key="'day'+dayIdx">
          <div class="day-label">
            <span v-if="dayIdx === 2">Mon</span>
            <span v-else-if="dayIdx === 4">Wed</span>
            <span v-else-if="dayIdx === 6">Fri</span>
          </div>

          <template v-for="(week, wIdx) in grid" :key="'c'+wIdx+'-'+dayIdx">
            <div class="cell-slot">
              <template v-if="week.find(d => d.dayOfWeek === dayIdx - 1)">
                <UTooltip :text="formatTooltip(week.find(d => d.dayOfWeek === dayIdx - 1)!)" :popper="{ placement: 'top' }">
                  <div
                    class="heatmap-cell"
                    :class="levelClasses[getLevel(week.find(d => d.dayOfWeek === dayIdx - 1)!.count)]"
                  />
                </UTooltip>
              </template>
              <div v-else class="heatmap-cell invisible" />
            </div>
          </template>
        </template>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-end gap-1 pt-2 pr-2">
        <span class="text-[10px] text-gray-400 pr-1">Less</span>
        <div v-for="i in 5" :key="i" class="w-[10px] h-[10px] rounded-sm" :class="levelClasses[i-1]" />
        <span class="text-[10px] text-gray-400 pl-1">More</span>
      </div>
    </div>

    <!-- Divider Border -->
    <div class="w-px bg-gray-200 dark:bg-gray-800/80 self-stretch my-1 shrink-0" />

    <!-- Year Selector (right side) -->
    <div class="flex flex-col gap-1.5 shrink-0 max-h-[160px] overflow-y-auto pr-1 select-none scrollbar-thin scroll-container">
      <button
        v-for="y in yearOptions"
        :key="y"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-center min-w-[58px]"
        :class="selectedYear === y
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'"
        @click="selectedYear = y; playSound('nav')"
      >
        {{ y }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.heatmap-months-grid {
  display: grid;
  gap: 2px;
  width: max-content;
}

.months-spacer {
  grid-column: 1;
}

.month-segment {
  font-size: 11px;
  color: #8b949e;
  font-weight: 500;
  white-space: nowrap;
}

.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 13px);
  gap: 2px;
  width: max-content;
}

.day-label {
  font-size: 10px;
  color: #8b949e;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
}

.cell-slot {
  width: 13px;
  height: 13px;
}

.heatmap-cell {
  width: 13px;
  height: 13px;
  border-radius: 2px;
  cursor: pointer;
  outline: 1px solid rgba(27, 31, 35, 0.06);
  outline-offset: -1px;
  transition: transform 0.1s;
}

.heatmap-cell:hover {
  transform: scale(1.2);
  z-index: 1;
  position: relative;
}

.scroll-container::-webkit-scrollbar {
  width: 4px;
}
.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}
.scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
