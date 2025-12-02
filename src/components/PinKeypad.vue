<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Enter PIN'
  },
  subtitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'cancel'])

const pin = ref('')
const maxLength = 4

const dots = computed(() => {
  return Array(maxLength).fill(false).map((_, i) => i < pin.value.length)
})

function addDigit(digit) {
  if (pin.value.length < maxLength) {
    pin.value += digit
  }
  // Auto-submit when 4 digits entered
  if (pin.value.length === maxLength) {
    setTimeout(() => emit('submit', pin.value), 150)
  }
}

function backspace() {
  pin.value = pin.value.slice(0, -1)
}

function clear() {
  pin.value = ''
}

function cancel() {
  pin.value = ''
  emit('cancel')
}

// Reset PIN when modal opens/closes
watch(() => props.show, (newVal) => {
  if (newVal) {
    pin.value = ''
  }
})

// Clear PIN on error
watch(() => props.error, (newVal) => {
  if (newVal) {
    pin.value = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-dark-800 w-full sm:w-auto sm:min-w-[360px] sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden safe-area-inset-bottom">
          <!-- Header -->
          <div class="px-6 pt-6 pb-4 text-center">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ title }}</h2>
            <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ subtitle }}</p>
          </div>

          <!-- PIN Display -->
          <div class="px-6 pb-2">
            <div class="flex justify-center gap-5 mb-4">
              <div 
                v-for="(filled, i) in dots" 
                :key="i"
                class="w-3.5 h-3.5 rounded-full transition-all duration-150"
                :class="filled ? 'bg-climax-500 scale-125' : 'bg-gray-200 dark:bg-dark-600'"
              />
            </div>

            <!-- Error Message -->
            <div v-if="error" class="text-center text-red-500 text-sm mb-3 font-medium">
              {{ error }}
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 text-sm mb-3">
              <span class="animate-pulse">Verifying...</span>
            </div>
          </div>

          <!-- Keypad -->
          <div class="px-4 pb-4">
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="digit in [1, 2, 3, 4, 5, 6, 7, 8, 9]" 
                :key="digit"
                @click="addDigit(String(digit))"
                :disabled="loading || pin.length >= maxLength"
                class="h-16 text-2xl font-semibold rounded-2xl bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-600 active:scale-95 active:bg-gray-200 dark:active:bg-dark-500 transition-all disabled:opacity-50 select-none"
              >
                {{ digit }}
              </button>
              
              <!-- Clear button -->
              <button 
                @click="clear"
                :disabled="loading"
                class="h-16 text-xs font-semibold uppercase tracking-wider rounded-2xl text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-700 active:scale-95 transition-all select-none"
              >
                Clear
              </button>
              
              <!-- Zero -->
              <button 
                @click="addDigit('0')"
                :disabled="loading || pin.length >= maxLength"
                class="h-16 text-2xl font-semibold rounded-2xl bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-600 active:scale-95 active:bg-gray-200 dark:active:bg-dark-500 transition-all disabled:opacity-50 select-none"
              >
                0
              </button>
              
              <!-- Backspace -->
              <button 
                @click="backspace"
                :disabled="loading || pin.length === 0"
                class="h-16 text-2xl rounded-2xl text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-700 active:scale-95 transition-all disabled:opacity-30 select-none"
              >
                ⌫
              </button>
            </div>
          </div>

          <!-- Cancel Button -->
          <div class="px-4 pb-6">
            <button 
              @click="cancel"
              :disabled="loading"
              class="w-full py-3.5 rounded-2xl text-gray-500 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
