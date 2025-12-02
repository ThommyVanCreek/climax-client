<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useSecurityStore } from '../stores/security'
import SensorList from '../components/SensorList.vue'

const security = useSecurityStore()

let refreshInterval = null

function refreshData() {
  security.fetchSensors()
}

onMounted(() => {
  security.fetchSensors()
  refreshInterval = setInterval(() => security.fetchSensors(), 5000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <SensorList 
      :sensors="security.sensors" 
      :loading="security.loading"
      :error="security.error"
      :configured-count="security.configuredSensorCount"
      @refresh="refreshData" 
    />
    
    <!-- Stats footer -->
    <div class="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
      <span>{{ security.sensors.length }} sensors</span>
      <span v-if="security.bypassedSensors.length > 0">• {{ security.bypassedSensors.length }} bypassed</span>
      <span v-if="security.offlineSensors.length > 0" class="text-red-400">• {{ security.offlineSensors.length }} offline</span>
    </div>
  </div>
</template>
