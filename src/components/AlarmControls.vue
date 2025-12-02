<script setup>
import { ref } from 'vue'
import { useSecurityStore } from '../stores/security'
import PinKeypad from './PinKeypad.vue'

const security = useSecurityStore()
const loading = ref(false)
const showKeypad = ref(false)
const keypadError = ref('')
const pendingAction = ref(null) // { type: 'arm'|'disarm', mode?: string }

const keypadTitle = ref('Enter PIN')
const keypadSubtitle = ref('')

function requestPin(action, mode = null) {
  pendingAction.value = { type: action, mode }
  keypadError.value = ''
  
  if (action === 'arm') {
    const modeNames = { away: 'Away', stay: 'Stay', night: 'Night' }
    keypadTitle.value = `Arm ${modeNames[mode]}`
    keypadSubtitle.value = 'Enter PIN to arm system'
  } else {
    keypadTitle.value = 'Disarm System'
    keypadSubtitle.value = 'Enter PIN to disarm'
  }
  
  showKeypad.value = true
}

async function handlePinSubmit(pin) {
  const action = pendingAction.value
  loading.value = true
  keypadError.value = ''
  
  try {
    if (action.type === 'arm') {
      await security.armSystem(action.mode, pin)
    } else {
      await security.disarmSystem(pin)
    }
    showKeypad.value = false
    pendingAction.value = null
  } catch (e) {
    keypadError.value = e.message || 'Invalid PIN'
  } finally {
    loading.value = false
  }
}

function handleKeypadCancel() {
  showKeypad.value = false
  pendingAction.value = null
  keypadError.value = ''
}
</script>

<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Controls</h2>
    </div>
    
    <div class="space-y-3">
      <!-- Arm buttons (show when disarmed) -->
      <template v-if="!security.isArmed && !security.isTriggered">
        <button 
          @click="requestPin('arm', 'away')"
          :disabled="loading || security.loading"
          class="w-full py-4 rounded-2xl font-semibold text-lg bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <span class="text-2xl">🔒</span>
          <span>Arm Away</span>
        </button>
        
        <button 
          @click="requestPin('arm', 'stay')"
          :disabled="loading || security.loading"
          class="w-full py-4 rounded-2xl font-semibold text-lg bg-amber-500/90 hover:bg-amber-500 text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <span class="text-2xl">🏠</span>
          <span>Arm Stay</span>
        </button>

        <button 
          @click="requestPin('arm', 'night')"
          :disabled="loading || security.loading"
          class="w-full py-4 rounded-2xl font-semibold text-lg bg-indigo-500/90 hover:bg-indigo-500 text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <span class="text-2xl">🌙</span>
          <span>Arm Night</span>
        </button>
      </template>

      <!-- Disarm button (show when armed or triggered) -->
      <template v-else>
        <button 
          @click="requestPin('disarm')"
          :disabled="loading || security.loading"
          class="w-full py-6 rounded-2xl font-bold text-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <span class="text-3xl">🔓</span>
          <span>Disarm</span>
        </button>
      </template>
    </div>

    <!-- Arm warnings -->
    <div v-if="!security.isArmed && security.openSensors.length > 0" class="mt-4 p-3 rounded-xl bg-amber-500/10">
      <p class="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ security.openSensors.length }} open sensor{{ security.openSensors.length > 1 ? 's' : '' }} will be bypassed</span>
      </p>
    </div>
    
    <div v-if="!security.isArmed && security.offlineSensors.length > 0" class="mt-3 p-3 rounded-xl bg-red-500/10">
      <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ security.offlineSensors.length }} sensor{{ security.offlineSensors.length > 1 ? 's' : '' }} offline</span>
      </p>
    </div>

    <!-- PIN Keypad Modal -->
    <PinKeypad 
      :show="showKeypad"
      :title="keypadTitle"
      :subtitle="keypadSubtitle"
      :loading="loading"
      :error="keypadError"
      @submit="handlePinSubmit"
      @cancel="handleKeypadCancel"
    />
  </div>
</template>
