/**
 * pages/Admin/AdminPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Protected Admin Panel — accessible ONLY to test@test.com
 * Route guard in App.jsx is the primary lock; this component re-validates
 * on mount as a secondary security layer.
 */

import { useState, useEffect, useCallback } from 'react'
import authService from '../../services/authService'
import { authFetch } from '../../api/api'
import {
  CompaniesSection,
  QuestionsBankSection,
} from './AdminContentSections'
import './AdminPanel.css'

const NAV_ITEMS = [
  // ── Dashboard ──
  { id: 'overview',    icon: '🏠', label: 'Overview',       badge: null,  group: 'main'    },
  { id: 'users',       icon: '👥', label: 'Users',          badge: null,  group: 'main'    },
  { id: 'interviews',  icon: '🎯', label: 'Interviews',     badge: null,  group: 'main', badgeColor: 'green' },
  { id: 'analytics',  icon: '📊', label: 'Analytics',      badge: null,  group: 'main'    },
  { id: 'reports',    icon: '📋', label: 'Reports',         badge: null,  group: 'main'    },
  { id: 'settings',   icon: '⚙️', label: 'Settings',        badge: null,  group: 'main'    },
  // ── Content Management ──
  { id: 'allQuestions', icon: '❓', label: 'Questions Bank', badge: null, group: 'content' },
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
function OverviewSection({ onAddQuestion, dashboardStats, weeklyActivity, recentActivity }) {
  const maxChart = Math.max(1, ...weeklyActivity.map((day) => Math.max(day.users, day.interviews)))
  const cards = [
    { icon: '👥', color: 'orange', label: 'Total Users', value: dashboardStats.totalUsers },
    { icon: '🎯', color: 'green', label: 'Interview Sessions', value: dashboardStats.totalSessions },
    { icon: '⚡', color: 'blue', label: 'Active Sessions', value: dashboardStats.activeSessions },
    { icon: '🏆', color: 'purple', label: 'Average Score', value: `${dashboardStats.averageScore}%` },
  ]

  return (
    <>
      {/* Stat Cards */}
      <div className="admin-stats-grid">
        {cards.map((s, i) => (
          <div key={i} className="admin-stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="admin-stat-card__shimmer" />
            <div className="admin-stat-card__top">
              <div className={`admin-stat-card__icon ${s.color}`}>{s.icon}</div>
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
              {weeklyActivity.map((d, i) => (
                <div key={i} className="admin-chart__bar-wrap">
                  <div
                    className="admin-chart__bar secondary"
                    style={{ height: `${(d.interviews / maxChart) * 100}%`, animationDelay: `${i * 60}ms` }}
                    title={`Interviews: ${d.interviews}`}
                  />
                  <div
                    className="admin-chart__bar"
                    style={{ height: `${(d.users / maxChart) * 100}%`, animationDelay: `${i * 60 + 30}ms` }}
                    title={`Users: ${d.users}`}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 6 }}>
              {weeklyActivity.map((d, i) => (
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
              {recentActivity.map((a, i) => (
                <div key={a.id} className="admin-activity__item" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`admin-activity__icon ${a.color}`}>{a.icon}</div>
                  <div className="admin-activity__text">
                    <strong>{a.text}</strong>
                    <span>{a.time ? new Date(a.time).toLocaleString() : ''}</span>
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
              { icon: '🎓', label: 'Students', val: dashboardStats.students },
              { icon: '🏢', label: 'Company Profiles', val: dashboardStats.totalCompanies },
              { icon: '❓', label: 'Questions', val: dashboardStats.totalQuestions },
              { icon: '👥', label: 'Active Users', val: dashboardStats.activeUsers },
            ].map((m, i) => (
              <div key={i} className="admin-metric-row">
                <div className="admin-metric-row__label">
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <div className="admin-metric-row__bar-wrap">
                  <div className="admin-metric-row__bar-fill" style={{ width: `${Math.min(100, dashboardStats.totalUsers ? (m.val / dashboardStats.totalUsers) * 100 : 0)}%` }} />
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
              { icon: '✅', label: 'Completed', val: dashboardStats.completedSessions, percent: dashboardStats.totalSessions ? dashboardStats.completedSessions / dashboardStats.totalSessions * 100 : 0 },
              { icon: '🎯', label: 'Active', val: dashboardStats.activeSessions, percent: dashboardStats.totalSessions ? dashboardStats.activeSessions / dashboardStats.totalSessions * 100 : 0 },
              { icon: '📊', label: 'Total', val: dashboardStats.totalSessions, percent: dashboardStats.totalSessions ? 100 : 0 },
              { icon: '🌟', label: 'Avg. Score', val: `${dashboardStats.averageScore} / 100`, percent: dashboardStats.averageScore },
            ].map((m, i) => (
              <div key={i} className="admin-metric-row">
                <div className="admin-metric-row__label">
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <div className="admin-metric-row__bar-wrap">
                  <div className="admin-metric-row__bar-fill" style={{ width: `${m.percent}%` }} />
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
                { icon: '❓', label: 'Add Question', onClick: onAddQuestion },
              ].map((a, i) => (
                <button
                  key={i}
                  className="admin-qa-btn"
                  id={`admin-qa-${a.label.toLowerCase().replace(/\s/g,'-')}`}
                  onClick={a.onClick}
                >
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
function UsersSection({ users, onRefresh, showToast, adminEmail }) {
  const [search, setSearch]       = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [updating, setUpdating] = useState(null)

  const filtered = users.filter((u) => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = filterRole === 'all'   || u.role === filterRole
    const matchStatus = filterStatus === 'all' || (u.active ? 'active' : 'inactive') === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  async function toggleStatus(user) {
    setUpdating(user.id)
    try {
      await authFetch(`/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ active: !user.active }),
      })
      await onRefresh()
      showToast(`User ${user.active ? 'deactivated' : 'activated'} ✓`)
    } catch (error) {
      showToast(error.message || 'Unable to update user status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div>
          <div className="admin-card__title">👥 User Management</div>
          <div className="admin-card__subtitle">{filtered.length} of {users.length} users shown</div>
        </div>
        <button
          className="admin-card__action"
          id="admin-export-users-btn"
          onClick={() => downloadCsv('users.csv', [['Name', 'Email', 'Role', 'Status', 'Joined'], ...users.map((user) => [user.name, user.email, user.role, user.active ? 'Active' : 'Inactive', user.joined])])}
        >
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
        {['all','active','inactive'].map((s) => (
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
                <td><StatusBadge status={u.active ? 'active' : 'inactive'} /></td>
                <td style={{ color: 'var(--ad-text-2)', fontSize: 12 }}>{u.joined ? new Date(u.joined).toLocaleDateString() : '—'}</td>
                <td style={{ color: 'var(--ad-text)', fontWeight: 600 }}>{u.interviews}</td>
                <td style={{ color: u.score >= 80 ? 'var(--ad-success)' : u.score >= 60 ? 'var(--ad-warning)' : 'var(--ad-text-2)', fontWeight: 600 }}>
                  {u.score > 0 ? `${u.score}%` : '—'}
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button
                      className="admin-table__btn ban"
                      disabled={updating === u.id || u.role === 'admin' || u.email === adminEmail}
                      onClick={() => toggleStatus(u)}
                    >
                      {updating === u.id ? 'Saving…' : u.active ? 'Deactivate' : 'Activate'}
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
function InterviewsSection({ sessions }) {
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
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="admin-table__user">
                    <div className="admin-table__avatar">{initials(s.user || s.email)}</div>
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
            {sessions.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--ad-text-2)' }}>No interview sessions in the database.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Analytics Section ────────────────────────────────────────────────────────
function AnalyticsSection({ monthlyRegistrations, stats }) {
  const months = monthlyRegistrations.map((item) => item.label)
  const vals = monthlyRegistrations.map((item) => item.users)
  const maxV   = Math.max(1, ...vals)
  const total = vals.reduce((sum, value) => sum + value, 0)
  const peakIndex = vals.indexOf(maxV)

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div className="admin-card__title">📊 Growth Analytics</div>
        <div className="admin-card__subtitle">Monthly registrations — last 6 months</div>
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
            { label: 'Users in period', val: total, icon: '📈' },
            { label: 'Total users', val: stats.totalUsers, icon: '👥' },
            { label: 'Peak month', val: months[peakIndex] || '—', icon: '🏆' },
            { label: 'Interview sessions', val: stats.totalSessions, icon: '🎯' },
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
function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((value) => {
    const text = String(value ?? '')
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safeText.replaceAll('"', '""')}"`
  }).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function ReportsSection({ users, sessions }) {
  const reports = [
    { name: 'Users', count: users.length, icon: '👥', exportRows: [['Name', 'Email', 'Role', 'Status', 'Joined'], ...users.map((user) => [user.name, user.email, user.role, user.active ? 'Active' : 'Inactive', user.joined])] },
    { name: 'Interview Sessions', count: sessions.length, icon: '🎯', exportRows: [['Candidate', 'Email', 'Topic', 'Score', 'Duration', 'Status'], ...sessions.map((session) => [session.user, session.email, session.topic, session.score, session.duration, session.status])] },
  ]
  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div className="admin-card__title">📋 Reports</div>
        <div className="admin-card__subtitle">Export current database records as CSV</div>
      </div>
      <div className="admin-card__body">
        {reports.map((r, i) => (
          <div key={i} className="admin-metric-row">
            <div className="admin-metric-row__label">
              <span>{r.icon}</span>
              <span>
                <strong style={{ display: 'block', color: 'var(--ad-text)', fontSize: 13 }}>{r.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--ad-text-3)' }}>{r.count} database records</span>
              </span>
            </div>
            <div>
              <button className="admin-table__btn view" onClick={() => downloadCsv(`${r.name.toLowerCase().replaceAll(' ', '-')}.csv`, r.exportRows)}>
                ↓ CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Settings Section ─────────────────────────────────────────────────────────
function AdminSettingsSection({ adminEmail, stats, connected }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">⚙️ Live Database</div>
        </div>
        <div className="admin-card__body">
          {[
            { label: 'Connection', value: connected ? 'Connected' : 'Unavailable', icon: connected ? '🟢' : '🔴' },
            { label: 'Auto-refresh', value: 'Every 15 seconds', icon: '🔄' },
            { label: 'Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Interview sessions', value: stats.totalSessions, icon: '🎯' },
            { label: 'Questions', value: stats.totalQuestions, icon: '❓' },
            { label: 'Company records', value: stats.totalCompanies, icon: '🏢' },
          ].map((item) => (
            <div key={item.label} className="admin-metric-row">
              <div className="admin-metric-row__label"><span>{item.icon}</span><span>{item.label}</span></div>
              <div className="admin-metric-row__val">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">🔐 Admin Info</div>
        </div>
        <div className="admin-card__body">
          {[
            { label: 'Admin Email', val: adminEmail, icon: '📧' },
            { label: 'Role', val: 'Administrator', icon: '👑' },
            { label: 'Database', val: 'MySQL via Spring API', icon: '🗄️' },
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
  const [addQuestionRequest, setAddQuestionRequest] = useState(0)
  const [handledQuestionRequest, setHandledQuestionRequest] = useState(0)
  const [dashboardData, setDashboardData] = useState({
    stats: { totalUsers: 0, students: 0, activeUsers: 0, totalSessions: 0, completedSessions: 0, activeSessions: 0, averageScore: 0, totalQuestions: 0, totalCompanies: 0 },
    users: [],
    sessions: [],
    weeklyActivity: [],
    monthlyRegistrations: [],
    recentActivity: [],
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [dataError, setDataError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)

  // ── Secondary auth guard ─────────────────────────────────────────────────────
  const isAuthorised = authService.isAdmin()
  const currentUser = authService.getCurrentUser()
  const adminEmail = currentUser?.email || 'Admin'
  const adminName = currentUser?.fullName || adminEmail

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

  const refreshDashboard = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const data = await authFetch('/api/admin/dashboard')
      setDashboardData(data)
      setDataError('')
      setHasLoaded(true)
    } catch (error) {
      setDataError(error.message || 'Unable to load admin data')
      if (!silent) showToast(error.message || 'Unable to load admin data')
    } finally {
      if (!silent) setIsRefreshing(false)
    }
  }, [showToast])
  const requestAddQuestion = useCallback(() => {
    setActiveNav('allQuestions')
    setAddQuestionRequest((request) => request + 1)
  }, [])
  const refreshAllData = useCallback(() => {
    setRefreshVersion((version) => version + 1)
    return refreshDashboard()
  }, [refreshDashboard])
  const markQuestionRequestHandled = useCallback((request) => {
    setHandledQuestionRequest(request)
  }, [])

  useEffect(() => {
    const initialLoad = setTimeout(() => refreshDashboard(), 0)
    const timer = setInterval(() => refreshDashboard(true), 15000)
    return () => {
      clearTimeout(initialLoad)
      clearInterval(timer)
    }
  }, [refreshDashboard])

  // ── Close sidebar on route change ─────────────────────────────────────────────
  function handleNav(id) {
    setActiveNav(id)
    setSidebarOpen(false)
  }

  // ── Section labels ────────────────────────────────────────────────────────────
  const SECTION_LABELS = {
    overview:     { title: 'Overview',              subtitle: 'Platform health & key metrics' },
    users:        { title: 'User Management',       subtitle: 'Search, filter and manage all users' },
    interviews:   { title: 'Interview Sessions',    subtitle: 'View all mock interview history' },
    analytics:    { title: 'Analytics',             subtitle: 'Growth trends and platform insights' },
    reports:      { title: 'Reports',               subtitle: 'Export current database records' },
    settings:     { title: 'Database Status',        subtitle: 'Live database and refresh information' },
    allQuestions: { title: 'Questions Bank',        subtitle: 'Manage, search, and add questions with options, explanations, and company tags' },
    companies:    { title: 'Companies',             subtitle: 'Add and manage company profiles' },
    aptitude:     { title: 'Aptitude Questions',    subtitle: 'Manage quantitative aptitude MCQ topics' },
    reasoning:    { title: 'Reasoning Questions',   subtitle: 'Manage logical reasoning MCQ topics' },
    generalQs:    { title: 'General Interview Qs',  subtitle: 'HR & behavioral interview questions' },
    javaQs:       { title: 'Java Interview Qs',     subtitle: 'Core Java, OOP, Collections & more' },
    sqlQs:        { title: 'SQL Interview Qs',      subtitle: 'Joins, indexing, window functions & more' },
  }
  const { stats, users, sessions, weeklyActivity, monthlyRegistrations, recentActivity } = dashboardData
  const scopedQuestionSections = {
    aptitude: { title: 'Aptitude Questions', icon: '📐', allowedCategories: ['Quantitative Aptitude'], defaultCategory: 'Quantitative Aptitude' },
    reasoning: { title: 'Reasoning Questions', icon: '🧠', allowedCategories: ['Logical Reasoning'], defaultCategory: 'Logical Reasoning' },
    generalQs: { title: 'General Interview Questions', icon: '💬', allowedCategories: ['HR & Behavioral', 'HR', 'Behavioral', 'General', 'Situational'], defaultCategory: 'HR & Behavioral' },
    javaQs: { title: 'Java Interview Questions', icon: '☕', allowedCategories: ['Core Java', 'Java'], defaultCategory: 'Core Java' },
    sqlQs: { title: 'SQL Interview Questions', icon: '🗄️', allowedCategories: ['SQL Database', 'SQL & Databases', 'SQL'], defaultCategory: 'SQL Database' },
  }

  // ─── Access Denied ────────────────────────────────────────────────────────────
  if (!isAuthorised) {
    return (
      <div className="admin-denied">
        <div className="admin-denied__icon">🚫</div>
        <h1>you are not an admin</h1>
        <p>This area is restricted to users with the ADMIN role.</p>
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
            <span>{currentUser?.role || 'ADMIN'}</span>
            <span>{adminEmail}</span>
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
              {(item.id === 'users' || item.id === 'interviews') && (
                <span className={`admin-nav-item__badge${item.badgeColor ? ' ' + item.badgeColor : ''}`}>
                  {item.id === 'users' ? users.length : sessions.length}
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
            <button
              className="admin-topbar__add-btn"
              id="admin-topbar-add-question-btn"
              onClick={() => {
                requestAddQuestion()
              }}
            >
              + Add Question
            </button>
            <div
              className="admin-topbar__icon-btn"
              id="admin-notif-btn"
              title="Notifications"
            >
              🔔
              <span className="admin-topbar__notif-dot" />
            </div>
            <button
              type="button"
              className="admin-topbar__icon-btn"
              id="admin-refresh-btn"
              title="Refresh database data"
              onClick={refreshAllData}
              disabled={isRefreshing}
            >
              {isRefreshing ? '⏳' : '🔄'}
            </button>
            <div
              className="admin-topbar__avatar"
              id="admin-avatar"
              title={adminEmail}
            >
              {initials(adminName)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ad-text-3)', fontWeight: 500, lineHeight: 1.4, textAlign: 'right' }}>
              <div>{time.toLocaleDateString()}</div>
              <div>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content" id="admin-content-area">
          {dataError && (
            <div className="admin-card" role="alert" style={{ padding: 18, marginBottom: 16 }}>
              <strong>Database data could not be refreshed.</strong> {hasLoaded ? 'Showing the last successful snapshot.' : dataError}
              {!hasLoaded && <button className="admin-card__action" style={{ marginLeft: 12 }} onClick={() => refreshDashboard()}>Retry</button>}
            </div>
          )}
          {activeNav === 'overview'   && (
            <OverviewSection
              dashboardStats={stats}
              weeklyActivity={weeklyActivity}
              recentActivity={recentActivity}
              onAddQuestion={requestAddQuestion}
            />
          )}
          {activeNav === 'users'        && <UsersSection users={users} onRefresh={() => refreshDashboard(true)} adminEmail={adminEmail} showToast={showToast} />}
          {activeNav === 'interviews'   && <InterviewsSection sessions={sessions} />}
          {activeNav === 'analytics'    && <AnalyticsSection monthlyRegistrations={monthlyRegistrations} stats={stats} />}
          {activeNav === 'reports'      && <ReportsSection users={users} sessions={sessions} />}
          {activeNav === 'settings'     && <AdminSettingsSection adminEmail={adminEmail} stats={stats} connected={hasLoaded && !dataError} />}
          {(activeNav === 'allQuestions' || scopedQuestionSections[activeNav]) && (
            <QuestionsBankSection
              showToast={showToast}
              refreshToken={refreshVersion}
              addRequest={addQuestionRequest}
              handledAddRequest={handledQuestionRequest}
              onAddRequestHandled={markQuestionRequestHandled}
              {...(scopedQuestionSections[activeNav] || {})}
            />
          )}
          {activeNav === 'companies'    && <CompaniesSection showToast={showToast} refreshToken={refreshVersion} />}
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
