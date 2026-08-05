/**
 * Support.jsx — Help & Support Center
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   - Hero with search
 *   - Quick help cards
 *   - FAQ accordion (filterable by category)
 *   - Contact / Ticket form
 *   - Live chat CTA
 *   - System status
 */

import React, { useState, useMemo } from 'react'
import './Support.css'

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  MessageCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

// ── Data ──────────────────────────────────────────────────────────────────────
const QUICK_CARDS = [
  { icon: Icon.Book, title: 'Documentation', desc: 'Guides and tutorials for every feature', color: '#5B4EE8', bg: 'rgba(91,78,232,0.08)', link: '#' },
  { icon: Icon.Video, title: 'Video Tutorials', desc: 'Step-by-step video walkthroughs', color: '#10B981', bg: 'rgba(16,185,129,0.08)', link: '#' },
  { icon: Icon.Users, title: 'Community Forum', desc: 'Get help from 50,000+ peers', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', link: '#' },
  { icon: Icon.Zap, title: 'Quick Start', desc: 'Get up and running in 5 minutes', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', link: '#' },
]

const FAQ_CATEGORIES = ['All', 'Account', 'Mock Interviews', 'Practice', 'Resume', 'Billing']

const FAQS = [
  {
    cat: 'Account',
    q: 'How do I reset my password?',
    a: 'Go to Settings → Privacy & Security → Change Password. Enter your current password and your new password. If you\'ve forgotten it, use "Forgot Password" on the login page and we\'ll email you a reset link within 2 minutes.',
  },
  {
    cat: 'Account',
    q: 'Can I change my email address?',
    a: 'Yes. Go to Settings → Profile & Account, update the Email field, and click Save. A verification link will be sent to your new email. The change takes effect once verified.',
  },
  {
    cat: 'Mock Interviews',
    q: 'Why is my microphone not working during a mock interview?',
    a: 'Make sure your browser has microphone permission. In Chrome, click the lock icon in the address bar → Site Settings → Microphone → Allow. Reload the page and try again. Check that no other app is using the mic.',
  },
  {
    cat: 'Mock Interviews',
    q: 'How are my interview scores calculated?',
    a: 'Scores are based on four dimensions: Accuracy (40%), Communication Clarity (25%), Time Management (20%), and Problem Approach (15%). Each dimension is scored by our AI model and averaged into a final 0–100 score.',
  },
  {
    cat: 'Mock Interviews',
    q: 'Can I retake the same mock interview?',
    a: 'Yes! You can retake any interview session. The latest score is shown on your profile, but all attempts are saved in your history so you can track improvement over time.',
  },
  {
    cat: 'Practice',
    q: 'How does the daily practice streak work?',
    a: 'Complete at least one practice session (5+ questions) on consecutive days to maintain your streak. Missing a day resets it to zero. Streaks reset at midnight IST. Premium users get a 1-day grace period per month.',
  },
  {
    cat: 'Practice',
    q: 'What topics are covered in the question bank?',
    a: 'Our bank has 2,000+ questions across: Data Structures & Algorithms, Database (SQL/NoSQL), System Design, Object-Oriented Programming, Aptitude & Reasoning, Verbal Ability, and HR/Behavioural questions.',
  },
  {
    cat: 'Resume',
    q: 'Which file formats are supported for resume upload?',
    a: 'We support PDF and DOCX formats up to 5 MB. PDF is recommended for best ATS parsing accuracy. Google Docs files can be exported as PDF and uploaded.',
  },
  {
    cat: 'Resume',
    q: 'How accurate is the ATS score?',
    a: 'Our ATS engine is trained on 10,000+ real recruiter decisions from top Indian tech companies. It achieves ~88% accuracy in predicting shortlisting outcomes. The score is a guidance tool—actual results may vary by company.',
  },
  {
    cat: 'Billing',
    q: 'Is PrepPilot free to use?',
    a: 'Yes! The free plan includes 5 mock interviews/month, the full question bank (limited daily attempts), basic ATS scoring, and performance graphs. Premium unlocks unlimited interviews, AI feedback, advanced analytics, and priority support.',
  },
  {
    cat: 'Billing',
    q: 'How do I cancel my subscription?',
    a: 'Go to Settings → Billing → Manage Subscription → Cancel Plan. Your premium access continues until the end of your current billing period. No partial refunds for mid-cycle cancellations.',
  },
]

const STATUS_ITEMS = [
  { name: 'Mock Interview Engine', status: 'operational' },
  { name: 'AI Feedback Service', status: 'operational' },
  { name: 'Resume ATS Analysis', status: 'operational' },
  { name: 'Question Bank API', status: 'degraded' },
  { name: 'Email Notifications', status: 'operational' },
  { name: 'Authentication Service', status: 'operational' },
]

const STATUS_META = {
  operational: { label: 'Operational', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  degraded: { label: 'Degraded', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  outage: { label: 'Outage', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`sup-faq-item ${open ? 'open' : ''}`}>
      <button className="sup-faq-q" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <span className={`sup-faq-chevron ${open ? 'open' : ''}`}><Icon.ChevronDown /></span>
      </button>
      {open && <div className="sup-faq-a">{a}</div>}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Support() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: 'General', message: '', priority: 'normal' })
  const [submitted, setSubmitted] = useState(false)

  const filteredFaqs = useMemo(() => {
    return FAQS.filter(f => {
      if (cat !== 'All' && f.cat !== cat) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      }
      return true
    })
  }, [search, cat])

  const handleFormChange = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const allOk = STATUS_ITEMS.every(s => s.status === 'operational')

  return (
    <div className="sup-page">
      <div className="sup-inner">

        {/* ── Hero ── */}
        <div className="sup-hero">
          <div className="sup-hero__accent" />
          <div className="sup-hero__content">
            <span className="sup-hero__badge">🛟 HELP CENTER</span>
            <h1 className="sup-hero__title">
              How can we <span className="sup-gradient">help you?</span>
            </h1>
            <p className="sup-hero__sub">Search our knowledge base or browse the topics below.</p>
            <div className="sup-search-bar">
              <span className="sup-search-icon"><Icon.Search /></span>
              <input
                className="sup-search-input"
                type="text"
                placeholder="Search for answers…  e.g. 'reset password', 'mock interview score'"
                value={search}
                onChange={e => { setSearch(e.target.value); setCat('All') }}
              />
              {search && (
                <button className="sup-search-clear" onClick={() => setSearch('')}><Icon.X /></button>
              )}
            </div>
          </div>
          <div className="sup-hero__stats">
            {[
              { num: '2,000+', label: 'Help Articles' },
              { num: '50K+', label: 'Community Members' },
              { num: '< 2h', label: 'Avg Response Time' },
              { num: '98%', label: 'Satisfaction Rate' },
            ].map(({ num, label }) => (
              <div key={label} className="sup-hero-stat">
                <span className="sup-hero-stat__num">{num}</span>
                <span className="sup-hero-stat__label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Cards ── */}
        <div className="sup-quick-grid">
          {QUICK_CARDS.map(({ icon: CardIcon, title, desc, color, bg }) => (
            <div key={title} className="sup-quick-card">
              <div className="sup-quick-icon" style={{ background: bg, color }}>
                <CardIcon />
              </div>
              <div className="sup-quick-title">{title}</div>
              <div className="sup-quick-desc">{desc}</div>
              <span className="sup-quick-link" style={{ color }}>
                Browse <Icon.ArrowRight />
              </span>
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div className="sup-faq-section">
          <div className="sup-faq-header">
            <div>
              <h2 className="sup-section-title">Frequently Asked Questions</h2>
              <p className="sup-section-sub">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
                {cat !== 'All' ? ` in "${cat}"` : ''}
                {search ? ` for "${search}"` : ''}
              </p>
            </div>
            <div className="sup-faq-cats">
              {FAQ_CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`sup-cat-btn ${cat === c ? 'active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="sup-faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="sup-faq-empty">
                <div className="sup-faq-empty-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try different keywords or browse all categories.</p>
                <button className="sup-reset-btn" onClick={() => { setSearch(''); setCat('All') }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))
            )}
          </div>
        </div>

        {/* ── Bottom grid: Contact Form + Live Chat + Status ── */}
        <div className="sup-bottom-grid">

          {/* Contact Form */}
          <div className="sup-card sup-form-card">
            <div className="sup-card-header">
              <div className="sup-card-icon" style={{ background: 'rgba(91,78,232,0.1)', color: 'var(--primary)' }}>
                <Icon.Mail />
              </div>
              <div>
                <h2 className="sup-card-title">Submit a Ticket</h2>
                <p className="sup-card-sub">We typically respond within 2 hours on weekdays.</p>
              </div>
            </div>

            {submitted ? (
              <div className="sup-submitted">
                <div className="sup-submitted-icon">✅</div>
                <h3>Ticket Submitted!</h3>
                <p>We've received your request and will reply to <strong>{form.email || 'your email'}</strong> within 2 hours.</p>
                <button className="sup-btn sup-btn--ghost" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', category: 'General', message: '', priority: 'normal' }) }}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form className="sup-form" onSubmit={handleSubmit}>
                <div className="sup-form-row">
                  <div className="sup-field">
                    <label className="sup-label">Full Name</label>
                    <input className="sup-input" type="text" placeholder="Arjun Sharma" value={form.name} onChange={e => handleFormChange('name', e.target.value)} required />
                  </div>
                  <div className="sup-field">
                    <label className="sup-label">Email Address</label>
                    <input className="sup-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => handleFormChange('email', e.target.value)} required />
                  </div>
                </div>

                <div className="sup-form-row">
                  <div className="sup-field">
                    <label className="sup-label">Category</label>
                    <select className="sup-input sup-select" value={form.category} onChange={e => handleFormChange('category', e.target.value)}>
                      {['General', 'Account', 'Mock Interviews', 'Practice', 'Resume', 'Billing', 'Bug Report', 'Feature Request'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sup-field">
                    <label className="sup-label">Priority</label>
                    <select className="sup-input sup-select" value={form.priority} onChange={e => handleFormChange('priority', e.target.value)}>
                      <option value="low">Low — General question</option>
                      <option value="normal">Normal — Feature / account issue</option>
                      <option value="high">High — Can't use the platform</option>
                      <option value="critical">Critical — Data loss / security</option>
                    </select>
                  </div>
                </div>

                <div className="sup-field">
                  <label className="sup-label">Subject</label>
                  <input className="sup-input" type="text" placeholder="Briefly describe the issue" value={form.subject} onChange={e => handleFormChange('subject', e.target.value)} required />
                </div>

                <div className="sup-field">
                  <label className="sup-label">Message</label>
                  <textarea
                    className="sup-input sup-textarea"
                    rows={5}
                    placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen…"
                    value={form.message}
                    onChange={e => handleFormChange('message', e.target.value)}
                    required
                  />
                </div>

                <div className="sup-form-footer">
                  <span className="sup-form-note">📎 Attach screenshots by emailing support@preppilot.in</span>
                  <button className="sup-btn sup-btn--primary" type="submit">
                    <Icon.Send /> Send Ticket
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="sup-right-col">

            {/* Live Chat */}
            <div className="sup-card sup-chat-card">
              <div className="sup-chat-glow" />
              <div className="sup-online-dot" />
              <h3 className="sup-chat-title">Live Chat Support</h3>
              <p className="sup-chat-sub">Chat with our support team right now. Average wait: <strong>&lt; 5 min</strong>.</p>
              <div className="sup-chat-hours">
                <div className="sup-chat-hour-row"><span>Mon – Fri</span><span>9 AM – 9 PM IST</span></div>
                <div className="sup-chat-hour-row"><span>Sat – Sun</span><span>10 AM – 6 PM IST</span></div>
              </div>
              <button className="sup-btn sup-btn--chat">
                <Icon.MessageCircle /> Start Live Chat
              </button>
              <div className="sup-rating-row">
                {[1, 2, 3, 4, 5].map(s => <span key={s} className="sup-star"><Icon.Star /></span>)}
                <span className="sup-rating-label">4.9 / 5 · 2,400 ratings</span>
              </div>
            </div>

            {/* System Status */}
            <div className="sup-card sup-status-card">
              <div className="sup-status-header">
                <h3 className="sup-card-title">System Status</h3>
                <span className={`sup-status-overall ${allOk ? 'green' : 'amber'}`}>
                  <span className="sup-status-dot" />
                  {allOk ? 'All Systems Operational' : 'Partial Degradation'}
                </span>
              </div>
              <div className="sup-status-list">
                {STATUS_ITEMS.map(({ name, status }) => {
                  const m = STATUS_META[status]
                  return (
                    <div key={name} className="sup-status-row">
                      <span className="sup-status-name">{name}</span>
                      <span className="sup-status-badge" style={{ background: m.bg, color: m.color }}>{m.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="sup-status-footer">Last checked: Just now · <span>View full status page →</span></div>
            </div>

            {/* Contact options */}
            <div className="sup-card sup-contact-card">
              <h3 className="sup-card-title" style={{ marginBottom: '0.85rem' }}>Other Ways to Reach Us</h3>
              {[
                { icon: '📧', title: 'Email', value: 'support@preppilot.in', sub: 'Response within 2 hours' },
                { icon: '💬', title: 'WhatsApp', value: '+91 98765 43210', sub: 'Mon – Fri, 9 AM – 6 PM IST' },
                { icon: '🐦', title: 'Twitter / X', value: '@PrepPilotHQ', sub: 'Public questions & updates' },
              ].map(({ icon, title, value, sub }) => (
                <div key={title} className="sup-contact-row">
                  <span className="sup-contact-emoji">{icon}</span>
                  <div>
                    <div className="sup-contact-title">{title}</div>
                    <div className="sup-contact-value">{value}</div>
                    <div className="sup-contact-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
