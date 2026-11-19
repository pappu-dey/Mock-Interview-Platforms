/**
 * Practice.jsx — Placement Practice Hub (DB-connected)
 * Layout: the 4 category cards are always stacked one under another.
 * Clicking a card opens its topics on the LEFT (all visible, no inner scroll).
 * Clicking a topic opens the question practice view.
 */

import React, { useState, useCallback, useEffect } from 'react'
import practiceService from '../../services/practiceService'
import './Practice.css'

const API = 'https://main-mock-interview-platforms-pappus-workspace.light-cloud.io/api/questions'

const CATEGORY_DB_MAP = {
  aptitude: 'Quantitative Aptitude',
  reasoning: 'Logical Reasoning',
  english: 'Verbal Ability',
  technical: 'Technical',
}

const CATEGORIES = [
  {
    id: 'aptitude',
    label: 'Quantitative Aptitude',
    icon: '📐',
    accent: '#E4A16A',
    items: [
      'Problems on Trains', 'Time and Distance', 'Height and Distance',
      'Time and Work', 'Simple Interest', 'Compound Interest',
      'Profit and Loss', 'Partnership', 'Percentage', 'Problems on Ages',
      'Calendar', 'Clock', 'Average', 'Area', 'Volume and Surface Area',
      'Permutation and Combination', 'Numbers', 'Problems on Numbers',
      'Problems on H.C.F and L.C.M', 'Decimal Fraction', 'Simplification',
      'Square Root and Cube Root', 'Surds and Indices', 'Ratio and Proportion',
      'Chain Rule', 'Pipes and Cistern', 'Boats and Streams',
      'Alligation or Mixture', 'Logarithm', 'Races and Games',
      'Stocks and Shares', 'Probability', 'True Discount',
      "Banker's Discount", 'Odd Man Out and Series',
    ],
  },
  {
    id: 'reasoning',
    label: 'Logical Reasoning',
    icon: '🧠',
    accent: '#B4652E',
    items: [
      'Number Series', 'Letter and Symbol Series', 'Verbal Classification',
      'Essential Part', 'Analogies', 'Artificial Language',
      'Matching Definitions', 'Making Judgments', 'Verbal Reasoning',
      'Logical Problems', 'Logical Games', 'Analyzing Arguments',
      'Statement and Assumption', 'Course of Action',
      'Statement and Conclusion', 'Theme Detection', 'Cause and Effect',
      'Statement and Argument', 'Logical Deduction',
    ],
  },
  {
    id: 'english',
    label: 'Verbal & English',
    icon: '📚',
    accent: '#4C9A6E',
    items: [
      'Spotting Errors', 'Synonyms', 'Antonyms', 'Selecting Words',
      'Spellings', 'Sentence Formation', 'Ordering of Words',
      'Sentence Correction', 'Sentence Improvement', 'Completing Statements',
      'Ordering of Sentences', 'Paragraph Formation', 'Closet Test',
      'Comprehension', 'One Word Substitutes', 'Idioms and Phrases',
      'Change of Voice', 'Change of Speech', 'Verbal Analogies',
    ],
  },
  {
    id: 'technical',
    label: 'Technical & CS Basics',
    icon: '💻',
    accent: '#5B6B8C',
    items: [
      'Python Interview Questions', 'C Programming Interview Questions',
      'Data Structure Basics', '.NET Interview Questions',
      'Software Testing Interview Questions', 'Networking Basics',
      'Objective Networking Questions (CCNA)', 'Operating System Basics',
      'Core Java', 'Java Basics', 'Advanced Java', 'DBMS Basics',
      'Database Management System', 'SQL Server General Questions',
      'SQL Server Common Questions', 'SQL Server 2008',
      'Unix File Management', 'Unix Memory Management',
    ],
  },
]

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function resolveAnswerIndex(row) {
  const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean)
  const raw = (row.answer || '').trim().toUpperCase()
  if (raw === 'A') return 0
  if (raw === 'B') return 1
  if (raw === 'C') return 2
  if (raw === 'D') return 3
  const matched = options.findIndex(
    (o) => o && o.trim().toLowerCase() === (row.answer || '').trim().toLowerCase()
  )
  return matched >= 0 ? matched : 0
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function mapRows(rows) {
  return shuffle(rows).slice(0, 20).map((row, i) => ({
    id: row.id ?? i,
    question: row.question,
    options: [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean),
    answer: resolveAnswerIndex(row),
    explanation: row.explanation || null,
  }))
}

