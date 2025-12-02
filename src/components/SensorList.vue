<script setup>
defineProps({
  sensors: {
    type: Array,
    default: () => []
  }
})

function getBatteryIcon(level) {
  if (level === null || level === undefined) return '❓'
  if (level >= 80) return '🔋'
  if (level >= 40) return '🔋'
  if (level >= 20) return '🪫'
  return '🪫'
}

function getBatteryColor(level) {
  if (level === null || level === undefined) return 'text-gray-400'
  if (level >= 50) return 'text-green-500'
  if (level >= 20) return 'text-amber-500'
  return 'text-red-500'
}
</script>

<template>
  <div class="card">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Sensors</h2>
    </div>
    
    <div class="divide-y divide-gray-200 dark:divide-gray-700">
      <div 
        v-for="sensor in sensors" 
        :key="sensor.mac"
        class="p-4 flex items-center justify-between"
        :class="{ 'opacity-50': sensor.dataStale }"
      >
        <div class="flex items-center gap-3">
          <!-- Contact status icon -->
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="sensor.contactOpen ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'"
          >
            <span class="text-xl">{{ sensor.contactOpen ? '🚪' : '🔒' }}</span>
          </div>
          
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ sensor.name }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ sensor.room }}
              <span v-if="sensor.dataStale" class="text-red-500 ml-2">• Offline</span>
              <span v-if="sensor.isEntryExit" class="text-blue-500 ml-2">• Entry/Exit</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <!-- Battery -->
          <div class="text-right" :class="getBatteryColor(sensor.battery?.level)">
            <span class="text-lg">{{ getBatteryIcon(sensor.battery?.level) }}</span>
            <span v-if="sensor.battery?.level !== null" class="text-sm ml-1">
              {{ sensor.battery.level }}%
            </span>
            <span v-else class="text-sm ml-1 text-gray-400">--</span>
          </div>

          <!-- Climate -->
          <div v-if="sensor.climate" class="text-right text-sm text-gray-500 dark:text-gray-400">
            <div v-if="sensor.climate.temperature !== null">
              🌡️ {{ sensor.climate.temperature?.toFixed(1) }}°C
            </div>
            <div v-if="sensor.climate.humidity !== null">
              💧 {{ sensor.climate.humidity?.toFixed(0) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="sensors.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        No sensors configured
      </div>
    </div>
  </div>
</template>
