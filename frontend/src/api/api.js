/**
 * api/api.js — Authenticated fetch helper
 *
 * Usage:
 *   import { authFetch } from '../api/api'
 *   const data = await authFetch('/api/interviews')
 *
 * Automatically attaches: Authorization: Bearer <JWT from localStorage>
 */

const BASE_URL = 'http://localhost:8080'

/**
 * Perform an authenticated HTTP request.
 * Throws an Error with a user-friendly message on non-2xx responses.
 */
export async function authFetch(path, options = {}) {
  const token = localStorage.getItem('jwt_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Request failed with status ${res.status}`)
  }

  return res.json()
}
