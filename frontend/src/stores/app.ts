import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Main application store.
 * Add shared state here as the app grows.
 */
export const useAppStore = defineStore('app', () => {
  const isLoading = ref(false)

  return { isLoading }
})
