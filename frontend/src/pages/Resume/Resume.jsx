/**
 * Resume.jsx — Resume Hub
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   - Drag-and-drop resume upload (PDF / DOCX)
 *   - ATS Compatibility Score with breakdown
 *   - Parsed resume preview card
 *   - Keyword suggestions & missing-section alerts
 *   - Resume template gallery
 *   - Job-match score for target companies
 */

import React, { useState, useRef, useCallback } from 'react'
import './Resume.css'

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
}

// ── Static data ───────────────────────────────────────────────────────────────
const ATS_BREAKDOWN = [
  { label: 'Contact Info', score: 100, tip: 'All contact fields found.' },
  { label: 'Work Experience', score: 90, tip: 'Good detail. Add quantified achievements.' },
  { label: 'Education', score: 100, tip: 'Correctly formatted.' },
  { label: 'Skills Section', score: 75, tip: 'Add technical keywords like Docker, CI/CD.' },
  { label: 'Action Verbs', score: 80, tip: 'Use stronger verbs: "Architected", "Optimised".' },
  { label: 'Keyword Match', score: 60, tip: 'Add role-specific keywords from JDs.' },
  { label: 'File Readability', score: 95, tip: 'PDF parsed cleanly by ATS.' },
]

const MISSING_SECTIONS = [
  { label: 'Summary / Objective', severity: 'high' },
  { label: 'Certifications', severity: 'medium' },
  { label: 'Projects section', severity: 'medium' },
  { label: 'LinkedIn URL', severity: 'low' },
]

const KEYWORD_SUGGESTIONS = [
  'React.js', 'Node.js', 'REST API', 'Agile/Scrum', 'Docker',
  'PostgreSQL', 'CI/CD', 'TypeScript', 'System Design', 'Microservices',
  'Redis', 'AWS', 'Unit Testing', 'GraphQL',
]

const PRESENT_KEYWORDS = ['React.js', 'Node.js', 'REST API', 'Agile/Scrum', 'PostgreSQL']

const COMPANY_MATCH = [
  { name: 'TCS', role: 'Software Engineer', match: 84, color: '#3C6FBB' },
  { name: 'Infosys', role: 'Systems Engineer', match: 76, color: '#1C6DB0' },
  { name: 'Wipro', role: 'Project Engineer', match: 61, color: '#5B2B82' },
  { name: 'Accenture', role: 'Associate Developer', match: 91, color: '#7C2A8C' },
  { name: 'Cognizant', role: 'Full Stack Developer', match: 72, color: '#2563EB' },
]

const TEMPLATES = [
  { id: 't1', name: 'Clean Pro', tag: 'Most Popular', color: '#5B4EE8', accent: '#EDE9FE' },
  { id: 't2', name: 'Modern Edge', tag: 'ATS Friendly', color: '#10B981', accent: '#D1FAE5' },
  { id: 't3', name: 'Executive', tag: 'Premium', color: '#F59E0B', accent: '#FEF3C7' },
  { id: 't4', name: 'Minimal Ink', tag: 'Minimalist', color: '#1E1B4B', accent: '#E0E7FF' },
]

const SAMPLE_RESUME = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@email.com',
  phone: '+91 98765 43210',
  linkedin: 'linkedin.com/in/arjunsharma',
  github: 'github.com/arjunsharma',
  summary: 'Full-stack developer with 2 years of experience building scalable web applications using React.js and Node.js.',
  experience: [
    { role: 'Junior Software Engineer', company: 'Infosys Ltd', duration: 'Jun 2024 – Present', points: ['Built REST APIs for internal HR portal serving 10k+ employees', 'Reduced page load time by 40% using lazy loading & code splitting'] },
    { role: 'Intern – Frontend', company: 'Startup XYZ', duration: 'Jan – May 2024', points: ['Developed 6 React components used across 3 products', 'Implemented responsive design for mobile-first experience'] },
  ],
  education: [{ degree: 'B.Tech – Computer Science', institution: 'VIT University', year: '2020–2024', cgpa: '8.7 CGPA' }],
  skills: ['React.js', 'Node.js', 'PostgreSQL', 'Agile/Scrum', 'REST API', 'JavaScript', 'Git', 'HTML/CSS'],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function atsColor(score) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function matchColor(m) {
  if (m >= 80) return '#10B981'
  if (m >= 65) return '#F59E0B'
  return '#EF4444'
}

