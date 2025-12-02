import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bridgeApi } from '../api'

export const useSecurityStore = defineStore('security', () => {
  // State
  const status = ref(null)
  const sensors = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)

  // Computed
  const alarmState = computed(() => status.value?.alarm?.state || 'unknown')
  const isArmed = computed(() => ['armed_away', 'armed_stay', 'armed_night'].includes(alarmState.value))
  const isTriggered = computed(() => alarmState.value === 'triggered')
  const openSensors = computed(() => sensors.value.filter(s => s.contactOpen && s.active))
  const offlineSensors = computed(() => sensors.value.filter(s => s.dataStale))
  const lowBatterySensors = computed(() => sensors.value.filter(s => s.battery?.level < 20))

  // Actions
  async function fetchStatus() {
    loading.value = true
    error.value = null
    try {
      status.value = await bridgeApi.getStatus()
      lastUpdate.value = new Date()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchSensors() {
    loading.value = true
    error.value = null
    try {
      const response = await bridgeApi.getSensors()
      sensors.value = response.sensors || []
      lastUpdate.value = new Date()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function armSystem(mode = 'away') {
    loading.value = true
    error.value = null
    try {
      await bridgeApi.armAlarm(mode)
      await fetchStatus()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function disarmSystem() {
    loading.value = true
    error.value = null
    try {
      await bridgeApi.disarmAlarm()
      await fetchStatus()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    status,
    sensors,
    loading,
    error,
    lastUpdate,
    // Computed
    alarmState,
    isArmed,
    isTriggered,
    openSensors,
    offlineSensors,
    lowBatterySensors,
    // Actions
    fetchStatus,
    fetchSensors,
    armSystem,
    disarmSystem,
  }
})
