<script setup>
import { ref } from 'vue'
import { useSecurityStore } from '../stores/security'

const security = useSecurityStore()
const arming = ref(false)
const disarming = ref(false)

async function arm(mode) {
  arming.value = true
  try {
    await security.armSystem(mode)
  } finally {
    arming.value = false
  }
}

async function disarm() {
  disarming.value = true
  try {
    await security.disarmSystem()
  } finally {
    disarming.value = false
  }
}
</script>

<template>
  <div class="card p-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alarm Controls</h2>
    
    <div class="space-y-3">
      <!-- Arm buttons (show when disarmed) -->
      <template v-if="!security.isArmed && !security.isTriggered">
        <button 
          @click="arm('away')"
          :disabled="arming || security.loading"
          class="w-full btn btn-danger flex items-center justify-center gap-2"
        >
          <span>🔒</span>
          <span>{{ arming ? 'Arming...' : 'Arm Away' }}</span>
        </button>
        
        <button 
          @click="arm('stay')"
          :disabled="arming || security.loading"
          class="w-full btn bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center gap-2"
        >
          <span>🏠</span>
          <span>{{ arming ? 'Arming...' : 'Arm Stay' }}</span>
        </button>

        <button 
          @click="arm('night')"
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
          @click="disarm()"
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
