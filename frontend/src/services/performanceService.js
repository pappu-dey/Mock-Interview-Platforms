import { authFetch } from '../api/api'

async function getPerformanceData() {
  return authFetch('/api/performance')
}

async function getRecentSessions() {
  return authFetch('/api/performance/sessions')
}

async function getSkillBreakdown() {
  return authFetch('/api/performance/skills')
}

export default { getPerformanceData, getRecentSessions, getSkillBreakdown }
