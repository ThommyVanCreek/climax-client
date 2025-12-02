<script setup>
import { ref } from 'vue'
import { useSecurityStore } from '../stores/security'

const security = useSecurityStore()
const arming = ref(false)
const disarming = ref(false)
const pin = ref('')
const showPinInput = ref(false)
const pendingAction = ref(null) // { type: 'arm'|'disarm', mode?: string }

function requestPin(action, mode = null) {
  pendingAction.value = { type: action, mode }
  showPinInput.value = true
  pin.value = ''
}

async function submitPin() {
  if (pin.value.length !== 4) return
  
  const action = pendingAction.value
  showPinInput.value = false
  
  if (action.type === 'arm') {
    arming.value = true
    try {
      await security.armSystem(action.mode, pin.value)
    } finally {
      arming.value = false
    }
  } else {
    disarming.value = true
    try {
      await security.disarmSystem(pin.value)
    } finally {
      disarming.value = false
    }
  }
  
  pin.value = ''
  pendingAction.value = null
}

function cancelPin() {
  showPinInput.value = false
  pin.value = ''
  pendingAction.value = null
}
</script>

<template>
  <div class="card p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alarm Controls</h2>
    
    <!-- PIN Input Modal -->
    <div v-if="showPinInput" class="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Enter PIN
      </label>
      <input 
        v-model="pin"
        type="password"
        maxlength="4"
        pattern="[0-9]*"
        inputmode="numeric"
        autofocus
        @keyup.enter="submitPin"
        @keyup.escape="cancelPin"
        class="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        placeholder="••••"
      />
      <div class="flex gap-2 mt-3">
        <button @click="cancelPin" class="flex-1 btn bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
          Cancel
        </button>
        <button @click="submitPin" :disabled="pin.length !== 4" class="flex-1 btn btn-primary">
          Confirm
        </button>
      </div>
    </div>
    
    <div v-else class="space-y-3">
      <!-- Arm buttons (show when disarmed) -->
      <template v-if="!security.isArmed && !security.isTriggered">
        <button 
          @click="requestPin('arm', 'away')"
          :disabled="arming || security.loading"
          class="w-full btn btn-danger flex items-center justify-center gap-2"
        >
          <span>🔒</span>
          <span>{{ arming ? 'Arming...' : 'Arm Away' }}</span>
        </button>
        
        <button 
          @click="requestPin('arm', 'stay')"
          :disabled="arming || security.loading"
          class="w-full btn bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center gap-2"
        >
          <span>🏠</span>
          <span>{{ arming ? 'Arming...' : 'Arm Stay' }}</span>
        </button>

        <button 
          @click="requestPin('arm', 'night')"
          :disabled="arming || security.loading"
          class="w-full btn bg-indigo-500 text-white hover:bg-indigo-600 flex items-center justify-center gap-2"
        >
          <span>🌙</span>
          <span>{{ arming ? 'Arming...' : 'Arm Night' }}</span>
        </button>
      </template>

      <!-- Disarm button (show when armed or triggered) -->
      <template v-else>
        <button 
          @click="requestPin('disarm')"
          :disabled="disarming || security.loading"
          class="w-full btn btn-primary flex items-center justify-center gap-2 py-4 text-lg"
        >
          <span>🔓</span>
          <span>{{ disarming ? 'Disarming...' : 'Disarm System' }}</span>
        </button>
      </template>
    </div>

    <!-- Arm warnings -->
    <div v-if="!security.isArmed && security.openSensors.length > 0" class="mt-4 text-sm text-gray-500 dark:text-gray-400">
      <p>⚠️ Open sensors will be bypassed when arming</p>
    </div>
  </div>
</template>
