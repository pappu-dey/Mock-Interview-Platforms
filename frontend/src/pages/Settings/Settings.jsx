/**
 * Settings.jsx — Application Settings Hub
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Profile & Account
 *   2. Notifications
 *   3. Appearance
 *   4. Privacy & Security
 *   5. Interview Preferences
 *   6. Connected Accounts
 *   7. Danger Zone
 */

import React, { useState, useRef } from 'react'
import './Settings.css'

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Camera: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Github: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  Google: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
}

// ── Sidebar sections ───────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'profile', label: 'Profile & Account', icon: Icon.User },
  { id: 'notifications', label: 'Notifications', icon: Icon.Bell },
  { id: 'appearance', label: 'Appearance', icon: Icon.Sun },
  { id: 'privacy', label: 'Privacy & Security', icon: Icon.Shield },
  { id: 'interview', label: 'Interview Preferences', icon: Icon.Mic },
  { id: 'connected', label: 'Connected Accounts', icon: Icon.Link },
  { id: 'danger', label: 'Danger Zone', icon: Icon.Trash },
]

// ── Toggle component ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }) {
  return (
    <label className="stg-toggle" htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="stg-toggle-track">
        <span className="stg-toggle-thumb" />
      </span>
    </label>
  )
}

// ── SaveBanner ─────────────────────────────────────────────────────────────────
function SaveBanner({ visible, onSave }) {
  if (!visible) return null
  return (
    <div className="stg-save-banner">
      <span>You have unsaved changes</span>
      <button className="stg-btn stg-btn--primary" onClick={onSave}>
        <Icon.Save /> Save Changes
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Settings() {
  const [active, setActive] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Profile
  const [profile, setProfile] = useState({
    name: 'Arjun Sharma',
    email: 'arjun.sharma@email.com',
    phone: '+91 98765 43210',
    college: 'VIT University',
    branch: 'Computer Science',
    year: '2024',
    bio: 'Aspiring Full-Stack Developer. Passionate about DSA and open-source.',
    targetRole: 'Software Engineer',
    targetCompany: 'TCS, Infosys, Accenture',
  })

  // Password visibility
  const [showPwd, setShowPwd] = useState(false)

  // Notifications
  const [notifs, setNotifs] = useState({
    emailInterviewReminders: true,
    emailScoreReports: true,
    emailTips: false,
    pushMockAlerts: true,
    pushStreakReminders: true,
    pushNewCourses: false,
    smsOtp: true,
    digest: 'weekly',
  })

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    accentColor: '#5B4EE8',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
  })

  const ACCENT_COLORS = ['#5B4EE8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

  // Privacy
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showScore: true,
    showStreak: true,
    twoFactor: false,
    sessionAlerts: true,
    dataCollection: true,
  })

  // Interview Prefs
  const [interviewPrefs, setInterviewPrefs] = useState({
    difficulty: 'medium',
    sessionDuration: '30',
    language: 'english',
    aiHints: true,
    autoSaveAnswers: true,
    practiceReminder: '8:00 PM',
    weeklyGoal: '5',
    focusAreas: new Set(['DSA', 'Java']),
  })

  const FOCUS_OPTIONS = ['DSA', 'Java', 'SQL', 'System Design', 'Aptitude', 'HR', 'Python', 'React']

  const toggleFocus = (area) => {
    setInterviewPrefs(prev => {
      const next = new Set(prev.focusAreas)
      next.has(area) ? next.delete(area) : next.add(area)
      return { ...prev, focusAreas: next }
    })
    markDirty()
  }

  // Connected
  const [connected, setConnected] = useState({
    google: true,
    github: false,
    linkedin: false,
  })

  const markDirty = () => { setDirty(true); setSaved(false) }
  const handleSave = () => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 3000) }

  const setProfileField = (key, val) => { setProfile(p => ({ ...p, [key]: val })); markDirty() }
  const setNotifField = (key, val) => { setNotifs(p => ({ ...p, [key]: val })); markDirty() }
  const setAppField = (key, val) => { setAppearance(p => ({ ...p, [key]: val })); markDirty() }
  const setPrivField = (key, val) => { setPrivacy(p => ({ ...p, [key]: val })); markDirty() }
  const setIntField = (key, val) => { setInterviewPrefs(p => ({ ...p, [key]: val })); markDirty() }

  return (
    <div className="stg-page">
      <div className="stg-inner">

        {/* ── Header ── */}
        <div className="stg-header">
          <div>
            <span className="stg-hero-badge">⚙️ SETTINGS</span>
            <h1 className="stg-hero-title">Account <span className="stg-gradient">Settings</span></h1>
            <p className="stg-hero-sub">Manage your profile, preferences, and security settings.</p>
          </div>
          {saved && (
            <div className="stg-saved-toast">
              <Icon.Check /> Saved successfully!
            </div>
          )}
        </div>

        <div className="stg-layout">
          {/* ── Sidebar ── */}
          <aside className="stg-sidebar">
            {SECTIONS.map(({ id, label, icon: SIcon }) => (
              <button
                key={id}
                className={`stg-sidebar-btn ${active === id ? 'stg-sidebar-btn--active' : ''} ${id === 'danger' ? 'stg-sidebar-btn--danger' : ''}`}
                onClick={() => setActive(id)}
              >
                <span className="stg-sidebar-icon"><SIcon /></span>
                <span>{label}</span>
                <span className="stg-sidebar-arrow"><Icon.ChevronRight /></span>
              </button>
            ))}
          </aside>

          {/* ── Content Panels ── */}
          <div className="stg-content">

            {/* ════ Profile & Account ════ */}
            {active === 'profile' && (
              <div className="stg-panel">
                <div className="stg-panel-header">
                  <h2>Profile & Account</h2>
                  <p>Update your personal information and target job details.</p>
                </div>

                {/* Avatar */}
                <div className="stg-avatar-row">
                  <div className="stg-avatar">
                    {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="stg-avatar-info">
                    <div className="stg-avatar-name">{profile.name}</div>
                    <div className="stg-avatar-email">{profile.email}</div>
                    <button className="stg-btn stg-btn--ghost stg-btn--sm">
                      <Icon.Camera /> Change Photo
                    </button>
                  </div>
                </div>

                <div className="stg-divider" />

                <div className="stg-field-grid">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
                    { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                    { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    { label: 'College', key: 'college', type: 'text', placeholder: 'Institution name' },
                    { label: 'Branch', key: 'branch', type: 'text', placeholder: 'e.g., Computer Science' },
                    { label: 'Passing Year', key: 'year', type: 'text', placeholder: 'e.g., 2024' },
                    { label: 'Target Role', key: 'targetRole', type: 'text', placeholder: 'Software Engineer' },
                    { label: 'Target Companies', key: 'targetCompany', type: 'text', placeholder: 'TCS, Infosys…' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className="stg-field">
                      <label className="stg-label">{label}</label>
                      <input
                        className="stg-input"
                        type={type}
                        value={profile[key]}
                        placeholder={placeholder}
                        onChange={e => setProfileField(key, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="stg-field stg-field--full">
                    <label className="stg-label">Bio</label>
                    <textarea
                      className="stg-input stg-textarea"
                      rows={3}
                      value={profile.bio}
                      placeholder="Tell us about yourself…"
                      onChange={e => setProfileField('bio', e.target.value)}
                    />
                  </div>
                </div>

                <div className="stg-divider" />

                {/* Change Password */}
                <div className="stg-section-subtitle">Change Password</div>
                <div className="stg-field-grid">
                  {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                    <div key={label} className="stg-field">
                      <label className="stg-label">{label}</label>
                      <div className="stg-input-wrap">
                        <input
                          className="stg-input"
                          type={showPwd ? 'text' : 'password'}
                          placeholder="••••••••"
                          onChange={markDirty}
                        />
                        <button className="stg-eye-btn" onClick={() => setShowPwd(v => !v)}>
                          {showPwd ? <Icon.EyeOff /> : <Icon.Eye />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="stg-panel-actions">
                  <button className="stg-btn stg-btn--primary" onClick={handleSave}>
                    <Icon.Save /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* ════ Notifications ════ */}
            {active === 'notifications' && (
              <div className="stg-panel">
                <div className="stg-panel-header">
                  <h2>Notifications</h2>
                  <p>Choose what you want to hear about and how.</p>
                </div>

                {[
                  {
                    title: '📧 Email Notifications',
                    items: [
                      { key: 'emailInterviewReminders', label: 'Interview reminders', sub: '24 hours before a scheduled mock interview' },
                      { key: 'emailScoreReports', label: 'Weekly score reports', sub: 'Performance summary every Monday morning' },
                      { key: 'emailTips', label: 'Study tips & resources', sub: 'Curated content for your target companies' },
                    ]
                  },
                  {
                    title: '🔔 Push Notifications',
                    items: [
                      { key: 'pushMockAlerts', label: 'Mock interview alerts', sub: 'Real-time alerts when sessions are available' },
                      { key: 'pushStreakReminders', label: 'Streak reminders', sub: 'Daily reminder to maintain your practice streak' },
                      { key: 'pushNewCourses', label: 'New courses & features', sub: 'Notified when new content drops' },
                    ]
                  },
                  {
                    title: '📱 SMS',
                    items: [
                      { key: 'smsOtp', label: 'OTP & Security alerts', sub: 'Login codes and security notifications only' },
                    ]
                  },
                ].map(({ title, items }) => (
                  <div key={title} className="stg-notif-group">
                    <div className="stg-section-subtitle">{title}</div>
                    {items.map(({ key, label, sub }) => (
                      <div key={key} className="stg-toggle-row">
                        <div className="stg-toggle-info">
                          <div className="stg-toggle-label">{label}</div>
                          <div className="stg-toggle-sub">{sub}</div>
                        </div>
                        <Toggle id={key} checked={notifs[key]} onChange={v => setNotifField(key, v)} />
                      </div>
                    ))}
                  </div>
                ))}

                <div className="stg-divider" />
                <div className="stg-section-subtitle">📆 Digest Frequency</div>
                <div className="stg-radio-group">
                  {['daily', 'weekly', 'never'].map(opt => (
                    <label key={opt} className={`stg-radio-card ${notifs.digest === opt ? 'active' : ''}`}>
                      <input type="radio" name="digest" value={opt} checked={notifs.digest === opt} onChange={() => setNotifField('digest', opt)} />
                      <span>{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                    </label>
                  ))}
                </div>

                <div className="stg-panel-actions">
                  <button className="stg-btn stg-btn--primary" onClick={handleSave}><Icon.Save /> Save Changes</button>
                </div>
              </div>
            )}

            {/* ════ Appearance ════ */}
            {active === 'appearance' && (
              <div className="stg-panel">
                <div className="stg-panel-header">
                  <h2>Appearance</h2>
                  <p>Customise how the platform looks and feels for you.</p>
                </div>

                <div className="stg-section-subtitle">🎨 Theme</div>
                <div className="stg-theme-row">
                  {['light', 'dark', 'system'].map(t => (
                    <button
                      key={t}
                      className={`stg-theme-card ${appearance.theme === t ? 'active' : ''}`}
                      onClick={() => setAppField('theme', t)}
                    >
                      <div className={`stg-theme-preview stg-theme-preview--${t}`}>
                        <div className="stp-bar" /><div className="stp-line" /><div className="stp-line stp-line--mid" />
                      </div>
                      <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                      {appearance.theme === t && <span className="stg-theme-check"><Icon.Check /></span>}
                    </button>
                  ))}
                </div>

                <div className="stg-divider" />
                <div className="stg-section-subtitle">🎯 Accent Colour</div>
                <div className="stg-color-row">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      className={`stg-color-swatch ${appearance.accentColor === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setAppField('accentColor', c)}
                      title={c}
                    >
                      {appearance.accentColor === c && <Icon.Check />}
                    </button>
                  ))}
                </div>

                <div className="stg-divider" />
                <div className="stg-section-subtitle">🔤 Font Size</div>
                <div className="stg-radio-group">
                  {['small', 'medium', 'large'].map(size => (
                    <label key={size} className={`stg-radio-card ${appearance.fontSize === size ? 'active' : ''}`}>
                      <input type="radio" name="fontSize" value={size} checked={appearance.fontSize === size} onChange={() => setAppField('fontSize', size)} />
                      <span style={{ fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.9rem' }}>
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="stg-divider" />
                <div className="stg-section-subtitle">🖥️ Layout</div>
                {[
                  { key: 'compactMode', label: 'Compact Mode', sub: 'Reduce spacing for a denser layout' },
                  { key: 'animations', label: 'Enable Animations', sub: 'Smooth transitions and micro-animations' },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="stg-toggle-row">
                    <div className="stg-toggle-info">
                      <div className="stg-toggle-label">{label}</div>
                      <div className="stg-toggle-sub">{sub}</div>
                    </div>
                    <Toggle id={`app-${key}`} checked={appearance[key]} onChange={v => setAppField(key, v)} />
                  </div>
                ))}

                <div className="stg-panel-actions">
                  <button className="stg-btn stg-btn--primary" onClick={handleSave}><Icon.Save /> Save Changes</button>
                </div>
              </div>
            )}

            {/* ════ Privacy & Security ════ */}
            {active === 'privacy' && (
              <div className="stg-panel">
                <div className="stg-panel-header">
                  <h2>Privacy & Security</h2>
                  <p>Control your privacy and keep your account secure.</p>
                </div>

                <div className="stg-section-subtitle">👁 Profile Visibility</div>
                {[
                  { key: 'profilePublic', label: 'Public Profile', sub: 'Allow others to find and view your profile' },
                  { key: 'showScore', label: 'Show Score', sub: 'Display your interview score on your profile' },
                  { key: 'showStreak', label: 'Show Streak', sub: 'Show your practice streak publicly' },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="stg-toggle-row">
                    <div className="stg-toggle-info">
                      <div className="stg-toggle-label">{label}</div>
                      <div className="stg-toggle-sub">{sub}</div>
                    </div>
                    <Toggle id={`priv-${key}`} checked={privacy[key]} onChange={v => setPrivField(key, v)} />
                  </div>
                ))}

                <div className="stg-divider" />
                <div className="stg-section-subtitle">🔐 Security</div>

                <div className="stg-security-card">
                  <div className="stg-security-icon">🔑</div>
                  <div className="stg-security-info">
                    <div className="stg-toggle-label">Two-Factor Authentication</div>
                    <div className="stg-toggle-sub">Add an extra layer of security via SMS or Authenticator app</div>
                    <span className={`stg-2fa-badge ${privacy.twoFactor ? 'enabled' : 'disabled'}`}>
                      {privacy.twoFactor ? '✓ Enabled' : '✗ Not enabled'}
                    </span>
                  </div>
                  <Toggle id="twoFactor" checked={privacy.twoFactor} onChange={v => setPrivField('twoFactor', v)} />
                </div>

                {[
                  { key: 'sessionAlerts', label: 'Login alerts', sub: 'Get notified on new device logins' },
                  { key: 'dataCollection', label: 'Analytics', sub: 'Help us improve by sharing anonymised usage data' },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="stg-toggle-row">
                    <div className="stg-toggle-info">
                      <div className="stg-toggle-label">{label}</div>
                      <div className="stg-toggle-sub">{sub}</div>
                    </div>
                    <Toggle id={`sec-${key}`} checked={privacy[key]} onChange={v => setPrivField(key, v)} />
                  </div>
                ))}

                <div className="stg-divider" />
                <div className="stg-section-subtitle">📋 Active Sessions</div>
                <div className="stg-sessions">
                  {[
                    { device: 'Windows Chrome', location: 'Bengaluru, IN', time: 'Active now', current: true },
                    { device: 'Android Chrome', location: 'Chennai, IN', time: '2 hours ago', current: false },
                    { device: 'iPhone Safari', location: 'Mumbai, IN', time: '3 days ago', current: false },
                  ].map(({ device, location, time, current }) => (
                    <div key={device} className="stg-session-row">
                      <div className="stg-session-dot" style={{ background: current ? '#10B981' : '#6B7280' }} />
                      <div className="stg-session-info">
                        <div className="stg-toggle-label">{device} {current && <span className="stg-current-tag">Current</span>}</div>
                        <div className="stg-toggle-sub">{location} · {time}</div>
                      </div>
                      {!current && <button className="stg-btn stg-btn--ghost stg-btn--sm stg-btn--red">Revoke</button>}
                    </div>
                  ))}
                </div>

                <div className="stg-panel-actions">
                  <button className="stg-btn stg-btn--primary" onClick={handleSave}><Icon.Save /> Save Changes</button>
                </div>
              </div>
            )}

            {/* ════ Interview Preferences ════ */}
            {active === 'interview' && (
              <div className="stg-panel">
                <div className="stg-panel-header">
                  <h2>Interview Preferences</h2>
                  <p>Personalise your practice sessions and mock interview experience.</p>
                </div>

                <div className="stg-field-grid">
                  <div className="stg-field">
                    <label className="stg-label">Default Difficulty</label>
                    <select className="stg-input stg-select" value={interviewPrefs.difficulty} onChange={e => setIntField('difficulty', e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="stg-field">
                    <label className="stg-label">Session Duration (mins)</label>
                    <select className="stg-input stg-select" value={interviewPrefs.sessionDuration} onChange={e => setIntField('sessionDuration', e.target.value)}>
                      {['15', '20', '30', '45', '60'].map(v => <option key={v} value={v}>{v} minutes</option>)}
                    </select>
                  </div>
                  <div className="stg-field">
                    <label className="stg-label">Question Language</label>
                    <select className="stg-input stg-select" value={interviewPrefs.language} onChange={e => setIntField('language', e.target.value)}>
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="mixed">Hinglish (Mixed)</option>
                    </select>
                  </div>
                  <div className="stg-field">
                    <label className="stg-label">Weekly Practice Goal</label>
                    <select className="stg-input stg-select" value={interviewPrefs.weeklyGoal} onChange={e => setIntField('weeklyGoal', e.target.value)}>
                      {['3', '5', '7', '10', '14'].map(v => <option key={v} value={v}>{v} sessions/week</option>)}
                    </select>
                  </div>
                  <div className="stg-field">
                    <label className="stg-label">Daily Reminder Time</label>
                    <input className="stg-input" type="time" value="20:00" onChange={markDirty} />
                  </div>
                </div>

                <div className="stg-divider" />
                {[
                  { key: 'aiHints', label: 'AI Hints', sub: 'Show contextual hints during practice sessions' },
                  { key: 'autoSaveAnswers', label: 'Auto-save Answers', sub: 'Automatically save your typed answers as drafts' },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="stg-toggle-row">
                    <div className="stg-toggle-info">
                      <div className="stg-toggle-label">{label}</div>
                      <div className="stg-toggle-sub">{sub}</div>
                    </div>
                    <Toggle id={`int-${key}`} checked={interviewPrefs[key]} onChange={v => setIntField(key, v)} />
                  </div>
                ))}

                <div className="stg-divider" />
                <div className="stg-section-subtitle">🎯 Focus Areas</div>
                <p className="stg-section-desc">Select the topics you want to prioritise in your practice sessions.</p>
                <div className="stg-focus-grid">
                  {FOCUS_OPTIONS.map(area => (
                    <button
                      key={area}
                      className={`stg-focus-chip ${interviewPrefs.focusAreas.has(area) ? 'active' : ''}`}
                      onClick={() => toggleFocus(area)}
                    >
                      {interviewPrefs.focusAreas.has(area) && <Icon.Check />}
                      {area}
                    </button>
                  ))}
                </div>

                <div className="stg-panel-actions">
                  <button className="stg-btn stg-btn--primary" onClick={handleSave}><Icon.Save /> Save Changes</button>
                </div>
              </div>
            )}

            {/* ════ Connected Accounts ════ */}
            {active === 'connected' && (
              <div className="stg-panel">
                <div className="stg-panel-header">
                  <h2>Connected Accounts</h2>
                  <p>Link external accounts for faster login and enhanced features.</p>
                </div>

                {[
                  { key: 'google', label: 'Google', sub: 'Sign in quickly and sync your calendar', Icon: Icon.Google, color: '#DB4437' },
                  { key: 'github', label: 'GitHub', sub: 'Link your repositories and coding profile', Icon: Icon.Github, color: '#24292E' },
                  { key: 'linkedin', label: 'LinkedIn', sub: 'Import your work experience and education', Icon: Icon.LinkedIn, color: '#0077B5' },
                ].map(({ key, label, sub, Icon: BrandIcon, color }) => (
                  <div key={key} className="stg-connected-row">
                    <div className="stg-brand-icon" style={{ background: color }}>
                      <BrandIcon />
                    </div>
                    <div className="stg-toggle-info">
                      <div className="stg-toggle-label">{label}</div>
                      <div className="stg-toggle-sub">{connected[key] ? `Connected as ${profile.email}` : sub}</div>
                    </div>
                    <button
                      className={`stg-btn ${connected[key] ? 'stg-btn--ghost stg-btn--red' : 'stg-btn--primary'} stg-btn--sm`}
                      onClick={() => { setConnected(p => ({ ...p, [key]: !p[key] })); markDirty() }}
                    >
                      {connected[key] ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}

                <div className="stg-info-box">
                  <span>ℹ️</span>
                  <p>Connecting accounts lets you sign in without a password. Your linked accounts are only used for authentication and cannot post on your behalf.</p>
                </div>
              </div>
            )}

            {/* ════ Danger Zone ════ */}
            {active === 'danger' && (
              <div className="stg-panel">
                <div className="stg-panel-header">
                  <h2>Danger Zone</h2>
                  <p>Irreversible actions — proceed with caution.</p>
                </div>

                <div className="stg-danger-warning">
                  <span>⚠️</span>
                  <p>Actions in this section are <strong>permanent and cannot be undone</strong>. Please read each description carefully before proceeding.</p>
                </div>

                {[
                  {
                    title: 'Delete All Interview History',
                    desc: 'Permanently removes all your past mock interview sessions, scores, and feedback. Your account remains active.',
                    btnLabel: 'Delete History',
                    color: '#F59E0B',
                  },
                  {
                    title: 'Reset Performance Data',
                    desc: 'Clears all analytics, streak data, and skill scores. Your account settings and profile will be preserved.',
                    btnLabel: 'Reset Data',
                    color: '#EF4444',
                  },
                  {
                    title: 'Delete Account',
                    desc: 'Permanently deletes your account and all associated data. This action cannot be undone and you will lose access immediately.',
                    btnLabel: 'Delete My Account',
                    color: '#DC2626',
                  },
                ].map(({ title, desc, btnLabel, color }) => (
                  <div key={title} className="stg-danger-card" style={{ '--danger-color': color }}>
                    <div className="stg-danger-card__info">
                      <div className="stg-danger-card__title">{title}</div>
                      <div className="stg-danger-card__desc">{desc}</div>
                    </div>
                    <button className="stg-btn stg-btn--danger" style={{ '--danger-color': color }}>
                      <Icon.Trash /> {btnLabel}
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Unsaved changes banner */}
      <SaveBanner visible={dirty} onSave={handleSave} />
    </div>
  )
}
