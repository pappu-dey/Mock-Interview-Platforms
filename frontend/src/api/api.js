/**
 * api/api.js — Authenticated fetch helper with live mock & real backend sync
 *
 * Usage:
 *   import { authFetch } from '../api/api'
 *   const data = await authFetch('/api/interviews')
 *
 * Automatically attaches: Authorization: Bearer <JWT from localStorage>
 */

const BASE_URL = 'https://main-mock-interview-platforms-pappus-workspace.light-cloud.io'

// ─── Local Mock Practice State (for offline/test-user real-time tracking) ──────
function getMockState() {
  const defaultState = {
    totalInterviews: 12,
    averageScore: 85,
    questionsSolved: 120,
    currentStreak: 5,
    weeklyChange: '+3 this wk',
    lastActiveDate: new Date().toISOString().split('T')[0],
    categoryScores: {
      'Quantitative Aptitude': { score: 78, sessions: 5, totalQuestions: 25 },
      'Logical Reasoning': { score: 91, sessions: 12, totalQuestions: 45 },
      'Verbal Ability': { score: 82, sessions: 3, totalQuestions: 12 },
      'Technical': { score: 85, sessions: 7, totalQuestions: 30 },
      'System Design': { score: 74, sessions: 6, totalQuestions: 22 },
      'SQL & Databases': { score: 68, sessions: 5, totalQuestions: 18 },
    },
    recentSessions: [
      { id: 1, topic: 'DSA Trees & Graphs', date: 'Aug 1, 2026', score: 92, time: '28 min', type: 'Mock' },
      { id: 2, topic: 'Java OOP Fundamentals', date: 'Jul 28, 2026', score: 88, time: '22 min', type: 'Practice' },
      { id: 3, topic: 'Aptitude — Percentages', date: 'Jul 25, 2026', score: 81, time: '20 min', type: 'Practice' },
      { id: 4, topic: 'DSA Arrays & Sorting', date: 'Jul 22, 2026', score: 85, time: '30 min', type: 'Mock' },
      { id: 5, topic: 'System Design Basics', date: 'Jul 19, 2026', score: 78, time: '35 min', type: 'Mock' },
      { id: 6, topic: 'SQL Joins & Subqueries', date: 'Jul 16, 2026', score: 68, time: '18 min', type: 'Practice' },
    ],
    upcomingMeetings: [
      { title: 'TCS Technical', subtitle: 'System Design', time: '2:00 PM', initials: 'TCS', color: '#3C6FBB' },
      { title: 'Infosys HR', subtitle: 'Behavioral', time: '4:30 PM', initials: 'IF', color: '#1BA94C' },
    ],
    weeklyActivity: [0, 1, 0, 2, 3, 1, 0, 1, 2, 3, 2, 1, 0, 0, 2, 3, 3, 1, 2, 0, 1, 3, 2, 1, 3, 3, 2, 1],
  }

  const stored = localStorage.getItem('mock_practice_state')
  if (!stored) {
    localStorage.setItem('mock_practice_state', JSON.stringify(defaultState))
    return defaultState
  }
  try {
    return JSON.parse(stored)
  } catch {
    return defaultState
  }
}

function saveMockState(state) {
  localStorage.setItem('mock_practice_state', JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('practice-stats-updated', { detail: state }))
}

/**
 * Perform an authenticated HTTP request.
 * Throws an Error with a user-friendly message on non-2xx responses.
 */
