<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { bridgeApi } from '../api'

const climate = ref([])
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref(null)

let refreshInterval = null

function getMoldRiskDisplay(level) {
  const displays = {
    0: { label: 'None', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', icon: '✓' },
    1: { label: 'Low', color: 'text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: '●' },
    2: { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: '●' },
    3: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: '⚠️' },
    4: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', icon: '🚨' },
  }
  return displays[level] || displays[0]
}

function getAlertLevelDisplay(level) {
  const displays = {
    0: { label: 'OK', color: 'text-green-500' },
    1: { label: 'Info', color: 'text-blue-500' },
    2: { label: 'Warning', color: 'text-amber-500' },
    3: { label: 'Alert', color: 'text-orange-500' },
    4: { label: 'Critical', color: 'text-red-500' },
  }
  return displays[level] || displays[0]
}

function getTemperatureColor(temp) {
  if (temp === null || temp === undefined) return 'text-gray-400'
  if (temp < 16) return 'text-blue-500'
  if (temp < 20) return 'text-cyan-500'
  if (temp < 24) return 'text-green-500'
  if (temp < 28) return 'text-amber-500'
  return 'text-red-500'
}

function getHumidityColor(hum) {
  if (hum === null || hum === undefined) return 'text-gray-400'
  if (hum < 30) return 'text-amber-500'  // Too dry
  if (hum < 40) return 'text-cyan-500'
  if (hum < 60) return 'text-green-500'  // Optimal
  if (hum < 70) return 'text-amber-500'  // Getting humid
  return 'text-red-500'  // Too humid
}

// Computed averages
const avgTemperature = computed(() => {
  const online = climate.value.filter(s => s.online && s.temperature !== null)
  if (online.length === 0) return null
  const sum = online.reduce((acc, s) => acc + s.temperature, 0)
  return sum / online.length
})

const avgHumidity = computed(() => {
  const online = climate.value.filter(s => s.online && s.humidity !== null)
  if (online.length === 0) return null
  const sum = online.reduce((acc, s) => acc + s.humidity, 0)
  return sum / online.length
})

const onlineSensors = computed(() => climate.value.filter(s => s.online))
const ventilationAdvice = computed(() => {
  const needsVent = climate.value.filter(s => s.shouldVentilate)
  return needsVent.length > 0
})

async function fetchClimate() {
  try {
    const response = await bridgeApi.getClimate()
    // API returns array directly
    climate.value = Array.isArray(response) ? response : (response.sensors || [])
    lastUpdate.value = new Date()
    error.value = null
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClimate()
  refreshInterval = setInterval(fetchClimate, 30000) // Refresh every 30s
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Error Banner -->
    <div v-if="error" class="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block animate-spin w-8 h-8 border-3 border-climax-500 border-t-transparent rounded-full mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Loading climate data...</p>
    </div>

    <template v-else>
      <!-- Overview Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card p-4 text-center">
          <div class="text-2xl font-bold" :class="getTemperatureColor(avgTemperature)">
            {{ avgTemperature !== null ? avgTemperature.toFixed(1) + '°' : '--' }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Temp</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-2xl font-bold" :class="getHumidityColor(avgHumidity)">
            {{ avgHumidity !== null ? avgHumidity.toFixed(0) + '%' : '--' }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Humidity</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-2xl font-bold" :class="onlineSensors.length > 0 ? 'text-emerald-500' : 'text-gray-400'">
            {{ onlineSensors.length }}/{{ climate.length }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Online</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-2xl">{{ ventilationAdvice ? '🪟' : '✓' }}</div>
          <div class="text-xs mt-1" :class="ventilationAdvice ? 'text-amber-500' : 'text-emerald-500'">{{ ventilationAdvice ? 'Ventilate' : 'Air OK' }}</div>
        </div>
      </div>

      <!-- Sensor Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="sensor in climate" 
          :key="sensor.id"
          class="card overflow-hidden"
          :class="{ 'opacity-50': !sensor.online }"
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-700/50 flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ sensor.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ sensor.room }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="sensor.windowOpen" class="text-amber-500 text-lg" title="Window Open">🪟</span>
              <span v-if="!sensor.online" class="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full font-medium">Offline</span>
            </div>
          </div>

          <!-- Climate Data -->
          <div class="p-5">
            <!-- Temperature & Humidity Row -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center">
                <div class="text-3xl font-bold" :class="getTemperatureColor(sensor.temperature)">
                  {{ sensor.temperature != null ? sensor.temperature.toFixed(1) : '--' }}°
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Temperature</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold" :class="getHumidityColor(sensor.humidity)">
                  {{ sensor.humidity != null ? sensor.humidity.toFixed(0) : '--' }}%
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Humidity</div>
              </div>
            </div>

            <!-- Pressure & Dew Point -->
            <div class="grid grid-cols-2 gap-3 text-sm mb-4">
              <div class="flex justify-between items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-700/50">
                <span class="text-gray-500 dark:text-gray-400 text-xs">Pressure</span>
                <span class="text-gray-900 dark:text-white font-medium">{{ sensor.pressure != null ? sensor.pressure.toFixed(0) : '--' }}</span>
              </div>
              <div class="flex justify-between items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-700/50">
                <span class="text-gray-500 dark:text-gray-400 text-xs">Dew Point</span>
                <span class="text-gray-900 dark:text-white font-medium">{{ sensor.dewPoint != null ? sensor.dewPoint.toFixed(1) : '--' }}°</span>
              </div>
            </div>

            <!-- Mold Risk -->
            <div v-if="sensor.online" class="flex items-center justify-between">
              <span 
                class="text-xs font-medium px-3 py-1.5 rounded-xl"
                :class="getMoldRiskDisplay(sensor.moldRisk).bg"
              >
                <span :class="getMoldRiskDisplay(sensor.moldRisk).color">{{ getMoldRiskDisplay(sensor.moldRisk).icon }} Mold: {{ getMoldRiskDisplay(sensor.moldRisk).label }}</span>
              </span>
              <span v-if="sensor.shouldVentilate" class="text-xs text-amber-500 font-medium">🪟 Open window</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="climate.length === 0" class="card p-12 text-center">
        <div class="text-4xl mb-4">🌡️</div>
        <p class="text-gray-600 dark:text-gray-300 font-semibold">No Climate Data</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Data will appear when sensors report in.
        </p>
      </div>
    </template>

    <!-- Last Update -->
    <div v-if="lastUpdate" class="text-center text-xs text-gray-400 dark:text-gray-500">
      Updated {{ lastUpdate.toLocaleTimeString() }}
    </div>
  </div>
</template>
