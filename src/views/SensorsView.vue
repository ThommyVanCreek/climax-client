<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useSecurityStore } from '../stores/security'
import SensorList from '../components/SensorList.vue'

const security = useSecurityStore()

let refreshInterval = null

onMounted(() => {
  security.fetchSensors()
  refreshInterval = setInterval(() => security.fetchSensors(), 5000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Sensors</h1>
    <SensorList :sensors="security.sensors" />
  </div>
</template>
