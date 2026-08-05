/**
 * Practice.jsx — Placement Aptitude, Reasoning & Verbal Practice Module
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   - Topic Modules: Quantitative Aptitude, Logical Reasoning, Verbal English, Technical Basics
 *   - Difficulty filters & Topic Search
 *   - Interactive Quiz Runner Modal (Multiple choice questions, Timer, Instant Scoring, Solution Explanations)
 *   - Practice score tracking & Completion badges
 */

import React, { useState, useMemo, useEffect } from 'react'
import Button from '../../components/Button'
import './Practice.css'

const CATEGORIES = [
  { id: 'all', label: 'All Practice Topics', icon: '🎯' },
  { id: 'aptitude', label: 'Quantitative Aptitude', icon: '📐' },
  { id: 'reasoning', label: 'Logical Reasoning', icon: '🧠' },
  { id: 'english', label: 'Verbal & English', icon: '📚' },
  { id: 'technical', label: 'Technical & CS Basics', icon: '💻' },
]

const PRACTICE_TOPICS = [
  // ── Quantitative Aptitude ──
  {
    id: 'apti-percent-profit',
    category: 'aptitude',
    title: 'Percentages, Profit & Loss',
    description: 'Master cost price, selling price, margin percentages, and discount calculations common in campus placement tests.',
    questionsCount: 15,
    timeLimit: '20 Mins',
    difficulty: 'Medium',
    attempts: '24.5k',
    avgScore: '78%',
    sampleQuestions: [
      {
        id: 1,
        question: 'A trader marks up his goods by 25% above cost price and gives a discount of 10%. What is his net profit percentage?',
        options: ['12.5%', '15%', '10%', '11.25%'],
        correctIndex: 0,
        explanation: 'Let Cost Price = 100. Marked Price = 125. Discount = 10% of 125 = 12.5. Selling Price = 112.5. Net Profit % = 12.5%.',
      },
      {
        id: 2,
        question: 'If 20% of a number is added to 80, the result is the number itself. What is the number?',
        options: ['100', '120', '80', '90'],
        correctIndex: 0,
        explanation: '0.2x + 80 = x => 0.8x = 80 => x = 100.',
      },
    ],
  },
  {
    id: 'apti-speed-distance',
    category: 'aptitude',
    title: 'Time, Speed & Distance',
    description: 'Solve relative speed, train crossing problems, boat & streams, and average speed equations.',
    questionsCount: 20,
    timeLimit: '25 Mins',
    difficulty: 'Hard',
    attempts: '19.2k',
    avgScore: '65%',
    sampleQuestions: [
      {
        id: 1,
        question: 'A train 150m long passes a telegraph pole in 12 seconds. What is the speed of the train in km/h?',
        options: ['45 km/h', '50 km/h', '36 km/h', '60 km/h'],
        correctIndex: 0,
        explanation: 'Speed = 150/12 = 12.5 m/s. In km/h = 12.5 * (18/5) = 45 km/h.',
      },
    ],
  },
  {
    id: 'apti-work-time',
    category: 'aptitude',
    title: 'Time & Work / Pipes & Cisterns',
    description: 'Learn efficient unit-work method to solve individual rate, alternate day, and pipe filling problems.',
    questionsCount: 15,
    timeLimit: '20 Mins',
    difficulty: 'Medium',
    attempts: '21.8k',
    avgScore: '72%',
    sampleQuestions: [
      {
        id: 1,
        question: 'A can complete a task in 10 days, and B in 15 days. Working together, how many days will they take?',
        options: ['5 days', '6 days', '8 days', '7.5 days'],
        correctIndex: 1,
        explanation: 'Combined rate = (1/10 + 1/15) = 1/6. Total days = 6 days.',
      },
    ],
  },

  // ── Logical Reasoning ──
  {
    id: 'reasoning-coding-decoding',
    category: 'reasoning',
    title: 'Coding-Decoding & Number Series',
    description: 'Identify letter substitution patterns, arithmetic progression steps, and missing term logic.',
    questionsCount: 20,
    timeLimit: '20 Mins',
    difficulty: 'Easy',
    attempts: '31.0k',
    avgScore: '84%',
    sampleQuestions: [
      {
        id: 1,
        question: 'If CAT is coded as 3120, how is DOG coded in the same pattern?',
        options: ['4157', '4147', '3157', '4158'],
        correctIndex: 0,
        explanation: 'Alphabet positions: C=3, A=1, T=20. So D=4, O=15, G=7 => 4157.',
      },
    ],
  },
  {
    id: 'reasoning-syllogism',
    category: 'reasoning',
    title: 'Syllogisms & Venn Diagrams',
    description: 'Master categorical logic statements, "Some A are B", "No B is C", and Venn diagram deductions.',
    questionsCount: 15,
    timeLimit: '18 Mins',
    difficulty: 'Medium',
    attempts: '28.4k',
    avgScore: '74%',
    sampleQuestions: [
      {
        id: 1,
        question: 'Statements: All cats are animals. All animals are mammals. Conclusion: All cats are mammals.',
        options: ['True (Follows)', 'False (Does not follow)', 'Cannot be determined'],
        correctIndex: 0,
        explanation: 'Since Cats ⊆ Animals and Animals ⊆ Mammals, Cats ⊆ Mammals. Conclusion follows.',
      },
    ],
  },
  {
    id: 'reasoning-blood-relations',
    category: 'reasoning',
    title: 'Blood Relations & Direction Sense',
    description: 'Decode complex family tree descriptions and cardinal direction movements with compass angles.',
    questionsCount: 15,
    timeLimit: '20 Mins',
    difficulty: 'Medium',
    attempts: '22.1k',
    avgScore: '76%',
    sampleQuestions: [
      {
        id: 1,
        question: 'Pointing to a man, a woman says: "His mother is the only daughter of my mother." How is the woman related to the man?',
        options: ['Mother', 'Sister', 'Aunt', 'Grandmother'],
        correctIndex: 0,
        explanation: '"Only daughter of my mother" is the woman herself. So his mother is the woman. She is his Mother.',
      },
    ],
  },

  // ── Verbal & English ──
  {
    id: 'english-error-spotting',
    category: 'english',
    title: 'Grammar & Spotting Errors',
    description: 'Identify subject-verb agreement, tense consistency, preposition errors, and modifier placements.',
    questionsCount: 20,
    timeLimit: '15 Mins',
    difficulty: 'Easy',
    attempts: '35.2k',
    avgScore: '81%',
    sampleQuestions: [
      {
        id: 1,
        question: 'Identify the error: "Each of the students have completed their assignment."',
        options: [
          '"have" should be "has"',
          '"their" should be "his/her"',
          'No error',
          'Both A and B',
        ],
        correctIndex: 3,
        explanation: '"Each" is singular, so singular verb "has" and singular pronoun "his or her" is grammatically correct.',
      },
    ],
  },
  {
    id: 'english-reading-comprehension',
    category: 'english',
    title: 'Reading Comprehension & Passages',
    description: 'Enhance speed reading, central theme identification, tone analysis, and contextual vocabulary inferencing.',
    questionsCount: 10,
    timeLimit: '20 Mins',
    difficulty: 'Medium',
    attempts: '18.7k',
    avgScore: '70%',
    sampleQuestions: [
      {
        id: 1,
        question: 'What is the primary purpose of identifying the author\'s tone in a passage?',
        options: [
          'To determine the underlying perspective or attitude',
          'To count word length',
          'To check grammar rules',
          'To memorize dates',
        ],
        correctIndex: 0,
        explanation: 'Tone reveals the author\'s attitude, sentiment, or stance toward the subject.',
      },
    ],
  },
  {
    id: 'english-vocab-synonyms',
    category: 'english',
    title: 'Vocabulary, Synonyms & Antonyms',
    description: 'Expand high-frequency corporate and GRE vocabulary, idioms, phrases, and sentence completion.',
    questionsCount: 25,
    timeLimit: '15 Mins',
    difficulty: 'Medium',
    attempts: '26.9k',
    avgScore: '75%',
    sampleQuestions: [
      {
        id: 1,
        question: 'Choose the word closest in meaning to PRAGMATIC:',
        options: ['Practical', 'Theoretical', 'Idealistic', 'Emotional'],
        correctIndex: 0,
        explanation: 'Pragmatic means dealing with things sensibly and realistically based on practical considerations.',
      },
    ],
  },

  // ── Technical & CS Basics ──
  {
    id: 'tech-dsa-fundamentals',
    category: 'technical',
    title: 'Core CS & Data Structures Trivia',
    description: 'Test fundamentals in Arrays, Stacks, Queues, Trees, Big-O Notation, and SQL Query basics.',
    questionsCount: 20,
    timeLimit: '20 Mins',
    difficulty: 'Medium',
    attempts: '29.3k',
    avgScore: '80%',
    sampleQuestions: [
      {
        id: 1,
        question: 'What is the average time complexity of searching in a Balanced Binary Search Tree (AVL/Red-Black)?',
        options: ['O(log N)', 'O(N)', 'O(1)', 'O(N log N)'],
        correctIndex: 0,
        explanation: 'A balanced BST maintains height of O(log N), yielding O(log N) search complexity.',
      },
    ],
  },
]