function overallAts(breakdown) {
  return Math.round(breakdown.reduce((a, b) => a + b.score, 0) / breakdown.length)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Resume() {
  const [uploaded, setUploaded] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [activeTab, setActiveTab] = useState('score')
  const [selectedTemplate, setSelectedTemplate] = useState('t1')
  const [expandedExp, setExpandedExp] = useState(null)
  const fileInputRef = useRef(null)

  const atsScore = overallAts(ATS_BREAKDOWN)

  const handleFile = useCallback((file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'doc'].includes(ext)) return
    setFileName(file.name)
    setUploaded(true)
    setActiveTab('score')
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div className="resume-page">
      <div className="resume-inner">

        {/* ── Hero ── */}
        <div className="resume-hero">
          <div className="resume-hero__accent" />
          <div className="resume-hero__content">
            <span className="resume-hero__badge">📄 RESUME HUB</span>
            <h1 className="resume-hero__title">
              Build a <span className="resume-gradient">Resume That Gets Shortlisted</span>
            </h1>
            <p className="resume-hero__sub">
              Upload your resume to get an instant ATS compatibility score, keyword gap analysis, and job-match reports for top companies.
            </p>
          </div>
          {uploaded && (
            <div className="resume-hero__ats-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="ring-bg" />
                <circle cx="60" cy="60" r="50" className="ring-fill"
                  strokeDasharray={`${2 * Math.PI * 50 * (atsScore / 100)} ${2 * Math.PI * 50}`}
                  style={{ stroke: atsColor(atsScore) }}
                />
              </svg>
              <div className="ring-label">
                <span className="ring-num" style={{ color: atsColor(atsScore) }}>{atsScore}%</span>
                <span className="ring-sub">ATS Score</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Upload Zone ── */}
        {!uploaded ? (
          <div
            className={`resume-dropzone ${dragging ? 'resume-dropzone--drag' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="dropzone-icon"><Icon.Upload /></div>
            <h2 className="dropzone-title">Drop your resume here</h2>
            <p className="dropzone-sub">or <span className="dropzone-link">browse files</span></p>
            <p className="dropzone-hint">Supports PDF, DOC, DOCX · Max 5 MB</p>
            <div className="dropzone-chips">
              <span>✅ Instant ATS Score</span>
              <span>✅ Keyword Analysis</span>
              <span>✅ Job Match Report</span>
            </div>
          </div>
        ) : (
          /* ── File Uploaded Banner ── */
          <div className="resume-file-banner">
            <div className="resume-file-icon"><Icon.File /></div>
            <div className="resume-file-info">
              <div className="resume-file-name">{fileName}</div>
              <div className="resume-file-meta">Uploaded just now · PDF · Parsed successfully ✓</div>
            </div>
            <div className="resume-file-actions">
              <button className="rfbtn rfbtn--ghost" title="Download">
                <Icon.Download /> Download
              </button>
              <button
                className="rfbtn rfbtn--danger"
                title="Remove"
                onClick={() => { setUploaded(false); setFileName('') }}
              >
                <Icon.Trash /> Remove
              </button>
            </div>
          </div>
        )}

        {/* ── Tabs (only when uploaded) ── */}
        {uploaded && (
          <>
            <div className="resume-tabs">
              {[
                { id: 'score', label: '🎯 ATS Score' },
                { id: 'preview', label: '👁 Preview' },
                { id: 'keywords', label: '🔑 Keywords' },
                { id: 'match', label: '🏢 Job Match' },
                { id: 'template', label: '🎨 Templates' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  className={`resume-tab ${activeTab === id ? 'resume-tab--active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ════ ATS Score Tab ════ */}
            {activeTab === 'score' && (
              <div className="resume-section-grid">
                <div className="resume-card resume-card--wide">
                  <div className="resume-card-hd">
                    <div>
                      <h2 className="resume-card-title">ATS Compatibility Score</h2>
                      <p className="resume-card-sub">How well your resume is parsed by Applicant Tracking Systems</p>
                    </div>
                    <div className="ats-overall" style={{ color: atsColor(atsScore) }}>
                      {atsScore}% <span>Overall</span>
                    </div>
                  </div>
                  <div className="ats-breakdown">
                    {ATS_BREAKDOWN.map(({ label, score, tip }) => (
                      <div key={label} className="ats-row">
                        <div className="ats-row-label">
                          <span>{label}</span>
                          <span className="ats-tip" title={tip}><Icon.Alert /></span>
                        </div>
                        <div className="ats-bar-wrap">
                          <div className="ats-bar" style={{ '--w': `${score}%`, '--c': atsColor(score) }} />
                        </div>
                        <span className="ats-pct" style={{ color: atsColor(score) }}>{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="resume-card">
                  <h2 className="resume-card-title">Missing Sections</h2>
                  <p className="resume-card-sub">Add these to boost your score</p>
                  <div className="missing-list">
                    {MISSING_SECTIONS.map(({ label, severity }) => (
                      <div key={label} className={`missing-item missing-item--${severity}`}>
                        <span className={`missing-dot dot--${severity}`} />
                        <span className="missing-label">{label}</span>
                        <span className={`missing-tag tag--${severity}`}>
                          {severity === 'high' ? 'High Impact' : severity === 'medium' ? 'Medium' : 'Optional'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="ats-tip-box">
                    <Icon.Sparkle />
                    <p><strong>Quick win:</strong> Adding a 3-line Summary section can increase your ATS score by up to <strong>12 points</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ════ Preview Tab ════ */}
            {activeTab === 'preview' && (
              <div className="resume-preview-wrap">
                <div className="resume-preview-card">
                  {/* Header */}
                  <div className="rp-header">
                    <div className="rp-avatar">{SAMPLE_RESUME.name.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <h2 className="rp-name">{SAMPLE_RESUME.name}</h2>
                      <div className="rp-contacts">
                        <span>✉ {SAMPLE_RESUME.email}</span>
                        <span>📱 {SAMPLE_RESUME.phone}</span>
                        <span>🔗 {SAMPLE_RESUME.linkedin}</span>
                        <span>⚙ {SAMPLE_RESUME.github}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rp-divider" />

                  {/* Summary */}
                  <div className="rp-section">
                    <div className="rp-section-title">Summary</div>
                    <p className="rp-summary">{SAMPLE_RESUME.summary}</p>
                  </div>

                  {/* Experience */}
                  <div className="rp-section">
                    <div className="rp-section-title">Work Experience</div>
                    {SAMPLE_RESUME.experience.map((exp, i) => (
                      <div key={i} className="rp-exp-item">
                        <div className="rp-exp-header" onClick={() => setExpandedExp(expandedExp === i ? null : i)}>
                          <div>
                            <div className="rp-exp-role">{exp.role}</div>
                            <div className="rp-exp-co">{exp.company} · {exp.duration}</div>
                          </div>
                          <span className={`rp-chevron ${expandedExp === i ? 'open' : ''}`}><Icon.ChevronRight /></span>
                        </div>
                        {expandedExp === i && (
                          <ul className="rp-exp-points">
                            {exp.points.map((p, j) => <li key={j}>{p}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="rp-section">
                    <div className="rp-section-title">Education</div>
                    {SAMPLE_RESUME.education.map((edu, i) => (
                      <div key={i} className="rp-edu-item">
                        <div className="rp-edu-degree">{edu.degree}</div>
                        <div className="rp-edu-inst">{edu.institution} · {edu.year} · {edu.cgpa}</div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="rp-section">
                    <div className="rp-section-title">Skills</div>
                    <div className="rp-skills">
                      {SAMPLE_RESUME.skills.map((s) => (
                        <span key={s} className="rp-skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ Keywords Tab ════ */}
            {activeTab === 'keywords' && (
              <div className="resume-section-grid">
                <div className="resume-card resume-card--wide">
                  <div className="resume-card-hd">
                    <div>
                      <h2 className="resume-card-title">Keyword Gap Analysis</h2>
                      <p className="resume-card-sub">Keywords found in top job descriptions for your target role</p>
                    </div>
                    <div className="kw-legend">
                      <span className="kw-dot kw-dot--found" /> Found
                      <span className="kw-dot kw-dot--missing" /> Missing
                    </div>
                  </div>
                  <div className="kw-grid">
                    {KEYWORD_SUGGESTIONS.map((kw) => {
                      const found = PRESENT_KEYWORDS.includes(kw)
                      return (
                        <div key={kw} className={`kw-chip ${found ? 'kw-chip--found' : 'kw-chip--missing'}`}>
                          <span className="kw-chip-icon">{found ? <Icon.Check /> : <Icon.X />}</span>
                          {kw}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="resume-card">
                  <h2 className="resume-card-title">How to Add Missing Keywords</h2>
                  <p className="resume-card-sub">Naturally integrate these into your bullet points</p>
                  <div className="kw-tips">
                    {[
                      { kw: 'Docker', tip: 'Mention containerising a project or using Docker Compose in local dev.' },
                      { kw: 'CI/CD', tip: 'Reference GitHub Actions or Jenkins pipelines you set up or used.' },
                      { kw: 'TypeScript', tip: 'Add to skills if familiar, and note any TS-converted codebases.' },
                      { kw: 'System Design', tip: 'Include a Projects entry with HLD diagram mention.' },
                    ].map(({ kw, tip }) => (
                      <div key={kw} className="kw-tip-item">
                        <div className="kw-tip-keyword"><Icon.Tag /> {kw}</div>
                        <div className="kw-tip-text">{tip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════ Job Match Tab ════ */}
            {activeTab === 'match' && (
              <div className="resume-card">
                <div className="resume-card-hd">
                  <div>
                    <h2 className="resume-card-title">Job Match Score</h2>
                    <p className="resume-card-sub">How well your resume aligns with each company's job description</p>
                  </div>
                  <span className="match-note">Based on current JD analysis</span>
                </div>
                <div className="match-list">
                  {COMPANY_MATCH.map(({ name, role, match, color }) => (
                    <div key={name} className="match-row">
                      <div className="match-logo" style={{ background: color }}>
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="match-info">
                        <div className="match-name">{name}</div>
                        <div className="match-role">{role}</div>
                      </div>
                      <div className="match-bar-wrap">
                        <div className="match-bar" style={{ '--mw': `${match}%`, '--mc': matchColor(match) }} />
                      </div>
                      <div className="match-pct" style={{ color: matchColor(match) }}>{match}%</div>
                      <span className={`match-badge ${match >= 80 ? 'mbadge--green' : match >= 65 ? 'mbadge--amber' : 'mbadge--red'}`}>
                        {match >= 80 ? 'Strong Match' : match >= 65 ? 'Good Fit' : 'Needs Work'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="match-tip-box">
                  <Icon.Sparkle />
                  <p>Adding keywords like <strong>Docker</strong>, <strong>CI/CD</strong>, and <strong>TypeScript</strong> could raise your Wipro match from 61% → 78%.</p>
                </div>
              </div>
            )}

            {/* ════ Templates Tab ════ */}
            {activeTab === 'template' && (
              <div className="resume-card">
                <div className="resume-card-hd">
                  <div>
                    <h2 className="resume-card-title">Resume Templates</h2>
                    <p className="resume-card-sub">Choose a template and re-export your resume instantly</p>
                  </div>
                </div>
                <div className="template-grid">
                  {TEMPLATES.map(({ id, name, tag, color, accent }) => (
                    <div
                      key={id}
                      className={`template-card ${selectedTemplate === id ? 'template-card--selected' : ''}`}
                      onClick={() => setSelectedTemplate(id)}
                    >
                      {/* Mini preview */}
                      <div className="template-preview" style={{ '--tp-color': color, '--tp-accent': accent }}>
                        <div className="tp-header" />
                        <div className="tp-line tp-line--wide" />
                        <div className="tp-line tp-line--mid" />
                        <div className="tp-line" />
                        <div className="tp-divider" />
                        <div className="tp-line tp-line--wide" />
                        <div className="tp-line" />
                        <div className="tp-line tp-line--mid" />
                        {selectedTemplate === id && (
                          <div className="tp-selected-overlay">
                            <span><Icon.Check /></span>
                          </div>
                        )}
                      </div>
                      <div className="template-meta">
                        <div className="template-name">{name}</div>
                        <span className="template-tag" style={{ background: accent, color }}>{tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="template-actions">
                  <button className="tbtn tbtn--primary">
                    <Icon.Download /> Export with Selected Template
                  </button>
                  <button className="tbtn tbtn--ghost">
                    <Icon.Eye /> Preview
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Template promo (if not yet uploaded) ── */}
        {!uploaded && (
          <div className="resume-promo-grid">
            {[
              { icon: '🎯', title: 'ATS Score Instantly', desc: 'Get a detailed score on how well ATS software can read your resume.' },
              { icon: '🔑', title: 'Keyword Gap Analysis', desc: 'Identify the keywords missing from your resume vs. top job descriptions.' },
              { icon: '🏢', title: 'Company Match Score', desc: 'See your resume match % for TCS, Infosys, Accenture, and more.' },
              { icon: '🎨', title: 'Premium Templates', desc: 'Export your resume in ATS-friendly professional templates.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="promo-card">
                <div className="promo-icon">{icon}</div>
                <h3 className="promo-title">{title}</h3>
                <p className="promo-desc">{desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