async function fetchRows(params) {
  const res = await fetch(`${API}?${new URLSearchParams(params).toString()}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

/* ─── Question Practice Panel ───────────────────────────────────────────── */
function QuestionPractice({ topic, categoryId, accent, onClose }) {
  const [questions, setQuestions] = useState(null) // null = loading
  const [loadError, setLoadError] = useState(null)
  const [selected, setSelected] = useState({})
  const [revealed, setRevealed] = useState({})

  const dbCategory = CATEGORY_DB_MAP[categoryId] || ''

  useEffect(() => {
    let cancelled = false
    setQuestions(null)
    setLoadError(null)
    setSelected({})
    setRevealed({})

    async function load() {
      if (!dbCategory) {
        setQuestions([]); setLoadError('no_data'); return
      }
      try {
        let rows = await fetchRows({ category: dbCategory, subCategory: topic })
        let fallback = false
        if (rows.length === 0) {
          rows = await fetchRows({ category: dbCategory })
          fallback = rows.length > 0
        }
        if (cancelled) return
        setQuestions(mapRows(rows))
        setLoadError(rows.length === 0 ? 'no_data' : fallback ? 'topic_fallback' : null)
      } catch {
        if (cancelled) return
        setQuestions([]); setLoadError('fetch_failed')
      }
    }
    load()
    return () => { cancelled = true }
  }, [dbCategory, topic])

  const handleSelect = useCallback((qIdx, optIdx) => {
    if (revealed[qIdx]) return
    setSelected((prev) => ({ ...prev, [qIdx]: optIdx }))
  }, [revealed])

  const handleCheck = useCallback((qIdx) => {
    if (selected[qIdx] === undefined) return
    setRevealed((prev) => ({ ...prev, [qIdx]: true }))

    if (questions && questions[qIdx]) {
      const q = questions[qIdx]
      const userPick = selected[qIdx]
      const isCorrect = userPick === q.answer

      practiceService.recordQuestionAnswered({
        questionId: q.id,
        category: dbCategory,
        topic: topic,
        isCorrect: isCorrect,
        selectedOption: q.options ? q.options[userPick] : String(userPick),
        score: isCorrect ? 100 : 0,
      })
    }
  }, [selected, questions, dbCategory, topic])

  const score = questions
    ? questions.filter((q, i) => revealed[i] && selected[i] === q.answer).length
    : 0
  const done = Object.keys(revealed).length

  const handleBack = useCallback(() => {
    if (questions && done > 0) {
      const pct = Math.round((score / done) * 100)
      practiceService.recordAssessmentSession({
        category: dbCategory,
        topic: topic,
        totalQuestions: done,
        correctCount: score,
        score: pct,
        timeSpentSeconds: done * 40,
        type: 'Practice',
      })
    }
    onClose()
  }, [questions, done, score, dbCategory, topic, onClose])

  return (
    <div className="pq-panel">
      <div className="pq-panel-header" style={{ borderColor: accent }}>
        <button className="pq-close-btn" onClick={handleBack}>← Back</button>
        <div className="pq-panel-title">
          <span className="pq-topic-tag" style={{ background: `${accent}22`, color: accent }}>{topic}</span>
        </div>
        {questions && questions.length > 0 && (
          <span className="pq-score">{score}/{done} correct</span>
        )}
      </div>

      <div className="pq-body">
        {questions === null && (
          <div className="pq-loading">
            <div className="pq-spinner" style={{ borderTopColor: accent }} />
            <span>Loading questions…</span>
          </div>
        )}

        {questions !== null && questions.length === 0 && (
          <div className="pq-empty">
            <span className="pq-empty-icon">📭</span>
            {loadError === 'fetch_failed' ? (
              <p>Couldn't reach the server. Check that the backend is running on port 8080.</p>
            ) : (
              <>
                <p>No questions found for <strong>{topic}</strong> yet.</p>
                <p className="pq-empty-sub">Add questions via the Admin panel → Questions Bank.</p>
              </>
            )}
          </div>
        )}

        {loadError === 'topic_fallback' && questions && questions.length > 0 && (
          <div className="pq-notice">
            ℹ️ No questions tagged for <em>{topic}</em> yet. Showing random <em>{CATEGORY_DB_MAP[categoryId]}</em> questions.
          </div>
        )}

        {questions && questions.length > 0 && (
          <div className="pq-question-list">
            {questions.map((q, qi) => {
              const isRevealed = !!revealed[qi]
              const userPick = selected[qi]
              return (
                <div key={q.id} className={`pq-question-card ${isRevealed ? 'pq-revealed' : ''}`}>
                  <div className="pq-q-header">
                    <span className="pq-q-num" style={{ background: `${accent}22`, color: accent }}>Q{qi + 1}</span>
                    {isRevealed && (
                      <span className={`pq-q-result ${userPick === q.answer ? 'correct' : 'wrong'}`}>
                        {userPick === q.answer ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                  </div>
                  <p className="pq-q-text">{q.question}</p>
                  <div className="pq-options">
                    {q.options.map((opt, oi) => {
                      let cls = 'pq-option'
                      if (isRevealed) {
                        if (oi === q.answer) cls += ' pq-opt-correct'
                        else if (oi === userPick) cls += ' pq-opt-wrong'
                        else cls += ' pq-opt-dim'
                      } else if (userPick === oi) {
                        cls += ' pq-opt-selected'
                      }
                      return (
                        <button
                          key={oi}
                          className={cls}
                          style={userPick === oi && !isRevealed ? { borderColor: accent } : {}}
                          onClick={() => handleSelect(qi, oi)}
                          disabled={isRevealed}
                        >
                          <span className="pq-opt-letter">{String.fromCharCode(65 + oi)}</span>
                          <span className="pq-opt-text">{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                  {!isRevealed && (
                    <div className="pq-check-row">
                      <button
                        className="pq-check-btn"
                        style={{ background: accent }}
                        onClick={() => handleCheck(qi)}
                        disabled={selected[qi] === undefined}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}
                  {isRevealed && (
                    q.explanation ? (
                      <div className="pq-explanation"><strong>Explanation:</strong> {q.explanation}</div>
                    ) : (
                      <div className="pq-explanation dim">
                        Correct answer: <strong>{q.options[q.answer]}</strong>
                      </div>
                    )
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Practice Component ───────────────────────────────────────────── */
export default function Practice() {
  const [activeId, setActiveId] = useState(null)
  const [activeTopic, setActiveTopic] = useState(null)

  const activeCategory = CATEGORIES.find((c) => c.id === activeId) || null

  if (activeTopic && activeCategory) {
    return (
      <div className="practice-page">
        <div className="practice-inner practice-inner--wide">
          <h1 className="practice-title">Practice</h1>
          <QuestionPractice
            topic={activeTopic}
            categoryId={activeCategory.id}
            accent={activeCategory.accent}
            onClose={() => setActiveTopic(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="practice-page">
      <div className={`practice-inner ${activeCategory ? 'practice-inner--split' : ''}`}>
        <h1 className="practice-title">Practice</h1>

        <div className={`practice-layout ${activeCategory ? 'practice-layout--selected' : ''}`}>

          {/* LEFT: topics of the selected category (all visible, no inner scroll) */}
          {activeCategory && (
            <section
              className="practice-panel"
              key={activeCategory.id}
              style={{ '--accent': activeCategory.accent }}
            >
              <header className="practice-panel__header">
                <span
                  className="practice-panel__icon"
                  style={{ background: `${activeCategory.accent}22` }}
                >
                  {activeCategory.icon}
                </span>
                <div>
                  <h2>{activeCategory.label}</h2>
                  <p>{activeCategory.items.length} topics — pick one to start</p>
                </div>
              </header>

              <ul className="practice-topic-grid">
                {activeCategory.items.map((item) => (
                  <li key={item}>
                    <button className="practice-topic" onClick={() => setActiveTopic(item)}>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* RIGHT: the 4 category cards, one under another */}
          <nav className="practice-grid" aria-label="Practice categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`practice-card ${activeId === cat.id ? 'practice-card--active' : ''}`}
                style={{ '--accent': cat.accent }}
                onClick={() => setActiveId(cat.id)}
                aria-pressed={activeId === cat.id}
              >
                <span className="practice-card__icon">{cat.icon}</span>
                <span className="practice-card__text">
                  <span className="practice-card__label">{cat.label}</span>
                  <span className="practice-card__count">{cat.items.length} topics</span>
                </span>
              </button>
            ))}
          </nav>

        </div>
      </div>
    </div>
  )
}