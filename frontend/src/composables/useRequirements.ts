import { ref } from 'vue'
import { api } from './useApi'
import type { Requirement } from '../types'

/**
 * Composable for Requirement operations.
 * Fetches the requirements seeded from PRD.json.
 */
export function useRequirements() {
  const requirements = ref<Requirement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRequirements() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<Requirement[]>('/api/requirements')
      requirements.value = data
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message ?? 'Error al cargar requisitos'
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: number, status: Requirement['status']) {
    const { data } = await api.patch<Requirement>(`/api/requirements/${id}/status`, { status })
    const idx = requirements.value.findIndex((r) => r.id === id)
    if (idx !== -1) requirements.value[idx] = data
  }

  return { requirements, loading, error, fetchRequirements, updateStatus }
}
