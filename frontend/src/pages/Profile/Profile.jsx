/**
 * Profile.jsx — User Profile Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads and writes profile data from the MySQL `profiles` table via
 * GET /api/profile and PUT /api/profile (see profileService.js).
 *
 * DB columns mapped:
 *   full_name, phone, college, branch, graduation_year,
 *   skills, linkedin_url, leetcode_url, github_url
 *
 * Props:
 *   user        object   — { email, role, token } from authService.getCurrentUser()
 *   onLogout    function — propagate logout up to App
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Button from '../../components/Button'
import profileService from '../../services/profileService'
import './Profile.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = '', email = '') {
  const src = name.trim() || email
  const parts = src.split(/[\s@._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (src.slice(0, 2) || 'U').toUpperCase()
}

const URL_RE   = /^https?:\/\/[^\s]+\.[^\s]+$/i
const PHONE_RE = /^[+()\\d][\\d\\s()+-]{6,18}$/

function validateField(field, value) {
  if (!value) return ''
  if (['linkedinUrl', 'leetcodeUrl', 'githubUrl'].includes(field)) {
    return URL_RE.test(value) ? '' : 'Enter a full URL starting with http:// or https://'
  }
  if (field === 'phone') {
    return PHONE_RE.test(value) ? '' : 'Enter a valid phone number'
  }
  return ''
}

const KNOWN_ROLES = ['student', 'company', 'admin']

const EMPTY_FORM = {
  fullName:       '',
  phone:          '',
  college:        '',
  branch:         '',
  graduationYear: '',
  skills:         '',
  linkedinUrl:    '',
  leetcodeUrl:    '',
  githubUrl:      '',
}

// ── Sample activity (replace with real endpoint later) ───────────────────────
const SAMPLE_ACTIVITY = [
  { id: 1, icon: '🎤', type: 'interview', title: 'Mock Interview — Data Structures',   sub: '2 days ago  •  45 min', score: 87 },
  { id: 2, icon: '🎤', type: 'interview', title: 'Mock Interview — System Design',       sub: '5 days ago  •  60 min', score: 74 },
  { id: 3, icon: '📋', type: 'application', title: 'Applied to Acme Corp — Frontend Eng', sub: '1 week ago',            score: null },
  { id: 4, icon: '🎤', type: 'interview', title: 'Mock Interview — Behavioural Round',   sub: '2 weeks ago  •  30 min', score: 91 },
]

function scoreClass(s) {
  if (s === null) return ''
  if (s >= 85) return 'activity-score--great'
  if (s >= 70) return 'activity-score--good'
  return 'activity-score--ok'
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Profile({ user = {}, onLogout = () => {} }) {
  const [editing,  setEditing]  = useState(false)
  const [toast,    setToast]    = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [errors,   setErrors]   = useState({})

  const toastTimer = useRef(null)

  // ── Form state initialised to empty; filled on mount from API ────────────
  const [form, setForm] = useState(EMPTY_FORM)
  // Snapshot of last saved state — used to detect dirty edits
  const [savedForm, setSavedForm] = useState(EMPTY_FORM)

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  )

  // ── Fetch profile from DB on mount ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    profileService.getProfile()
      .then((data) => {
        if (cancelled) return
        // Map null → '' for controlled inputs
        const filled = {
          fullName:       data.fullName       || '',
          phone:          data.phone          || '',
          college:        data.college        || '',
          branch:         data.branch         || '',
          graduationYear: data.graduationYear || '',
          skills:         data.skills         || '',
          linkedinUrl:    data.linkedinUrl    || '',
          leetcodeUrl:    data.leetcodeUrl    || '',
          githubUrl:      data.githubUrl      || '',
        }
        setForm(filled)
        setSavedForm(filled)
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message || 'Could not load profile', 'error')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Warn on tab-close when there are unsaved edits ───────────────────────
  useEffect(() => {
    if (!editing || !isDirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [editing, isDirty])

  // ── Derived stats from sample activity ───────────────────────────────────
  const stats = useMemo(() => {
    const interviews = SAMPLE_ACTIVITY.filter((a) => a.type === 'interview')
    const avgScore   = interviews.length
      ? Math.round(interviews.reduce((s, a) => s + a.score, 0) / interviews.length)
      : 0
    return {
      interviews: interviews.length,
      score:      avgScore,
      applied:    SAMPLE_ACTIVITY.filter((a) => a.type === 'application').length,
      streak:     7,
    }
  }, [])

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((message, tone = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, tone })
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // ── Validation ────────────────────────────────────────────────────────────
  const runValidation = (nextForm) => {
    const nextErrors = {}
    ;['phone', 'linkedinUrl', 'leetcodeUrl', 'githubUrl'].forEach((field) => {
      const msg = validateField(field, nextForm[field])
      if (msg) nextErrors[field] = msg
    })
    return nextErrors
  }

  const hasErrors = Object.keys(errors).length > 0

  // ── Save handler — calls PUT /api/profile ─────────────────────────────────
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
      const saved = await profileService.saveProfile(form)
      const filled = {
        fullName:       saved.fullName       || '',
        phone:          saved.phone          || '',
        college:        saved.college        || '',
        branch:         saved.branch         || '',
        graduationYear: saved.graduationYear || '',
        skills:         saved.skills         || '',
        linkedinUrl:    saved.linkedinUrl    || '',
        leetcodeUrl:    saved.leetcodeUrl    || '',
        githubUrl:      saved.githubUrl      || '',
      }
      setForm(filled)
      setSavedForm(filled)
      setEditing(false)
      showToast('✓ Profile saved!')
    } catch (err) {
      showToast(err.message || 'Could not save profile — try again', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('Discard your changes?')) return
    setForm(savedForm)
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
        else     delete next[field]
        return next
      })
    }
  }

  const handleLogout = () => {
    if (editing && isDirty && !window.confirm('You have unsaved changes. Log out anyway?')) return
    onLogout()
  }

  // ── Derived display values ────────────────────────────────────────────────
  const displayName = form.fullName || user.email?.split('@')[0] || 'User'
  const rawRole     = user.role?.toLowerCase() ?? 'student'
  const role        = KNOWN_ROLES.includes(rawRole) ? rawRole : 'student'

  // ─────────────────────────────────────────────────────────────────────────
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
              {getInitials(form.fullName, user.email)}
            </div>

            {/* Identity */}
            <div className="profile-identity">
              <h1 className="profile-name">{loading ? '…' : displayName}</h1>
              <p className="profile-email">{user.email}</p>
              <div className="profile-badges">
                <span className={`badge badge--role-${role}`}>{role}</span>
                {form.college && (
                  <span className="badge badge--joined">{form.college}</span>
                )}
                <span className="badge badge--interviews">
                  {stats.interviews} Interviews
                </span>
              </div>
            </div>

            {/* Edit button */}
            {!editing && !loading && (
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
                EDITING{isDirty ? ' • UNSAVED' : ''}
              </span>
            )}
          </div>

          {loading ? (
            /* ── Skeleton loader ─────────────────────────────────────────── */
            <div className="profile-form" style={{ opacity: 0.5 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="form-field">
                  <div className="form-label" style={{ background: 'var(--p-100)', height: 12, width: 80, borderRadius: 6 }} />
                  <div className="form-input" style={{ background: 'var(--p-50)', color: 'transparent', userSelect: 'none' }}>
                    &nbsp;
                  </div>
                </div>
              ))}
            </div>
          ) : editing ? (
            /* ── Edit Form ─────────────────────────────────────────────── */
            <form className="profile-form" onSubmit={handleSave} id="profile-edit-form" noValidate>

              <div className="profile-form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-fullName">Full Name</label>
                  <input
                    id="pf-fullName"
                    className="form-input"
                    type="text"
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                    maxLength={100}
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
                  />
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-college">College</label>
                  <input
                    id="pf-college"
                    className="form-input"
                    type="text"
                    placeholder="Your college / university"
                    value={form.college}
                    onChange={handleChange('college')}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="profile-form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-branch">Branch / Department</label>
                  <input
                    id="pf-branch"
                    className="form-input"
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={form.branch}
                    onChange={handleChange('branch')}
                    maxLength={255}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-gradYear">Graduation Year</label>
                  <input
                    id="pf-gradYear"
                    className="form-input"
                    type="text"
                    placeholder="e.g. 2025"
                    value={form.graduationYear}
                    onChange={handleChange('graduationYear')}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="pf-skills">Skills</label>
                  <span className="form-counter">comma-separated</span>
                </div>
                <input
                  id="pf-skills"
                  className="form-input"
                  type="text"
                  placeholder="React, Java, SQL, Python…"
                  value={form.skills}
                  onChange={handleChange('skills')}
                />
              </div>

              <div className="profile-form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-linkedin">LinkedIn URL</label>
                  <input
                    id="pf-linkedin"
                    className={`form-input ${errors.linkedinUrl ? 'form-input--error' : ''}`}
                    type="url"
                    placeholder="https://linkedin.com/in/…"
                    value={form.linkedinUrl}
                    onChange={handleChange('linkedinUrl')}
                    aria-invalid={Boolean(errors.linkedinUrl)}
                  />
                  {errors.linkedinUrl && <p className="form-error">{errors.linkedinUrl}</p>}
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="pf-github">GitHub URL</label>
                  <input
                    id="pf-github"
                    className={`form-input ${errors.githubUrl ? 'form-input--error' : ''}`}
                    type="url"
                    placeholder="https://github.com/…"
                    value={form.githubUrl}
                    onChange={handleChange('githubUrl')}
                    aria-invalid={Boolean(errors.githubUrl)}
                  />
                  {errors.githubUrl && <p className="form-error">{errors.githubUrl}</p>}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="pf-leetcode">LeetCode URL</label>
                <input
                  id="pf-leetcode"
                  className={`form-input ${errors.leetcodeUrl ? 'form-input--error' : ''}`}
                  type="url"
                  placeholder="https://leetcode.com/u/…"
                  value={form.leetcodeUrl}
                  onChange={handleChange('leetcodeUrl')}
                  aria-invalid={Boolean(errors.leetcodeUrl)}
                />
                {errors.leetcodeUrl && <p className="form-error">{errors.leetcodeUrl}</p>}
              </div>

              <div className="form-actions">
                <Button variant="secondary" size="sm" type="button"
                  onClick={handleCancel} id="profile-cancel-btn">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit"
                  loading={saving} disabled={hasErrors} id="profile-save-btn">
                  Save Changes →
                </Button>
              </div>
            </form>

          ) : (
            /* ── View Mode ─────────────────────────────────────────────── */
            <div className="profile-info-grid">
              {[
                { label: 'Full Name',        value: form.fullName },
                { label: 'Email',            value: user.email },
                { label: 'Phone',            value: form.phone },
                { label: 'College',          value: form.college },
                { label: 'Branch',           value: form.branch },
                { label: 'Graduation Year',  value: form.graduationYear },
                { label: 'LinkedIn',         value: form.linkedinUrl, href: form.linkedinUrl },
                { label: 'GitHub',           value: form.githubUrl,   href: form.githubUrl },
                { label: 'LeetCode',         value: form.leetcodeUrl, href: form.leetcodeUrl },
                { label: 'Role',             value: role },
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

              {/* Skills spans full width */}
              {form.skills && (
                <div className="info-field info-field--wide">
                  <div className="info-field__label">Skills</div>
                  <div className="info-field__value">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {form.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                        <span key={skill} style={{
                          background: 'var(--p-100)', color: 'var(--primary)',
                          padding: '0.2rem 0.65rem', borderRadius: '999px',
                          fontSize: '0.75rem', fontWeight: 600
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ACTIVITY CARD
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <Button variant="secondary" size="sm"
              onClick={() => showToast('Full history coming soon!')}
              id="profile-view-all-btn">
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
                    <span className={`activity-score ${scoreClass(item.score)}`}
                      aria-label={`Score ${item.score} percent`}>
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
          <div className="card-header"><h2>Account</h2></div>
          <div className="account-actions">
            <Button variant="ghost" size="sm"
              onClick={() => showToast('Password reset email sent!')}
              id="profile-reset-pwd-btn">
              🔑 Reset Password
            </Button>
            <Button variant="danger" size="sm"
              onClick={handleLogout} id="profile-logout-btn">
              🚪 Log Out
            </Button>
          </div>
        </div>

      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className={`profile-toast profile-toast--${toast.tone}`}
          role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  )
}
