/**
 * services/profileService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API service for the /api/profile endpoint.
 * Reads the JWT token from localStorage (set by authService on login).
 *
 * Usage:
 *   import profileService from '@/services/profileService'
 *   const data = await profileService.getProfile()
 *   await profileService.saveProfile({ fullName: 'Jane', ... })
 */

const BASE_URL = 'http://localhost:8080/api/profile'
const TOKEN_KEY = 'jwt_token'

// ─── Shared authenticated fetch ───────────────────────────────────────────────
async function authFetch(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  // If 401/403, session expired — clear token
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(TOKEN_KEY)
    const err = new Error('Session expired. Please log in again.')
    err.status = res.status
    throw err
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || `Server error (${res.status})`)
    err.status = res.status
    throw err
  }

  return data
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/profile
 * Returns the logged-in user's profile data from the DB.
 * If the user has no profile yet, returns an object with all null values.
 *
 * @returns {Promise<ProfileData>}
 */
async function getProfile() {
  return authFetch(BASE_URL)
}

/**
 * PUT /api/profile
 * Creates or updates the logged-in user's profile in the DB.
 *
 * @param {ProfileData} data
 * @returns {Promise<ProfileData>} — the saved data echoed back by the server
 */
async function saveProfile(data) {
  return authFetch(BASE_URL, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────
const profileService = {
  getProfile,
  saveProfile,
}

export default profileService
