<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { databaseApi } from '../api'

// State
const activeTab = ref('events')
const loading = ref(false)
const error = ref(null)
const lastUpdate = ref(null)

// Events
const events = ref([])
const eventFilter = ref({
  category: '',
  limit: 50
})

// Alarms
const alarms = ref([])

// Dashboard summary
const summary = ref(null)

// Sensor list for filters
const sensors = ref([])

function getCategoryIcon(category) {
  const icons = {
    sensor: '📡',
    alarm: '🚨',
    climate: '🌡️',
    system: '⚙️',
    power: '🔋',
    config: '🔧'
  }
  return icons[category] || '📋'
}

function getSeverityColor(severity) {
  const colors = {
    0: 'text-gray-500',
    1: 'text-amber-500',
    2: 'text-orange-500',
    3: 'text-red-500'
  }
  return colors[severity] || 'text-gray-500'
}

function getSeverityLabel(severity) {
  const labels = { 0: 'Info', 1: 'Warning', 2: 'Error', 3: 'Critical' }
  return labels[severity] || 'Info'
}

function formatTime(timestamp) {
  if (!timestamp) return '--'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return '--'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

async function fetchEvents() {
  loading.value = true
  error.value = null
  try {
    const params = { limit: eventFilter.value.limit }
    if (eventFilter.value.category) params.category = eventFilter.value.category
    const response = await databaseApi.getEvents(params)
    events.value = response.events || response || []
    lastUpdate.value = new Date()
  } catch (e) {
    error.value = e.message
    events.value = []
  } finally {
    loading.value = false
  }
}

async function fetchAlarms() {
  loading.value = true
  error.value = null
  try {
    const response = await databaseApi.getAlarmHistory({ limit: 50 })
    alarms.value = response.alarms || response || []
    lastUpdate.value = new Date()
  } catch (e) {
    error.value = e.message
    alarms.value = []
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    const response = await databaseApi.getDashboardSummary()
    summary.value = response
  } catch (e) {
    // Non-critical, don't show error
    console.warn('Failed to fetch summary:', e)
  }
}

async function loadTabData() {
  if (activeTab.value === 'events') {
    await fetchEvents()
  } else if (activeTab.value === 'alarms') {
    await fetchAlarms()
  }
}

watch(activeTab, loadTabData)
watch(eventFilter, () => {
  if (activeTab.value === 'events') fetchEvents()
}, { deep: true })

onMounted(async () => {
  await fetchSummary()
  await loadTabData()
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Connection Error / Server Unavailable -->
    <div v-if="error" class="card p-12 text-center">
      <div class="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
        <span class="text-3xl">📊</span>
      </div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">History Unavailable</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
        Historical data will appear here once the database server is connected.
      </p>
    </div>

    <!-- Content only shown when no error -->
    <template v-if="!error">
      <!-- Summary Cards (if available) -->
    <div v-if="summary" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ summary.events_24h || 0 }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Events (24h)</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold" :class="summary.errors_24h > 0 ? 'text-red-500' : 'text-emerald-500'">
          {{ summary.errors_24h || 0 }}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Errors (24h)</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-blue-500">{{ summary.sensors_online || 0 }}/{{ summary.sensors_total || 0 }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Online</div>
      </div>
      <div class="card p-4 text-center">
        <div class="text-2xl font-bold text-gray-600 dark:text-gray-300 capitalize">{{ summary.current_alarm_mode || '--' }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Mode</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="card overflow-hidden">
      <div class="border-b border-gray-100 dark:border-dark-700/50">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'events'"
            class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors text-center"
            :class="activeTab === 'events' 
              ? 'border-climax-500 text-climax-600 dark:text-climax-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            Events
          </button>
          <button
            @click="activeTab = 'alarms'"
            class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors text-center"
            :class="activeTab === 'alarms' 
              ? 'border-climax-500 text-climax-600 dark:text-climax-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            Alarms
          </button>
        </nav>
      </div>

      <!-- Events Tab -->
      <div v-if="activeTab === 'events'" class="p-4">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2 mb-4">
          <select 
            v-model="eventFilter.category"
            class="px-3 py-2 bg-gray-50 dark:bg-dark-700 border-0 rounded-xl text-sm focus:ring-2 focus:ring-climax-500"
          >
            <option value="">All</option>
            <option value="sensor">Sensor</option>
            <option value="alarm">Alarm</option>
            <option value="climate">Climate</option>
            <option value="system">System</option>
            <option value="power">Power</option>
          </select>
          <select 
            v-model="eventFilter.limit"
            class="px-3 py-2 bg-gray-50 dark:bg-dark-700 border-0 rounded-xl text-sm focus:ring-2 focus:ring-climax-500"
          >
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <button 
            @click="fetchEvents" 
            class="px-4 py-2 bg-climax-500 text-white rounded-xl text-sm font-medium hover:bg-climax-600 transition-colors active:scale-95"
            :disabled="loading"
          >
            {{ loading ? '...' : 'Refresh' }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="py-12 text-center">
          <div class="inline-block animate-spin w-6 h-6 border-3 border-climax-500 border-t-transparent rounded-full"></div>
        </div>

        <!-- Events List -->
        <div v-else-if="events.length > 0" class="space-y-2">
          <div 
            v-for="event in events" 
            :key="event.id"
            class="p-3 rounded-2xl bg-gray-50 dark:bg-dark-700/50 flex items-start gap-3"
          >
            <span class="text-lg mt-0.5">{{ getCategoryIcon(event.category) }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-gray-900 dark:text-white text-sm">{{ event.event_type || event.eventType }}</span>
                <span 
                  class="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-dark-600 font-medium"
                  :class="getSeverityColor(event.severity)"
                >
                  {{ getSeverityLabel(event.severity) }}
                </span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{{ event.message }}</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{{ formatRelativeTime(event.local_time || event.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-12 text-center text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">📋</div>
          <p class="font-medium">No events found</p>
        </div>
      </div>

      <!-- Alarms Tab -->
      <div v-if="activeTab === 'alarms'" class="p-4">
        <div class="flex justify-end mb-4">
          <button 
            @click="fetchAlarms" 
            class="px-4 py-2 bg-climax-500 text-white rounded-xl text-sm font-medium hover:bg-climax-600 transition-colors active:scale-95"
            :disabled="loading"
          >
            {{ loading ? '...' : 'Refresh' }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="py-12 text-center">
          <div class="inline-block animate-spin w-6 h-6 border-3 border-climax-500 border-t-transparent rounded-full"></div>
        </div>

        <!-- Alarms List -->
        <div v-else-if="alarms.length > 0" class="space-y-2">
          <div 
            v-for="alarm in alarms" 
            :key="alarm.id"
            class="p-4 rounded-2xl flex items-center gap-4"
            :class="{
              'bg-red-500/10': alarm.event_type === 'triggered',
              'bg-emerald-500/10': alarm.event_type === 'disarmed',
              'bg-blue-500/10': alarm.event_type === 'armed'
            }"
          >
            <span class="text-2xl">
              {{ alarm.event_type === 'triggered' ? '🚨' : alarm.event_type === 'armed' ? '🔒' : '🔓' }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 dark:text-white capitalize">
                {{ alarm.event_type }}
                <span v-if="alarm.alarm_mode" class="text-sm text-gray-500 font-normal">({{ alarm.alarm_mode }})</span>
              </div>
              <div v-if="alarm.trigger_name" class="text-sm text-gray-600 dark:text-gray-400">
                {{ alarm.trigger_name }}
              </div>
            </div>
            <div class="text-right text-xs text-gray-500 dark:text-gray-400">
              {{ formatRelativeTime(alarm.local_time || alarm.created_at) }}
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-12 text-center text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🚨</div>
          <p class="font-medium">No alarm events</p>
        </div>
      </div>
    </div>
    </template>

    <!-- Last Update -->
    <div v-if="lastUpdate && !error" class="text-center text-xs text-gray-400 dark:text-gray-500">
      Updated {{ lastUpdate.toLocaleTimeString() }}
    </div>
  </div>
</template>