export default function Practice() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [activeQuiz, setActiveQuiz] = useState(null) // Quiz topic object
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizFinished, setQuizFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Timer logic for active quiz
  useEffect(() => {
    if (!activeQuiz || quizFinished || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setQuizFinished(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [activeQuiz, quizFinished, timeLeft])

  const filteredTopics = useMemo(() => {
    return PRACTICE_TOPICS.filter((topic) => {
      if (activeCategory !== 'all' && topic.category !== activeCategory) return false
      if (difficultyFilter !== 'All' && topic.difficulty !== difficultyFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return topic.title.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q)
      }
      return true
    })
  }, [search, activeCategory, difficultyFilter])

  const startQuiz = (topic) => {
    setActiveQuiz(topic)
    setCurrentQIndex(0)
    setSelectedAnswers({})
    setQuizFinished(false)
    // Parse time limit integer (e.g. "20 Mins" -> 20 * 60 = 1200s)
    const mins = parseInt(topic.timeLimit, 10) || 15
    setTimeLeft(mins * 60)
  }

  const handleSelectOption = (qId, optionIdx) => {
    if (quizFinished) return
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
  }

  const calculateScore = () => {
    if (!activeQuiz?.sampleQuestions) return 0
    let correct = 0
    activeQuiz.sampleQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++
      }
    })
    return correct
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="practice-page">
      <div className="practice-inner">

        {/* ── Hero Banner ── */}
        <div className="practice-hero">
          <div className="practice-hero__content">
            <span className="practice-hero__badge">🎯 PLACEMENT PREPARATION HUB</span>
            <h1 className="practice-hero__title">
              Aptitude, Reasoning & <span className="gradient-text">Verbal Practice</span>
            </h1>
            <p className="practice-hero__sub">
              Master quantitative aptitude shortcuts, logical puzzle patterns, and English verbal proficiency with timed practice modules.
            </p>

            {/* Search Input Bar */}
            <div className="practice-search-bar">
              <span className="practice-search-icon">🔍</span>
              <input
                type="text"
                className="practice-search-input"
                placeholder="Search topics (e.g. Percentages, Syllogisms, Error Spotting, Speed & Distance)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="practice-search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="practice-filter-section">
          <div className="practice-categories-scroll">
            {CATEGORIES.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`practice-cat-pill ${activeCategory === id ? 'practice-cat-pill--active' : ''}`}
                onClick={() => setActiveCategory(id)}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          <div className="practice-filter-controls">
            <div className="diff-filter-wrap">
              <span>Difficulty:</span>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  className={`diff-btn ${difficultyFilter === diff ? 'diff-btn--active' : ''}`}
                  onClick={() => setDifficultyFilter(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>

            {(activeCategory !== 'all' || difficultyFilter !== 'All' || search) && (
              <button
                className="clear-filters-btn"
                onClick={() => { setActiveCategory('all'); setDifficultyFilter('All'); setSearch('') }}
              >
                Reset Filters ↺
              </button>
            )}
          </div>
        </div>

        {/* ── Topic Cards Grid ── */}
        {filteredTopics.length === 0 ? (
          <div className="practice-empty-card">
            <div className="practice-empty-icon">🔍</div>
            <h3>No practice modules found</h3>
            <p>Try searching for a different topic or reset your filters.</p>
            <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setActiveCategory('all'); setDifficultyFilter('All') }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="practice-grid">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="practice-card">
                <div className="practice-card__header">
                  <span className={`cat-badge cat-badge--${topic.category}`}>
                    {topic.category.toUpperCase()}
                  </span>
                  <span className={`diff-badge diff-badge--${topic.difficulty.toLowerCase()}`}>
                    {topic.difficulty}
                  </span>
                </div>

                <h3 className="practice-card__title">{topic.title}</h3>
                <p className="practice-card__desc">{topic.description}</p>

                <div className="practice-card__stats">
                  <div className="stat-pill">
                    <span>❓</span> {topic.questionsCount} Questions
                  </div>
                  <div className="stat-pill">
                    <span>⏱️</span> {topic.timeLimit}
                  </div>
                  <div className="stat-pill">
                    <span>👥</span> {topic.attempts} Attempted
                  </div>
                </div>

                <div className="practice-card__footer">
                  <span className="avg-score">Avg Score: {topic.avgScore}</span>
                  <Button variant="primary" size="sm" onClick={() => startQuiz(topic)}>
                    Start Practice →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Interactive Quiz Runner Modal ── */}
        {activeQuiz && (
          <div className="quiz-modal-backdrop" onClick={() => setActiveQuiz(null)}>
            <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
              <div className="quiz-modal-header">
                <div>
                  <span className={`cat-badge cat-badge--${activeQuiz.category}`}>
                    {activeQuiz.category.toUpperCase()}
                  </span>
                  <h3 className="quiz-modal-title">{activeQuiz.title}</h3>
                </div>
                <div className="quiz-timer">
                  ⏱️ {formatTime(timeLeft)}
                </div>
                <button className="quiz-modal-close" onClick={() => setActiveQuiz(null)}>✕</button>
              </div>

              {!quizFinished ? (
                <div className="quiz-modal-body">
                  {/* Progress Indicator */}
                  <div className="quiz-progress-bar">
                    <div
                      className="quiz-progress-fill"
                      style={{
                        width: `${((currentQIndex + 1) / activeQuiz.sampleQuestions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {activeQuiz.sampleQuestions[currentQIndex] ? (
                    <div className="quiz-question-card">
                      <div className="q-number">
                        Question {currentQIndex + 1} of {activeQuiz.sampleQuestions.length}
                      </div>
                      <div className="q-text">
                        {activeQuiz.sampleQuestions[currentQIndex].question}
                      </div>

                      <div className="q-options-list">
                        {activeQuiz.sampleQuestions[currentQIndex].options.map((optionText, oIdx) => {
                          const isSelected = selectedAnswers[activeQuiz.sampleQuestions[currentQIndex].id] === oIdx
                          return (
                            <button
                              key={oIdx}
                              className={`q-option ${isSelected ? 'q-option--selected' : ''}`}
                              onClick={() => handleSelectOption(activeQuiz.sampleQuestions[currentQIndex].id, oIdx)}
                            >
                              <span className="q-option-key">{String.fromCharCode(65 + oIdx)}</span>
                              <span className="q-option-text">{optionText}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <p>No questions available for this module yet.</p>
                  )}

                  <div className="quiz-modal-footer">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex((i) => i - 1)}
                    >
                      ← Previous
                    </Button>

                    {currentQIndex < activeQuiz.sampleQuestions.length - 1 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCurrentQIndex((i) => i + 1)}
                      >
                        Next Question →
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setQuizFinished(true)}
                      >
                        Submit Test ✓
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Quiz Finished / Score Results */
                <div className="quiz-results">
                  <div className="results-hero">
                    <span className="results-icon">🏆</span>
                    <h2>Practice Test Completed!</h2>
                    <div className="results-score">
                      {calculateScore()} / {activeQuiz.sampleQuestions.length} Correct
                    </div>
                  </div>

                  <div className="results-explanations">
                    <h4>Review & Explanations</h4>
                    {activeQuiz.sampleQuestions.map((q, idx) => {
                      const userChoice = selectedAnswers[q.id]
                      const isCorrect = userChoice === q.correctIndex
                      return (
                        <div key={q.id} className={`explanation-card ${isCorrect ? 'exp--correct' : 'exp--wrong'}`}>
                          <div className="exp-q-title">
                            Q{idx + 1}: {q.question}
                          </div>
                          <div className="exp-choice">
                            Your answer: <strong>{userChoice !== undefined ? q.options[userChoice] : 'Not answered'}</strong> {isCorrect ? '✓' : '✗'}
                          </div>
                          {!isCorrect && (
                            <div className="exp-correct">
                              Correct answer: <strong>{q.options[q.correctIndex]}</strong>
                            </div>
                          )}
                          <div className="exp-detail">
                            💡 <em>{q.explanation}</em>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="quiz-results-actions">
                    <Button variant="secondary" size="sm" onClick={() => startQuiz(activeQuiz)}>
                      Retry Test ↺
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setActiveQuiz(null)}>
                      Back to Practice Hub
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
