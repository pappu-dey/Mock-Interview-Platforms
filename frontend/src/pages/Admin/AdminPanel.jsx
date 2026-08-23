/**
 * pages/Admin/AdminPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Protected Admin Panel — accessible ONLY to test@test.com
 * Route guard in App.jsx is the primary lock; this component re-validates
 * on mount as a secondary security layer.
 */

import React, { useState, useEffect, useCallback } from 'react'
import authService from '../../services/authService'
import {
  CompaniesSection,
  AptitudeSection,
  ReasoningSection,
  GeneralQsSection,
  JavaQsSection,
  SqlQsSection,
} from './AdminContentSections'
import './AdminPanel.css'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: 'Alice Johnson',   email: 'alice@example.com',   role: 'student', status: 'active',   joined: '2025-01-12', interviews: 24, score: 88 },
  { id: 2, name: 'Bob Martinez',    email: 'bob@techcorp.com',     role: 'company', status: 'active',   joined: '2025-02-03', interviews: 0,  score: 0  },
  { id: 3, name: 'Clara Singh',     email: 'clara@example.com',    role: 'student', status: 'active',   joined: '2025-03-17', interviews: 11, score: 74 },
  { id: 4, name: 'David Chen',      email: 'david@startups.io',    role: 'company', status: 'inactive', joined: '2025-04-05', interviews: 0,  score: 0  },
  { id: 5, name: 'Emma Wilson',     email: 'emma@example.com',     role: 'student', status: 'active',   joined: '2025-05-20', interviews: 38, score: 92 },
  { id: 6, name: 'Frank Nakamura',  email: 'frank@example.com',    role: 'student', status: 'pending',  joined: '2025-06-11', interviews: 2,  score: 55 },
  { id: 7, name: 'Grace Lee',       email: 'grace@bigco.com',      role: 'company', status: 'active',   joined: '2025-07-08', interviews: 0,  score: 0  },
  { id: 8, name: 'Henry Brown',     email: 'henry@example.com',    role: 'student', status: 'inactive', joined: '2025-08-01', interviews: 7,  score: 63 },
]

const MOCK_ACTIVITY = [
  { id: 1, icon: '🎯', color: 'green',  text: 'Emma Wilson completed a React interview',        time: '2m ago'   },
  { id: 2, icon: '👤', color: 'blue',   text: 'New company account: Grace Lee (bigco.com)',      time: '14m ago'  },
  { id: 3, icon: '🚨', color: 'red',    text: 'Failed login attempt on david@startups.io',       time: '31m ago'  },
  { id: 4, icon: '📄', color: 'orange', text: 'Clara Singh uploaded a new resume',               time: '1h ago'   },
  { id: 5, icon: '✅', color: 'green',  text: 'Frank Nakamura account verified',                 time: '2h ago'   },
  { id: 6, icon: '💬', color: 'purple', text: 'Support ticket #47 resolved',                     time: '3h ago'   },
  { id: 7, icon: '📊', color: 'blue',   text: 'Weekly analytics report generated',               time: '5h ago'   },
  { id: 8, icon: '🔒', color: 'red',    text: 'David Chen account suspended by admin',           time: '6h ago'   },
]

const CHART_DATA = [
  { label: 'Mon', users: 65, interviews: 40 },
  { label: 'Tue', users: 78, interviews: 55 },
  { label: 'Wed', users: 90, interviews: 70 },
  { label: 'Thu', users: 72, interviews: 48 },
  { label: 'Fri', users: 88, interviews: 63 },
  { label: 'Sat', users: 45, interviews: 30 },
  { label: 'Sun', users: 52, interviews: 35 },
]
const MAX_CHART = Math.max(...CHART_DATA.map((d) => Math.max(d.users, d.interviews)))

const NAV_ITEMS = [
  // ── Dashboard ──
  { id: 'overview',    icon: '🏠', label: 'Overview',       badge: null,  group: 'main'    },
  { id: 'users',       icon: '👥', label: 'Users',          badge: '8',   group: 'main'    },
  { id: 'interviews',  icon: '🎯', label: 'Interviews',     badge: '3',   group: 'main', badgeColor: 'green' },
  { id: 'analytics',  icon: '📊', label: 'Analytics',      badge: null,  group: 'main'    },
  { id: 'reports',    icon: '📋', label: 'Reports',         badge: null,  group: 'main'    },
  { id: 'settings',   icon: '⚙️', label: 'Settings',        badge: null,  group: 'main'    },
  // ── Content Management ──
  { id: 'companies',  icon: '🏢', label: 'Companies',       badge: null,  group: 'content' },
  { id: 'aptitude',   icon: '📐', label: 'Aptitude Qs',     badge: null,  group: 'content' },
  { id: 'reasoning',  icon: '🧠', label: 'Reasoning Qs',    badge: null,  group: 'content' },
  { id: 'generalQs',  icon: '💬', label: 'General Qs',      badge: null,  group: 'content' },
  { id: 'javaQs',     icon: '☕', label: 'Java Interview',  badge: null,  group: 'content' },
  { id: 'sqlQs',      icon: '🗄️', label: 'SQL Interview',   badge: null,  group: 'content' },
]

