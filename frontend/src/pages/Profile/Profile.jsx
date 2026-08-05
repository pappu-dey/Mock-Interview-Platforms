/**
 * Profile.jsx — User Profile Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads and writes profile data via GET /api/profile and PUT /api/profile
 * (see profileService.js). Resume storage is handled entirely by
 * resumeService.js — this component never assumes *how* or *where* the file
 * ends up (cloud storage, DB row, etc.), it just asks resumeService for the
 * current resume and displays "Your resume is saved". That keeps the UI
 * decoupled from the storage implementation.
 *
 * NEW: Resume upload lives in its own card and auto-fills the profile form
 * (name, phone, links, skills, college, branch, graduation year) by
 * extracting text from a PDF/DOCX resume client-side and pattern-matching
 * common fields. The user always reviews the auto-filled values before
 * saving — nothing is written to the profile until they hit "Save Changes".
 *
 * Requires (run once in the project):
 *   npm install pdfjs-dist mammoth
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
import resumeService from '../../services/resumeService'
import './Profile.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = '', email = '') {
  const src = name.trim() || email
  const parts = src.split(/[\s@._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (src.slice(0, 2) || 'U').toUpperCase()
}

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/i
const PHONE_RE = /^[+()\d][\d\s()+-]{6,18}$/

function getViewableResumeUrl(url) {
  if (!url) return '#'
  // If it's a Cloudinary raw upload or PDF/DOC, route through Google Docs viewer for guaranteed inline viewing in a new tab
  if (url.includes('/raw/upload/') || url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('.doc')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`
  }
  return url
}

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
  fullName: '',
  phone: '',
  college: '',
  branch: '',
  graduationYear: '',
  skills: '',
  linkedinUrl: '',
  leetcodeUrl: '',
  githubUrl: '',
}

const PROFILE_FIELDS = Object.keys(EMPTY_FORM)

// ── Sample activity (replace with real endpoint later) ───────────────────────
const SAMPLE_ACTIVITY = [
  { id: 1, icon: '🎤', type: 'interview', title: 'Mock Interview — Data Structures', sub: '2 days ago  •  45 min', score: 87 },
  { id: 2, icon: '🎤', type: 'interview', title: 'Mock Interview — System Design', sub: '5 days ago  •  60 min', score: 74 },
  { id: 3, icon: '📋', type: 'application', title: 'Applied to Acme Corp — Frontend Eng', sub: '1 week ago', score: null },
  { id: 4, icon: '🎤', type: 'interview', title: 'Mock Interview — Behavioural Round', sub: '2 weeks ago  •  30 min', score: 91 },
]

function scoreClass(s) {
  if (s === null) return ''
  if (s >= 85) return 'activity-score--great'
  if (s >= 70) return 'activity-score--good'
  return 'activity-score--ok'
}

// ─── Resume parsing ─────────────────────────────────────────────────────────
// A small, dependency-light heuristic parser. It extracts raw text from the
// uploaded PDF/DOCX, then pattern-matches common resume fields. It is not
// perfect — that's why extracted values are always shown for user review
// before saving, rather than being saved automatically.

const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'react', 'redux', 'next.js', 'vue', 'angular', 'node.js', 'express',
  'django', 'flask', 'spring', 'spring boot', '.net', 'ruby on rails',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest api',
  'html', 'css', 'sass', 'tailwind', 'bootstrap', 'docker', 'kubernetes',
  'aws', 'azure', 'gcp', 'git', 'ci/cd', 'jenkins', 'linux', 'bash',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas',
  'numpy', 'data structures', 'algorithms', 'system design', 'oop',
  'kotlin', 'swift', 'flutter', 'react native', 'php', 'r', 'scala',
  'firebase', 'figma', 'jira', 'agile', 'scrum',
]

const BRANCH_KEYWORDS = [
  'Computer Science', 'Information Technology', 'Electronics and Communication',
  'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Computer Engineering', 'Data Science', 'Artificial Intelligence',
  'Chemical Engineering', 'Biotechnology', 'Instrumentation',
]

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist/build/pdf')
    pdfjs.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js'
    const buf = await file.arrayBuffer()
    const doc = await pdfjs.getDocument({ data: buf }).promise
    let text = ''
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((it) => it.str).join(' ') + '\n'
    }
    return text
  }

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth')
    const buf = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf })
    return value
  }

  throw new Error('Unsupported file type — please upload a PDF or DOCX resume')
}

function extractFieldsFromText(text) {
  const found = {}
  const clean = text.replace(/\r/g, '')

  // Email (used only to help find the name line, not written to the form)
  const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

  // Phone
  const phoneMatch = clean.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?){2,4}\d{2,4}/g)
  if (phoneMatch) {
    const candidate = phoneMatch.find((p) => p.replace(/\D/g, '').length >= 10)
    if (candidate) found.phone = candidate.trim()
  }

  // Links
  const linkedin = clean.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s,)]+/i)
  if (linkedin) found.linkedinUrl = linkedin[0].replace(/[.,]$/, '')
  const github = clean.match(/https?:\/\/(www\.)?github\.com\/[^\s,)]+/i)
  if (github) found.githubUrl = github[0].replace(/[.,]$/, '')
  const leetcode = clean.match(/https?:\/\/(www\.)?leetcode\.com\/[^\s,)]+/i)
  if (leetcode) found.leetcodeUrl = leetcode[0].replace(/[.,]$/, '')

  // Name — best guess: first non-empty line that isn't an email/phone/url
  // and looks like "First Last" (2-4 title-case words).
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 8)) {
    if (/@|http|www\.|\d{5,}/.test(line)) continue
    const words = line.split(/\s+/)
    if (words.length >= 2 && words.length <= 4 && /^[A-Z][a-zA-Z.'-]*$/.test(words[0])) {
      found.fullName = line
      break
    }
  }

  // College
  const collegeLine = lines.find((l) => /university|college|institute of technology|\biit\b|\bnit\b/i.test(l))
  if (collegeLine) found.college = collegeLine.slice(0, 100)

  // Branch
  const branchHit = BRANCH_KEYWORDS.find((b) => new RegExp(b, 'i').test(clean))
  if (branchHit) found.branch = branchHit

  // Graduation year — pick the most recent plausible year mentioned
  const years = [...clean.matchAll(/20[1-3]\d/g)].map((m) => parseInt(m[0], 10))
  if (years.length) found.graduationYear = String(Math.max(...years))

  // Skills — match against a known list, dedupe, cap at 15
  const lowerText = clean.toLowerCase()
  const skillHits = COMMON_SKILLS.filter((s) => lowerText.includes(s))
  if (skillHits.length) {
    found.skills = skillHits
      .slice(0, 15)
      .map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(', ')
  }

  return found
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Profile({ user = {}, onLogout = () => { } }) {
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [parsingResume, setParsingResume] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [resumeJustSaved, setResumeJustSaved] = useState(false)
  const [autofilledFields, setAutofilledFields] = useState(new Set())

  const toastTimer = useRef(null)
  const pulseTimer = useRef(null)
  const resumeInputRef = useRef(null)
  const avatarInputRef = useRef(null)

  // ── Form state initialised to empty; filled on mount from API ────────────
  const [form, setForm] = useState(EMPTY_FORM)
  // Snapshot of last saved state — used to detect dirty edits
  const [savedForm, setSavedForm] = useState(EMPTY_FORM)

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  )

  // ── Profile completeness (used for the meter in the hero card) ───────────
  const completeness = useMemo(() => {
    const filled = PROFILE_FIELDS.filter((f) => String(savedForm[f] || '').trim()).length
    return Math.round((filled / PROFILE_FIELDS.length) * 100)
  }, [savedForm])

  // ── Fetch profile & resume on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.allSettled([
      profileService.getProfile(),
      resumeService.getResume(),
    ]).then(([profileRes, resumeRes]) => {
      if (cancelled) return

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const data = profileRes.value
        const filled = {
          fullName: data.fullName || '',
          phone: data.phone || '',
          college: data.college || '',
          branch: data.branch || '',
          graduationYear: data.graduationYear || '',
          skills: data.skills || '',
          linkedinUrl: data.linkedinUrl || '',
          leetcodeUrl: data.leetcodeUrl || '',
          githubUrl: data.githubUrl || '',
        }
        setForm(filled)
        setSavedForm(filled)
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl)
      } else if (profileRes.status === 'rejected') {
        showToast(profileRes.reason?.message || 'Could not load profile', 'error')
      }

      if (resumeRes.status === 'fulfilled' && resumeRes.value) {
        setResumeData(resumeRes.value)
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

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

  useEffect(() => () => {
    clearTimeout(toastTimer.current)
    clearTimeout(pulseTimer.current)
  }, [])

  // ── Derived stats from sample activity ───────────────────────────────────
  const stats = useMemo(() => {
    const interviews = SAMPLE_ACTIVITY.filter((a) => a.type === 'interview')
    const avgScore = interviews.length
      ? Math.round(interviews.reduce((s, a) => s + a.score, 0) / interviews.length)
      : 0
    return {
      interviews: interviews.length,
      score: avgScore,
      applied: SAMPLE_ACTIVITY.filter((a) => a.type === 'application').length,
      streak: 7,
    }
  }, [])

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((message, tone = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ message, tone })
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

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
        fullName: saved.fullName || '',
        phone: saved.phone || '',
        college: saved.college || '',
        branch: saved.branch || '',
        graduationYear: saved.graduationYear || '',
        skills: saved.skills || '',
        linkedinUrl: saved.linkedinUrl || '',
        leetcodeUrl: saved.leetcodeUrl || '',
        githubUrl: saved.githubUrl || '',
      }
      setForm(filled)
      setSavedForm(filled)
      setEditing(false)
      setAutofilledFields(new Set())
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
    setAutofilledFields(new Set())
  }

  const handleChange = (field) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [field]: value }))
    setAutofilledFields((prev) => {
      if (!prev.has(field)) return prev
      const next = new Set(prev)
      next.delete(field)
      return next
    })
    if (errors[field]) {
      setErrors((prev) => {
        const msg = validateField(field, value)
        const next = { ...prev }
        if (msg) next[field] = msg
        else delete next[field]
        return next
      })
    }
  }

  const handleLogout = () => {
    if (editing && isDirty && !window.confirm('You have unsaved changes. Log out anyway?')) return
    onLogout()
  }

  // ── Resume upload → parsed for auto-fill, then handed to resumeService ───
  // Note: this component doesn't know or care where resumeService persists
  // the file — that detail is fully encapsulated behind getResume() /
  // uploadResume() / deleteResume(). The UI only ever says "saved".
  const handleResumeButtonClick = () => resumeInputRef.current?.click()

  const handleResumeFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast('Resume is too large (max 10MB)', 'error')
      return
    }

    setParsingResume(true)
    setUploadingResume(true)

    // 1. Client-side text parsing for form field auto-fill
    let pulledFieldsCount = 0
    try {
      const text = await extractTextFromFile(file)
      const extracted = extractFieldsFromText(text)

      if (Object.keys(extracted).length > 0) {
        const newlyFilled = new Set()
        setForm((prev) => {
          const next = { ...prev }
          Object.entries(extracted).forEach(([field, value]) => {
            if (!next[field] && value) {
              next[field] = value
              newlyFilled.add(field)
            }
          })
          return next
        })
        setAutofilledFields(newlyFilled)
        pulledFieldsCount = newlyFilled.size
      }
    } catch (err) {
      console.warn('Text extraction skipped:', err.message)
    } finally {
      setParsingResume(false)
    }

    // 2. Hand the file to resumeService to persist it
    try {
      const savedResume = await resumeService.uploadResume(file)
      setResumeData(savedResume)
      setResumeJustSaved(true)
      clearTimeout(pulseTimer.current)
      pulseTimer.current = setTimeout(() => setResumeJustSaved(false), 1400)

      if (pulledFieldsCount > 0) {
        showToast(`✓ Resume saved — auto-filled ${pulledFieldsCount} field(s)!`)
      } else {
        showToast('✓ Your resume has been saved!')
      }
    } catch (err) {
      showToast(err.message || 'Could not save your resume — try again', 'error')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded resume?')) return
    try {
      await resumeService.deleteResume()
      setResumeData(null)
      showToast('✓ Resume deleted')
    } catch (err) {
      showToast(err.message || 'Could not delete resume', 'error')
    }
  }

  // ── Avatar upload (local preview; posts to server if supported) ──────────
  const handleAvatarButtonClick = () => avatarInputRef.current?.click()

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file', 'error')
      return
    }
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)

    if (typeof profileService.uploadAvatar === 'function') {
      try {
        const { avatarUrl } = await profileService.uploadAvatar(file)
        if (avatarUrl) setAvatarPreview(avatarUrl)
        showToast('✓ Photo updated!')
      } catch (err) {
        showToast(err.message || 'Could not upload photo', 'error')
      }
    }
  }

  // ── Derived display values ────────────────────────────────────────────────
  const displayName = form.fullName || user.email?.split('@')[0] || 'User'
  const rawRole = user.role?.toLowerCase() ?? 'student'
  const role = KNOWN_ROLES.includes(rawRole) ? rawRole : 'student'

  const inputClass = (field, base = 'form-input') => {
    const cls = [base]
    if (errors[field]) cls.push('form-input--error')
    if (autofilledFields.has(field)) cls.push('form-input--autofilled')
    return cls.join(' ')
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* ── Page heading ── */}
        <p className="section-title">My Profile</p>

        {/* ═══════════════════════════════════════════════════════════════════
            HERO CARD — avatar · name · role badges · completeness
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="profile-card">
          <div className="profile-hero">

            {/* Avatar */}
            <div className="profile-avatar" role="img" aria-label={`Avatar for ${displayName}`}>
              {avatarPreview
                ? <img className="profile-avatar__img" src={avatarPreview} alt="" />
                : getInitials(form.fullName, user.email)}
              {editing && (
                <button
                  type="button"
                  className="profile-avatar__edit"
                  onClick={handleAvatarButtonClick}
                  title="Change photo"
                  aria-label="Change profile photo"
                >
                  📷
                </button>
              )}
              <input
                ref={avatarInputRef}
                className="profile-avatar__input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                tabIndex={-1}
              />
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

              {!loading && (
                <div className="completeness" aria-label={`Profile ${completeness}% complete`}>
                  <div className="completeness__track">
                    <div className="completeness__fill" style={{ width: `${completeness}%` }} />
                  </div>
                  <span className="completeness__label">{completeness}% complete</span>
                </div>
              )}
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
            RESUME CARD — its own card, independent of edit mode.
            Only ever tells the user "your resume is saved" — the storage
            mechanism is an implementation detail of resumeService.
        ═══════════════════════════════════════════════════════════════════ */}
        {!loading && (
          <div className={`profile-card resume-card${resumeJustSaved ? ' resume-card--pulse' : ''}`}>
            <div className="card-header">
              <h2>Resume</h2>
              {resumeData?.resumeUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResumeButtonClick}
                  loading={parsingResume || uploadingResume}
                  id="profile-resume-replace-btn"
                >
                  {uploadingResume ? 'Uploading…' : parsingResume ? 'Reading…' : 'Replace'}
                </Button>
              )}
            </div>

            <div className="resume-card-body">
              {resumeData?.resumeUrl ? (
                <div className="resume-saved">
                  <div className="resume-saved__icon-wrap">
                    <span className="resume-saved__icon" aria-hidden="true">📄</span>
                    <span className="resume-saved__check" aria-hidden="true">✓</span>
                  </div>
                  <div className="resume-saved__details">
                    <span className="resume-saved__title">Your resume is saved</span>
                    <span className="resume-saved__date">
                      Uploaded {resumeData.uploadDate || 'recently'}
                    </span>
                  </div>
                  <div className="resume-saved__actions">
                    <a
                      href={getViewableResumeUrl(resumeData.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-pill-link"
                    >
                      View ↗
                    </a>
                    <button type="button" onClick={handleDeleteResume} className="btn-link-danger">
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`resume-dropzone ${parsingResume || uploadingResume ? 'resume-dropzone--busy' : ''}`}>
                  <div className="resume-dropzone__icon">📄</div>
                  <div className="resume-dropzone__text">
                    <strong>Upload your resume</strong>
                    <span>PDF or DOCX — we'll auto-fill your profile fields below</span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleResumeButtonClick}
                    loading={parsingResume || uploadingResume}
                    id="profile-resume-btn"
                  >
                    {uploadingResume ? 'Uploading…' : parsingResume ? 'Reading…' : 'Choose File'}
                  </Button>
                </div>
              )}

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeFile}
                style={{ display: 'none' }}
              />

              {autofilledFields.size > 0 && (
                <p className="resume-hint">
                  ✨ We pulled some details from your resume —{' '}
                  {editing
                    ? 'double-check the highlighted fields below before saving.'
                    : <>open <strong>Edit</strong> on your details to review them before saving.</>}
                </p>
              )}
            </div>
          </div>
        )}

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
                    className={inputClass('fullName')}
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
                    className={inputClass('phone')}
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
                    className={inputClass('college')}
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
                    className={inputClass('branch')}
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
                    className={inputClass('graduationYear')}
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
                  className={inputClass('skills')}
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
                    className={inputClass('linkedinUrl')}
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
                    className={inputClass('githubUrl')}
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
                  className={inputClass('leetcodeUrl')}
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
                { label: 'Full Name', value: form.fullName },
                { label: 'Email', value: user.email },
                { label: 'Phone', value: form.phone },
                { label: 'College', value: form.college },
                { label: 'Branch', value: form.branch },
                { label: 'Graduation Year', value: form.graduationYear },
                { label: 'LinkedIn', value: form.linkedinUrl, href: form.linkedinUrl },
                { label: 'GitHub', value: form.githubUrl, href: form.githubUrl },
                { label: 'LeetCode', value: form.leetcodeUrl, href: form.leetcodeUrl },
                { label: 'Role', value: role },
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

              {!form.fullName && !form.phone && !form.college && !form.skills && !resumeData && (
                <div className="info-field info-field--wide">
                  <div className="profile-empty" style={{ padding: '1rem 0' }}>
                    <div className="profile-empty-icon">📄</div>
                    <p>Your profile is looking empty — try the <strong>Resume</strong> card above to fill it in seconds.</p>
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