export async function authFetch(path, options = {}) {
  const token = localStorage.getItem('jwt_token')

  if (token === 'mock-jwt-token-for-test-user') {
    const state = getMockState()

    // ── Profile ──
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

    // ── Practice recording endpoints ──
    if (path === '/api/practice/submit-answer') {
      const payload = options.body ? JSON.parse(options.body) : {}
      state.questionsSolved = (state.questionsSolved || 120) + 1

      // Dynamic Streak Update: ensure active streak is maintained & incremented
      const todayStr = new Date().toISOString().split('T')[0]
      if (!state.lastActivityDate) {
        state.lastActivityDate = todayStr
        state.currentStreak = Math.max(1, state.currentStreak || 1)
      } else if (state.lastActivityDate !== todayStr) {
        state.currentStreak = (state.currentStreak || 1) + 1
        state.lastActivityDate = todayStr
      }

      // Update category questions & score
      const cat = payload.category || 'Quantitative Aptitude'
      if (!state.categoryScores[cat]) {
        state.categoryScores[cat] = { score: 75, sessions: 1, totalQuestions: 0 }
      }
      const catData = state.categoryScores[cat]
      catData.totalQuestions = (catData.totalQuestions || 0) + 1
      const isCorrect = Boolean(payload.isCorrect)
      const qScore = isCorrect ? 100 : 0
      catData.score = Math.round((catData.score * (catData.totalQuestions - 1) + qScore) / catData.totalQuestions)

      // Update topic specific questions & score
      if (!state.topicScores) state.topicScores = {}
      const topicName = payload.topic || 'General'
      if (!state.topicScores[topicName]) {
        state.topicScores[topicName] = { category: cat, totalQuestions: 0, correctCount: 0, score: 75 }
      }
      const tData = state.topicScores[topicName]
      tData.totalQuestions = (tData.totalQuestions || 0) + 1
      if (isCorrect) tData.correctCount = (tData.correctCount || 0) + 1
      tData.score = Math.round((tData.correctCount / tData.totalQuestions) * 100)

      // Update activity heatmap
      if (Array.isArray(state.weeklyActivity) && state.weeklyActivity.length > 0) {
        state.weeklyActivity[state.weeklyActivity.length - 1] = Math.min(3, (state.weeklyActivity[state.weeklyActivity.length - 1] || 0) + 1)
      }

      saveMockState(state)
      return {
        success: true,
        questionsSolvedTotal: state.questionsSolved,
        currentStreak: state.currentStreak,
        category: cat,
        categoryTotalQuestions: catData.totalQuestions,
        categoryScore: catData.score,
        topic: topicName,
        topicTotalQuestions: tData.totalQuestions,
        topicScore: tData.score,
        isCorrect,
      }
    }

    if (path === '/api/practice/submit-session') {
      const payload = options.body ? JSON.parse(options.body) : {}
      const totalQ = payload.totalQuestions || 10
      state.questionsSolved = (state.questionsSolved || 120) + totalQ
      state.totalInterviews = (state.totalInterviews || 12) + 1

      // Dynamic Streak Update
      const todayStr = new Date().toISOString().split('T')[0]
      if (!state.lastActivityDate) {
        state.lastActivityDate = todayStr
        state.currentStreak = Math.max(1, state.currentStreak || 1)
      } else if (state.lastActivityDate !== todayStr) {
        state.currentStreak = (state.currentStreak || 1) + 1
        state.lastActivityDate = todayStr
      }

      const sessionScore = payload.score != null ? Math.round(payload.score) : 80
      state.averageScore = Math.round((state.averageScore * (state.totalInterviews - 1) + sessionScore) / state.totalInterviews)

      // Update category stats for this session
      const cat = payload.category || 'Quantitative Aptitude'
      if (!state.categoryScores[cat]) {
        state.categoryScores[cat] = { score: sessionScore, sessions: 1, totalQuestions: totalQ }
      } else {
        state.categoryScores[cat].sessions = (state.categoryScores[cat].sessions || 1) + 1
        state.categoryScores[cat].totalQuestions = (state.categoryScores[cat].totalQuestions || 0) + totalQ
        state.categoryScores[cat].score = Math.round((state.categoryScores[cat].score + sessionScore) / 2)
      }

      const newSession = {
        id: state.recentSessions.length + 1,
        topic: payload.topic || (payload.company ? `${payload.company} Mock Interview` : 'Practice Assessment'),
        date: 'Today',
        score: sessionScore,
        time: payload.timeSpentSeconds ? `${Math.round(payload.timeSpentSeconds / 60)} min` : '15 min',
        type: payload.type || (payload.company ? 'Mock' : 'Practice'),
      }
      state.recentSessions.unshift(newSession)

      saveMockState(state)
      return { success: true, session: newSession, state }
    }

    if (path === '/api/practice/schedule-interview') {
      const payload = options.body ? JSON.parse(options.body) : {}
      const comp = payload.company || 'TCS'
      const role = payload.role || 'Software Engineer'
      const colors = { TCS: '#3C6FBB', Infosys: '#1C6DB0', Wipro: '#5B2B82', Accenture: '#7C2A8C' }

      const meeting = {
        title: `${comp} Mock Interview`,
        subtitle: role,
        time: payload.startTime ? payload.startTime.split('T')[1]?.substring(0, 5) || 'Tomorrow' : 'Tomorrow',
        initials: comp.substring(0, 2).toUpperCase(),
        color: colors[comp] || '#C97F4A',
      }
      state.upcomingMeetings.unshift(meeting)
      saveMockState(state)
      return { success: true, meeting }
    }

    // ── Dashboard endpoints ──
    if (path === '/api/dashboard/stats') {
      return {
        totalInterviews: state.totalInterviews,
        averageScore: state.averageScore,
        questionsSolved: state.questionsSolved,
        currentStreak: Math.max(1, state.currentStreak || 1),
        weeklyChange: state.weeklyChange,
      }
    }

    if (path === '/api/dashboard/chart-data') {
      return Object.entries(state.categoryScores).map(([cat, data]) => {
        const shortLabels = {
          'Quantitative Aptitude': 'Aptitude',
          'Logical Reasoning': 'Reasoning',
          'Verbal Ability': 'Verbal',
          'Technical': 'Tech',
          'System Design': 'System',
          'SQL & Databases': 'SQL',
        }
        return {
          label: shortLabels[cat] || cat.slice(0, 6),
          height: data.score,
          score: data.score,
          color: 'var(--accent)',
        }
      })
    }

    if (path === '/api/dashboard/upcoming') {
      return state.upcomingMeetings
    }

    if (path === '/api/dashboard/companies-readiness') {
      const avg = state.averageScore || 80
      return [
        { name: 'TCS', role: 'Software Engineer', readiness: Math.min(98, Math.round(avg * 1.05)), status: 'Ready', logoBg: '#3C6FBB', initials: 'TCS' },
        { name: 'Infosys', role: 'Systems Engineer', readiness: Math.min(95, Math.round(avg * 0.90)), status: avg >= 75 ? 'Ready' : 'In Progress', logoBg: '#1C6DB0', initials: 'IN' },
        { name: 'Wipro', role: 'Project Engineer', readiness: Math.min(90, Math.round(avg * 0.80)), status: 'In Progress', logoBg: '#5B2B82', initials: 'WI' },
        { name: 'Accenture', role: 'Associate Developer', readiness: Math.min(99, Math.round(avg * 1.10)), status: 'Ready', logoBg: '#7C2A8C', initials: 'AC' },
      ]
    }

    // ── Performance endpoints ──
    if (path === '/api/performance') {
      const skills = Object.entries(state.categoryScores).map(([label, d], idx) => {
        const colors = ['#5B4EE8', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
        return {
          label,
          category: label,
          score: d.score,
          sessions: d.sessions,
          totalQuestions: d.totalQuestions,
          color: colors[idx % colors.length],
        }
      })

      // Best category
      const best = skills.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), skills[0] || { label: 'DSA', score: 91, sessions: 12 })

      return {
        totalSessions: state.totalInterviews,
        averageScore: state.averageScore,
        currentStreak: Math.max(1, state.currentStreak || 1),
        bestCategory: best.label,
        bestCategoryScore: best.score,
        bestCategorySessions: best.sessions,
        scoreTrend: state.recentSessions.slice(0, 8).reverse().map((s, i) => ({
          session: `S${i + 1}`,
          sessionLabel: `Session ${i + 1}`,
          score: s.score,
          date: s.date,
          topic: s.topic,
        })),
        skillBreakdown: skills,
        recentSessions: state.recentSessions,
        strengths: [
          `Strong accuracy in ${best.label} above 80% benchmark`,
          'Consistent problem-solving streak on the platform',
          'Solid fundamental understanding of algorithmic patterns',
        ],
        improvements: [
          'Practice time management on complex multi-step reasoning problems',
          'Aim to improve query optimization in SQL & database topics',
          'Take full-length mock interviews to increase exam stamina',
        ],
        weeklyActivity: state.weeklyActivity,
        placementReadiness: Math.min(96, Math.round(state.averageScore * 0.92)),
      }
    }

    if (path === '/api/performance/sessions') {
      return state.recentSessions
    }

    if (path === '/api/performance/skills') {
      return Object.entries(state.categoryScores).map(([label, d], idx) => {
        const colors = ['#5B4EE8', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
        return {
          label,
          category: label,
          score: d.score,
          sessions: d.sessions,
          color: colors[idx % colors.length],
        }
      })
    }

    return {}
  }

  // ── Real Backend Fetch ──
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

  const result = await res.json()

  // If a practice answer or session was recorded, notify any listening dashboard/performance components
  if (path.startsWith('/api/practice/')) {
    window.dispatchEvent(new CustomEvent('practice-stats-updated', { detail: result }))
  }

  return result
}
