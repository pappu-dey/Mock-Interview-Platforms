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

// ── Mock data ─────────────────────────────────────────────────────────────────
const KPI_CARDS = [
  { id: 'sessions', label: 'Total Sessions', value: '38', sub: '+5 this week', up: true, icon: Icon.Calendar, color: '#5B4EE8', bg: 'rgba(91,78,232,0.08)' },
  { id: 'avg', label: 'Average Score', value: '82', sub: '+4.3% from last month', up: true, icon: Icon.Trend, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  { id: 'streak', label: 'Current Streak', value: '9 days', sub: 'Personal best: 14 days', up: null, icon: Icon.Flame, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  { id: 'best', label: 'Best Category', value: 'DSA', sub: 'Avg 91% across 12 sessions', up: null, icon: Icon.Trophy, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
]

const SCORE_TREND = [
  { session: 'S1', score: 64, date: 'Jul 10', topic: 'HR Round' },
  { session: 'S2', score: 72, date: 'Jul 13', topic: 'DSA Basics' },
  { session: 'S3', score: 68, date: 'Jul 16', topic: 'SQL' },
  { session: 'S4', score: 78, date: 'Jul 19', topic: 'System Design' },
  { session: 'S5', score: 85, date: 'Jul 22', topic: 'DSA Advanced' },
  { session: 'S6', score: 81, date: 'Jul 25', topic: 'Aptitude' },
  { session: 'S7', score: 88, date: 'Jul 28', topic: 'Java OOP' },
  { session: 'S8', score: 92, date: 'Aug 1', topic: 'DSA Trees' },
]

const SKILL_BREAKDOWN = [
  { label: 'Data Structures & Algo', score: 91, sessions: 12, color: '#5B4EE8' },
  { label: 'System Design', score: 74, sessions: 6, color: '#8B5CF6' },
  { label: 'SQL & Databases', score: 68, sessions: 5, color: '#10B981' },
  { label: 'Java / OOP', score: 85, sessions: 7, color: '#F59E0B' },
  { label: 'Quantitative Aptitude', score: 78, sessions: 5, color: '#EF4444' },
  { label: 'HR & Behavioural', score: 82, sessions: 3, color: '#06B6D4' },
]

const RECENT_SESSIONS = [
  { id: 1, topic: 'DSA Trees & Graphs', date: 'Aug 1, 2026', score: 92, time: '28 min', type: 'Mock' },
  { id: 2, topic: 'Java OOP Fundamentals', date: 'Jul 28, 2026', score: 88, time: '22 min', type: 'Practice' },
  { id: 3, topic: 'Aptitude — Percentages', date: 'Jul 25, 2026', score: 81, time: '20 min', type: 'Practice' },
  { id: 4, topic: 'DSA Arrays & Sorting', date: 'Jul 22, 2026', score: 85, time: '30 min', type: 'Mock' },
  { id: 5, topic: 'System Design Basics', date: 'Jul 19, 2026', score: 78, time: '35 min', type: 'Mock' },
  { id: 6, topic: 'SQL Joins & Subqueries', date: 'Jul 16, 2026', score: 68, time: '18 min', type: 'Practice' },
]

const STRENGTHS = [
  'Consistent improvement in DSA over the past 4 weeks',
  'Strong logical reasoning — top 15% among platform users',
  'Java OOP concepts above 80% benchmark consistently',
]

const IMPROVE = [
  'SQL window functions & query optimisation need attention',
  'System Design depth — practice more HLD/LLD problems',
  'Quantitative speed: accuracy is high but time per Q is slow',
]

const WEEKLY_ACTIVITY = [0, 1, 0, 2, 3, 1, 0, 1, 2, 3, 2, 1, 0, 0, 2, 3, 3, 1, 2, 0, 1, 3, 2, 1, 3, 3, 2, 0]

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
    if (ran.current) return
    ran.current = true
    const end = parseInt(target, 10)
    if (isNaN(end)) { setVal(target); return }
    let cur = 0
    const step = Math.ceil(end / 40)
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

  return (
    <div className="perf-page">
      <div className="perf-inner">

        {/* ── Hero ── */}
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
              <circle cx="60" cy="60" r="50" className="perf-ring-fill"
                strokeDasharray={`${2 * Math.PI * 50 * 0.82} ${2 * Math.PI * 50}`}
              />
            </svg>
            <div className="perf-ring-label">
              <span className="perf-ring-num">82%</span>
              <span className="perf-ring-sub">Overall</span>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="perf-kpi-grid">
          {KPI_CARDS.map(({ id, label, value, sub, up, icon: KpiIcon, color, bg }) => (
            <div key={id} className="perf-kpi-card" style={{ '--kpi-color': color, '--kpi-bg': bg }}>
              <div className="perf-kpi-icon"><KpiIcon /></div>
              <div className="perf-kpi-body">
                <div className="perf-kpi-label">{label}</div>
                <div className="perf-kpi-value">
                  {id === 'avg' ? <><AnimatedNumber target={82} />%</> :
                    id === 'sessions' ? <AnimatedNumber target={38} /> :
                      value}
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
                  <p className="perf-card-sub">Last 8 practice sessions</p>
                </div>
                <div className="perf-trend-badge"><Icon.ArrowUp /> +28 pts overall</div>
              </div>
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
                  {SCORE_TREND.map(({ session, score, date, topic }) => (
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
                {SKILL_BREAKDOWN.map(({ label, score, sessions, color }) => (
                  <div key={label} className="perf-skill-row">
                    <div className="perf-skill-meta">
                      <span className="perf-skill-label">{label}</span>
                      <span className="perf-skill-sessions">{sessions} sessions</span>
                    </div>
                    <div className="perf-skill-bar-wrap">
                      <div className="perf-skill-bar" style={{ '--skill-w': `${score}%`, '--skill-color': color }} />
                    </div>
                    <span className="perf-skill-score" style={{ color }}>{score}%</span>
                  </div>
                ))}
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
                {WEEKLY_ACTIVITY.map((level, i) => (
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
              <span className="perf-session-count">{RECENT_SESSIONS.length} sessions</span>
            </div>
            <div className="perf-sessions-wrap">
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
                  {RECENT_SESSIONS.map(({ id, topic, date, score, time, type }) => (
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
                {STRENGTHS.map((s, i) => (
                  <li key={i} className="perf-insight-item perf-insight-item--green">
                    <span className="perf-insight-bullet">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="perf-card perf-insight-card perf-insight-card--orange">
              <div className="perf-insight-icon perf-insight-icon--orange"><Icon.AlertCircle /></div>
              <h2 className="perf-card-title">Focus Areas 🎯</h2>
              <p className="perf-card-sub">Topics that need more practice for big gains</p>
              <ul className="perf-insight-list">
                {IMPROVE.map((s, i) => (
                  <li key={i} className="perf-insight-item perf-insight-item--orange">
                    <span className="perf-insight-bullet">!</span>{s}
                  </li>
                ))}
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
                    <circle cx="50" cy="50" r="40" className="perf-ready-fill"
                      strokeDasharray={`${2 * Math.PI * 40 * 0.76} ${2 * Math.PI * 40}`}
                    />
                  </svg>
                  <div className="perf-ready-num">76%</div>
                </div>
                <div className="perf-ready-companies">
                  {[{ name: 'TCS', ok: true }, { name: 'Infosys', ok: true }, { name: 'Wipro', ok: false }, { name: 'Accenture', ok: true }, { name: 'Cognizant', ok: false }].map(({ name, ok }) => (
                    <span key={name} className={`perf-company-pill ${ok ? 'pill-ready' : 'pill-not'}`}>
                      {ok ? '✓' : '○'} {name}
                    </span>
                  ))}
                </div>
              </div>
              <p className="perf-ready-note">💡 Complete 5 more mock interviews to boost readiness to <strong>85%+</strong></p>
            </div>

            <div className="perf-card perf-insight-card perf-insight-card--gold">
              <div className="perf-insight-icon perf-insight-icon--gold"><Icon.Star /></div>
              <h2 className="perf-card-title">Platform Ranking</h2>
              <p className="perf-card-sub">How you compare to other students</p>
              <div className="perf-rank-num">Top 18%</div>
              <div className="perf-rank-sub">out of 4,200+ active users</div>
              <div className="perf-percentile-bar">
                <div className="perf-percentile-fill" />
                <span className="perf-percentile-you">You</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
