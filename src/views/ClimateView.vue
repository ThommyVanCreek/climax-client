<script setup>
import { ref, onMounted } from 'vue'
import { bridgeApi } from '../api'

const climate = ref([])
const loading = ref(true)
const error = ref(null)

async function fetchClimate() {
  loading.value = true
  try {
    const response = await bridgeApi.getClimate()
    climate.value = response.sensors || []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchClimate)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Climate</h1>

    <div v-if="error" class="bg-red-100 dark:bg-red-900/30 border border-red-300 rounded-lg p-4">
      <p class="text-red-800 dark:text-red-200">{{ error }}</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading climate data...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="sensor in climate" 
        :key="sensor.mac"
        class="card p-6"
      >
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">{{ sensor.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ sensor.room }}</p>
        
        <div class="space-y-3">
          <div v-if="sensor.temperature !== null" class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">🌡️ Temperature</span>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ sensor.temperature?.toFixed(1) }}°C
            </span>
          </div>
          
          <div v-if="sensor.humidity !== null" class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">💧 Humidity</span>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ sensor.humidity?.toFixed(0) }}%
            </span>
          </div>
          
          <div v-if="sensor.pressure !== null" class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">🌀 Pressure</span>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ sensor.pressure?.toFixed(0) }} hPa
            </span>
          </div>

          <div v-if="sensor.dataStale" class="text-sm text-red-500 mt-2">
            ⚠️ Sensor offline - data may be stale
          </div>
        </div>
      </div>

      <div v-if="climate.length === 0" class="col-span-full text-center py-8 text-gray-500">
        No climate data available
      </div>
    </div>
  </div>
</template>
