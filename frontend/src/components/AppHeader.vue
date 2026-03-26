<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="text-xl font-bold text-gray-900">
        {{APP_NAME}}
      </RouterLink>
      <nav class="flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          Inicio
        </RouterLink>
        <!-- Add more nav links here -->
      </nav>
    </div>
  </header>
</template>
