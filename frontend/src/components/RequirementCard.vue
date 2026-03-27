<script setup lang="ts">
import type { Requirement } from '../types'

defineProps<{
  requirement: Requirement
  interactive?: boolean
}>()

const emit = defineEmits<{
  'cycle-status': [req: Requirement]
}>()

const priorityColors: Record<string, string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-blue-100 text-blue-700',
}

const statusIcons: Record<string, string> = {
  PENDING: '⏳',
  IN_PROGRESS: '🔨',
  DONE: '✅',
}
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg border px-4 py-3 transition-all"
    :class="[
      requirement.status === 'DONE'
        ? 'border-green-200 bg-green-50/50'
        : 'border-gray-200 bg-white hover:shadow-md',
    ]"
  >
    <!-- Status icon / toggle -->
    <button
      v-if="interactive"
      class="mt-0.5 shrink-0 text-lg transition-transform hover:scale-125"
      @click="emit('cycle-status', requirement)"
      :aria-label="`Cambiar estado de: ${requirement.title}`"
    >
      {{ statusIcons[requirement.status] ?? '⏳' }}
    </button>
    <span v-else class="mt-0.5 shrink-0 text-lg">
      {{ statusIcons[requirement.status] ?? '⏳' }}
    </span>

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <p
        class="text-sm font-medium"
        :class="requirement.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'"
      >
        {{ requirement.title }}
      </p>
      <p v-if="requirement.description" class="mt-0.5 text-xs text-gray-500">
        {{ requirement.description }}
      </p>
    </div>

    <!-- Priority badge -->
    <span
      class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
      :class="priorityColors[requirement.priority] ?? 'bg-gray-100 text-gray-600'"
    >
      {{ requirement.priority }}
    </span>
  </div>
</template>