// ─── Helper: initials from name ────────────────────────────────────────────────
function initials(name) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Shared chip colours for stats ─────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`admin-table__badge ${status}`}>
      <span className="admin-table__badge-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
function RoleBadge({ role }) {
  return <span className={`admin-table__badge ${role}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection() {
  const stats = [
    { icon: '👥', color: 'orange', label: 'Total Users',       value: '1,248', change: '+12%', up: true  },
    { icon: '🎯', color: 'green',  label: 'Interviews Today',  value: '47',    change: '+8%',  up: true  },
    { icon: '⚡', color: 'blue',   label: 'Active Sessions',   value: '23',    change: '-3%',  up: false },
    { icon: '🏆', color: 'purple', label: 'Avg. Pass Rate',    value: '76%',   change: '+5%',  up: true  },
  ]

  return (
    <>
      {/* Stat Cards */}
      <div className="admin-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="admin-stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="admin-stat-card__shimmer" />
            <div className="admin-stat-card__top">
              <div className={`admin-stat-card__icon ${s.color}`}>{s.icon}</div>
              <span className={`admin-stat-card__change ${s.up ? 'up' : 'down'}`}>
                {s.up ? '↑' : '↓'} {s.change}
              </span>
            </div>
            <div className="admin-stat-card__value">{s.value}</div>
            <div className="admin-stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="admin-grid-2">
        {/* Chart */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__title">📈 Weekly Activity</div>
              <div className="admin-card__subtitle">Users & interviews — last 7 days</div>
            </div>
          </div>
          <div className="admin-card__body">
            <div className="admin-chart">
              {CHART_DATA.map((d, i) => (
                <div key={i} className="admin-chart__bar-wrap">
                  <div
                    className="admin-chart__bar secondary"
                    style={{ height: `${(d.interviews / MAX_CHART) * 100}%`, animationDelay: `${i * 60}ms` }}
                    title={`Interviews: ${d.interviews}`}
                  />
                  <div
                    className="admin-chart__bar"
                    style={{ height: `${(d.users / MAX_CHART) * 100}%`, animationDelay: `${i * 60 + 30}ms` }}
                    title={`Users: ${d.users}`}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 6 }}>
              {CHART_DATA.map((d, i) => (
                <div key={i} className="admin-chart__label">{d.label}</div>
              ))}
            </div>
            <div className="admin-chart-legend">
              <div className="admin-chart-legend__item">
                <span className="admin-chart-legend__dot orange" /> Users
              </div>
              <div className="admin-chart-legend__item">
                <span className="admin-chart-legend__dot purple" /> Interviews
              </div>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">🔔 Recent Activity</div>
          </div>
          <div className="admin-card__body" style={{ padding: '10px 20px' }}>
            <div className="admin-activity">
              {MOCK_ACTIVITY.map((a, i) => (
                <div key={a.id} className="admin-activity__item" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`admin-activity__icon ${a.color}`}>{a.icon}</div>
                  <div className="admin-activity__text">
                    <strong>{a.text}</strong>
                    <span>Platform activity</span>
                  </div>
                  <div className="admin-activity__time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Metrics + Quick Actions */}
      <div className="admin-grid-3">
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">📊 Platform Metrics</div>
          </div>
          <div className="admin-card__body">
            {[
              { icon: '🎓', label: 'Students',      val: '1,042', pct: 0.83 },
              { icon: '🏢', label: 'Companies',     val: '206',   pct: 0.17 },
              { icon: '✅', label: 'Verified Users', val: '918',   pct: 0.73 },
              { icon: '💾', label: 'Storage Used',  val: '4.7 GB',pct: 0.47 },
            ].map((m, i) => (
              <div key={i} className="admin-metric-row">
                <div className="admin-metric-row__label">
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <div className="admin-metric-row__bar-wrap">
                  <div className="admin-metric-row__bar-fill" style={{ width: `${m.pct * 100}%` }} />
                </div>
                <div className="admin-metric-row__val">{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">⚡ Interview Stats</div>
          </div>
          <div className="admin-card__body">
            {[
              { icon: '🟢', label: 'Passed',       val: '2,301', pct: 0.76 },
              { icon: '🔴', label: 'Failed',        val: '725',   pct: 0.24 },
              { icon: '⏱️', label: 'Avg Duration',  val: '42 min',pct: 0.70 },
              { icon: '🌟', label: 'Avg Score',     val: '78 / 100', pct: 0.78 },
            ].map((m, i) => (
              <div key={i} className="admin-metric-row">
                <div className="admin-metric-row__label">
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <div className="admin-metric-row__bar-wrap">
                  <div className="admin-metric-row__bar-fill" style={{ width: `${m.pct * 100}%` }} />
                </div>
                <div className="admin-metric-row__val">{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">🚀 Quick Actions</div>
          </div>
          <div className="admin-card__body">
            <div className="admin-quick-actions">
              {[
                { icon: '📢', label: 'Announce' },
                { icon: '📤', label: 'Export'   },
                { icon: '🗑️', label: 'Clear Cache'},
                { icon: '🔒', label: 'Lock User' },
                { icon: '📧', label: 'Email All' },
                { icon: '🔄', label: 'Refresh'   },
              ].map((a, i) => (
                <button key={i} className="admin-qa-btn" id={`admin-qa-${a.label.toLowerCase().replace(/\s/g,'-')}`}>
                  <span className="admin-qa-btn__icon">{a.icon}</span>
                  <span className="admin-qa-btn__label">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection({ showToast }) {
  const [users, setUsers]         = useState(MOCK_USERS)
  const [search, setSearch]       = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = filterRole === 'all'   || u.role === filterRole
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  function toggleStatus(id) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      )
    )
    showToast('User status updated ✓')
  }

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div>
          <div className="admin-card__title">👥 User Management</div>
          <div className="admin-card__subtitle">{filtered.length} of {users.length} users shown</div>
        </div>
        <button className="admin-card__action" id="admin-export-users-btn" onClick={() => showToast('Export started ✓')}>
          ↓ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--ad-border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          id="admin-user-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search users…"
          style={{
            flex: 1,
            minWidth: 160,
            background: 'var(--ad-glass)',
            border: '1px solid var(--ad-glass-bd)',
            color: 'var(--ad-text)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
          }}
        />
        {['all','student','company'].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              border: '1px solid',
              transition: 'all 0.2s ease',
              background: filterRole === r ? 'var(--ad-accent-glow)' : 'var(--ad-glass)',
              color:      filterRole === r ? 'var(--ad-accent)'      : 'var(--ad-text-2)',
              borderColor:filterRole === r ? 'rgba(228,161,106,0.25)' : 'var(--ad-glass-bd)',
            }}
          >
            {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
        {['all','active','inactive','pending'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              border: '1px solid',
              transition: 'all 0.2s ease',
              background: filterStatus === s ? 'var(--ad-accent-glow)' : 'var(--ad-glass)',
              color:      filterStatus === s ? 'var(--ad-accent)'      : 'var(--ad-text-2)',
              borderColor:filterStatus === s ? 'rgba(228,161,106,0.25)' : 'var(--ad-glass-bd)',
            }}
          >
            {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Interviews</th>
              <th>Avg Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="admin-table__user">
                    <div className="admin-table__avatar">{initials(u.name)}</div>
                    <div className="admin-table__user-info">
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                  </div>
                </td>
                <td><RoleBadge role={u.role} /></td>
                <td><StatusBadge status={u.status} /></td>
                <td style={{ color: 'var(--ad-text-2)', fontSize: 12 }}>{u.joined}</td>
                <td style={{ color: 'var(--ad-text)', fontWeight: 600 }}>{u.interviews}</td>
                <td style={{ color: u.score >= 80 ? 'var(--ad-success)' : u.score >= 60 ? 'var(--ad-warning)' : 'var(--ad-text-2)', fontWeight: 600 }}>
                  {u.score > 0 ? `${u.score}%` : '—'}
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-table__btn view" onClick={() => showToast(`Viewing ${u.name}'s profile`)}>View</button>
                    <button
                      className="admin-table__btn ban"
                      onClick={() => toggleStatus(u.id)}
                    >
                      {u.status === 'active' ? 'Ban' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--ad-text-2)' }}>
                  No users match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Interviews Section ───────────────────────────────────────────────────────
function InterviewsSection() {
  const sessions = [
    { user: 'Emma Wilson',    email: 'emma@example.com',    topic: 'React & Hooks',          score: 92, duration: '48 min', status: 'completed' },
    { user: 'Clara Singh',    email: 'clara@example.com',   topic: 'System Design',           score: 74, duration: '55 min', status: 'completed' },
    { user: 'Frank Nakamura', email: 'frank@example.com',   topic: 'Algorithms & DS',         score: 55, duration: '38 min', status: 'completed' },
    { user: 'Alice Johnson',  email: 'alice@example.com',   topic: 'Behavioral Round',        score: 88, duration: '32 min', status: 'completed' },
    { user: 'Henry Brown',    email: 'henry@example.com',   topic: 'Node.js Backend',         score: 63, duration: '42 min', status: 'completed' },
    { user: 'Test Admin',     email: 'test@test.com',       topic: 'Full Stack Mock',         score: 0,  duration: '—',      status: 'active'    },
  ]

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div>
          <div className="admin-card__title">🎯 Interview Sessions</div>
          <div className="admin-card__subtitle">All recorded mock interview sessions</div>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Topic</th>
              <th>Score</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={i}>
                <td>
                  <div className="admin-table__user">
                    <div className="admin-table__avatar">{initials(s.user)}</div>
                    <div className="admin-table__user-info">
                      <strong>{s.user}</strong>
                      <span>{s.email}</span>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--ad-text-2)', fontSize: 13 }}>{s.topic}</td>
                <td style={{ color: s.score >= 80 ? 'var(--ad-success)' : s.score >= 60 ? 'var(--ad-warning)' : s.score > 0 ? 'var(--ad-danger)' : 'var(--ad-text-2)', fontWeight: 700 }}>
                  {s.score > 0 ? `${s.score}%` : '—'}
                </td>
                <td style={{ color: 'var(--ad-text-2)', fontSize: 12 }}>{s.duration}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Analytics Section ────────────────────────────────────────────────────────
function AnalyticsSection() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug']
  const vals   = [320, 480, 390, 620, 540, 710, 830, 920]
  const maxV   = Math.max(...vals)

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div className="admin-card__title">📊 Growth Analytics</div>
        <div className="admin-card__subtitle">Monthly user registrations — 2025</div>
      </div>
      <div className="admin-card__body">
        <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--ad-text-2)' }}>Monthly Registrations</div>
        <div className="admin-chart" style={{ height: 180 }}>
          {vals.map((v, i) => (
            <div key={i} className="admin-chart__bar-wrap">
              <div
                className="admin-chart__bar"
                style={{ height: `${(v / maxV) * 100}%`, animationDelay: `${i * 80}ms` }}
                title={`${months[i]}: ${v} users`}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
          {months.map((m, i) => (
            <div key={i} className="admin-chart__label">{m}</div>
          ))}
        </div>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 24 }}>
          {[
            { label: 'Total Signups', val: '4,812', icon: '📈' },
            { label: 'Avg / Month',   val: '601',   icon: '📅' },
            { label: 'Peak Month',    val: 'Aug',    icon: '🏆' },
            { label: 'Growth Rate',   val: '+187%',  icon: '🚀' },
          ].map((m, i) => (
            <div key={i} style={{
              background: 'var(--ad-glass)',
              border: '1px solid var(--ad-border)',
              borderRadius: 12,
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ad-accent)' }}>{m.val}</div>
              <div style={{ fontSize: 11, color: 'var(--ad-text-2)', marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Reports Section ──────────────────────────────────────────────────────────
function ReportsSection({ showToast }) {
  const reports = [
    { name: 'Monthly User Report',        date: '2025-07-31', size: '2.4 MB', format: 'PDF' },
    { name: 'Interview Performance Log',  date: '2025-08-01', size: '1.8 MB', format: 'CSV' },
    { name: 'Revenue Analytics Q2',       date: '2025-06-30', size: '3.1 MB', format: 'XLSX'},
    { name: 'Support Ticket Summary',     date: '2025-08-05', size: '0.9 MB', format: 'PDF' },
    { name: 'Security Audit Log',         date: '2025-08-10', size: '5.2 MB', format: 'TXT' },
  ]
  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div className="admin-card__title">📋 Reports</div>
        <button className="admin-card__action" onClick={() => showToast('Generating new report…')}>+ Generate</button>
      </div>
      <div className="admin-card__body">
        {reports.map((r, i) => (
          <div key={i} className="admin-metric-row">
            <div className="admin-metric-row__label">
              <span>{r.format === 'PDF' ? '📄' : r.format === 'CSV' ? '📊' : r.format === 'XLSX' ? '📗' : '📝'}</span>
              <span>
                <strong style={{ display: 'block', color: 'var(--ad-text)', fontSize: 13 }}>{r.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--ad-text-3)' }}>{r.date} · {r.size}</span>
              </span>
            </div>
            <div>
              <button className="admin-table__btn view" onClick={() => showToast(`Downloading ${r.name}…`)}>
                ↓ {r.format}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Settings Section ─────────────────────────────────────────────────────────
function AdminSettingsSection({ showToast }) {
  const [notifs, setNotifs]   = useState(true)
  const [maint,  setMaint]    = useState(false)
  const [debug,  setDebug]    = useState(false)
  const [reg,    setReg]      = useState(true)

  function Toggle({ label, desc, checked, onChange, id }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--ad-border)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ad-text)' }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--ad-text-2)', marginTop: 2 }}>{desc}</div>
        </div>
        <button
          id={id}
          onClick={() => { onChange(!checked); showToast('Setting updated ✓') }}
          style={{
            width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: checked ? 'var(--ad-accent)' : 'var(--ad-border)',
            transition: 'all 0.25s ease', position: 'relative', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20,
            borderRadius: '50%', background: '#fff', transition: 'left 0.25s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">⚙️ Platform Settings</div>
        </div>
        <div className="admin-card__body">
          <Toggle id="admin-toggle-notifs"  label="Email Notifications" desc="Send automated email alerts to users" checked={notifs} onChange={setNotifs} />
          <Toggle id="admin-toggle-maint"   label="Maintenance Mode"    desc="Temporarily disable user access"       checked={maint}  onChange={setMaint}  />
          <Toggle id="admin-toggle-debug"   label="Debug Logging"       desc="Enable verbose server-side logging"    checked={debug}  onChange={setDebug}  />
          <Toggle id="admin-toggle-reg"     label="Open Registration"   desc="Allow new user sign-ups"               checked={reg}    onChange={setReg}    />
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">🔐 Admin Info</div>
        </div>
        <div className="admin-card__body">
          {[
            { label: 'Admin Email',   val: 'test@test.com',   icon: '📧' },
            { label: 'Role',          val: 'Super Admin',      icon: '👑' },
            { label: 'Last Login',    val: 'Just now',         icon: '🕐' },
            { label: 'Platform Ver.', val: 'v2.4.1',           icon: '🏷️' },
            { label: 'Node Env',      val: 'Development',      icon: '💻' },
            { label: 'DB Status',     val: '🟢 Connected',     icon: '🗄️' },
          ].map((r, i) => (
            <div key={i} className="admin-metric-row">
              <div className="admin-metric-row__label">
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </div>
              <div className="admin-metric-row__val">{r.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main AdminPanel Component ────────────────────────────────────────────────
export default function AdminPanel({ onNavigate }) {
  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [time, setTime] = useState(new Date())

  // ── Secondary auth guard ─────────────────────────────────────────────────────
  const isAuthorised = authService.isAdmin()

  // ── Live clock ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Close sidebar on route change ─────────────────────────────────────────────
  function handleNav(id) {
    setActiveNav(id)
    setSidebarOpen(false)
  }

  // ── Section labels ────────────────────────────────────────────────────────────
  const SECTION_LABELS = {
    overview:   { title: 'Overview',              subtitle: 'Platform health & key metrics' },
    users:      { title: 'User Management',       subtitle: 'Search, filter and manage all users' },
    interviews: { title: 'Interview Sessions',    subtitle: 'View all mock interview history' },
    analytics:  { title: 'Analytics',             subtitle: 'Growth trends and platform insights' },
    reports:    { title: 'Reports',               subtitle: 'Download and generate reports' },
    settings:   { title: 'Admin Settings',        subtitle: 'Configure platform behaviour' },
    companies:  { title: 'Companies',             subtitle: 'Add and manage company profiles' },
    aptitude:   { title: 'Aptitude Questions',    subtitle: 'Manage quantitative aptitude MCQ topics' },
    reasoning:  { title: 'Reasoning Questions',   subtitle: 'Manage logical reasoning MCQ topics' },
    generalQs:  { title: 'General Interview Qs',  subtitle: 'HR & behavioral interview questions' },
    javaQs:     { title: 'Java Interview Qs',     subtitle: 'Core Java, OOP, Collections & more' },
    sqlQs:      { title: 'SQL Interview Qs',      subtitle: 'Joins, indexing, window functions & more' },
  }

  // ─── Access Denied ────────────────────────────────────────────────────────────
  if (!isAuthorised) {
    return (
      <div className="admin-denied">
        <div className="admin-denied__icon">🚫</div>
        <h1>Access Denied</h1>
        <p>This area is restricted to authorised administrators only.</p>
        <button
          className="admin-denied__btn"
          id="admin-denied-go-home"
          onClick={() => onNavigate ? onNavigate('/') : (window.location.pathname = '/')}
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="admin-root">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'block' }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">🎯</div>
          <div className="admin-sidebar__title">
            <span>PrepPilot</span>
            <span>Admin Console</span>
          </div>
        </div>

        {/* Admin badge */}
        <div className="admin-sidebar__badge">
          <div className="admin-sidebar__badge-dot" />
          <div className="admin-sidebar__badge-info">
            <span>Super Admin</span>
            <span>test@test.com</span>
          </div>
        </div>

        {/* Main nav — split into groups */}
        <div className="admin-sidebar__nav">
          <div className="admin-sidebar__section-label" style={{ padding: '12px 8px 6px' }}>Main Menu</div>
          {NAV_ITEMS.filter(i => i.group === 'main').map((item) => (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              className={`admin-nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="admin-nav-item__icon">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className={`admin-nav-item__badge${item.badgeColor ? ' ' + item.badgeColor : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="admin-sidebar__section-label" style={{ padding: '16px 8px 6px' }}>Content Management</div>
          {NAV_ITEMS.filter(i => i.group === 'content').map((item) => (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              className={`admin-nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="admin-nav-item__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="admin-sidebar__footer">
          <button
            id="admin-sidebar-back-btn"
            className="admin-sidebar__back"
            onClick={() => onNavigate ? onNavigate('/dashboard') : (window.location.pathname = '/dashboard')}
          >
            ← Back to App
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <button
            className="admin-hamburger"
            id="admin-hamburger-btn"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            ☰
          </button>
          <div style={{ flex: 1 }}>
            <div className="admin-topbar__title">
              {SECTION_LABELS[activeNav].title}
            </div>
            <div className="admin-topbar__subtitle">
              {SECTION_LABELS[activeNav].subtitle}
            </div>
          </div>
          <div className="admin-topbar__search">
            <span className="admin-topbar__search-icon">🔍</span>
            <input
              id="admin-topbar-search"
              type="text"
              placeholder="Quick search…"
            />
          </div>
          <div className="admin-topbar__actions">
            <div
              className="admin-topbar__icon-btn"
              id="admin-notif-btn"
              title="Notifications"
            >
              🔔
              <span className="admin-topbar__notif-dot" />
            </div>
            <div
              className="admin-topbar__icon-btn"
              id="admin-refresh-btn"
              title="Refresh"
              onClick={() => showToast('Data refreshed ✓')}
            >
              🔄
            </div>
            <div
              className="admin-topbar__avatar"
              id="admin-avatar"
              title="test@test.com"
            >
              TA
            </div>
            <div style={{ fontSize: 11, color: 'var(--ad-text-3)', fontWeight: 500, lineHeight: 1.4, textAlign: 'right' }}>
              <div>{time.toLocaleDateString()}</div>
              <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content" id="admin-content-area">
          {activeNav === 'overview'   && <OverviewSection />}
          {activeNav === 'users'      && <UsersSection showToast={showToast} />}
          {activeNav === 'interviews' && <InterviewsSection />}
          {activeNav === 'analytics'  && <AnalyticsSection />}
          {activeNav === 'reports'    && <ReportsSection showToast={showToast} />}
          {activeNav === 'settings'   && <AdminSettingsSection showToast={showToast} />}
          {activeNav === 'companies'  && <CompaniesSection showToast={showToast} />}
          {activeNav === 'aptitude'   && <AptitudeSection  showToast={showToast} />}
          {activeNav === 'reasoning'  && <ReasoningSection showToast={showToast} />}
          {activeNav === 'generalQs'  && <GeneralQsSection showToast={showToast} />}
          {activeNav === 'javaQs'     && <JavaQsSection    showToast={showToast} />}
          {activeNav === 'sqlQs'      && <SqlQsSection     showToast={showToast} />}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="admin-toast" id="admin-toast">
          <span>✅</span> {toast}
        </div>
      )}
    </div>
  )
}
