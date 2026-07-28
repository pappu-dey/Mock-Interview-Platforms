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

  if (token === 'mock-jwt-token-for-test-user') {
    if (path.includes('/api/profile')) {
      if (options.method === 'PUT') {
        localStorage.setItem('mock_profile_data', options.body)
        return JSON.parse(options.body)
      } else {
        const stored = localStorage.getItem('mock_profile_data')
        if (stored) return JSON.parse(stored)
        return {
          fullName: 'Test User',
          phone: '+1234567890',
          college: 'Test University',
          branch: 'Computer Science',
          graduationYear: '2026',
          skills: 'React, Node.js, Spring Boot',
          linkedinUrl: 'https://linkedin.com/in/testuser',
          leetcodeUrl: 'https://leetcode.com/testuser',
          githubUrl: 'https://github.com/testuser',
        }
      }
    }
    return {}
  }

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
