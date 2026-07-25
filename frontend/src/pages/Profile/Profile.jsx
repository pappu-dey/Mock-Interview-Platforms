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

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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

function readStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem('profile_data') || '{}')
  } catch {
    return {}
  }
}

const URL_RE   = /^https?:\/\/[^\s]+\.[^\s]+$/i
const PHONE_RE = /^[+()\d][\d\s()+-]{6,18}$/

function validateField(field, value) {
  if (!value) return ''
  if (field === 'linkedin' || field === 'github' || field === 'website') {
    return URL_RE.test(value) ? '' : 'Enter a full URL, starting with http:// or https://'
  }
  if (field === 'phone') {
    return PHONE_RE.test(value) ? '' : 'Enter a valid phone number'
  }
  return ''
}

const KNOWN_ROLES = ['student', 'company', 'admin']

const EMPTY_FORM = {
  displayName: '',
  phone:       '',
  location:    '',
  bio:         '',
  linkedin:    '',
  github:      '',
  website:     '',
  avatarUrl:   '',
  joinedAt:    '',
}

// ── Sample activity data (replace with real API call) ─────────────────────────
const SAMPLE_ACTIVITY = [
  {
    id: 1, icon: '🎤', type: 'interview',
    title: 'Mock Interview — Data Structures',
    sub: '2 days ago  •  45 min', score: 87,
  },
  {
    id: 2, icon: '🎤', type: 'interview',
    title: 'Mock Interview — System Design',
    sub: '5 days ago  •  60 min', score: 74,
  },
  {
    id: 3, icon: '📋', type: 'application',
    title: 'Applied to Acme Corp — Frontend Engineer',
    sub: '1 week ago', score: null,
  },
  {
    id: 4, icon: '🎤', type: 'interview',
    title: 'Mock Interview — Behavioural Round',
    sub: '2 weeks ago  •  30 min', score: 91,
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
  const [editing, setEditing]       = useState(false)
  const [toast,   setToast]         = useState(null) // { message, tone }
  const [saving,  setSaving]        = useState(false)
  const [errors,  setErrors]        = useState({})
  const fileInputRef = useRef(null)
  const toastTimer   = useRef(null)

  // ── Local profile data (persisted in localStorage), read once on mount ──────
  const [storedProfile, setStoredProfile] = useState(readStoredProfile)

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...storedProfile,
    joinedAt: storedProfile.joinedAt || new Date().toISOString(),
  })

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify({ ...EMPTY_FORM, ...storedProfile, joinedAt: form.joinedAt }),
    [form, storedProfile]
  )

  // ── warn on tab close if there are unsaved edits ────────────────────────────
  useEffect(() => {
    if (!editing || !isDirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [editing, isDirty])

  // ── derived stats ─────────────────────────────────────────────────────────
  const derivedStats = useMemo(() => {
    const interviewItems = SAMPLE_ACTIVITY.filter((a) => a.type === 'interview')
    const avgScore = interviewItems.length
      ? Math.round(interviewItems.reduce((sum, a) => sum + a.score, 0) / interviewItems.length)
      : 0
    return {
      interviews: interviewItems.length,
      score:      avgScore,
      applied:    SAMPLE_ACTIVITY.filter((a) => a.type === 'application').length,
      streak:     7,
    }
  }, [])

  const stats = {
    interviews: storedProfile.interviews ?? derivedStats.interviews,
    score:      storedProfile.score      ?? derivedStats.score,
    applied:    storedProfile.applied    ?? derivedStats.applied,
    streak:     storedProfile.streak     ?? derivedStats.streak,
  }

  // ── show toast helper ────────────────────────────────────────────────────────
  const showToast = useCallback((message, tone = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, tone })
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // ── validation ────────────────────────────────────────────────────────────
  const runValidation = (nextForm) => {
    const nextErrors = {}
    ;['phone', 'linkedin', 'github', 'website'].forEach((field) => {
      const msg = validateField(field, nextForm[field])
      if (msg) nextErrors[field] = msg
    })
    return nextErrors
  }

  const hasErrors = Object.keys(errors).length > 0

  // ── save handler ─────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    const nextErrors = runValidation(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast('Fix the highlighted fields before saving', 'error')
      return
    }
    setSaving(true)
    try {
      // TODO: replace with: await authFetch('/api/profile', { method:'PUT', body: JSON.stringify(form) })
      await new Promise((resolve) => setTimeout(resolve, 700)) // simulate network
      localStorage.setItem('profile_data', JSON.stringify(form))
      setStoredProfile(form)
      setEditing(false)
      showToast('✓ Profile saved!')
    } catch {
      showToast('Could not save your profile — try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('Discard your changes?')) return
    setForm({ ...EMPTY_FORM, ...storedProfile, joinedAt: storedProfile.joinedAt || form.joinedAt })
    setErrors({})
    setEditing(false)
  }

  const handleChange = (field) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const msg  = validateField(field, value)
        const next = { ...prev }
        if (msg) next[field] = msg
        else delete next[field]
        return next
      })
    }
  }

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file', 'error'); return }
    if (file.size > 2 * 1024 * 1024)    { showToast('Image must be under 2MB', 'error');      return }
    const reader = new FileReader()
    reader.onload = () => {
      const avatarUrl = reader.result
      setForm((prev) => ({ ...prev, avatarUrl }))
      const updated = { ...storedProfile, avatarUrl }
      localStorage.setItem('profile_data', JSON.stringify(updated))
      setStoredProfile(updated)
      showToast('✓ Avatar updated!')
    }
    reader.onerror = () => showToast('Could not read that image — try again', 'error')
    reader.readAsDataURL(file)
  }

  const handleLogout = () => {
    if (editing && isDirty && !window.confirm('You have unsaved changes. Log out anyway?')) return
    onLogout()
  }

  // ── Display name fallback ─────────────────────────────────────────────────────
  const displayName = form.displayName || user.email?.split('@')[0] || 'Anonymous'
  const rawRole     = user.role?.toLowerCase() ?? 'student'
  const role        = KNOWN_ROLES.includes(rawRole) ? rawRole : 'student'

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
              {form.avatarUrl ? (
                <img className="profile-avatar__img" src={form.avatarUrl} alt="" />
              ) : (
                getInitials(user.email || displayName)
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="profile-avatar__input"
                onChange={handleAvatarFile}
                aria-hidden="true"
                tabIndex={-1}
              />
              <button
                type="button"
                className="profile-avatar__edit"
                title="Change avatar"
                aria-label="Change avatar"
                onClick={handleAvatarPick}
              >
                ✏️
              </button>
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
              <span className="editing-flag">
                EDITING MODE{isDirty ? ' • UNSAVED' : ''}
              </span>
            )}
          </div>

          {editing ? (
            /* ── Edit Form ─────────────────────────────────────────────── */
            <form className="profile-form" onSubmit={handleSave} id="profile-edit-form" noValidate>
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
                    maxLength={60}
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
                    className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'pf-phone-error' : undefined}
                  />
                  {errors.phone && <p className="form-error" id="pf-phone-error">{errors.phone}</p>}
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
                    maxLength={80}
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="pf-bio">Bio</label>
                  <span className="form-counter">{form.bio.length}/300</span>
                </div>
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
                    className={`form-input ${errors.linkedin ? 'form-input--error' : ''}`}
                    type="url"
                    placeholder="https://linkedin.com/in/…"
                    value={form.linkedin}
                    onChange={handleChange('linkedin')}
                    aria-invalid={Boolean(errors.linkedin)}
                    aria-describedby={errors.linkedin ? 'pf-linkedin-error' : undefined}
                  />
                  {errors.linkedin && <p className="form-error" id="pf-linkedin-error">{errors.linkedin}</p>}
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-github">GitHub URL</label>
                  <input
                    id="pf-github"
                    className={`form-input ${errors.github ? 'form-input--error' : ''}`}
                    type="url"
                    placeholder="https://github.com/…"
                    value={form.github}
                    onChange={handleChange('github')}
                    aria-invalid={Boolean(errors.github)}
                    aria-describedby={errors.github ? 'pf-github-error' : undefined}
                  />
                  {errors.github && <p className="form-error" id="pf-github-error">{errors.github}</p>}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="pf-website">Personal Website</label>
                <input
                  id="pf-website"
                  className={`form-input ${errors.website ? 'form-input--error' : ''}`}
                  type="url"
                  placeholder="https://yoursite.com"
                  value={form.website}
                  onChange={handleChange('website')}
                  aria-invalid={Boolean(errors.website)}
                  aria-describedby={errors.website ? 'pf-website-error' : undefined}
                />
                {errors.website && <p className="form-error" id="pf-website-error">{errors.website}</p>}
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
                  disabled={hasErrors}
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
                { label: 'LinkedIn',     value: form.linkedin, href: form.linkedin },
                { label: 'GitHub',       value: form.github,   href: form.github   },
                { label: 'Website',      value: form.website,  href: form.website  },
                { label: 'Role',         value: role },
              ].map(({ label, value, href }) => (
                <div className="info-field" key={label}>
                  <div className="info-field__label">{label}</div>
                  <div className={`info-field__value ${!value ? 'info-field__value--muted' : ''}`}>
                    {value && href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer">{value}</a>
                    ) : (
                      value || 'Not set'
                    )}
                  </div>
                </div>
              ))}

              {/* Bio spans full width if it has content */}
              {form.bio && (
                <div className="info-field info-field--wide">
                  <div className="info-field__label">Bio</div>
                  <div className="info-field__value info-field__value--bio">
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
                    <span
                      className={`activity-score ${scoreClass(item.score)}`}
                      aria-label={`Score ${item.score} percent`}
                    >
                      {item.score}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Account / Danger zone ── */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Account</h2>
          </div>
          <div className="account-actions">
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
              onClick={handleLogout}
              id="profile-logout-btn"
            >
              🚪 Log Out
            </Button>
          </div>
        </div>

      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className={`profile-toast profile-toast--${toast.tone}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  )
}
