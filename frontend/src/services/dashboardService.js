import { authFetch } from '../api/api'

async function getDashboardStats() {
  return authFetch('/api/dashboard/stats')
}

async function getChartData() {
  return authFetch('/api/dashboard/chart-data')
}

async function getUpcomingInterviews() {
  return authFetch('/api/dashboard/upcoming')
}

async function getCompaniesReadiness() {
  return authFetch('/api/dashboard/companies-readiness')
}

export default { getDashboardStats, getChartData, getUpcomingInterviews, getCompaniesReadiness }
