<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useSecurityStore } from '../stores/security'
import StatusCard from '../components/StatusCard.vue'
import SensorList from '../components/SensorList.vue'
import AlarmControls from '../components/AlarmControls.vue'

const security = useSecurityStore()

let refreshInterval = null

function formatUptime(seconds) {
  if (!seconds) return '--'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function refreshData() {
  security.fetchStatus()
  security.fetchSensors()
}

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
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Error Banner -->
    <div v-if="security.error" class="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ security.error }}</p>
    </div>

    <!-- Alarm Status & Controls -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <StatusCard />
      <AlarmControls />
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ security.sensors.length }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Sensors</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold" :class="security.openSensors.length > 0 ? 'text-amber-500' : 'text-emerald-500'">
          {{ security.openSensors.length }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Open</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold" :class="security.offlineSensors.length > 0 ? 'text-red-500' : 'text-emerald-500'">
          {{ security.offlineSensors.length }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Offline</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold" :class="security.lowBatterySensors.length > 0 ? 'text-amber-500' : 'text-emerald-500'">
          {{ security.lowBatterySensors.length }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Low Battery</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold" :class="security.bypassedSensors.length > 0 ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'">
          {{ security.bypassedSensors.length }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Bypassed</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatUptime(security.systemInfo?.uptime) }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Uptime</div>
      </div>
    </div>

    <!-- Sensor List -->
    <SensorList 
      :sensors="security.sensors" 
      :loading="security.loading"
      :error="security.error"
      :configured-count="security.configuredSensorCount"
      @refresh="refreshData" 
    />

    <!-- Connection Status -->
    <div class="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
      <span class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full" :class="security.systemInfo ? 'bg-emerald-500' : 'bg-gray-400'"></span>
        {{ security.systemInfo ? 'Connected' : 'Connecting...' }}
      </span>
      <span v-if="security.lastUpdate">•</span>
      <span v-if="security.lastUpdate">{{ security.lastUpdate.toLocaleTimeString() }}</span>
    </div>
  </div>
</template>
