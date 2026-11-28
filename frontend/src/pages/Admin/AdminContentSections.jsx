/**
 * pages/Admin/AdminContentSections.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Six content-management sections for the Admin Panel:
 *  • CompaniesSection   — add/edit/delete company profiles
 *  • AptitudeSection    — add/edit/delete aptitude MCQ topics
 *  • ReasoningSection   — add/edit/delete reasoning MCQ topics
 *  • GeneralQsSection   — add/edit/delete general interview questions
 *  • JavaQsSection      — add/edit/delete Java interview questions
 *  • SqlQsSection       — add/edit/delete SQL interview questions
 *
 * The active companies and question-bank sections use authenticated API calls.
 * Older topic-editor exports remain backed by adminStore for compatibility.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import adminStore from '../../store/adminStore'
import { authFetch } from '../../api/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
function badgeClass(val) {
  if (!val) return 'default'
  const v = val.toLowerCase()
  if (v === 'easy') return 'easy'
  if (v === 'medium') return 'medium'
  if (v === 'hard') return 'hard'
  if (v === 'hr') return 'hr'
  if (v === 'behavioral') return 'behavioral'
  if (v === 'technical') return 'technical'
  if (v === 'oop') return 'oop'
  if (v === 'collections') return 'collections'
  return 'default'
}

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

/** Tag pill input — press Enter or comma to add a tag */
function TagInput({ value = [], onChange, placeholder = 'Type and press Enter…' }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  function addTag(raw) {
    const tag = raw.trim().replace(/,$/, '')
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="cm-tag-wrap" onClick={() => inputRef.current?.focus()}>
      {value.map((tag, i) => (
        <span key={i} className="cm-tag">
          {tag}
          <button
            className="cm-tag__remove"
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="cm-tag-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => draft && addTag(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  )
}

/** Delete-confirmation modal */
function DeleteConfirm({ label, onConfirm, onCancel }) {
  return (
    <div className="cm-drawer-overlay" onClick={onCancel}>
      <div className="cm-confirm-modal">
        <div className="cm-confirm-modal__box" onClick={e => e.stopPropagation()}>
          <div className="cm-confirm-modal__icon">🗑️</div>
          <div className="cm-confirm-modal__title">Delete Item?</div>
          <div className="cm-confirm-modal__msg">
            Are you sure you want to delete <strong>"{label}"</strong>?<br />
            This action cannot be undone.
          </div>
          <div className="cm-confirm-modal__actions">
            <button className="cm-btn-cancel" onClick={onCancel}>Cancel</button>
            <button className="cm-btn-del-confirm" onClick={onConfirm}>Yes, Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Generic slide-in drawer */
function Drawer({ title, icon, subtitle, onClose, onSave, children, saveLabel = 'Save' }) {
  return (
    <>
      <div className="cm-drawer-overlay" onClick={onClose} />
      <div className="cm-drawer">
        <div className="cm-drawer__header">
          <div>
            <div className="cm-drawer__title">{icon} {title}</div>
            <div className="cm-drawer__subtitle">{subtitle}</div>
          </div>
          <button className="cm-drawer__close" onClick={onClose}>✕</button>
        </div>
        <div className="cm-drawer__body">{children}</div>
        <div className="cm-drawer__footer">
          <button className="cm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cm-btn-save" onClick={onSave}>💾 {saveLabel}</button>
        </div>
      </div>
    </>
  )
}

/** Section toolbar with search + Add button */
function SectionToolbar({ icon, title, subtitle, count, searchVal, onSearch, onAdd, addLabel }) {
  return (
    <div className="cm-toolbar">
      <div className="cm-toolbar__left">
        <h2>{icon} {title} <span className="cm-count-chip">{count}</span></h2>
        <p>{subtitle}</p>
      </div>
      <div className="cm-toolbar__right">
        <div className="cm-search">
          <span className="cm-search__icon">🔍</span>
          <input
            value={searchVal}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search…"
          />
        </div>
        <button className="cm-add-btn" onClick={onAdd}>
          + {addLabel}
        </button>
      </div>
    </div>
  )
}

/** Empty state */
function EmptyState({ icon, title, desc, onAdd }) {
  return (
    <div className="cm-table-wrap">
      <div className="cm-empty">
        <div className="cm-empty__icon">{icon}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
        <button className="cm-add-btn" style={{ marginTop: 8 }} onClick={onAdd}>
          + Add First Entry
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  1. COMPANIES SECTION
// ═══════════════════════════════════════════════════════════════════════════════

const COMPANY_DEFAULTS = {
  name: '', logo: '', color: '#E4A16A',
  hq: '', employees: '', website: '', salaryRange: '',
  difficulty: 'Medium', rating: '',
  roles: [], topics: [], tip: '',
  rounds: [],
}

function CompanyForm({ form, setForm, errors }) {
  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function addRound() {
    setForm(f => ({ ...f, rounds: [...f.rounds, { id: uid(), name: '', type: 'aptitude', desc: '' }] }))
  }
  function removeRound(id) {
    setForm(f => ({ ...f, rounds: f.rounds.filter(r => r.id !== id) }))
  }
  function updateRound(id, key, val) {
    setForm(f => ({ ...f, rounds: f.rounds.map(r => r.id === id ? { ...r, [key]: val } : r) }))
  }

  return (
    <>
      {/* Basic Info */}
      <div className="cm-divider">Basic Info</div>
      <div className="cm-field-row">
        <div className="cm-field">
          <label className="cm-label">Company Name <span>*</span></label>
          <input className={`cm-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Google" />
          {errors.name && <span className="cm-field-error">{errors.name}</span>}
        </div>
        <div className="cm-field">
          <label className="cm-label">Logo Initials</label>
          <input className="cm-input" value={form.logo} onChange={e => setField('logo', e.target.value.toUpperCase().slice(0, 2))} placeholder="2 letters, e.g. TCS" maxLength={2} />
        </div>
      </div>
      <div className="cm-field-row">
        <div className="cm-field">
          <label className="cm-label">HQ Location</label>
          <input className="cm-input" value={form.hq} onChange={e => setField('hq', e.target.value)} placeholder="e.g. Mumbai, India" />
        </div>
        <div className="cm-field">
          <label className="cm-label">Employees</label>
          <input className="cm-input" value={form.employees} onChange={e => setField('employees', e.target.value)} placeholder="e.g. 300,000+" />
        </div>
      </div>
      <div className="cm-field-row">
        <div className="cm-field">
          <label className="cm-label">Website</label>
          <input className="cm-input" value={form.website} onChange={e => setField('website', e.target.value)} placeholder="e.g. company.com" />
        </div>
        <div className="cm-field">
          <label className="cm-label">Salary Range</label>
          <input className="cm-input" value={form.salaryRange} onChange={e => setField('salaryRange', e.target.value)} placeholder="e.g. ₹4L – ₹8L" />
        </div>
      </div>

      {/* Classification */}
      <div className="cm-divider">Classification</div>
      <div className="cm-field-row-3">
        <div className="cm-field">
          <label className="cm-label">Difficulty</label>
          <select className="cm-select" value={form.difficulty} onChange={e => setField('difficulty', e.target.value)}>
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="cm-field">
          <label className="cm-label">Rating</label>
          <input className="cm-input" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setField('rating', e.target.value)} />
        </div>
      </div>

      {/* Arrays */}
      <div className="cm-divider">Roles & Topics</div>
      <div className="cm-field">
        <label className="cm-label">Roles <span className="cm-field-hint" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}> — press Enter to add</span></label>
        <TagInput value={form.roles} onChange={v => setField('roles', v)} placeholder="Add a role…" />
      </div>
      <div className="cm-field">
        <label className="cm-label">Key Topics</label>
        <TagInput value={form.topics} onChange={v => setField('topics', v)} placeholder="Add a topic…" />
      </div>

      {/* Interview Rounds */}
      <div className="cm-divider">Interview Rounds</div>
      <div className="cm-qbuilder">
        {form.rounds.map((r, i) => (
          <div key={r.id} className="cm-round-card">
            <div className="cm-qcard__header">
              <span className="cm-qcard__num">Round {i + 1}</span>
              {form.rounds.length > 1 && (
                <button className="cm-qcard__del" onClick={() => removeRound(r.id)}>🗑️</button>
              )}
            </div>
            <div className="cm-field-row">
              <div className="cm-field">
                <label className="cm-label">Round Name</label>
                <input className="cm-input" value={r.name} onChange={e => updateRound(r.id, 'name', e.target.value)} placeholder="e.g. Online Aptitude" />
              </div>
              <div className="cm-field">
                <label className="cm-label">Type</label>
                <select className="cm-select" value={r.type} onChange={e => updateRound(r.id, 'type', e.target.value)}>
                  <option value="aptitude">Aptitude</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="coding">Coding</option>
                  <option value="group">Group Discussion</option>
                </select>
              </div>
            </div>
            <div className="cm-field" style={{ marginTop: 10 }}>
              <label className="cm-label">Description</label>
              <input className="cm-input" value={r.desc} onChange={e => updateRound(r.id, 'desc', e.target.value)} placeholder="Brief description of this round" />
            </div>
          </div>
        ))}
        <button className="cm-add-round-btn" onClick={addRound}>+ Add Round</button>
      </div>

      {/* Tip */}
      <div className="cm-divider">Preparation Tip</div>
      <div className="cm-field">
        <label className="cm-label">Insider Tip</label>
        <textarea className="cm-textarea" rows={3} value={form.tip} onChange={e => setField('tip', e.target.value)} placeholder="Share a preparation tip for students targeting this company…" />
      </div>
    </>
  )
}

export function CompaniesSection({ showToast, refreshToken }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState(null)   // null | 'add' | 'edit'
  const [form, setForm] = useState(COMPANY_DEFAULTS)
  const [editId, setEditId] = useState(null)
  const [errors, setErrors] = useState({})
  const [delItem, setDelItem] = useState(null)

  const fetchCompanies = useCallback(async () => {
    const data = await authFetch('/api/companies')
    if (!Array.isArray(data)) throw new Error('Invalid companies response')
    const mapped = data.map(c => ({
            id: c.companyId,
            companyId: c.companyId,
            name: c.companyName,
            logo: c.companyLogo || c.companyName?.slice(0, 2).toUpperCase() || 'CO',
            color: '#E4A16A',
            hq: c.headquarters || '',
            employees: c.employees || '',
            website: c.companyWebsite || '',
            salaryRange: c.jobRoles?.[0]?.salary || '',
            difficulty: c.difficulty || 'Medium',
            rating: c.rating ?? '',
            roles: c.jobRoles ? c.jobRoles.map(r => r.roleName) : [],
            topics: c.jobRoles && c.jobRoles[0]?.technicalTopics ? c.jobRoles[0].technicalTopics.split(',').map(t => t.trim()) : [],
            tip: c.insiderTips || '',
            rounds: c.jobRoles && c.jobRoles[0]?.hiringProcesses
              ? c.jobRoles[0].hiringProcesses.map((hp) => ({ id: uid(), name: hp.roundName, type: 'technical', desc: hp.description }))
              : [],
            jobRoles: c.jobRoles || []
    }))
    setItems(mapped)
  }, [])

  useEffect(() => {
    let active = true
    const load = (notify = true) => fetchCompanies().catch(error => {
      if (active && notify) showToast(error.message || 'Unable to load companies')
    })
    load()
    const timer = setInterval(() => load(false), 15000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [fetchCompanies, showToast, refreshToken])

  const filtered = items.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.website?.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setForm({ ...COMPANY_DEFAULTS, rounds: [] })
    setEditId(null)
    setErrors({})
    setDrawer('add')
  }
  function openEdit(item) {
    setForm({
      ...COMPANY_DEFAULTS,
      ...item,
      name: item.name || item.companyName || '',
      hq: item.hq || item.headquarters || '',
      website: item.website || item.companyWebsite || '',
      logo: item.logo || item.companyLogo || '',
      tip: item.tip || item.insiderTips || '',
      rounds: item.rounds?.length ? item.rounds.map(r => ({ ...r, id: r.id || uid() })) : []
    })
    setEditId(item.companyId || item.id)
    setErrors({})
    setDrawer('edit')
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Company name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    const payload = {
      companyId: drawer === 'edit' && editId ? Number(editId) : null,
      companyName: form.name,
      companyWebsite: form.website,
      companyLogo: form.logo || form.name.slice(0, 2).toUpperCase(),
      headquarters: form.hq,
      employees: form.employees,
      rating: form.rating === '' ? null : Number(form.rating),
      difficulty: form.difficulty,
      insiderTips: form.tip,
      jobRoles: form.roles.map((rName) => {
        const roleName = typeof rName === 'string' ? rName : (rName.roleName || 'Software Engineer')
        const existingRole = form.jobRoles?.find(role => role.roleName === roleName)
        return {
        ...existingRole,
        roleName,
        location: existingRole?.location || form.hq,
        salary: form.salaryRange || existingRole?.salary || '',
        experience: existingRole?.experience || '',
        eligibility: existingRole?.eligibility || '',
        technicalTopics: Array.isArray(form.topics) && form.topics.length
          ? form.topics.join(', ')
          : existingRole?.technicalTopics || '',
        description: form.tip || existingRole?.description || '',
        isOpen: existingRole?.isOpen ?? true,
        hiringProcesses: (form.rounds || []).map((rnd, idx) => ({
          roundNumber: idx + 1,
          roundName: rnd.name || `Round ${idx + 1}`,
          description: rnd.desc || ''
        }))
      }})
    }

    try {
      const method = drawer === 'add' ? 'POST' : 'PUT'
      await authFetch(drawer === 'add' ? '/api/companies' : `/api/companies/${editId}`, {
        method,
        body: JSON.stringify(payload)
      })
      showToast(drawer === 'add' ? 'Company saved to database ✓' : 'Company updated in database ✓')
      await fetchCompanies()
      setDrawer(null)
    } catch (e) {
      showToast(e.message || 'Unable to save company')
    }
  }

  function handleDelete(item) {
    setDelItem(item)
  }

  async function confirmDelete() {
    if (delItem) {
      const targetId = delItem.companyId || delItem.id
      try {
        await authFetch(`/api/companies/${targetId}`, { method: 'DELETE' })
        showToast('Company deleted from database')
        await fetchCompanies()
      } catch (error) {
        showToast(error.message || 'Unable to delete company')
      }
    }
    setDelItem(null)
  }

  return (
    <>
      <SectionToolbar icon="🏢" title="Companies" subtitle="Manage company profiles shown to students" count={items.length} searchVal={search} onSearch={setSearch} onAdd={openAdd} addLabel="Add Company" />

      {filtered.length === 0 ? (
        <EmptyState icon="🏢" title="No companies yet" desc="Add your first company to show students the right target companies." onAdd={openAdd} />
      ) : (
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Website</th>
                <th>HQ</th>
                <th>Difficulty</th>
                <th>Salary</th>
                <th>Rounds</th>
                <th>Open Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color || '#E4A16A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {c.logo || c.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{c.name}</strong>
                        <span className="cm-cell-sub">{c.employees || 'Employees not listed'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="cm-cell-muted">{c.website || '—'}</td>
                  <td className="cm-cell-muted">{c.hq}</td>
                  <td><span className={`cm-badge ${badgeClass(c.difficulty)}`}>{c.difficulty}</span></td>
                  <td className="cm-cell-muted">{c.salaryRange}</td>
                  <td><span className="cm-count-chip">🎯 {c.rounds?.length || 0}</span></td>
                  <td><span className="cm-count-chip">{c.openRoles}</span></td>
                  <td>
                    <div className="cm-row-actions">
                      <button className="cm-action-btn edit" title="Edit" onClick={() => openEdit(c)}>✏️</button>
                      <button className="cm-action-btn del" title="Delete" onClick={() => handleDelete(c)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawer && (
        <Drawer
          icon="🏢"
          title={drawer === 'add' ? 'Add Company' : 'Edit Company'}
          subtitle={drawer === 'add' ? 'Fill in the company details below' : `Editing: ${form.name}`}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
          saveLabel={drawer === 'add' ? 'Add Company' : 'Save Changes'}
        >
          <CompanyForm form={form} setForm={setForm} errors={errors} />
        </Drawer>
      )}

      {delItem && (
        <DeleteConfirm
          label={delItem.name}
          onConfirm={confirmDelete}
          onCancel={() => setDelItem(null)}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  2. MCQ TOPIC SECTIONS (Aptitude + Reasoning share the same form)
// ═══════════════════════════════════════════════════════════════════════════════

const BLANK_QUESTION = () => ({
  id: uid(),
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
})

const MCQ_DEFAULTS = (category) => ({
  title: '', description: '', category, difficulty: 'Medium',
  timeLimit: '20 Mins', questionsCount: 10, attempts: '0', avgScore: '0%',
  sampleQuestions: [BLANK_QUESTION()],
})

function McqTopicForm({ form, setForm, errors }) {
  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function addQuestion() {
    setForm(f => ({ ...f, sampleQuestions: [...f.sampleQuestions, BLANK_QUESTION()] }))
  }
  function removeQuestion(id) {
    setForm(f => ({ ...f, sampleQuestions: f.sampleQuestions.filter(q => q.id !== id) }))
  }
  function updateQ(id, key, val) {
    setForm(f => ({ ...f, sampleQuestions: f.sampleQuestions.map(q => q.id === id ? { ...q, [key]: val } : q) }))
  }
  function updateOption(qid, idx, val) {
    setForm(f => ({
      ...f,
      sampleQuestions: f.sampleQuestions.map(q => {
        if (q.id !== qid) return q
        const opts = [...q.options]
        opts[idx] = val
        return { ...q, options: opts }
      })
    }))
  }

  return (
    <>
      <div className="cm-divider">Topic Info</div>
      <div className="cm-field">
        <label className="cm-label">Topic Title <span>*</span></label>
        <input className={`cm-input ${errors.title ? 'error' : ''}`} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Percentages & Profit/Loss" />
        {errors.title && <span className="cm-field-error">{errors.title}</span>}
      </div>
      <div className="cm-field">
        <label className="cm-label">Description</label>
        <textarea className="cm-textarea" rows={2} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Brief description shown on the practice card…" />
      </div>
      <div className="cm-field-row-3">
        <div className="cm-field">
          <label className="cm-label">Difficulty</label>
          <select className="cm-select" value={form.difficulty} onChange={e => setField('difficulty', e.target.value)}>
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="cm-field">
          <label className="cm-label">Time Limit</label>
          <input className="cm-input" value={form.timeLimit} onChange={e => setField('timeLimit', e.target.value)} placeholder="e.g. 20 Mins" />
        </div>
        <div className="cm-field">
          <label className="cm-label">Question Count</label>
          <input className="cm-input" type="number" min="1" value={form.questionsCount} onChange={e => setField('questionsCount', +e.target.value)} />
        </div>
      </div>

      {/* Questions */}
      <div className="cm-divider">Sample Questions</div>
      <div className="cm-qbuilder">
        {form.sampleQuestions.map((q, qi) => (
          <div key={q.id} className="cm-qcard">
            <div className="cm-qcard__header">
              <span className="cm-qcard__num">Q{qi + 1}</span>
              {form.sampleQuestions.length > 1 && (
                <button className="cm-qcard__del" onClick={() => removeQuestion(q.id)}>🗑️</button>
              )}
            </div>
            <div className="cm-field">
              <label className="cm-label">Question Text</label>
              <textarea className="cm-textarea" rows={2} value={q.question} onChange={e => updateQ(q.id, 'question', e.target.value)} placeholder="Write the question here…" />
            </div>
            <div className="cm-field" style={{ marginTop: 10 }}>
              <label className="cm-label">Options — click the letter to mark correct</label>
              <div className="cm-options-grid">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="cm-option-row">
                    <div
                      className={`cm-option-key ${q.correctIndex === oi ? 'correct' : ''}`}
                      title="Click to mark as correct answer"
                      onClick={() => updateQ(q.id, 'correctIndex', oi)}
                    >
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <input
                      className="cm-input"
                      value={opt}
                      onChange={e => updateOption(q.id, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="cm-field" style={{ marginTop: 10 }}>
              <label className="cm-label">Explanation</label>
              <textarea className="cm-textarea" rows={2} value={q.explanation} onChange={e => updateQ(q.id, 'explanation', e.target.value)} placeholder="Explain why the correct answer is correct…" />
            </div>
          </div>
        ))}
        <button className="cm-add-q-btn" onClick={addQuestion}>+ Add Question</button>
      </div>
    </>
  )
}

function McqSection({ storeKey, icon, title, subtitle, category, showToast }) {
  const [items, setItems] = useState(() => adminStore.get(storeKey))
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState(null)
  const [form, setForm] = useState(MCQ_DEFAULTS(category))
  const [editId, setEditId] = useState(null)
  const [errors, setErrors] = useState({})
  const [delItem, setDelItem] = useState(null)

  useEffect(() => adminStore.subscribe(storeKey, () => setItems(adminStore.get(storeKey))), [storeKey])

  const filtered = items.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))

  function openAdd() {
    setForm(MCQ_DEFAULTS(category))
    setEditId(null); setErrors({}); setDrawer('add')
  }
  function openEdit(item) {
    setForm({
      ...MCQ_DEFAULTS(category), ...item,
      sampleQuestions: item.sampleQuestions?.length
        ? item.sampleQuestions.map(q => ({ ...q, id: q.id || uid(), options: q.options?.length === 4 ? q.options : ['', '', '', ''] }))
        : [BLANK_QUESTION()],
    })
    setEditId(item.id); setErrors({}); setDrawer('edit')
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const payload = { ...form, questionsCount: form.sampleQuestions.length || form.questionsCount }
    if (drawer === 'add') {
      adminStore.add(storeKey, { ...payload, id: storeKey + '-' + uid() })
      showToast(`${title.slice(0, -3)} topic added ✓`)
    } else {
      adminStore.update(storeKey, editId, payload)
      showToast('Topic updated ✓')
    }
    setDrawer(null)
  }

  function confirmDelete() {
    adminStore.remove(storeKey, delItem.id)
    showToast('Topic deleted')
    setDelItem(null)
  }

  return (
    <>
      <SectionToolbar icon={icon} title={title} subtitle={subtitle} count={items.length} searchVal={search} onSearch={setSearch} onAdd={openAdd} addLabel="Add Topic" />

      {filtered.length === 0 ? (
        <EmptyState icon={icon} title={`No ${title.toLowerCase()} yet`} desc={`Add your first ${title.toLowerCase().replace(' qs', '')} topic with practice questions.`} onAdd={openAdd} />
      ) : (
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Time Limit</th>
                <th>Questions</th>
                <th>Avg Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.title}</strong>
                    <span className="cm-cell-sub">{t.description?.slice(0, 60)}…</span>
                  </td>
                  <td><span className={`cm-badge ${badgeClass(t.difficulty)}`}>{t.difficulty}</span></td>
                  <td className="cm-cell-muted">{t.timeLimit}</td>
                  <td><span className="cm-count-chip">❓ {t.sampleQuestions?.length || t.questionsCount}</span></td>
                  <td className="cm-cell-muted">{t.avgScore}</td>
                  <td>
                    <div className="cm-row-actions">
                      <button className="cm-action-btn edit" onClick={() => openEdit(t)}>✏️</button>
                      <button className="cm-action-btn del" onClick={() => setDelItem(t)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawer && (
        <Drawer
          icon={icon}
          title={drawer === 'add' ? `Add ${title.slice(0, -3)} Topic` : 'Edit Topic'}
          subtitle={drawer === 'add' ? 'Create a new practice topic with MCQ questions' : `Editing: ${form.title}`}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
          saveLabel={drawer === 'add' ? 'Add Topic' : 'Save Changes'}
        >
          <McqTopicForm form={form} setForm={setForm} errors={errors} />
        </Drawer>
      )}

      {delItem && (
        <DeleteConfirm label={delItem.title} onConfirm={confirmDelete} onCancel={() => setDelItem(null)} />
      )}
    </>
  )
}

export function AptitudeSection({ showToast }) {
  return <McqSection storeKey="aptitude" icon="📐" title="Aptitude Qs" subtitle="Manage quantitative aptitude practice topics" category="aptitude" showToast={showToast} />
}
export function ReasoningSection({ showToast }) {
  return <McqSection storeKey="reasoning" icon="🧠" title="Reasoning Qs" subtitle="Manage logical reasoning practice topics" category="reasoning" showToast={showToast} />
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3. INTERVIEW QUESTION SECTIONS (General, Java, SQL — open-ended format)
// ═══════════════════════════════════════════════════════════════════════════════

function InterviewQForm({ form, setForm, errors, categories }) {
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }
  return (
    <>
      <div className="cm-field">
        <label className="cm-label">Question <span>*</span></label>
        <textarea className={`cm-textarea ${errors.question ? 'error' : ''}`} rows={3} value={form.question} onChange={e => setField('question', e.target.value)} placeholder="Write the interview question here…" />
        {errors.question && <span className="cm-field-error">{errors.question}</span>}
      </div>
      <div className="cm-field-row">
        <div className="cm-field">
          <label className="cm-label">Category</label>
          <select className="cm-select" value={form.category} onChange={e => setField('category', e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="cm-field">
          <label className="cm-label">Difficulty</label>
          <select className="cm-select" value={form.difficulty} onChange={e => setField('difficulty', e.target.value)}>
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div className="cm-field">
        <label className="cm-label">Answer / Explanation</label>
        <textarea className="cm-textarea" rows={4} value={form.answer} onChange={e => setField('answer', e.target.value)} placeholder="Provide the model answer or key points to cover…" />
        <span className="cm-field-hint">This is the suggested answer shown after the interview question.</span>
      </div>
    </>
  )
}

function InterviewQSection({ storeKey, icon, title, subtitle, categories, defaultCategory, showToast }) {
  const [items, setItems] = useState(() => adminStore.get(storeKey))
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [drawer, setDrawer] = useState(null)
  const [form, setForm] = useState({ question: '', category: defaultCategory, difficulty: 'Medium', answer: '' })
  const [editId, setEditId] = useState(null)
  const [errors, setErrors] = useState({})
  const [delItem, setDelItem] = useState(null)

  useEffect(() => adminStore.subscribe(storeKey, () => setItems(adminStore.get(storeKey))), [storeKey])

  const filtered = items.filter(q => {
    const matchSearch = q.question?.toLowerCase().includes(search.toLowerCase()) || q.answer?.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || q.category === filterCat
    return matchSearch && matchCat
  })

  function openAdd() {
    setForm({ question: '', category: defaultCategory, difficulty: 'Medium', answer: '' })
    setEditId(null); setErrors({}); setDrawer('add')
  }
  function openEdit(item) {
    setForm({ question: item.question, category: item.category, difficulty: item.difficulty, answer: item.answer || '' })
    setEditId(item.id); setErrors({}); setDrawer('edit')
  }

  function validate() {
    const e = {}
    if (!form.question.trim()) e.question = 'Question is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    if (drawer === 'add') {
      adminStore.add(storeKey, { ...form, id: storeKey + '-' + uid() })
      showToast('Question added ✓')
    } else {
      adminStore.update(storeKey, editId, form)
      showToast('Question updated ✓')
    }
    setDrawer(null)
  }

  function confirmDelete() {
    adminStore.remove(storeKey, delItem.id)
    showToast('Question deleted')
    setDelItem(null)
  }

  return (
    <>
      <SectionToolbar icon={icon} title={title} subtitle={subtitle} count={items.length} searchVal={search} onSearch={setSearch} onAdd={openAdd} addLabel="Add Question" />

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['All', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            style={{
              padding: '6px 14px', borderRadius: 99, border: '1px solid',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease',
              background: filterCat === cat ? 'rgba(228,161,106,0.12)' : 'var(--ad-glass)',
              color: filterCat === cat ? 'var(--ad-accent)' : 'var(--ad-text-2)',
              borderColor: filterCat === cat ? 'rgba(228,161,106,0.25)' : 'var(--ad-glass-bd)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={icon} title={`No ${title.toLowerCase()} yet`} desc={`Add your first ${title.toLowerCase()} to help students prepare.`} onAdd={openAdd} />
      ) : (
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Question</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Answer Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{q.question?.length > 80 ? q.question.slice(0, 80) + '…' : q.question}</span>
                  </td>
                  <td><span className={`cm-badge ${badgeClass(q.category)}`}>{q.category}</span></td>
                  <td><span className={`cm-badge ${badgeClass(q.difficulty)}`}>{q.difficulty}</span></td>
                  <td className="cm-cell-muted">
                    {q.answer ? (q.answer.length > 50 ? q.answer.slice(0, 50) + '…' : q.answer) : <em style={{ opacity: 0.5 }}>No answer yet</em>}
                  </td>
                  <td>
                    <div className="cm-row-actions">
                      <button className="cm-action-btn edit" onClick={() => openEdit(q)}>✏️</button>
                      <button className="cm-action-btn del" onClick={() => setDelItem(q)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawer && (
        <Drawer
          icon={icon}
          title={drawer === 'add' ? `Add ${title}` : 'Edit Question'}
          subtitle={drawer === 'add' ? 'Add a new interview question with a model answer' : 'Update question and answer'}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
          saveLabel={drawer === 'add' ? 'Add Question' : 'Save Changes'}
        >
          <InterviewQForm form={form} setForm={setForm} errors={errors} categories={categories} />
        </Drawer>
      )}

      {delItem && (
        <DeleteConfirm
          label={delItem.question?.slice(0, 50) + '…'}
          onConfirm={confirmDelete}
          onCancel={() => setDelItem(null)}
        />
      )}
    </>
  )
}

export function GeneralQsSection({ showToast }) {
  return (
    <InterviewQSection
      storeKey="generalQs"
      icon="💬"
      title="General Interview Qs"
      subtitle="HR, behavioral, and general interview questions"
      categories={['HR', 'Behavioral', 'Technical', 'Situational']}
      defaultCategory="HR"
      showToast={showToast}
    />
  )
}

export function JavaQsSection({ showToast }) {
  return (
    <InterviewQSection
      storeKey="javaQs"
      icon="☕"
      title="Java Interview Qs"
      subtitle="Core Java, OOP, Collections, Concurrency, and framework questions"
      categories={['Core Java', 'OOP', 'Collections', 'Concurrency', 'Streams', 'Spring', 'Design Patterns']}
      defaultCategory="Core Java"
      showToast={showToast}
    />
  )
}

export function SqlQsSection({ showToast }) {
  return (
    <InterviewQSection
      storeKey="sqlQs"
      icon="🗄️"
      title="SQL Interview Qs"
      subtitle="Joins, aggregation, indexing, design, and advanced SQL questions"
      categories={['Joins', 'Filtering', 'Aggregation', 'Indexing', 'Subqueries', 'DDL/DML', 'Design', 'Window Functions']}
      defaultCategory="Joins"
      showToast={showToast}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  4. QUESTIONS BANK SECTION (Direct mapping to MySQL questions table schema)
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTION_DEFAULTS = {
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  answer: '',
  category: 'Quantitative Aptitude',
  sub_category: '',
  question_type: 'MCQ',
  difficulty: 'Medium',
  explanation: '',
  company_tag: '',
}

const CATEGORY_OPTIONS = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Technical',
  'Core Java',
  'SQL Database',
  'System Design',
  'HR & Behavioral',
]

const TYPE_OPTIONS = [
  'MCQ',
  'Single Choice',
  'Multiple Choice',
  'True/False',
  'Coding',
  'Subjective',
]

function QuestionForm({ form, setForm, errors, categories }) {
  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function pickOptionAsAnswer(letter, optValue) {
    setField('answer', optValue || letter)
  }

  return (
    <>
      <div className="cm-divider">Question Info</div>
      <div className="cm-field">
        <label className="cm-label">Question Text <span>*</span></label>
        <textarea
          className={`cm-textarea ${errors.question ? 'error' : ''}`}
          rows={3}
          value={form.question}
          onChange={e => setField('question', e.target.value)}
          placeholder="Enter the complete question or problem statement…"
        />
        {errors.question && <span className="cm-field-error">{errors.question}</span>}
      </div>

      <div className="cm-field-row-3">
        <div className="cm-field">
          <label className="cm-label">Question Type <span>*</span></label>
          <select className="cm-select" value={form.question_type} onChange={e => setField('question_type', e.target.value)}>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="cm-field">
          <label className="cm-label">Category <span>*</span></label>
          <select className="cm-select" value={form.category} onChange={e => setField('category', e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="cm-field">
          <label className="cm-label">Sub-Category</label>
          <input
            className="cm-input"
            value={form.sub_category}
            onChange={e => setField('sub_category', e.target.value)}
            placeholder="e.g. Speed & Distance, OOP, Joins"
          />
        </div>
      </div>

      <div className="cm-field-row">
        <div className="cm-field">
          <label className="cm-label">Difficulty</label>
          <select className="cm-select" value={form.difficulty} onChange={e => setField('difficulty', e.target.value)}>
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="cm-field">
          <label className="cm-label">Company Tags</label>
          <input
            className="cm-input"
            value={form.company_tag}
            onChange={e => setField('company_tag', e.target.value)}
            placeholder="e.g. TCS, Infosys, Wipro, Google"
          />
        </div>
      </div>

      {/* Options A, B, C, D */}
      <div className="cm-divider">Options (A, B, C, D)</div>
      <div className="cm-field-hint" style={{ marginBottom: 10, fontSize: 12 }}>
        💡 Click the letter badge <strong>(A, B, C, D)</strong> to quickly select that option as the correct answer.
      </div>

      <div className="cm-q-options-stack">
        {[
          { key: 'option_a', letter: 'A', val: form.option_a },
          { key: 'option_b', letter: 'B', val: form.option_b },
          { key: 'option_c', letter: 'C', val: form.option_c },
          { key: 'option_d', letter: 'D', val: form.option_d },
        ].map(({ key, letter, val }) => {
          const isSelected = form.answer && (
            form.answer === val ||
            form.answer.trim().toLowerCase() === letter.toLowerCase() ||
            form.answer.toLowerCase().startsWith(letter.toLowerCase() + ':') ||
            form.answer.toLowerCase().startsWith(letter.toLowerCase() + ' -')
          );
          return (
            <div key={key} className="cm-q-opt-input-row" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <button
                type="button"
                className={`cm-q-opt-btn ${isSelected ? 'active-ans' : ''}`}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  border: isSelected ? '2px solid var(--ad-success, #22c55e)' : '1px solid var(--ad-border, #cbd5e1)',
                  background: isSelected ? 'rgba(34, 197, 94, 0.15)' : 'var(--ad-glass, #f8fafc)',
                  color: isSelected ? 'var(--ad-success, #22c55e)' : 'var(--ad-text, #334155)',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title={`Click to set Option ${letter} as answer`}
                onClick={() => pickOptionAsAnswer(letter, val)}
              >
                {letter} {isSelected && '✓'}
              </button>
              <input
                className="cm-input"
                style={{ flex: 1 }}
                value={val || ''}
                onChange={e => setField(key, e.target.value)}
                placeholder={`Option ${letter} text…`}
              />
            </div>
          )
        })}
      </div>

      {/* Answer & Explanation */}
      <div className="cm-divider">Answer & Explanation</div>
      <div className="cm-field">
        <label className="cm-label">Correct Answer <span>*</span></label>
        <textarea
          className={`cm-textarea ${errors.answer ? 'error' : ''}`}
          rows={2}
          value={form.answer}
          onChange={e => setField('answer', e.target.value)}
          placeholder="e.g. 150 metres or B, or formula result…"
        />
        {errors.answer && <span className="cm-field-error">{errors.answer}</span>}
      </div>

      <div className="cm-field">
        <label className="cm-label">Explanation / Solution</label>
        <textarea
          className="cm-textarea"
          rows={3}
          value={form.explanation}
          onChange={e => setField('explanation', e.target.value)}
          placeholder="Detailed step-by-step reasoning or mathematical proof explaining why this answer is correct…"
        />
      </div>
    </>
  )
}

/** Modal to inspect full question details */
function QuestionDetailModal({ item, onClose, onEdit }) {
  if (!item) return null
  return (
    <div className="cm-drawer-overlay" onClick={onClose}>
      <div className="cm-confirm-modal" style={{ maxWidth: 650, width: '92vw' }}>
        <div className="cm-confirm-modal__box" style={{ textAlign: 'left' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="cm-q-id-chip">#{item.id}</span>
              <span className={`cm-badge ${badgeClass(item.difficulty)}`}>{item.difficulty || 'Medium'}</span>
              <span className="cm-badge technical">{item.question_type || item.questionType || 'MCQ'}</span>
            </div>
            <button className="cm-drawer__close" onClick={onClose}>✕</button>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--ad-text)' }}>
            {item.question}
          </h3>

          <div style={{ fontSize: 12, color: 'var(--ad-text-2)', marginBottom: 16 }}>
            <span><strong>Category:</strong> {item.category}</span>
            {item.sub_category && <span> • <strong>Sub-category:</strong> {item.sub_category}</span>}
            {item.company_tag && <span> • <strong>Tags:</strong> {item.company_tag}</span>}
          </div>

          {/* Options Display */}
          {(item.option_a || item.optionA || item.option_b || item.optionB) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {[
                { letter: 'A', text: item.option_a || item.optionA },
                { letter: 'B', text: item.option_b || item.optionB },
                { letter: 'C', text: item.option_c || item.optionC },
                { letter: 'D', text: item.option_d || item.optionD },
              ].map(({ letter, text }) => {
                if (!text) return null
                const isAns = item.answer && (
                  item.answer === text ||
                  item.answer.trim().toLowerCase() === letter.toLowerCase() ||
                  item.answer.toLowerCase().startsWith(letter.toLowerCase() + ':') ||
                  item.answer.toLowerCase().startsWith(letter.toLowerCase() + ' -')
                )
                return (
                  <div
                    key={letter}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: isAns ? 'rgba(34, 197, 94, 0.12)' : 'var(--ad-glass)',
                      border: isAns ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--ad-border)',
                      fontSize: 13,
                    }}
                  >
                    <span style={{
                      fontWeight: 800,
                      color: isAns ? '#16a34a' : 'var(--ad-text)',
                      width: 22,
                    }}>
                      {letter}.
                    </span>
                    <span style={{ flex: 1, color: isAns ? '#15803d' : 'var(--ad-text)', fontWeight: isAns ? 600 : 400 }}>
                      {text}
                    </span>
                    {isAns && <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 12 }}>✓ Correct Answer</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Answer Key */}
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(228, 161, 106, 0.1)', border: '1px solid rgba(228, 161, 106, 0.3)', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ad-accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Answer
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ad-text)' }}>
              {item.answer}
            </div>
          </div>

          {/* Explanation */}
          {item.explanation && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--ad-glass)', border: '1px solid var(--ad-border)', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ad-text-2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Explanation
              </div>
              <div style={{ fontSize: 13, color: 'var(--ad-text-2)', lineHeight: 1.5 }}>
                {item.explanation}
              </div>
            </div>
          )}

          {/* Timestamps */}
          {(item.created_at || item.createdAt) && (
            <div style={{ fontSize: 11, color: 'var(--ad-text-3)', marginBottom: 16 }}>
              Created: {new Date(item.created_at || item.createdAt).toLocaleString()}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="cm-btn-cancel" onClick={onClose}>Close</button>
            <button className="cm-btn-save" onClick={() => { onClose(); onEdit(item); }}>✏️ Edit Question</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function QuestionsBankSection({
  showToast,
  refreshToken,
  addRequest = 0,
  handledAddRequest = 0,
  onAddRequestHandled,
  title = 'Questions Bank',
  icon = '❓',
  allowedCategories,
  defaultCategory = QUESTION_DEFAULTS.category,
}) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterDiff, setFilterDiff] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [drawer, setDrawer] = useState(null)
  const [form, setForm] = useState({ ...QUESTION_DEFAULTS, category: defaultCategory })
  const [editId, setEditId] = useState(null)
  const [errors, setErrors] = useState({})
  const [delItem, setDelItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    if (addRequest <= handledAddRequest) return
    const timer = setTimeout(() => {
      setForm({ ...QUESTION_DEFAULTS, category: defaultCategory })
      setEditId(null)
      setErrors({})
      setDrawer('add')
      onAddRequestHandled(addRequest)
    }, 0)
    return () => clearTimeout(timer)
  }, [addRequest, handledAddRequest, defaultCategory, onAddRequestHandled])

  const fetchQuestions = useCallback(async (silent = false) => {
    setIsSyncing(true)
    try {
      const data = await authFetch('/api/questions')
      if (!Array.isArray(data)) throw new Error('Invalid questions response')
      const mapped = data.map(q => ({
            id: q.id,
            question: q.question,
            option_a: q.option_a || q.optionA || '',
            option_b: q.option_b || q.optionB || '',
            option_c: q.option_c || q.optionC || '',
            option_d: q.option_d || q.optionD || '',
            answer: q.answer || '',
            category: q.category || 'General',
            sub_category: q.sub_category || q.subCategory || '',
            question_type: q.question_type || q.questionType || 'MCQ',
            difficulty: q.difficulty || 'Medium',
            explanation: q.explanation || '',
            company_tag: q.company_tag || q.companyTag || '',
            created_at: q.created_at || q.createdAt,
            updated_at: q.updated_at || q.updatedAt,
      }))
      setItems(mapped)
    } catch (error) {
      if (!silent) showToast(error.message || 'Unable to load questions')
    } finally {
      setIsSyncing(false)
    }
  }, [showToast])

  useEffect(() => {
    const initialLoad = setTimeout(fetchQuestions, 0)
    const timer = setInterval(() => fetchQuestions(true), 15000)
    return () => {
      clearTimeout(initialLoad)
      clearInterval(timer)
    }
  }, [fetchQuestions, refreshToken])

  const categories = allowedCategories || CATEGORY_OPTIONS
  const scopedItems = allowedCategories
    ? items.filter(question => allowedCategories.includes(question.category) || allowedCategories.includes(question.sub_category))
    : items
  const filtered = scopedItems.filter(q => {
    const s = search.toLowerCase()
    const matchSearch = (q.question || '').toLowerCase().includes(s) ||
      (q.explanation || '').toLowerCase().includes(s) ||
      (q.company_tag || '').toLowerCase().includes(s) ||
      (q.sub_category || '').toLowerCase().includes(s) ||
      (q.answer || '').toLowerCase().includes(s)
    const matchCat = filterCat === 'All' || q.category === filterCat || q.sub_category === filterCat
    const matchDiff = filterDiff === 'All' || (q.difficulty || '').toLowerCase() === filterDiff.toLowerCase()
    const matchType = filterType === 'All' || (q.question_type || '').toLowerCase() === filterType.toLowerCase()
    return matchSearch && matchCat && matchDiff && matchType
  })

  function openAdd() {
    setForm({ ...QUESTION_DEFAULTS, category: defaultCategory })
    setEditId(null)
    setErrors({})
    setDrawer('add')
  }

  function openEdit(item) {
    setForm({
      question: item.question || '',
      option_a: item.option_a || item.optionA || '',
      option_b: item.option_b || item.optionB || '',
      option_c: item.option_c || item.optionC || '',
      option_d: item.option_d || item.optionD || '',
      answer: item.answer || '',
      category: item.category || 'Quantitative Aptitude',
      sub_category: item.sub_category || item.subCategory || '',
      question_type: item.question_type || item.questionType || 'MCQ',
      difficulty: item.difficulty || 'Medium',
      explanation: item.explanation || '',
      company_tag: item.company_tag || item.companyTag || '',
    })
    setEditId(item.id)
    setErrors({})
    setDrawer('edit')
  }

  function validate() {
    const e = {}
    if (!form.question.trim()) e.question = 'Question text is required'
    if (!form.answer.trim()) e.answer = 'Correct answer is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return

    const payload = {
      id: drawer === 'edit' && editId ? editId : null,
      question: form.question,
      option_a: form.option_a,
      option_b: form.option_b,
      option_c: form.option_c,
      option_d: form.option_d,
      answer: form.answer,
      category: form.category,
      sub_category: form.sub_category,
      question_type: form.question_type,
      difficulty: form.difficulty,
      explanation: form.explanation,
      company_tag: form.company_tag,
    }

    try {
      const method = drawer === 'add' ? 'POST' : 'PUT'
      await authFetch(drawer === 'add' ? '/api/questions' : `/api/questions/${editId}`, {
        method,
        body: JSON.stringify(payload)
      })
      showToast(drawer === 'add' ? 'Question saved to database ✓' : 'Question updated in database ✓')
      await fetchQuestions()
      setDrawer(null)
    } catch (error) {
      showToast(error.message || 'Unable to save question')
    }
  }

  async function confirmDelete() {
    if (delItem) {
      const targetId = delItem.id
      try {
        await authFetch(`/api/questions/${targetId}`, { method: 'DELETE' })
        showToast('Question deleted from database')
        await fetchQuestions()
      } catch (error) {
        showToast(error.message || 'Unable to delete question')
      }
    }
    setDelItem(null)
  }

  return (
    <>
      <SectionToolbar
        icon={icon}
        title={title}
        subtitle="Manage questions, options, answers, and company tags stored in the database"
        count={scopedItems.length}
        searchVal={search}
        onSearch={setSearch}
        onAdd={openAdd}
        addLabel="Add Question"
      />

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ad-text-2)' }}>Category:</span>
          <select
            className="cm-select"
            style={{ width: 'auto', padding: '5px 12px', fontSize: 12, height: 32 }}
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ad-text-2)' }}>Difficulty:</span>
          <select
            className="cm-select"
            style={{ width: 'auto', padding: '5px 12px', fontSize: 12, height: 32 }}
            value={filterDiff}
            onChange={e => setFilterDiff(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ad-text-2)' }}>Type:</span>
          <select
            className="cm-select"
            style={{ width: 'auto', padding: '5px 12px', fontSize: 12, height: 32 }}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {isSyncing && (
          <span style={{ fontSize: 11, color: 'var(--ad-accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🔄</span> Syncing with DB…
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={icon}
          title="No questions found"
          desc="Click the '+ Add Question' button to create your first question with options, correct answer, and explanation."
          onAdd={openAdd}
        />
      ) : (
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ width: '38%' }}>Question</th>
                <th>Category / Sub-category</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Options & Answer</th>
                <th>Company Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const hasOpts = q.option_a || q.option_b || q.option_c || q.option_d
                return (
                  <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => setDetailItem(q)}>
                    <td>
                      <span className="cm-q-id-chip">#{q.id}</span>
                    </td>
                    <td>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--ad-text)', fontSize: 13, lineHeight: 1.4 }}>
                          {q.question?.length > 90 ? q.question.slice(0, 90) + '…' : q.question}
                        </strong>
                        {q.explanation && (
                          <span className="cm-cell-sub" style={{ fontSize: 11, color: 'var(--ad-text-3)', display: 'block', marginTop: 3 }}>
                            💡 {q.explanation.slice(0, 65)}…
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--ad-text)' }}>{q.category}</span>
                        {q.sub_category && (
                          <span className="cm-cell-sub" style={{ fontSize: 11, color: 'var(--ad-accent)' }}>
                            {q.sub_category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="cm-badge technical" style={{ fontSize: 11 }}>{q.question_type || 'MCQ'}</span>
                    </td>
                    <td>
                      <span className={`cm-badge ${badgeClass(q.difficulty)}`}>{q.difficulty || 'Medium'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {hasOpts && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            {['A', 'B', 'C', 'D'].map(l => (
                              <span
                                key={l}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  background: (q.answer && (q.answer.toLowerCase() === l.toLowerCase() || q.answer.toLowerCase().startsWith(l.toLowerCase() + ':')))
                                    ? 'rgba(34, 197, 94, 0.25)'
                                    : 'var(--ad-glass)',
                                  color: (q.answer && (q.answer.toLowerCase() === l.toLowerCase() || q.answer.toLowerCase().startsWith(l.toLowerCase() + ':')))
                                    ? '#16a34a'
                                    : 'var(--ad-text-3)',
                                  border: '1px solid var(--ad-border)'
                                }}
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        )}
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ad-success, #16a34a)' }}>
                          Ans: {q.answer?.length > 22 ? q.answer.slice(0, 22) + '…' : q.answer}
                        </span>
                      </div>
                    </td>
                    <td>
                      {q.company_tag ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {q.company_tag.split(',').slice(0, 2).map((t, idx) => (
                            <span key={idx} className="cm-tag" style={{ fontSize: 10, padding: '2px 6px' }}>
                              {t.trim()}
                            </span>
                          ))}
                          {q.company_tag.split(',').length > 2 && (
                            <span style={{ fontSize: 10, color: 'var(--ad-text-3)' }}>
                              +{q.company_tag.split(',').length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="cm-cell-muted">—</span>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="cm-row-actions">
                        <button className="cm-action-btn view" title="View details" onClick={() => setDetailItem(q)}>👁️</button>
                        <button className="cm-action-btn edit" title="Edit question" onClick={() => openEdit(q)}>✏️</button>
                        <button className="cm-action-btn del" title="Delete question" onClick={() => setDelItem(q)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Drawer */}
      {drawer && (
        <Drawer
          icon={icon}
          title={drawer === 'add' ? `Add ${title.replace(/s$/, '')}` : 'Edit Question'}
          subtitle={drawer === 'add' ? 'Configure question statement, options A-D, answer, and taxonomy' : `Editing Question #${editId}`}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
          saveLabel={drawer === 'add' ? 'Save Question to Database' : 'Update Question'}
        >
          <QuestionForm form={form} setForm={setForm} errors={errors} categories={categories} />
        </Drawer>
      )}

      {/* Delete Confirmation */}
      {delItem && (
        <DeleteConfirm
          label={`Question #${delItem.id}: "${delItem.question?.slice(0, 40)}…"`}
          onConfirm={confirmDelete}
          onCancel={() => setDelItem(null)}
        />
      )}

      {/* Detail Modal */}
      {detailItem && (
        <QuestionDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={openEdit}
        />
      )}
    </>
  )
}
