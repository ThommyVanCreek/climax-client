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
  const alarmState = computed(() => {
    const alarm = status.value?.alarm
    if (!alarm) return 'unknown'
    if (alarm.inExitDelay) return 'exit_delay'
    if (alarm.inEntryDelay) return 'entry_delay'
    if (alarm.modeName === 'triggered') return 'triggered'
    if (alarm.armed) return `armed_${alarm.modeName}`
    return 'disarmed'
  })
  const isArmed = computed(() => status.value?.alarm?.armed || false)
  const isTriggered = computed(() => status.value?.alarm?.modeName === 'triggered')
  const openSensors = computed(() => sensors.value.filter(s => s.contactOpen && !s.dataStale))
  const offlineSensors = computed(() => sensors.value.filter(s => s.dataStale))
  const lowBatterySensors = computed(() => sensors.value.filter(s => s.battery?.level !== null && s.battery?.level < 20))
  const bypassedSensors = computed(() => sensors.value.filter(s => s.bypass?.active || s.bypass?.nightActive))
  const systemInfo = computed(() => status.value?.system || null)
  const bridgeBattery = computed(() => status.value?.system?.battery || null)
  const configuredSensorCount = computed(() => {
    // Status response includes all configured sensors
    return status.value?.sensors?.length || sensors.value.length || 0
  })

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
      // API returns array directly, not wrapped in {sensors: [...]}
      sensors.value = Array.isArray(response) ? response : (response.sensors || [])
      lastUpdate.value = new Date()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function armSystem(mode = 'away', pin) {
    loading.value = true
    error.value = null
    try {
      await bridgeApi.armAlarm(mode, pin)
      await fetchStatus()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function disarmSystem(pin) {
    loading.value = true
    error.value = null
    try {
      await bridgeApi.disarmAlarm(pin)
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
    bypassedSensors,
    systemInfo,
    bridgeBattery,
    configuredSensorCount,
    // Actions
    fetchStatus,
    fetchSensors,
    armSystem,
    disarmSystem,
  }
})
