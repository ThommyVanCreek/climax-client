<script setup>
import { useSecurityStore } from '../stores/security'

const security = useSecurityStore()

const stateDisplay = {
  'disarmed': { label: 'Disarmed', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: '🔓' },
  'armed_away': { label: 'Armed Away', bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', icon: '🔒' },
  'armed_stay': { label: 'Armed Stay', bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', icon: '🏠' },
  'armed_night': { label: 'Armed Night', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', icon: '🌙' },
  'triggered': { label: 'TRIGGERED!', bg: 'bg-red-600', text: 'text-white', icon: '🚨', pulse: true },
  'entry_delay': { label: 'Entry Delay', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: '⏳' },
  'exit_delay': { label: 'Exit Delay', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: '⏳' },
  'unknown': { label: 'Connecting...', bg: 'bg-gray-100 dark:bg-dark-700', text: 'text-gray-500 dark:text-gray-400', icon: '•••' },
}

const currentState = () => stateDisplay[security.alarmState] || stateDisplay.unknown
</script>

<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">System Status</h2>
    </div>
    
    <div 
      class="rounded-2xl p-6 text-center transition-all duration-300"
      :class="[currentState().bg, currentState().pulse && 'animate-pulse']"
    >
      <div class="text-5xl mb-3">{{ currentState().icon }}</div>
      <div class="text-2xl font-bold" :class="currentState().text">{{ currentState().label }}</div>
      
      <!-- Entry/Exit delay countdown -->
      <div 
        v-if="security.status?.alarm?.delayRemaining" 
        class="mt-3 text-lg font-mono" 
        :class="currentState().text"
      >
        {{ security.status.alarm.delayRemaining }}s
      </div>
    </div>

    <!-- Warnings -->
    <div v-if="security.openSensors.length > 0 && !security.isArmed" class="mt-4 p-3 rounded-xl bg-amber-500/10">
      <p class="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ security.openSensors.length }} sensor{{ security.openSensors.length > 1 ? 's' : '' }} open</span>
      </p>
    </div>

    <div v-if="security.offlineSensors.length > 0" class="mt-3 p-3 rounded-xl bg-red-500/10">
      <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ security.offlineSensors.length }} sensor{{ security.offlineSensors.length > 1 ? 's' : '' }} offline</span>
      </p>
    </div>
  </div>
</template>
