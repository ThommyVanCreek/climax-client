// API configuration
// VITE_API_URL - Database server API (historical data)
// VITE_BRIDGE_URL - Direct ESP32 Bridge API (real-time data)
const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || ''
const API_KEY = import.meta.env.VITE_API_KEY || ''

/**
 * Fetch wrapper for Database Server API (with authentication)
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

/**
 * Fetch wrapper for direct Bridge API (Bearer token auth)
 */
async function bridgeFetch(endpoint, options = {}) {
  // Use Bridge URL if configured, otherwise fall back to API URL
  const baseUrl = BRIDGE_URL || API_BASE_URL
  const url = `${baseUrl}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  // Bridge uses Bearer token auth
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// ═══════════════════════════════════════════════════════════════════════════════
// Bridge API (Real-time data from ESP32)
// Uses direct connection to Bridge when VITE_BRIDGE_URL is set
// ═══════════════════════════════════════════════════════════════════════════════

export const bridgeApi = {
  /**
   * Get system health status
   */
  getHealth() {
    return bridgeFetch('/api/health')
  },

  /**
   * Get full system status
   */
  getStatus() {
    return bridgeFetch('/api/status')
  },

  /**
   * Get all sensors with current state
   */
  getSensors() {
    return bridgeFetch('/api/sensors')
  },

  /**
   * Get alarm system state
   */
  getAlarm() {
    return bridgeFetch('/api/alarm')
  },

  /**
   * Arm the alarm system
   * @param {string} mode - 'stay', 'away', or 'night'
   * @param {string} pin - 4-digit PIN code
   */
  armAlarm(mode = 'away', pin) {
    return bridgeFetch('/api/alarm', {
      method: 'POST',
      body: JSON.stringify({ state: mode, pin }),
    })
  },

  /**
   * Disarm the alarm system
   * @param {string} pin - 4-digit PIN code
   */
  disarmAlarm(pin) {
    return bridgeFetch('/api/alarm', {
      method: 'POST',
      body: JSON.stringify({ state: 'disarm', pin }),
    })
  },

  /**
   * Get battery status for all sensors
   */
  getBatteries() {
    return bridgeFetch('/api/batteries')
  },

  /**
   * Get climate data from all sensors
   */
  getClimate() {
    return bridgeFetch('/api/climate')
  },

  /**
   * Get dashboard overview
   */
  getDashboard() {
    return bridgeFetch('/api/dashboard')
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// Database API (Historical data from PostgreSQL)
// ═══════════════════════════════════════════════════════════════════════════════

export const databaseApi = {
  /**
   * Get system events with pagination
   * @param {Object} params - Query parameters
   */
  getEvents(params = {}) {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/api/events?${query}`)
  },

  /**
   * Get climate history
   * @param {Object} params - Query parameters (sensor_id, start, end, interval)
   */
  getClimateHistory(params = {}) {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/api/climate/history?${query}`)
  },

  /**
   * Get battery history
   * @param {Object} params - Query parameters
   */
  getBatteryHistory(params = {}) {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/api/battery/history?${query}`)
  },

  /**
   * Get alarm history
   * @param {Object} params - Query parameters
   */
  getAlarmHistory(params = {}) {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/api/alarm/history?${query}`)
  },
}

export default {
  bridge: bridgeApi,
  database: databaseApi,
}
