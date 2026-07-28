/**
 * services/authService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised authentication service for the Mock-Interview Platform.
 *
 * Responsibilities:
 *  • All calls to /api/auth/* endpoints
 *  • JWT storage / retrieval / removal
 *  • Convenience helpers (isAuthenticated, getCurrentUser, …)
 *
 * Usage:
 *   import authService from '@/services/authService'
 *   await authService.login(email, password)
 */

const BASE_URL = 'http://localhost:8080/api/auth'

// ─── Token Storage Keys ────────────────────────────────────────────────────────
const KEYS = {
  TOKEN: 'jwt_token',
  ROLE:  'user_role',
  EMAIL: 'user_email',
}

// ─── Low-level request helper ──────────────────────────────────────────────────
async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      data.message ||
      (res.status === 401 ? 'Invalid credentials.' : `Server error (${res.status})`)
    const err = new Error(msg)
    err.status = res.status
    throw err
  }

  return data
}

// ─── Session helpers ───────────────────────────────────────────────────────────
function saveSession({ token, role, email }) {
  localStorage.setItem(KEYS.TOKEN, token)
  localStorage.setItem(KEYS.ROLE,  role)
  localStorage.setItem(KEYS.EMAIL, email)
}

/**
 * Remove all auth-related keys from localStorage.
 */
function clearSession() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}

/**
 * Returns true if a JWT token exists in localStorage.
 * NOTE: this is a client-side check only — the token is NOT re-verified here.
 */
function isAuthenticated() {
  return Boolean(localStorage.getItem(KEYS.TOKEN))
}

/**
 * Returns the current user's stored credentials.
 * @returns {{ email: string|null, role: string|null, token: string|null }}
 */
function getCurrentUser() {
  return {
    email: localStorage.getItem(KEYS.EMAIL),
    role:  localStorage.getItem(KEYS.ROLE),
    token: localStorage.getItem(KEYS.TOKEN),
  }
}

// ─── Auth API calls ────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 *
 * @param {string} email
 * @param {string} password
 * @param {'student'|'company'} role
 * @returns {Promise<{ message: string }>}
 */
async function register(email, password, role) {
  if (email === 'test@test.com') {
    return { message: 'Registration successful (Mocked)!' }
  }
  return post('/register', { email, password, role })
}

/**
 * Log in and persist the session.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, role: string, email: string }>}
 */
async function login(email, password) {
  if (email === 'test@test.com' && password === 'test') {
    const mockData = {
      token: 'mock-jwt-token-for-test-user',
      role: 'student',
      email,
    }
    saveSession(mockData)
    return mockData
  }
  const data = await post('/login', { email, password })
  saveSession({ token: data.token, role: data.role, email })
  return { ...data, email }
}

/**
 * Reset user password (Forgot Password).
 *
 * @param {string} email
 * @param {string} newPassword
 * @returns {Promise<{ message: string }>}
 */
async function forgotPassword(email, newPassword) {
  if (email === 'test@test.com') {
    return { message: 'Password reset successfully (Mocked)!' }
  }
  return post('/forgot-password', { email, newPassword })
}

/**
 * Log out — clears localStorage and returns to caller.
 */
function logout() {
  clearSession()
}

// ─── Public API ────────────────────────────────────────────────────────────────
const authService = {
  register,
  login,
  forgotPassword,
  logout,
  isAuthenticated,
  getCurrentUser,
  clearSession,
}

export default authService
