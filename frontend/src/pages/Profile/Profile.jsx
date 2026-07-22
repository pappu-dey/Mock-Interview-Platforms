/**
 * Profile.jsx — User Profile Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows the logged-in user's profile: avatar, stats, editable info, and
 * a recent-activity feed.
 *
 * Props:
 *   user        object   — { email, role, token } from authService.getCurrentUser()
 *   onLogout    function — propagate logout up to App
 *
 * Data is read from localStorage; edits are saved there too (no extra endpoint
 * needed yet — swap the save handler for an authFetch call when the backend is ready).
 */

import React, { useState, useEffect, useCallback } from 'react'
import Button from '../../components/Button'
import './Profile.css'

// ─── helpers ──────────────────────────────────────────────────────────────────
function getInitials(email = '') {
  const [local] = email.split('@')
  const parts = local.split(/[._-]/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : local.slice(0, 2).toUpperCase()
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ── Sample activity data (replace with real API call) ─────────────────────────
const SAMPLE_ACTIVITY = [
  {
    id: 1,
    icon: '🎤',
    title: 'Mock Interview — Data Structures',
    sub: '2 days ago  •  45 min',
    score: 87,
  },
  {
    id: 2,
    icon: '🎤',
    title: 'Mock Interview — System Design',
    sub: '5 days ago  •  60 min',
    score: 74,
  },
  {
    id: 3,
    icon: '📋',
    title: 'Applied to Acme Corp — Frontend Engineer',
    sub: '1 week ago',
    score: null,
  },
  {
    id: 4,
    icon: '🎤',
    title: 'Mock Interview — Behavioural Round',
    sub: '2 weeks ago  •  30 min',
    score: 91,
  },
]

function scoreClass(s) {
  if (s === null) return ''
  if (s >= 85) return 'activity-score--great'
  if (s >= 70) return 'activity-score--good'
  return 'activity-score--ok'
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Profile({ user = {}, onLogout = () => {} }) {
  // ── Local profile data (persisted in localStorage) ──────────────────────────
  const storedProfile = JSON.parse(
    localStorage.getItem('profile_data') || '{}'
  )

  const [editing, setEditing] = useState(false)
  const [toast,   setToast]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const [form, setForm] = useState({
    displayName: storedProfile.displayName || '',
    phone:       storedProfile.phone       || '',
    location:    storedProfile.location    || '',
    bio:         storedProfile.bio         || '',
    linkedin:    storedProfile.linkedin    || '',
    github:      storedProfile.github      || '',
    website:     storedProfile.website     || '',
    joinedAt:    storedProfile.joinedAt    || new Date().toISOString(),
  })

  // ── stats (mock — swap for API) ─────────────────────────────────────────────
  const stats = {
    interviews: storedProfile.interviews ?? 4,
    score:      storedProfile.score      ?? 84,
    applied:    storedProfile.applied    ?? 12,
    streak:     storedProfile.streak     ?? 7,
  }

  // ── show toast helper ────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }, [])

  // ── save handler ─────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    // ── TODO: replace with: await authFetch('/api/profile', { method:'PUT', body: JSON.stringify(form) })
    await new Promise((r) => setTimeout(r, 700)) // simulate network
    localStorage.setItem('profile_data', JSON.stringify(form))
    setSaving(false)
    setEditing(false)
    showToast('✓ Profile saved!')
  }

  const handleCancel = () => {
    // restore from storage
    const saved = JSON.parse(localStorage.getItem('profile_data') || '{}')
    setForm((prev) => ({ ...prev, ...saved }))
    setEditing(false)
  }

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // ── Display name fallback ─────────────────────────────────────────────────────
  const displayName = form.displayName || user.email?.split('@')[0] || 'Anonymous'
  const role        = user.role?.toLowerCase() ?? 'student'

  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* ── Page heading ── */}
        <p className="section-title">My Profile</p>

        {/* ═══════════════════════════════════════════════════════════════════
            HERO CARD — avatar · name · role badges
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="profile-card">
          <div className="profile-hero">

            {/* Avatar */}
            <div className="profile-avatar" role="img" aria-label={`Avatar for ${displayName}`}>
              {getInitials(user.email || displayName)}
              <span
                className="profile-avatar__edit"
                role="button"
                tabIndex={0}
                title="Change avatar"
                aria-label="Change avatar"
                onClick={() => showToast('Avatar upload coming soon!')}
                onKeyDown={(e) => e.key === 'Enter' && showToast('Avatar upload coming soon!')}
              >
                ✏️
              </span>
            </div>

            {/* Identity */}
            <div className="profile-identity">
              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-email">{user.email}</p>
              <div className="profile-badges">
                <span className={`badge badge--role-${role}`}>{role}</span>
                <span className="badge badge--joined">
                  Joined {formatDate(form.joinedAt)}
                </span>
                <span className="badge badge--interviews">
                  {stats.interviews} Interviews
                </span>
              </div>
            </div>

            {/* Edit button */}
            {!editing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditing(true)}
                id="profile-edit-btn"
              >
                ✏️ Edit
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.interviews}</div>
              <div className="stat-label">Interviews</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.score}%</div>
              <div className="stat-label">Avg. Score</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.applied}</div>
              <div className="stat-label">Jobs Applied</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.streak}d</div>
              <div className="stat-label">Streak 🔥</div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            DETAILS CARD — view or edit info
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Personal Details</h2>
            {editing && (
              <span style={{ fontSize: '0.68rem', opacity: 0.5 }}>
                EDITING MODE
              </span>
            )}
          </div>

          {editing ? (
            /* ── Edit Form ─────────────────────────────────────────────── */
            <form className="profile-form" onSubmit={handleSave} id="profile-edit-form">
              <div className="profile-form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-displayName">Display Name</label>
                  <input
                    id="pf-displayName"
                    className="form-input"
                    type="text"
                    placeholder="Your name"
                    value={form.displayName}
                    onChange={handleChange('displayName')}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-email">Email</label>
                  <input
                    id="pf-email"
                    className="form-input"
                    type="email"
                    value={user.email || ''}
                    disabled
                    title="Email cannot be changed here"
                  />
                </div>
              </div>

              <div className="profile-form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-phone">Phone</label>
                  <input
                    id="pf-phone"
                    className="form-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-location">Location</label>
                  <input
                    id="pf-location"
                    className="form-input"
                    type="text"
                    placeholder="City, Country"
                    value={form.location}
                    onChange={handleChange('location')}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="pf-bio">Bio</label>
                <textarea
                  id="pf-bio"
                  className="form-input form-textarea"
                  placeholder="A short intro about yourself…"
                  value={form.bio}
                  onChange={handleChange('bio')}
                  maxLength={300}
                />
              </div>

              <div className="profile-form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-linkedin">LinkedIn URL</label>
                  <input
                    id="pf-linkedin"
                    className="form-input"
                    type="url"
                    placeholder="https://linkedin.com/in/…"
                    value={form.linkedin}
                    onChange={handleChange('linkedin')}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-github">GitHub URL</label>
                  <input
                    id="pf-github"
                    className="form-input"
                    type="url"
                    placeholder="https://github.com/…"
                    value={form.github}
                    onChange={handleChange('github')}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="pf-website">Personal Website</label>
                <input
                  id="pf-website"
                  className="form-input"
                  type="url"
                  placeholder="https://yoursite.com"
                  value={form.website}
                  onChange={handleChange('website')}
                />
              </div>

              <div className="form-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={handleCancel}
                  id="profile-cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={saving}
                  id="profile-save-btn"
                >
                  Save Changes →
                </Button>
              </div>
            </form>
          ) : (
            /* ── View Mode ─────────────────────────────────────────────── */
            <div className="profile-info-grid">
              {[
                { label: 'Display Name', value: form.displayName },
                { label: 'Email',        value: user.email },
                { label: 'Phone',        value: form.phone },
                { label: 'Location',     value: form.location },
                { label: 'LinkedIn',     value: form.linkedin },
                { label: 'GitHub',       value: form.github },
                { label: 'Website',      value: form.website },
                { label: 'Role',         value: role },
              ].map(({ label, value }) => (
                <div className="info-field" key={label}>
                  <div className="info-field__label">{label}</div>
                  <div className={`info-field__value ${!value ? 'info-field__value--muted' : ''}`}>
                    {value || 'Not set'}
                  </div>
                </div>
              ))}

              {/* Bio spans full width if it has content */}
              {form.bio && (
                <div className="info-field" style={{ gridColumn: '1 / -1' }}>
                  <div className="info-field__label">Bio</div>
                  <div className="info-field__value" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                    {form.bio}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ACTIVITY CARD — recent interviews & applications
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showToast('Full history coming soon!')}
              id="profile-view-all-btn"
            >
              View All
            </Button>
          </div>

          {SAMPLE_ACTIVITY.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">📭</div>
              <p>No activity yet — start a mock interview!</p>
            </div>
          ) : (
            <ul className="activity-list" aria-label="Recent activity">
              {SAMPLE_ACTIVITY.map((item) => (
                <li className="activity-item" key={item.id}>
                  <span className="activity-icon" aria-hidden="true">{item.icon}</span>
                  <div className="activity-content">
                    <div className="activity-title">{item.title}</div>
                    <div className="activity-sub">{item.sub}</div>
                  </div>
                  {item.score !== null && (
                    <span className={`activity-score ${scoreClass(item.score)}`}>
                      {item.score}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Danger zone ── */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Account</h2>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => showToast('Password reset email sent!')}
              id="profile-reset-pwd-btn"
            >
              🔑 Reset Password
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onLogout}
              id="profile-logout-btn"
            >
              🚪 Log Out
            </Button>
          </div>
        </div>

      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className="profile-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  )
}
