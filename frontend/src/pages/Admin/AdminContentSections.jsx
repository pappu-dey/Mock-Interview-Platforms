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
 * All use adminStore for localStorage persistence.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import adminStore from '../../store/adminStore'

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
  name: '', fullName: '', industry: '', logo: '', color: '#E4A16A',
  hq: '', employees: '', website: '', salaryRange: '',
  difficulty: 'Medium', status: 'saved', readiness: 70,
  rating: 4, hired: '', openRoles: 0,
  roles: [], topics: [], tip: '',
  rounds: [{ id: uid(), name: '', type: 'aptitude', desc: '' }],
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
          <label className="cm-label">Full Name</label>
          <input className="cm-input" value={form.fullName} onChange={e => setField('fullName', e.target.value)} placeholder="e.g. Alphabet Inc." />
        </div>
      </div>
      <div className="cm-field-row">
        <div className="cm-field">
          <label className="cm-label">Industry <span>*</span></label>
          <input className={`cm-input ${errors.industry ? 'error' : ''}`} value={form.industry} onChange={e => setField('industry', e.target.value)} placeholder="e.g. IT Services" />
          {errors.industry && <span className="cm-field-error">{errors.industry}</span>}
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
          <label className="cm-label">Status</label>
          <select className="cm-select" value={form.status} onChange={e => setField('status', e.target.value)}>
            {['saved', 'applied', 'interview', 'offer'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="cm-field">
          <label className="cm-label">Open Roles</label>
          <input className="cm-input" type="number" min="0" value={form.openRoles} onChange={e => setField('openRoles', +e.target.value)} />
        </div>
      </div>
      <div className="cm-field-row">
        <div className="cm-field">
          <label className="cm-label">Readiness %</label>
          <input className="cm-input" type="number" min="0" max="100" value={form.readiness} onChange={e => setField('readiness', +e.target.value)} />
        </div>
        <div className="cm-field">
          <label className="cm-label">Campus Hired/yr</label>
          <input className="cm-input" value={form.hired} onChange={e => setField('hired', e.target.value)} placeholder="e.g. 5,000+ campus hires/yr" />
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

export function CompaniesSection({ showToast }) {
  const [items, setItems]     = useState(() => adminStore.get('companies'))
  const [search, setSearch]   = useState('')
  const [drawer, setDrawer]   = useState(null)   // null | 'add' | 'edit'
  const [form, setForm]       = useState(COMPANY_DEFAULTS)
  const [editId, setEditId]   = useState(null)
  const [errors, setErrors]   = useState({})
  const [delItem, setDelItem] = useState(null)

  useEffect(() => adminStore.subscribe('companies', () => setItems(adminStore.get('companies'))), [])

  const filtered = items.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setForm({ ...COMPANY_DEFAULTS, rounds: [{ id: uid(), name: '', type: 'aptitude', desc: '' }] })
    setEditId(null)
    setErrors({})
    setDrawer('add')
  }
  function openEdit(item) {
    setForm({ ...COMPANY_DEFAULTS, ...item, rounds: item.rounds?.length ? item.rounds.map(r => ({ ...r, id: r.id || uid() })) : [{ id: uid(), name: '', type: 'aptitude', desc: '' }] })
    setEditId(item.id)
    setErrors({})
    setDrawer('edit')
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Company name is required'
    if (!form.industry.trim()) e.industry = 'Industry is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const payload = { ...form, logo: form.logo || form.name.slice(0, 2).toUpperCase() }
    if (drawer === 'add') {
      adminStore.add('companies', { ...payload, id: form.name.toLowerCase().replace(/\s+/g, '-') + '-' + uid() })
      showToast('Company added ✓')
    } else {
      adminStore.update('companies', editId, payload)
      showToast('Company updated ✓')
    }
    setDrawer(null)
  }

  function handleDelete(item) {
    setDelItem(item)
  }
  function confirmDelete() {
    adminStore.remove('companies', delItem.id)
    showToast('Company deleted')
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
                <th>Industry</th>
                <th>HQ</th>
                <th>Difficulty</th>
                <th>Salary</th>
                <th>Rounds</th>
                <th>Status</th>
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
                        <span className="cm-cell-sub">{c.fullName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="cm-cell-muted">{c.industry}</td>
                  <td className="cm-cell-muted">{c.hq}</td>
                  <td><span className={`cm-badge ${badgeClass(c.difficulty)}`}>{c.difficulty}</span></td>
                  <td className="cm-cell-muted">{c.salaryRange}</td>
                  <td><span className="cm-count-chip">🎯 {c.rounds?.length || 0}</span></td>
                  <td><span className={`cm-badge ${badgeClass(c.status)}`}>{c.status}</span></td>
                  <td>
                    <div className="cm-row-actions">
                      <button className="cm-action-btn edit" title="Edit" onClick={() => openEdit(c)}>✏️</button>
                      <button className="cm-action-btn del"  title="Delete" onClick={() => handleDelete(c)}>🗑️</button>
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
  const [items, setItems]     = useState(() => adminStore.get(storeKey))
  const [search, setSearch]   = useState('')
  const [drawer, setDrawer]   = useState(null)
  const [form, setForm]       = useState(MCQ_DEFAULTS(category))
  const [editId, setEditId]   = useState(null)
  const [errors, setErrors]   = useState({})
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
                      <button className="cm-action-btn del"  onClick={() => setDelItem(t)}>🗑️</button>
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
  const [items, setItems]     = useState(() => adminStore.get(storeKey))
  const [search, setSearch]   = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [drawer, setDrawer]   = useState(null)
  const [form, setForm]       = useState({ question: '', category: defaultCategory, difficulty: 'Medium', answer: '' })
  const [editId, setEditId]   = useState(null)
  const [errors, setErrors]   = useState({})
  const [delItem, setDelItem] = useState(null)

  useEffect(() => adminStore.subscribe(storeKey, () => setItems(adminStore.get(storeKey))), [storeKey])

  const filtered = items.filter(q => {
    const matchSearch = q.question?.toLowerCase().includes(search.toLowerCase()) || q.answer?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'All' || q.category === filterCat
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
              color:      filterCat === cat ? 'var(--ad-accent)'        : 'var(--ad-text-2)',
              borderColor:filterCat === cat ? 'rgba(228,161,106,0.25)'  : 'var(--ad-glass-bd)',
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
                      <button className="cm-action-btn del"  onClick={() => setDelItem(q)}>🗑️</button>
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
