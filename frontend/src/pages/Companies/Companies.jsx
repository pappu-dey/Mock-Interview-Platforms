/**
 * Companies.jsx — Target Companies Hub
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   - Company cards grid with readiness scores & status badges
 *   - Filter by industry, difficulty, application status
 *   - Application tracker (Saved → Applied → Interview → Offer)
 *   - Company detail modal with interview pattern & tips
 *   - Salary ranges & role information
 */

import React, { useState, useMemo } from 'react'
import './Companies.css'

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Bookmark: ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? '#F59E0B' : 'none'} stroke={filled ? '#F59E0B' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Rupee: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a6 6 0 0 0 0-5H6" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
}

// ── Data ──────────────────────────────────────────────────────────────────────
const COMPANIES = [
  {
    id: 'tcs',
    name: 'TCS',
    fullName: 'Tata Consultancy Services',
    industry: 'IT Services',
    logo: 'TC',
    color: '#1A6FBF',
    hq: 'Mumbai, India',
    employees: '600,000+',
    website: 'tcs.com',
    roles: ['Software Engineer', 'Systems Engineer', 'IT Analyst'],
    salaryRange: '₹3.5L – ₹7.5L',
    difficulty: 'Easy',
    status: 'applied',
    readiness: 84,
    rating: 4,
    hired: '18,000+ campus hires/yr',
    rounds: [
      { name: 'Online Aptitude', type: 'aptitude', desc: 'Quant, Reasoning, Verbal – 90 mins' },
      { name: 'Technical Interview', type: 'technical', desc: 'DSA basics, CS fundamentals, Java/Python' },
      { name: 'HR Round', type: 'hr', desc: 'Culture fit, situational questions' },
    ],
    topics: ['Arrays', 'OOP', 'SQL Basics', 'Aptitude', 'Verbal'],
    tip: 'TCS NQT has a strong aptitude section. Practice Quantitative Aptitude daily. Verbal section carries high weightage.',
    openRoles: 3,
  },
  {
    id: 'infosys',
    name: 'Infosys',
    fullName: 'Infosys Limited',
    industry: 'IT Services',
    logo: 'IN',
    color: '#006DB7',
    hq: 'Bengaluru, India',
    employees: '340,000+',
    website: 'infosys.com',
    roles: ['Systems Engineer', 'Technology Analyst', 'Associate Consultant'],
    salaryRange: '₹3.6L – ₹9L',
    difficulty: 'Medium',
    status: 'interview',
    readiness: 76,
    rating: 4,
    hired: '12,000+ campus hires/yr',
    rounds: [
      { name: 'HackerRank Test', type: 'aptitude', desc: 'Coding (2 problems) + Aptitude' },
      { name: 'Technical Round', type: 'technical', desc: 'DSA, OOPS, DBMS, OS concepts' },
      { name: 'HR Interview', type: 'hr', desc: 'Behavioral, goals, flexibility' },
    ],
    topics: ['Linked Lists', 'DBMS', 'Java OOP', 'OS', 'Coding'],
    tip: 'Infosys SP track (Power Programmer) requires strong coding skills. Focus on medium-level DSA problems.',
    openRoles: 5,
  },
  {
    id: 'wipro',
    name: 'Wipro',
    fullName: 'Wipro Limited',
    industry: 'IT Services',
    logo: 'WI',
    color: '#6B2D8B',
    hq: 'Bengaluru, India',
    employees: '250,000+',
    website: 'wipro.com',
    roles: ['Project Engineer', 'Software Engineer', 'Associate'],
    salaryRange: '₹3.5L – ₹6.5L',
    difficulty: 'Easy',
    status: 'saved',
    readiness: 61,
    rating: 3,
    hired: '10,000+ campus hires/yr',
    rounds: [
      { name: 'NLTH Online Test', type: 'aptitude', desc: 'Aptitude + English + Coding – 3 hrs' },
      { name: 'Technical Interview', type: 'technical', desc: 'Resume-based, DSA basics' },
      { name: 'HR Round', type: 'hr', desc: 'Standard HR questions' },
    ],
    topics: ['Basic DSA', 'Aptitude', 'English', 'Resume-Based'],
    tip: 'Wipro Elite NLTH is achievable with consistent aptitude practice. English section can be a differentiator.',
    openRoles: 4,
  },
  {
    id: 'accenture',
    name: 'Accenture',
    fullName: 'Accenture PLC',
    industry: 'Consulting & IT',
    logo: 'AC',
    color: '#A100FF',
    hq: 'Dublin / Bengaluru',
    employees: '750,000+',
    website: 'accenture.com',
    roles: ['Associate Developer', 'ASE', 'Analyst'],
    salaryRange: '₹4.5L – ₹8L',
    difficulty: 'Medium',
    status: 'offer',
    readiness: 91,
    rating: 5,
    hired: '20,000+ campus hires/yr',
    rounds: [
      { name: 'Cognitive & Technical', type: 'aptitude', desc: 'Gamified aptitude + coding challenge' },
      { name: 'Communication Test', type: 'technical', desc: 'Spoken English & situational scenarios' },
      { name: 'HR Discussion', type: 'hr', desc: 'Values fit, relocation, role preferences' },
    ],
    topics: ['Aptitude', 'Spoken English', 'Basic Coding', 'Behavioural'],
    tip: 'Accenture values communication skills highly. Practice spoken English and situational judgement questions.',
    openRoles: 7,
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    fullName: 'Cognizant Technology Solutions',
    industry: 'IT Services',
    logo: 'CG',
    color: '#1F6BE6',
    hq: 'Teaneck, NJ / Chennai',
    employees: '360,000+',
    website: 'cognizant.com',
    roles: ['Programmer Analyst', 'Associate', 'Full Stack Developer'],
    salaryRange: '₹4L – ₹7.5L',
    difficulty: 'Medium',
    status: 'applied',
    readiness: 72,
    rating: 4,
    hired: '8,000+ campus hires/yr',
    rounds: [
      { name: 'GenC Evolve Test', type: 'aptitude', desc: 'Aptitude + Coding – 90 mins' },
      { name: 'Technical Interview', type: 'technical', desc: 'DSA, project discussion, full-stack' },
      { name: 'HR Interview', type: 'hr', desc: 'Career goals, strengths' },
    ],
    topics: ['Full Stack', 'DSA', 'React', 'Node.js', 'Aptitude'],
    tip: 'Cognizant GenC Evolve track targets full-stack developers. Highlight your project work with React/Node.',
    openRoles: 2,
  },
  {
    id: 'hcl',
    name: 'HCL Tech',
    fullName: 'HCL Technologies',
    industry: 'IT Services',
    logo: 'HC',
    color: '#0F6FFF',
    hq: 'Noida, India',
    employees: '220,000+',
    website: 'hcltech.com',
    roles: ['Graduate Engineer Trainee', 'Software Engineer'],
    salaryRange: '₹3.5L – ₹6L',
    difficulty: 'Easy',
    status: 'saved',
    readiness: 68,
    rating: 3,
    hired: '6,000+ campus hires/yr',
    rounds: [
      { name: 'Online Assessment', type: 'aptitude', desc: 'Aptitude + Coding + Communication' },
      { name: 'Technical Interview', type: 'technical', desc: 'Core CS, OOP, Resume projects' },
      { name: 'HR Round', type: 'hr', desc: 'Standard HR questions' },
    ],
    topics: ['OOP', 'DBMS', 'Aptitude', 'Communication'],
    tip: 'HCL has a simpler interview process. Core CS fundamentals and good communication will get you through.',
    openRoles: 6,
  },
]

