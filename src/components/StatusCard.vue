<script setup>
import { useSecurityStore } from '../stores/security'

const security = useSecurityStore()

const stateDisplay = {
  'disarmed': { label: 'Disarmed', class: 'status-disarmed', icon: '🔓' },
  'armed_away': { label: 'Armed Away', class: 'status-armed', icon: '🔒' },
  'armed_stay': { label: 'Armed Stay', class: 'status-armed', icon: '🏠' },
  'armed_night': { label: 'Armed Night', class: 'status-armed', icon: '🌙' },
  'triggered': { label: 'TRIGGERED!', class: 'bg-red-600 text-white animate-pulse', icon: '🚨' },
  'entry_delay': { label: 'Entry Delay', class: 'status-pending', icon: '⏳' },
  'exit_delay': { label: 'Exit Delay', class: 'status-pending', icon: '⏳' },
  'unknown': { label: 'Unknown', class: 'bg-gray-200 text-gray-600', icon: '❓' },
}

const currentState = () => stateDisplay[security.alarmState] || stateDisplay.unknown
</script>

<template>
  <div class="card p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
    
    <div 
      class="rounded-xl p-6 text-center"
      :class="currentState().class"
    >
      <div class="text-4xl mb-2">{{ currentState().icon }}</div>
      <div class="text-2xl font-bold">{{ currentState().label }}</div>
      
      <!-- Entry/Exit delay countdown -->
      <div v-if="security.status?.alarm?.entryDelayRemaining" class="mt-2 text-lg">
        {{ security.status.alarm.entryDelayRemaining }}s remaining
      </div>
      <div v-if="security.status?.alarm?.exitDelayRemaining" class="mt-2 text-lg">
        {{ security.status.alarm.exitDelayRemaining }}s remaining
      </div>
    </div>

    <!-- Warnings -->
    <div v-if="security.openSensors.length > 0 && !security.isArmed" class="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
      <p class="text-sm text-amber-800 dark:text-amber-200">
        ⚠️ {{ security.openSensors.length }} sensor(s) currently open
      </p>
    </div>

    <div v-if="security.offlineSensors.length > 0" class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
      <p class="text-sm text-red-800 dark:text-red-200">
        ⚠️ {{ security.offlineSensors.length }} sensor(s) offline
      </p>
    </div>
  </div>
</template>
