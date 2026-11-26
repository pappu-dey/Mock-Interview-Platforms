/**
 * api/api.js — Authenticated fetch helper
 *
 * Usage:
 *   import { authFetch } from '../api/api'
 *   const data = await authFetch('/api/dashboard/stats')
 *
 * Automatically attaches: Authorization: Bearer <JWT from localStorage>
 */

import { API_BASE_URL } from '../config/apiConfig'

export async function authFetch(path, options = {}) {
  const token = localStorage.getItem('jwt_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('jwt_token')
    }
    const errBody = await res.json().catch(() => ({}))
    const error = new Error(errBody.message || errBody.error || `Request failed with status ${res.status}`)
    error.status = res.status
    throw error
  }

  if (res.status === 204) {
    return null
  }

  return res.json()
}
