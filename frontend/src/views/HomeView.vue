<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '../composables/useApi'
import { useRequirements } from '../composables/useRequirements'
import type { HealthStatus, Requirement } from '../types'
import RequirementCard from '../components/RequirementCard.vue'

const health = ref<HealthStatus | null>(null)
const { requirements, loading, fetchRequirements, updateStatus } = useRequirements()

const doneCount = computed(() => requirements.value.filter((r) => r.status === 'DONE').length)
const progress = computed(() =>
  requirements.value.length ? Math.round((doneCount.value / requirements.value.length) * 100) : 0,
)

onMounted(async () => {
  try {
    const { data } = await api.get<HealthStatus>('/api/health')
    health.value = data
    await fetchRequirements()
  } catch {
    // Backend not running yet — that's OK
  }
})

const nextStatus: Record<string, Requirement['status']> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'PENDING',
}

async function cycleStatus(req: Requirement) {
  await updateStatus(req.id, nextStatus[req.status])
}
</script>

<template>
  <!-- ☕ Splash — Always shown while app is taking shape -->
  <div
    v-if="true"
    class="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center text-center"
  >
    <!-- Coffee cup -->
    <div class="mb-8">
      <span class="animate-pulse text-9xl">☕</span>
    </div>

    <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Estamos construyendo tu idea
    </h1>
    <p class="mt-3 text-lg text-gray-500">
      ¿Momento de un café? Mientras tanto, aquí tienes tu lista de deseos:
    </p>

    <div
      v-if="health"
      class="mt-8 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700"
    >
      <span class="h-2 w-2 rounded-full bg-green-500"></span>
      Backend conectado — v{{ health.version }}
    </div>
    <div
      v-else
      class="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700"
    >
      <span class="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
      Conectando con el backend...
    </div>

    <!-- Requirements loaded from the API -->
    <div class="mx-auto mt-10 w-full max-w-md text-left">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
        📋 Requisitos del proyecto
      </h2>
      <div v-if="loading" class="py-4 text-center text-sm text-gray-400">Cargando requisitos...</div>
      <ul v-else class="space-y-2 opacity-75">
        <li
          v-for="req in requirements"
          :key="req.id"
          class="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white/60 px-4 py-2.5 text-sm text-gray-500"
        >
          <span class="text-base">⏳</span>
          {{ req.title }}
        </li>
      </ul>
    </div>
  </div>

  <!-- 🚀 App conectada — muestra requisitos reales del backend (oculto hasta que haya más que mostrar) -->
  <div v-if="false">
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">__APP_NAME__</h1>
      <p class="mt-4 text-lg text-gray-600">__APP_DESCRIPTION__</p>

      <div
        v-if="health"
        class="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700"
      >
        <span class="h-2 w-2 rounded-full bg-green-500"></span>
        Backend conectado — v{{ health?.version }}
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mx-auto mb-6 max-w-xl">
      <div class="mb-1 flex justify-between text-sm text-gray-500">
        <span>Progreso</span>
        <span>{{ doneCount }}/{{ requirements.length }} — {{ progress }}%</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          class="h-full rounded-full bg-indigo-500 transition-all duration-500"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Requirements list -->
    <div class="mx-auto max-w-xl">
      <div v-if="loading" class="text-center text-sm text-gray-400">Cargando requisitos...</div>

      <div v-else-if="requirements.length === 0" class="mt-10 text-center">
        <p class="text-gray-400">No hay requisitos en el PRD.</p>
      </div>

      <ul v-else class="space-y-2">
        <li v-for="req in requirements" :key="req.id">
          <RequirementCard :requirement="req" interactive @cycle-status="cycleStatus" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
@keyframes steam {
  0% {
    opacity: 0;
    transform: translateY(0) scaleX(1);
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scaleX(1.5);
  }
}

.animate-steam-1 {
  animation: steam 2s ease-in-out infinite;
}
.animate-steam-2 {
  animation: steam 2s ease-in-out 0.4s infinite;
}
.animate-steam-3 {
  animation: steam 2s ease-in-out 0.8s infinite;
}
</style>
