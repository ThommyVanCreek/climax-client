<script setup>
import { ref } from 'vue'

// Default to dark mode if no preference saved
const savedDarkMode = localStorage.getItem('darkMode')
const darkMode = ref(savedDarkMode === null ? true : savedDarkMode === 'true')

// Apply initial state
if (darkMode.value) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
  localStorage.setItem('darkMode', darkMode.value.toString())
}
</script>

<template>
  <div class="max-w-lg mx-auto space-y-6">
    <!-- Appearance -->
    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-700/50">
        <h2 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Appearance</h2>
      </div>
      
      <div class="p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white flex items-center justify-center">
              <span class="text-lg">{{ darkMode ? '🌙' : '☀️' }}</span>
            </div>
            <div>
              <div class="font-semibold text-gray-900 dark:text-white">Dark Mode</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ darkMode ? 'Enabled' : 'Disabled' }}</div>
            </div>
          </div>
          <button 
            @click="toggleDarkMode"
            class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-climax-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800"
            :class="darkMode ? 'bg-climax-500' : 'bg-gray-300 dark:bg-dark-600'"
          >
            <span 
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform"
              :class="darkMode ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-700/50">
        <h2 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">About</h2>
      </div>
      
      <div class="p-5">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-climax-400 to-climax-600 flex items-center justify-center">
            <span class="text-2xl">🔐</span>
          </div>
          <div>
            <h3 class="font-bold text-xl text-gray-900 dark:text-white">ClimaX</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Security & Climate</p>
          </div>
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          HomeKit-compatible security system with integrated climate monitoring.
        </p>

        <div class="mt-6 pt-4 border-t border-gray-100 dark:border-dark-700/50">
          <p class="text-xs text-gray-400 dark:text-gray-500 text-center">
            © 2025 ClimaX
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
