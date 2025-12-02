<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useSecurityStore } from '../stores/security'
import StatusCard from '../components/StatusCard.vue'
import SensorList from '../components/SensorList.vue'
import AlarmControls from '../components/AlarmControls.vue'

const security = useSecurityStore()

let refreshInterval = null

onMounted(() => {
  security.fetchStatus()
  security.fetchSensors()
  
  // Auto-refresh every 5 seconds
  refreshInterval = setInterval(() => {
    security.fetchStatus()
    security.fetchSensors()
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <span v-if="security.lastUpdate" class="text-sm text-gray-500 dark:text-gray-400">
        Updated: {{ security.lastUpdate.toLocaleTimeString() }}
      </span>
    </div>

    <!-- Error Banner -->
    <div v-if="security.error" class="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
      <p class="text-red-800 dark:text-red-200">{{ security.error }}</p>
    </div>

    <!-- Alarm Status & Controls -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatusCard />
      <AlarmControls />
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4 text-center">
        <div class="text-3xl font-bold text-climax-600">{{ security.sensors.length }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Total Sensors</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-3xl font-bold" :class="security.openSensors.length > 0 ? 'text-amber-500' : 'text-green-500'">
          {{ security.openSensors.length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Open</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-3xl font-bold" :class="security.offlineSensors.length > 0 ? 'text-red-500' : 'text-green-500'">
          {{ security.offlineSensors.length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Offline</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-3xl font-bold" :class="security.lowBatterySensors.length > 0 ? 'text-amber-500' : 'text-green-500'">
          {{ security.lowBatterySensors.length }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Low Battery</div>
      </div>
    </div>

    <!-- Sensor List -->
    <SensorList :sensors="security.sensors" />
  </div>
</template>
