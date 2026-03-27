/**
 * Shared TypeScript types.
 * Define your API response shapes here.
 */
export interface Requirement {
  id: number
  title: string
  description: string
  priority: string
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
  updatedAt: string
}

export interface HealthStatus {
  status: string
  app: string
  version: string
}
