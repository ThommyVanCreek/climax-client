<script setup>
import { ref } from 'vue'

const apiUrl = ref(import.meta.env.VITE_API_URL || window.location.origin)
const apiKey = ref('')
const darkMode = ref(false)

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
  localStorage.setItem('darkMode', darkMode.value)
}

// Load saved settings
if (localStorage.getItem('darkMode') === 'true') {
  darkMode.value = true
  document.documentElement.classList.add('dark')
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

    <!-- Appearance -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
      
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium text-gray-900 dark:text-white">Dark Mode</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme</div>
        </div>
        <button 
          @click="toggleDarkMode"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="darkMode ? 'bg-climax-600' : 'bg-gray-300'"
        >
          <span 
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="darkMode ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>

    <!-- Connection -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connection</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API URL
          </label>
          <input 
            v-model="apiUrl"
            type="text"
            readonly
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p class="text-xs text-gray-500 mt-1">Set via VITE_API_URL environment variable</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <input 
            v-model="apiKey"
            type="password"
            placeholder="Enter API key..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p class="text-xs text-gray-500 mt-1">Required for write operations (arm/disarm)</p>
        </div>
      </div>
    </div>

    <!-- About -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
      <div class="text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <p><strong>ClimaX Security System</strong></p>
        <p>ESP32-C6 HomeKit security system with climate monitoring</p>
        <p class="text-xs">Vue 3 + Vite + Tailwind CSS</p>
      </div>
    </div>
  </div>
</template>
