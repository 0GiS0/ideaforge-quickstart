<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../composables/useApi'

const health = ref<{ status: string; app: string; version: string } | null>(null)

onMounted(async () => {
  try {
    const { data } = await api.get('/api/health')
    health.value = data
  } catch {
    // Backend not running yet — that's OK
  }
})
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
      {{APP_NAME}}
    </h1>
    <p class="mt-4 text-lg text-gray-600">
      {{APP_DESCRIPTION}}
    </p>

    <div v-if="health" class="mt-8 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
      <span class="h-2 w-2 rounded-full bg-green-500"></span>
      Backend conectado — v{{ health.version }}
    </div>
    <div v-else class="mt-8 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
      <span class="h-2 w-2 rounded-full bg-yellow-500"></span>
      Esperando al backend...
    </div>

    <!-- App content will go here -->
    <div class="mt-12 rounded-xl border-2 border-dashed border-gray-300 p-12 text-gray-400">
      <p class="text-lg">🚀 Tu aplicación empieza aquí</p>
      <p class="mt-2 text-sm">Edita este componente para construir la primera pantalla</p>
    </div>
  </div>
</template>