const STATUS_PIPELINE = ['saved', 'applied', 'interview', 'offer']

const STATUS_META = {
  saved:     { label: 'Saved',     color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  applied:   { label: 'Applied',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  interview: { label: 'Interview', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  offer:     { label: 'Offer 🎉',  color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
}

const DIFF_META = {
  Easy:   { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  Medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  Hard:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
}

const ROUND_TYPE_COLOR = {
  aptitude: { bg: 'rgba(245,158,11,0.1)',  color: '#B45309', label: '📐 Aptitude' },
  technical: { bg: 'rgba(91,78,232,0.1)',  color: '#5B4EE8', label: '💻 Technical' },
  hr:        { bg: 'rgba(16,185,129,0.1)', color: '#059669', label: '🤝 HR' },
}

function readinessColor(r) {
  if (r >= 80) return '#10B981'
  if (r >= 65) return '#F59E0B'
  return '#EF4444'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Companies() {
  const [search, setSearch]               = useState('')
  const [filterIndustry, setFilterIndustry] = useState('All')
  const [filterStatus, setFilterStatus]   = useState('All')
  const [filterDiff, setFilterDiff]       = useState('All')
  const [activeTab, setActiveTab]         = useState('all')   // 'all' | 'tracker'
  const [selected, setSelected]           = useState(null)    // company detail modal
  const [bookmarked, setBookmarked]       = useState(new Set(['tcs', 'accenture']))

  const industries = ['All', ...new Set(COMPANIES.map(c => c.industry))]
  const statuses   = ['All', ...STATUS_PIPELINE]
  const diffs      = ['All', 'Easy', 'Medium', 'Hard']

  const filtered = useMemo(() => {
    return COMPANIES.filter(c => {
      if (filterIndustry !== 'All' && c.industry !== filterIndustry) return false
      if (filterStatus !== 'All' && c.status !== filterStatus) return false
      if (filterDiff !== 'All' && c.difficulty !== filterDiff) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return c.name.toLowerCase().includes(q) ||
               c.fullName.toLowerCase().includes(q) ||
               c.roles.some(r => r.toLowerCase().includes(q))
      }
      return true
    })
  }, [search, filterIndustry, filterStatus, filterDiff])

  const toggleBookmark = (id, e) => {
    e.stopPropagation()
    setBookmarked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const pipelineGroups = STATUS_PIPELINE.reduce((acc, s) => {
    acc[s] = COMPANIES.filter(c => c.status === s)
    return acc
  }, {})

  return (
    <div className="co-page">
      <div className="co-inner">

        {/* ── Hero ── */}
        <div className="co-hero">
          <div className="co-hero__accent" />
          <div className="co-hero__content">
            <span className="co-hero__badge">🏢 COMPANY TRACKER</span>
            <h1 className="co-hero__title">
              Your <span className="co-gradient">Target Companies</span> Hub
            </h1>
            <p className="co-hero__sub">
              Track your applications, explore company interview patterns, and know exactly how ready you are for each target company.
            </p>
          </div>
          <div className="co-hero__stats">
            {[
              { label: 'Companies Tracked', value: COMPANIES.length },
              { label: 'Applications Sent', value: COMPANIES.filter(c => ['applied','interview','offer'].includes(c.status)).length },
              { label: 'Interviews Scheduled', value: COMPANIES.filter(c => c.status === 'interview').length },
              { label: 'Offers Received', value: COMPANIES.filter(c => c.status === 'offer').length },
            ].map(({ label, value }) => (
              <div key={label} className="co-hero-stat">
                <span className="co-hero-stat__num">{value}</span>
                <span className="co-hero-stat__label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="co-tab-row">
          <div className="co-tabs">
            <button className={`co-tab ${activeTab === 'all' ? 'co-tab--active' : ''}`} onClick={() => setActiveTab('all')}>
              🏢 All Companies
            </button>
            <button className={`co-tab ${activeTab === 'tracker' ? 'co-tab--active' : ''}`} onClick={() => setActiveTab('tracker')}>
              📋 Application Tracker
            </button>
          </div>

          {activeTab === 'all' && (
            <div className="co-search-bar">
              <span className="co-search-icon"><Icon.Search /></span>
              <input
                type="text"
                placeholder="Search companies or roles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="co-search-input"
              />
              {search && <button className="co-search-clear" onClick={() => setSearch('')}><Icon.X /></button>}
            </div>
          )}
        </div>

        {/* ════ All Companies Tab ════ */}
        {activeTab === 'all' && (
          <>
            {/* Filters */}
            <div className="co-filters">
              <div className="co-filter-group">
                <span className="co-filter-label"><Icon.Filter /> Industry:</span>
                {industries.map(ind => (
                  <button key={ind} className={`co-filter-btn ${filterIndustry === ind ? 'active' : ''}`} onClick={() => setFilterIndustry(ind)}>
                    {ind}
                  </button>
                ))}
              </div>
              <div className="co-filter-group">
                <span className="co-filter-label">Status:</span>
                {statuses.map(st => (
                  <button key={st} className={`co-filter-btn ${filterStatus === st ? 'active' : ''}`} onClick={() => setFilterStatus(st)}>
                    {st === 'All' ? 'All' : STATUS_META[st].label}
                  </button>
                ))}
              </div>
              <div className="co-filter-group">
                <span className="co-filter-label">Difficulty:</span>
                {diffs.map(d => (
                  <button key={d} className={`co-filter-btn ${filterDiff === d ? 'active' : ''}`} onClick={() => setFilterDiff(d)}>
                    {d}
                  </button>
                ))}
              </div>
              {(search || filterIndustry !== 'All' || filterStatus !== 'All' || filterDiff !== 'All') && (
                <button className="co-reset-btn" onClick={() => { setSearch(''); setFilterIndustry('All'); setFilterStatus('All'); setFilterDiff('All') }}>
                  Reset ↺
                </button>
              )}
            </div>

            {/* Company Cards Grid */}
            {filtered.length === 0 ? (
              <div className="co-empty">
                <div className="co-empty-icon">🔍</div>
                <h3>No companies found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="co-grid">
                {filtered.map(company => {
                  const sm = STATUS_META[company.status]
                  const dm = DIFF_META[company.difficulty]
                  const rc = readinessColor(company.readiness)
                  const isBookmarked = bookmarked.has(company.id)
                  return (
                    <div key={company.id} className="co-card" onClick={() => setSelected(company)}>
                      {/* Top bar colour accent */}
                      <div className="co-card__accent" style={{ background: company.color }} />

                      <div className="co-card__head">
                        <div className="co-logo" style={{ background: company.color }}>
                          {company.logo}
                        </div>
                        <div className="co-card__badges">
                          <span className="co-badge" style={{ background: dm.bg, color: dm.color }}>{company.difficulty}</span>
                          <span className="co-badge" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                        </div>
                        <button className={`co-bookmark ${isBookmarked ? 'co-bookmark--active' : ''}`} onClick={e => toggleBookmark(company.id, e)}>
                          <Icon.Bookmark filled={isBookmarked} />
                        </button>
                      </div>

                      <div className="co-card__info">
                        <h3 className="co-card__name">{company.name}</h3>
                        <p className="co-card__fullname">{company.fullName}</p>
                        <div className="co-card__meta">
                          <span><Icon.MapPin /> {company.hq.split('/')[0].trim()}</span>
                          <span><Icon.Briefcase /> {company.openRoles} open roles</span>
                        </div>
                      </div>

                      <div className="co-card__roles">
                        {company.roles.slice(0, 2).map(r => (
                          <span key={r} className="co-role-chip">{r}</span>
                        ))}
                        {company.roles.length > 2 && <span className="co-role-chip co-role-chip--more">+{company.roles.length - 2}</span>}
                      </div>

                      <div className="co-card__readiness">
                        <div className="co-readiness-row">
                          <span className="co-readiness-label">Readiness</span>
                          <span className="co-readiness-pct" style={{ color: rc }}>{company.readiness}%</span>
                        </div>
                        <div className="co-readiness-bar">
                          <div className="co-readiness-fill" style={{ width: `${company.readiness}%`, background: rc }} />
                        </div>
                      </div>

                      <div className="co-card__footer">
                        <span className="co-salary"><Icon.Rupee /> {company.salaryRange}</span>
                        <span className="co-rounds-count">{company.rounds.length} rounds</span>
                        <span className="co-view-btn">Details <Icon.ChevronRight /></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ════ Application Tracker Tab ════ */}
        {activeTab === 'tracker' && (
          <div className="co-tracker">
            {STATUS_PIPELINE.map((status, si) => {
              const sm = STATUS_META[status]
              const companies = pipelineGroups[status]
              return (
                <div key={status} className="co-pipeline-col">
                  <div className="co-pipeline-header" style={{ borderColor: sm.color }}>
                    <span className="co-pipeline-title" style={{ color: sm.color }}>{sm.label}</span>
                    <span className="co-pipeline-count" style={{ background: sm.bg, color: sm.color }}>{companies.length}</span>
                  </div>
                  <div className="co-pipeline-cards">
                    {companies.map(c => (
                      <div key={c.id} className="co-pipeline-card" onClick={() => setSelected(c)}>
                        <div className="co-pipeline-card__logo" style={{ background: c.color }}>{c.logo}</div>
                        <div className="co-pipeline-card__info">
                          <div className="co-pipeline-card__name">{c.name}</div>
                          <div className="co-pipeline-card__role">{c.roles[0]}</div>
                          <div className="co-pipeline-card__readiness">
                            <div className="co-mini-bar">
                              <div className="co-mini-fill" style={{ width: `${c.readiness}%`, background: readinessColor(c.readiness) }} />
                            </div>
                            <span style={{ color: readinessColor(c.readiness) }}>{c.readiness}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {companies.length === 0 && (
                      <div className="co-pipeline-empty">
                        <span>No companies here yet</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ════ Company Detail Modal ════ */}
        {selected && (
          <div className="co-modal-backdrop" onClick={() => setSelected(null)}>
            <div className="co-modal" onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="co-modal-header" style={{ '--co-color': selected.color }}>
                <div className="co-modal-logo" style={{ background: selected.color }}>{selected.logo}</div>
                <div className="co-modal-hd-info">
                  <h2 className="co-modal-name">{selected.name}</h2>
                  <p className="co-modal-fullname">{selected.fullName}</p>
                  <div className="co-modal-meta">
                    <span><Icon.MapPin /> {selected.hq}</span>
                    <span><Icon.Users /> {selected.employees}</span>
                    <span><Icon.Globe /> {selected.website}</span>
                  </div>
                </div>
                <button className="co-modal-close" onClick={() => setSelected(null)}><Icon.X /></button>
              </div>

              <div className="co-modal-body">

                {/* Quick Stats */}
                <div className="co-modal-stats">
                  {[
                    { label: 'Readiness', value: `${selected.readiness}%`, color: readinessColor(selected.readiness) },
                    { label: 'Difficulty', value: selected.difficulty, color: DIFF_META[selected.difficulty].color },
                    { label: 'Status', value: STATUS_META[selected.status].label, color: STATUS_META[selected.status].color },
                    { label: 'Salary Range', value: selected.salaryRange, color: '#5B4EE8' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="co-modal-stat">
                      <div className="co-modal-stat__val" style={{ color }}>{value}</div>
                      <div className="co-modal-stat__label">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Open Roles */}
                <div className="co-modal-section">
                  <h3 className="co-modal-section-title">Open Roles</h3>
                  <div className="co-modal-roles">
                    {selected.roles.map(r => (
                      <div key={r} className="co-modal-role-card">
                        <Icon.Briefcase />
                        <span>{r}</span>
                        <span className="co-modal-role-arrow"><Icon.ArrowRight /></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Process */}
                <div className="co-modal-section">
                  <h3 className="co-modal-section-title">Interview Process</h3>
                  <div className="co-interview-process">
                    {selected.rounds.map((round, i) => {
                      const rt = ROUND_TYPE_COLOR[round.type]
                      return (
                        <React.Fragment key={i}>
                          <div className="co-round-card">
                            <div className="co-round-num">{i + 1}</div>
                            <div className="co-round-info">
                              <div className="co-round-name">{round.name}</div>
                              <div className="co-round-desc">{round.desc}</div>
                            </div>
                            <span className="co-round-type" style={{ background: rt.bg, color: rt.color }}>{rt.label}</span>
                          </div>
                          {i < selected.rounds.length - 1 && <div className="co-round-connector" />}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>

                {/* Key Topics */}
                <div className="co-modal-section">
                  <h3 className="co-modal-section-title">Key Topics to Prepare</h3>
                  <div className="co-topics">
                    {selected.topics.map(t => (
                      <span key={t} className="co-topic-chip">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Insider Tip */}
                <div className="co-insider-tip">
                  <div className="co-tip-icon"><Icon.Trophy /></div>
                  <div>
                    <div className="co-tip-title">Insider Tip</div>
                    <div className="co-tip-text">{selected.tip}</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="co-modal-section">
                  <h3 className="co-modal-section-title">Campus Experience Rating</h3>
                  <div className="co-stars">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="co-star"><Icon.Star filled={s <= selected.rating} /></span>
                    ))}
                    <span className="co-star-label">{selected.rating}/5 · {selected.hired}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
