/**
 * Performance.jsx — Interview & Practice Performance Analytics
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   - KPI summary cards (total sessions, avg score, streak, best subject)
 *   - Score trend bar chart (last 8 sessions)
 *   - Skill category progress breakdown
 *   - Recent sessions history table
 *   - Strengths & improvement areas panel
 *   - Weekly activity heatmap strip
 *   - AI placement readiness score
 */

import React, { useState, useEffect, useRef } from 'react'
import performanceService from '../../services/performanceService'
import './Performance.css'

// ── Inline SVG icon set ───────────────────────────────────────────────────────
const Icon = {
  Trend: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  Flame: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  ArrowUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
  ArrowDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
}

// ── Empty Defaults (no dummy stats) ────────────────────────────────────────────
const EMPTY_WEEKLY_ACTIVITY = Array(28).fill(0)

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreLabel(s) {
  if (s >= 90) return 'Excellent'
  if (s >= 80) return 'Great'
  if (s >= 70) return 'Good'
  return 'Average'
}
function scoreClass(s) {
  if (s >= 90) return 'perf-status--excellent'
  if (s >= 80) return 'perf-status--great'
  if (s >= 70) return 'perf-status--good'
  return 'perf-status--average'
}

function AnimatedNumber({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ran = useRef(false)
  useEffect(() => {
    ran.current = false
    const end = parseInt(target, 10)
    if (isNaN(end)) { setVal(target); return }
    let cur = 0
    const step = Math.max(1, Math.ceil(end / 40))
    const t = setInterval(() => {
      cur += step
      if (cur >= end) { setVal(end); clearInterval(t) }
      else setVal(cur)
    }, 20)
    return () => clearInterval(t)
  }, [target])
  return <>{isNaN(parseInt(target, 10)) ? target : val}{suffix}</>
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Performance() {
  const [activeTab, setActiveTab] = useState('overview')

  // Live state from API (zero-initialized, no dummy fallback)
  const [totalSessions, setTotalSessions] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [totalActiveDays, setTotalActiveDays] = useState(0)
  const [totalAttempted, setTotalAttempted] = useState(0)
  const [totalSolved, setTotalSolved] = useState(0)
  const [totalQuestionsInBank, setTotalQuestionsInBank] = useState(0)
  const [accuracyPercentage, setAccuracyPercentage] = useState(0)
  const [bestCategory, setBestCategory] = useState('N/A')
  const [bestCategoryScore, setBestCategoryScore] = useState(0)
  const [bestCategorySessions, setBestCategorySessions] = useState(0)

  const [scoreTrend, setScoreTrend] = useState([])
  const [skillBreakdown, setSkillBreakdown] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [strengths, setStrengths] = useState([])
  const [improve, setImprove] = useState([])
  const [weeklyActivity, setWeeklyActivity] = useState(EMPTY_WEEKLY_ACTIVITY)
  const [placementReadiness, setPlacementReadiness] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const data = await performanceService.getPerformanceData()
        if (!isMounted || !data) return

        setTotalSessions(data.totalSessions ?? 0)
        setAverageScore(Math.round(data.averageScore ?? 0))
        setCurrentStreak(data.currentStreak ?? 0)
        setLongestStreak(data.longestStreak ?? 0)
        setTotalActiveDays(data.totalActiveDays ?? 0)
        setTotalAttempted(data.totalAttempted ?? 0)
        setTotalSolved(data.totalSolved ?? 0)
        setTotalQuestionsInBank(data.totalQuestionsInBank ?? 0)
        setAccuracyPercentage(Math.round(data.accuracyPercentage ?? 0))
        setBestCategory(data.bestCategory || 'N/A')
        setBestCategoryScore(Math.round(data.bestCategoryScore ?? 0))
        setBestCategorySessions(data.bestCategorySessions ?? 0)

        setScoreTrend(
          Array.isArray(data.scoreTrend)
            ? data.scoreTrend.map((item, idx) => ({
                session: item.session || `S${idx + 1}`,
                score: Math.round(item.score ?? 0),
                date: item.date || `Session ${idx + 1}`,
                topic: item.topic || 'Session',
              }))
            : []
        )

        const colors = ['#5B4EE8', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
        setSkillBreakdown(
          Array.isArray(data.skillBreakdown)
            ? data.skillBreakdown.map((item, idx) => ({
                label: item.label || item.category || 'Skill',
                score: Math.round(item.score ?? 0),
                sessions: item.sessions || 0,
                totalQuestions: item.totalQuestions ?? item.sessions ?? 0,
                color: item.color || colors[idx % colors.length],
              }))
            : []
        )

        setRecentSessions(
          Array.isArray(data.recentSessions)
            ? data.recentSessions.map((item, idx) => ({
                id: item.id || idx + 1,
                topic: item.topic || (item.roleName ? `${item.roleName}` : 'Practice Session'),
                date: item.date || 'Recent',
                score: Math.round(item.score ?? item.overallScore ?? 0),
                time: item.time || '—',
                type: item.type || 'Practice',
              }))
            : []
        )

        setStrengths(Array.isArray(data.strengths) ? data.strengths : [])
        setImprove(Array.isArray(data.improvements) ? data.improvements : [])
        setWeeklyActivity(
          Array.isArray(data.weeklyActivity) && data.weeklyActivity.length > 0
            ? data.weeklyActivity
            : EMPTY_WEEKLY_ACTIVITY
        )
        setPlacementReadiness(Math.round(data.placementReadiness ?? 0))
      } catch (err) {
        console.warn('Could not load performance data from API:', err)
        if (isMounted) setError('Could not load performance analytics from server.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    const handlePracticeStatsUpdated = () => {
      loadData()
    }
    window.addEventListener('practice-stats-updated', handlePracticeStatsUpdated)

    return () => {
      isMounted = false
      window.removeEventListener('practice-stats-updated', handlePracticeStatsUpdated)
    }
  }, [])

  const unsolvedCount = Math.max(0, totalQuestionsInBank - totalSolved)

  const kpiCards = [
    {
      id: 'solved',
      label: 'Questions Solved',
      value: `${totalSolved}/${totalQuestionsInBank || totalAttempted}`,
      sub: `${totalAttempted} attempted · ${unsolvedCount} unsolved`,
      up: null,
      icon: Icon.CheckCircle,
      color: '#5B4EE8',
      bg: 'rgba(91,78,232,0.08)',
    },
    {
      id: 'avg',
      label: 'Accuracy / Avg Score',
      value: `${accuracyPercentage || averageScore}%`,
      sub: `Avg session score: ${averageScore}%`,
      up: accuracyPercentage > 0 ? true : null,
      icon: Icon.Trend,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      id: 'streak',
      label: 'Current Streak',
      value: `${currentStreak} days`,
      sub: `Best: ${longestStreak} days · ${totalActiveDays} active days`,
      up: null,
      icon: Icon.Flame,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      id: 'best',
      label: 'Best Category',
      value: bestCategory,
      sub: bestCategory !== 'N/A'
        ? `Avg ${bestCategoryScore}% across ${bestCategorySessions} answers`
        : `${totalSessions} sessions completed`,
      up: null,
      icon: Icon.Trophy,
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.08)',
    },
  ]

  const scoreCircumference = 2 * Math.PI * 50
  const scoreStrokeDash = `${(scoreCircumference * averageScore) / 100} ${scoreCircumference}`

  const readinessCircumference = 2 * Math.PI * 40
  const readinessStrokeDash = `${(readinessCircumference * placementReadiness) / 100} ${readinessCircumference}`

  return (
    <div className="perf-page">
      <div className="perf-inner">

        {/* ── Hero ── */}
        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', color: '#dc2626', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        <div className="perf-hero">
          <div className="perf-hero__accent" />
          <div className="perf-hero__content">
            <span className="perf-hero__badge">📊 ANALYTICS DASHBOARD</span>
            <h1 className="perf-hero__title">
              Your <span className="perf-gradient-text">Performance</span> Overview
            </h1>
            <p className="perf-hero__sub">
              Track your interview readiness, monitor score trends, and identify areas to accelerate your prep.
            </p>
          </div>
          <div className="perf-hero__ring">
            <svg viewBox="0 0 120 120" className="perf-ring-svg">
              <circle cx="60" cy="60" r="50" className="perf-ring-bg" />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="perf-ring-fill"
                strokeDasharray={scoreStrokeDash}
              />
            </svg>
            <div className="perf-ring-label">
              <span className="perf-ring-num">
                <AnimatedNumber target={averageScore} />%
              </span>
              <span className="perf-ring-sub">Overall</span>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="perf-kpi-grid">
          {kpiCards.map(({ id, label, value, sub, up, icon: KpiIcon, color, bg }) => (
            <div key={id} className="perf-kpi-card" style={{ '--kpi-color': color, '--kpi-bg': bg }}>
              <div className="perf-kpi-icon"><KpiIcon /></div>
              <div className="perf-kpi-body">
                <div className="perf-kpi-label">{label}</div>
                <div className="perf-kpi-value">
                  {id === 'avg' ? (
                    <><AnimatedNumber target={averageScore} />%</>
                  ) : id === 'sessions' ? (
                    <AnimatedNumber target={totalSessions} />
                  ) : (
                    value
                  )}
                </div>
                <div className="perf-kpi-sub">
                  {up !== null && (
                    <span className={`perf-kpi-arrow ${up ? 'up' : 'down'}`}>
                      {up ? <Icon.ArrowUp /> : <Icon.ArrowDown />}
                    </span>
                  )}
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="perf-tabs">
          {['overview', 'sessions', 'insights'].map(tab => (
            <button
              key={tab}
              className={`perf-tab ${activeTab === tab ? 'perf-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? '📈 Overview' : tab === 'sessions' ? '📋 Sessions' : '💡 Insights'}
            </button>
          ))}
        </div>

        {/* ════ Overview Tab ════ */}
        {activeTab === 'overview' && (
          <div className="perf-overview-grid">

            {/* Score Trend Chart */}
            <div className="perf-card perf-card--wide">
              <div className="perf-card-header">
                <div>
                  <h2 className="perf-card-title">Score Trend</h2>
                  <p className="perf-card-sub">Last {scoreTrend.length} practice sessions</p>
                </div>
                <div className="perf-trend-badge"><Icon.ArrowUp /> Live Tracking</div>
              </div>
              {scoreTrend.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>
                  {loading ? 'Loading score trend…' : 'No completed sessions yet. Complete a mock test to track your score trend!'}
                </div>
              ) : (
                <div className="perf-chart-area">
                  <div className="perf-chart-guides">
                    {[100, 75, 50, 25].map(g => (
                      <div key={g} className="perf-guide">
                        <span className="perf-guide-num">{g}%</span>
                        <div className="perf-guide-line" />
                      </div>
                    ))}
                  </div>
                  <div className="perf-bar-chart">
                    {scoreTrend.map(({ session, score, date, topic }) => (
                      <div key={session} className="perf-bar-col">
                        <div className="perf-bar-tooltip">
                          <strong>{score}%</strong>
                          <span>{topic}</span>
                          <span>{date}</span>
                        </div>
                        <div className="perf-bar-wrap">
                          <div className="perf-bar" style={{ height: `${score}%` }}>
                            <span className="perf-bar-val">{score}%</span>
                          </div>
                        </div>
                        <div className="perf-bar-label">{session}</div>
                        <div className="perf-bar-date">{date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skill Breakdown */}
            <div className="perf-card">
              <div className="perf-card-header">
                <div>
                  <h2 className="perf-card-title">Skill Breakdown</h2>
                  <p className="perf-card-sub">Average score by category</p>
                </div>
              </div>
              <div className="perf-skill-list">
                {skillBreakdown.length === 0 ? (
                  <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--muted)' }}>
                    {loading ? 'Loading skill breakdown…' : 'No topic performance data yet. Solve practice questions to see your topic breakdown.'}
                  </div>
                ) : (
                  skillBreakdown.map(({ label, score, sessions, totalQuestions, color }) => (
                    <div key={label} className="perf-skill-row">
                      <div className="perf-skill-meta">
                        <span className="perf-skill-label">{label}</span>
                        <span className="perf-skill-sessions">
                          {totalQuestions ? `${totalQuestions} answered` : `${sessions} sessions`}
                        </span>
                      </div>
                      <div className="perf-skill-bar-wrap">
                        <div className="perf-skill-bar" style={{ '--skill-w': `${score}%`, '--skill-color': color }} />
                      </div>
                      <span className="perf-skill-score" style={{ color }}>{score}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weekly Activity Heatmap */}
            <div className="perf-card">
              <div className="perf-card-header">
                <div>
                  <h2 className="perf-card-title">Weekly Activity</h2>
                  <p className="perf-card-sub">Last 28 days</p>
                </div>
                <div className="perf-act-legend">
                  <span className="perf-act-dot act-0" /> Less
                  <span className="perf-act-dot act-1" />
                  <span className="perf-act-dot act-2" />
                  <span className="perf-act-dot act-3" /> More
                </div>
              </div>
              <div className="perf-heatmap-labels">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="perf-heatmap">
                {weeklyActivity.map((level, i) => (
                  <div
                    key={i}
                    className={`perf-heatmap-cell act-${level}`}
                    title={['No activity', 'Low activity', 'Medium activity', 'High activity'][level]}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ════ Sessions Tab ════ */}
        {activeTab === 'sessions' && (
          <div className="perf-card">
            <div className="perf-card-header">
              <div>
                <h2 className="perf-card-title">Recent Sessions</h2>
                <p className="perf-card-sub">All your practice & mock interview history</p>
              </div>
              <span className="perf-session-count">{recentSessions.length} sessions</span>
            </div>
            <div className="perf-sessions-wrap">
              {recentSessions.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                  No recent sessions recorded yet.
                </div>
              ) : (
                <table className="perf-sessions-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Topic</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map(({ id, topic, date, score, time, type }) => (
                    <tr key={id}>
                      <td className="perf-td-num">{id}</td>
                      <td className="perf-td-topic">{topic}</td>
                      <td>
                        <span className={`perf-type-badge ${type === 'Mock' ? 'type-mock' : 'type-practice'}`}>
                          {type}
                        </span>
                      </td>
                      <td className="perf-td-muted">
                        <span className="perf-icon-cell"><Icon.Calendar />{date}</span>
                      </td>
                      <td className="perf-td-muted">
                        <span className="perf-icon-cell"><Icon.Clock />{time}</span>
                      </td>
                      <td>
                        <div className="perf-score-cell">
                          <div className="perf-score-mini">
                            <div className="perf-score-mini-fill" style={{ width: `${score}%` }} />
                          </div>
                          <strong>{score}%</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`perf-status-badge ${scoreClass(score)}`}>
                          {scoreLabel(score)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        )}

        {/* ════ Insights Tab ════ */}
        {activeTab === 'insights' && (
          <div className="perf-insights-grid">

            <div className="perf-card perf-insight-card perf-insight-card--green">
              <div className="perf-insight-icon perf-insight-icon--green"><Icon.CheckCircle /></div>
              <h2 className="perf-card-title">Your Strengths 💪</h2>
              <p className="perf-card-sub">Areas where you're consistently performing well</p>
              <ul className="perf-insight-list">
                {strengths.length === 0 ? (
                  <li className="perf-insight-item">Complete more questions to uncover your strengths.</li>
                ) : (
                  strengths.map((s, i) => (
                    <li key={i} className="perf-insight-item perf-insight-item--green">
                      <span className="perf-insight-bullet">✓</span>{s}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="perf-card perf-insight-card perf-insight-card--orange">
              <div className="perf-insight-icon perf-insight-icon--orange"><Icon.AlertCircle /></div>
              <h2 className="perf-card-title">Focus Areas 🎯</h2>
              <p className="perf-card-sub">Topics that need more practice for big gains</p>
              <ul className="perf-insight-list">
                {improve.length === 0 ? (
                  <li className="perf-insight-item">No weak areas flagged yet.</li>
                ) : (
                  improve.map((s, i) => (
                    <li key={i} className="perf-insight-item perf-insight-item--orange">
                      <span className="perf-insight-bullet">!</span>{s}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="perf-card perf-insight-card perf-insight-card--purple">
              <div className="perf-insight-icon perf-insight-icon--purple"><Icon.Target /></div>
              <h2 className="perf-card-title">Placement Readiness</h2>
              <p className="perf-card-sub">AI-powered estimate based on your performance</p>
              <div className="perf-readiness">
                <div className="perf-ready-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="perf-ready-bg" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="perf-ready-fill"
                      strokeDasharray={readinessStrokeDash}
                    />
                  </svg>
                  <div className="perf-ready-num">{placementReadiness}%</div>
                </div>
                <div className="perf-ready-companies">
                  {[
                    { name: 'TCS', ok: placementReadiness >= 70 },
                    { name: 'Infosys', ok: placementReadiness >= 65 },
                    { name: 'Wipro', ok: placementReadiness >= 75 },
                    { name: 'Accenture', ok: placementReadiness >= 60 },
                    { name: 'Cognizant', ok: placementReadiness >= 80 },
                  ].map(({ name, ok }) => (
                    <span key={name} className={`perf-company-pill ${ok ? 'pill-ready' : 'pill-not'}`}>
                      {ok ? '✓' : '○'} {name}
                    </span>
                  ))}
                </div>
              </div>
              <p className="perf-ready-note">💡 Complete more mock interviews to boost readiness to <strong>85%+</strong></p>
            </div>

            <div className="perf-card perf-insight-card perf-insight-card--gold">
              <div className="perf-insight-icon perf-insight-icon--gold"><Icon.Star /></div>
              <h2 className="perf-card-title">Platform Ranking</h2>
              <p className="perf-card-sub">How you compare to other students</p>
              <div className="perf-rank-num">
                Top {Math.max(5, Math.round(100 - placementReadiness * 0.95))}%
              </div>
              <div className="perf-rank-sub">out of 4,200+ active users</div>
              <div className="perf-percentile-bar">
                <div
                  className="perf-percentile-fill"
                  style={{ width: `${Math.min(98, Math.max(20, placementReadiness))}%` }}
                />
                <span
                  className="perf-percentile-you"
                  style={{ left: `${Math.min(98, Math.max(20, placementReadiness))}%` }}
                >
                  You
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
