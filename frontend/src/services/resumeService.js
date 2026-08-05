/**
 * services/resumeService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API service for the /api/resume endpoint.
 * Handles uploading resumes to Cloudinary & MySQL via Spring Boot backend.
 */

const BASE_URL = 'http://localhost:8080/api/resume'
const TOKEN_KEY = 'jwt_token'

/**
 * Upload resume file to Cloudinary + MySQL
 * @param {File} file
 * @returns {Promise<{resumeId: number, userId: number, resumeUrl: string, uploadDate: string}>}
 */
async function uploadResume(file) {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token === 'mock-jwt-token-for-test-user') {
    const mockData = {
      resumeId: 101,
      userId: 1,
      resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
      uploadDate: new Date().toISOString().split('T')[0],
    }
    localStorage.setItem('mock_resume_data', JSON.stringify(mockData))
    return mockData
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Note: Do NOT manually set Content-Type header when sending FormData!
    },
    body: formData,
  })

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(TOKEN_KEY)
    const err = new Error('Session expired. Please log in again.')
    err.status = res.status
    throw err
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || `Upload failed (${res.status})`)
    err.status = res.status
    throw err
  }

  return data
}

/**
 * GET /api/resume
 * Retrieves current user's uploaded resume details.
 */
async function getResume() {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token === 'mock-jwt-token-for-test-user') {
    const stored = localStorage.getItem('mock_resume_data')
    return stored ? JSON.parse(stored) : null
  }

  const res = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (res.status === 404) {
    return null
  }

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(TOKEN_KEY)
    const err = new Error('Session expired. Please log in again.')
    err.status = res.status
    throw err
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || `Failed to fetch resume (${res.status})`)
    err.status = res.status
    throw err
  }

  return data
}

/**
 * DELETE /api/resume
 * Deletes current user's resume.
 */
async function deleteResume() {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token === 'mock-jwt-token-for-test-user') {
    localStorage.removeItem('mock_resume_data')
    return true
  }

  const res = await fetch(BASE_URL, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to delete resume')
  }

  return true
}

const resumeService = {
  uploadResume,
  getResume,
  deleteResume,
}

export default resumeService
