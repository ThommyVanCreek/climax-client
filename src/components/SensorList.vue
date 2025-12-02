<script setup>
import { ref } from 'vue'
import { bridgeApi } from '../api'
import PinKeypad from './PinKeypad.vue'

const props = defineProps({
  sensors: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  configuredCount: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['refresh'])

// Bypass control state
const showKeypad = ref(false)
const keypadLoading = ref(false)
const keypadError = ref('')
const keypadTitle = ref('')
const keypadSubtitle = ref('')
const pendingBypass = ref(null) // { sensorId, sensorName, type: 'standard'|'night', enable: boolean }

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

function getMoldRiskDisplay(level) {
  if (level === null || level === undefined) return null
  const displays = {
    0: { label: 'OK', color: 'text-green-500', icon: '✓' },
    1: { label: 'Low', color: 'text-green-400', icon: '●' },
    2: { label: 'Medium', color: 'text-amber-500', icon: '●' },
    3: { label: 'High', color: 'text-orange-500', icon: '⚠️' },
    4: { label: 'Critical', color: 'text-red-500', icon: '🚨' },
  }
  return displays[level] || displays[0]
}

function requestBypassToggle(sensor, type = 'standard') {
  const isCurrentlyBypassed = type === 'night' ? sensor.bypass?.nightActive : sensor.bypass?.active
  const enable = !isCurrentlyBypassed
  
  pendingBypass.value = {
    sensorId: sensor.id,
    sensorName: sensor.name,
    type,
    enable
  }
  
  keypadTitle.value = enable 
    ? (type === 'night' ? 'Enable Night Bypass' : 'Enable Bypass')
    : (type === 'night' ? 'Disable Night Bypass' : 'Disable Bypass')
  keypadSubtitle.value = sensor.name
  keypadError.value = ''
  showKeypad.value = true
}

async function handlePinSubmit(pin) {
  const { sensorId, type, enable } = pendingBypass.value
  keypadLoading.value = true
  keypadError.value = ''
  
  try {
    if (type === 'night') {
      await bridgeApi.setSensorNightBypass(sensorId, enable, pin)
    } else {
      await bridgeApi.setSensorBypass(sensorId, enable, pin)
    }
    showKeypad.value = false
    pendingBypass.value = null
    emit('refresh')
  } catch (e) {
    keypadError.value = e.message || 'Failed to update bypass'
  } finally {
    keypadLoading.value = false
  }
}

function handleKeypadCancel() {
  showKeypad.value = false
  pendingBypass.value = null
  keypadError.value = ''
}
</script>

<template>
  <div class="card overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100 dark:border-dark-700/50">
      <h2 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sensors</h2>
    </div>
    
    <div class="divide-y divide-gray-100 dark:divide-dark-700/50">
      <div 
        v-for="sensor in sensors" 
        :key="sensor.mac"
        class="p-4 sm:p-5"
      >
        <div class="flex items-start sm:items-center justify-between gap-4" :class="{ 'opacity-50': sensor.dataStale }">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Contact status icon -->
            <div 
              class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              :class="sensor.contactOpen ? 'bg-amber-500/10' : 'bg-emerald-500/10'"
            >
              <span class="text-xl">{{ sensor.contactOpen ? '🚪' : '🔒' }}</span>
            </div>
            
            <div class="min-w-0">
              <div class="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span class="truncate">{{ sensor.name }}</span>
                <span v-if="sensor.bypass?.active" class="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-medium">Bypass</span>
                <span v-if="sensor.bypass?.nightActive" class="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">Night</span>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2 mt-0.5">
                <span>{{ sensor.room }}</span>
                <span v-if="sensor.dataStale" class="text-red-500 text-xs">• Offline</span>
                <span v-if="sensor.isEntryExit" class="text-blue-500 text-xs">• Entry</span>
                <span v-if="sensor.battery?.charging" class="text-emerald-500 text-xs">• ⚡</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <!-- Climate (mobile: temp only) -->
            <div v-if="sensor.climate" class="text-right text-sm hidden sm:block">
              <div v-if="sensor.climate.temperature != null" class="text-gray-600 dark:text-gray-300 font-medium">
                {{ sensor.climate.temperature?.toFixed(1) }}°
              </div>
              <div v-if="sensor.climate.humidity != null" class="text-gray-400 dark:text-gray-500 text-xs">
                {{ sensor.climate.humidity?.toFixed(0) }}% RH
              </div>
            </div>

            <!-- Battery -->
            <div class="text-right" :class="getBatteryColor(sensor.battery?.level)">
              <div class="text-lg">{{ getBatteryIcon(sensor.battery?.level) }}</div>
              <div v-if="sensor.battery?.level != null" class="text-xs font-medium">
                {{ sensor.battery.level }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Bypass Controls -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            @click="requestBypassToggle(sensor, 'standard')"
            class="px-3 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-95"
            :class="sensor.bypass?.active 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'"
          >
            {{ sensor.bypass?.active ? '✓ Bypassed' : 'Bypass' }}
          </button>
          
          <button
            @click="requestBypassToggle(sensor, 'night')"
            class="px-3 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-95"
            :class="sensor.bypass?.nightActive 
              ? 'bg-indigo-500 text-white' 
              : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'"
          >
            {{ sensor.bypass?.nightActive ? '✓ Night' : 'Night Bypass' }}
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading && sensors.length === 0" class="p-12 text-center">
        <div class="inline-block animate-spin w-8 h-8 border-3 border-climax-500 border-t-transparent rounded-full mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Loading sensors...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error && sensors.length === 0" class="p-12 text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <p class="text-red-500 font-semibold">Connection Error</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">{{ error }}</p>
      </div>

      <!-- Empty state - sensors configured but none responding -->
      <div v-else-if="sensors.length === 0 && configuredCount && configuredCount > 0" class="p-12 text-center">
        <div class="text-4xl mb-4">📡</div>
        <p class="text-amber-500 font-semibold">Waiting for Sensors</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {{ configuredCount }} configured, none reporting yet
        </p>
      </div>

      <!-- Empty state - no sensors configured -->
      <div v-else-if="sensors.length === 0" class="p-12 text-center">
        <div class="text-4xl mb-4">🔧</div>
        <p class="text-gray-600 dark:text-gray-300 font-semibold">No Sensors</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Configure sensors in <code class="bg-gray-100 dark:bg-dark-700 px-1.5 py-0.5 rounded text-xs">sensors.h</code>
        </p>
      </div>
    </div>

    <!-- PIN Keypad Modal -->
    <PinKeypad 
      :show="showKeypad"
      :title="keypadTitle"
      :subtitle="keypadSubtitle"
      :loading="keypadLoading"
      :error="keypadError"
      @submit="handlePinSubmit"
      @cancel="handleKeypadCancel"
    />
  </div>
</template>
