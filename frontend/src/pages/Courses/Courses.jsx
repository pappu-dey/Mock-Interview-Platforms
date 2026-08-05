/**
 * Courses.jsx — Comprehensive Learning & Interview Preparation Courses Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   - Search & Category filtering (DSA, System Design, Frontend, Backend, AI, Behavioral)
 *   - Skill Level filtering (Beginner, Intermediate, Advanced)
 *   - Tab switcher ("All Courses" vs "My Enrolled Courses")
 *   - Interactive Course Modal/Drawer previewing syllabus, instructor, & practice questions
 *   - Live enrollment state management with toast feedback
 */

import React, { useState, useMemo } from 'react'
import Button from '../../components/Button'
import './Courses.css'

const CATEGORIES = [
  { id: 'all', label: 'All Courses', icon: '✨' },
  { id: 'dsa', label: 'Data Structures & Algorithms', icon: '⚡' },
  { id: 'system-design', label: 'System Design', icon: '🏛️' },
  { id: 'frontend', label: 'Frontend Engineering', icon: '🎨' },
  { id: 'backend', label: 'Backend & Microservices', icon: '⚙️' },
  { id: 'ai-ml', label: 'AI & Data Science', icon: '🤖' },
  { id: 'behavioral', label: 'Behavioral & Leadership', icon: '💬' },
]

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

const SAMPLE_COURSES = [
  {
    id: 'course-dsa-mastery',
    category: 'dsa',
    title: 'Data Structures & Algorithms for FAANG Interviews',
    subtitle: 'Master array, graph, dynamic programming, and tree patterns with 150+ solved interview problems.',
    instructor: {
      name: 'Dr. Alex Rivera',
      title: 'Ex-Google Staff Engineer',
      avatar: '👨‍💻',
    },
    level: 'Intermediate',
    duration: '24 Hours',
    modulesCount: 12,
    studentsCount: '14.2k',
    rating: 4.9,
    reviewsCount: 1280,
    badge: '🔥 Bestseller',
    featured: true,
    tags: ['Algorithms', 'Data Structures', 'Python', 'Java', 'LeetCode'],
    description: `A comprehensive course designed to take you from foundational concepts to cracking hard-level algorithmic interviews at top tech companies. Includes step-by-step video breakdowns, optimal space-time analysis, and live AI mock coding sessions.`,
    curriculum: [
      { title: 'Module 1: Two Pointers & Sliding Window Patterns', duration: '1h 45m', lessons: 6 },
      { title: 'Module 2: Fast & Slow Pointers, Linked Lists', duration: '2h 10m', lessons: 8 },
      { title: 'Module 3: Monotonic Stack & Binary Search Variants', duration: '2h 30m', lessons: 9 },
      { title: 'Module 4: Tree Traversals, BFS & DFS Depth-First Search', duration: '3h 15m', lessons: 10 },
      { title: 'Module 5: Graph Algorithms: Dijkstra, Topological Sort & Disjoint Set', duration: '4h 00m', lessons: 12 },
      { title: 'Module 6: Dynamic Programming 1D & 2D Memoization', duration: '4h 30m', lessons: 14 },
    ],
  },
  {
    id: 'course-system-design',
    category: 'system-design',
    title: 'HLS System Design Architecture Blueprint',
    subtitle: 'Learn how to architect scalable distributed systems like Netflix, Uber, WhatsApp, and Google Drive.',
    instructor: {
      name: 'Sarah Chen',
      title: 'Principal Architect @ Amazon',
      avatar: '👩‍💻',
    },
    level: 'Advanced',
    duration: '18 Hours',
    modulesCount: 9,
    studentsCount: '9.8k',
    rating: 4.95,
    reviewsCount: 840,
    badge: '⭐ Top Rated',
    featured: true,
    tags: ['System Design', 'Microservices', 'Distributed Systems', 'Kafka', 'Redis'],
    description: `Designed for Senior Software Engineers and Tech Leads. Covers trade-offs in SQL vs NoSQL, caching strategies, message queues, load balancing, rate limiters, database sharding, and real-time distributed consensus.`,
    curriculum: [
      { title: 'Module 1: Fundamentals of Scalability & Availability', duration: '1h 30m', lessons: 5 },
      { title: 'Module 2: Load Balancing, CDN & API Gateway Design', duration: '2h 00m', lessons: 6 },
      { title: 'Module 3: Caching Strategies: Redis & Memcached In-Depth', duration: '2h 15m', lessons: 7 },
      { title: 'Module 4: Designing a Distributed Message Queue (Kafka)', duration: '3h 00m', lessons: 8 },
      { title: 'Module 5: Real-World Case Study: URL Shortener & Video Streaming', duration: '3h 30m', lessons: 9 },
    ],
  },
  {
    id: 'course-react-fullstack',
    category: 'frontend',
    title: 'Modern React 19 & Next.js Fullstack Masterclass',
    subtitle: 'Build production-ready web apps with React, Server Components, TypeScript, and state-of-the-art UI styling.',
    instructor: {
      name: 'Michael Vance',
      title: 'Frontend Tech Lead',
      avatar: '🎨',
    },
    level: 'Intermediate',
    duration: '22 Hours',
    modulesCount: 10,
    studentsCount: '11.5k',
    rating: 4.88,
    reviewsCount: 920,
    badge: '🚀 Popular',
    featured: false,
    tags: ['React', 'Next.js', 'TypeScript', 'CSS3', 'Performance'],
    description: `Master modern frontend engineering. Learn React Server Components, custom hook design patterns, state management, accessibility (a11y), responsive design systems, and frontend interview machine-coding rounds.`,
    curriculum: [
      { title: 'Module 1: React 18 & 19 Architecture & Virtual DOM', duration: '2h 00m', lessons: 7 },
      { title: 'Module 2: Custom Hooks & Performance Optimization', duration: '2h 45m', lessons: 8 },
      { title: 'Module 3: Next.js App Router, SSR, and ISR', duration: '3h 30m', lessons: 10 },
      { title: 'Module 4: Machine Coding Round: Building Autocomplete & Drag-Drop', duration: '4h 00m', lessons: 9 },
    ],
  },
  {
    id: 'course-spring-microservices',
    category: 'backend',
    title: 'Java Spring Boot & Cloud Microservices Architecture',
    subtitle: 'Build enterprise-grade REST APIs, Spring Security JWT authentication, and Spring Cloud microservices.',
    instructor: {
      name: 'Rajesh Sharma',
      title: 'Lead Backend Engineer',
      avatar: '🛡️',
    },
    level: 'Intermediate',
    duration: '26 Hours',
    modulesCount: 14,
    studentsCount: '8.3k',
    rating: 4.85,
    reviewsCount: 650,
    badge: '⚡ Updated',
    featured: false,
    tags: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'JWT', 'REST API'],
    description: `Complete guide to modern Java backend development. Learn Spring Data JPA, Hibernate, JWT security filters, Docker containerization, RESTful API design standards, and backend system testing.`,
    curriculum: [
      { title: 'Module 1: Spring Boot Core & Dependency Injection', duration: '2h 10m', lessons: 6 },
      { title: 'Module 2: Spring Data JPA & MySQL Query Optimization', duration: '3h 20m', lessons: 9 },
      { title: 'Module 3: Stateless Authentication with Spring Security & JWT', duration: '3h 50m', lessons: 11 },
      { title: 'Module 4: Dockerizing Spring Boot Microservices', duration: '2h 30m', lessons: 7 },
    ],
  },
  {
    id: 'course-ai-prompt-engineering',
    category: 'ai-ml',
    title: 'Generative AI & LLM Application Development',
    subtitle: 'Build AI agents, Retrieval-Augmented Generation (RAG) systems, and LangChain AI pipelines.',
    instructor: {
      name: 'Elena Rostova',
      title: 'AI Research Scientist',
      avatar: '🤖',
    },
    level: 'Advanced',
    duration: '16 Hours',
    modulesCount: 8,
    studentsCount: '6.7k',
    rating: 4.92,
    reviewsCount: 510,
    badge: '🤖 New',
    featured: false,
    tags: ['Generative AI', 'LLMs', 'Python', 'LangChain', 'Vector DB'],
    description: `Build bleeding-edge AI applications. Learn prompt engineering techniques, embedding models, vector databases (Pinecone, Chroma), fine-tuning LLMs, and autonomous agent loops.`,
    curriculum: [
      { title: 'Module 1: LLM Architecture & Prompt Engineering Best Practices', duration: '2h 00m', lessons: 6 },
      { title: 'Module 2: Vector Embeddings & Similarity Search', duration: '2h 30m', lessons: 7 },
      { title: 'Module 3: Building RAG Pipelines with LangChain', duration: '3h 15m', lessons: 8 },
      { title: 'Module 4: Deploying Production AI Microservices', duration: '2h 45m', lessons: 6 },
    ],
  },
  {
    id: 'course-behavioral-mastery',
    category: 'behavioral',
    title: 'Behavioral & Leadership Interview Masterclass',
    subtitle: 'Craft compelling STAR-method stories for Amazon Leadership Principles, STAR responses, and executive rounds.',
    instructor: {
      name: 'David Miller',
      title: 'Ex-Amazon Recruiting Director',
      avatar: '💬',
    },
    level: 'Beginner',
    duration: '8 Hours',
    modulesCount: 5,
    studentsCount: '18.9k',
    rating: 4.97,
    reviewsCount: 2100,
    badge: '🏆 Must Have',
    featured: false,
    tags: ['Behavioral', 'STAR Method', 'Leadership', 'Communication'],
    description: `Behavioral interviews make or break senior hiring decisions. Learn how to structure responses using the STAR format, demonstrate leadership principles, answer difficult conflict resolution questions, and negotiate salary offers.`,
    curriculum: [
      { title: 'Module 1: The STAR Framework & Story Matrix', duration: '1h 30m', lessons: 5 },
      { title: 'Module 2: Decoding Amazon Leadership Principles & FAANG Questions', duration: '2h 00m', lessons: 6 },
      { title: 'Module 3: Handling Tough Questions: Failures, Conflicts & Deadlines', duration: '2h 00m', lessons: 6 },
      { title: 'Module 4: Executive Presence & Salary Negotiation Strategies', duration: '1h 45m', lessons: 5 },
    ],
  },
]

export default function Courses() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeLevel, setActiveLevel] = useState('All Levels')
  const [viewTab, setViewTab] = useState('all') // 'all' | 'enrolled'
  const [enrolledIds, setEnrolledIds] = useState(new Set(['course-dsa-mastery']))
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  // Filter courses based on tab, search, category, level
  const filteredCourses = useMemo(() => {
    return SAMPLE_COURSES.filter((course) => {
      // Enrolled tab filter
      if (viewTab === 'enrolled' && !enrolledIds.has(course.id)) {
        return false
      }
      // Category filter
      if (activeCategory !== 'all' && course.category !== activeCategory) {
        return false
      }
      // Level filter
      if (activeLevel !== 'All Levels' && course.level !== activeLevel) {
        return false
      }
      // Search query filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const titleMatch = course.title.toLowerCase().includes(q)
        const descMatch = course.subtitle.toLowerCase().includes(q)
        const tagsMatch = course.tags.some((t) => t.toLowerCase().includes(q))
        return titleMatch || descMatch || tagsMatch
      }
      return true
    })
  }, [search, activeCategory, activeLevel, viewTab, enrolledIds])

  const handleEnrollToggle = (courseId, e) => {
    if (e) e.stopPropagation()
    setEnrolledIds((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
        showToast('Unenrolled from course')
      } else {
        next.add(courseId)
        showToast('🎉 Enrolled successfully! Course added to your dashboard.')
      }
      return next
    })
  }

  return (
    <div className="courses-page">
      <div className="courses-inner">

        {/* ── Toast banner ── */}
        {toast && <div className="courses-toast">{toast}</div>}

        {/* ── Hero Banner ── */}
        <div className="courses-hero">
          <div className="courses-hero__content">
            <span className="courses-hero__badge">🎓 INTERVIEW PREPARATION COURSES</span>
            <h1 className="courses-hero__title">
              Master the Skills to Crack <span className="gradient-text">Top Tech Interviews</span>
            </h1>
            <p className="courses-hero__sub">
              Hands-on interview pattern breakdown, system design architectures, and interactive AI coding modules built by industry veterans.
            </p>

            {/* Search Input Bar */}
            <div className="courses-search-bar">
              <span className="courses-search-icon">🔍</span>
              <input
                type="text"
                className="courses-search-input"
                placeholder="Search courses by topic, skill (e.g. Dynamic Programming, System Design, React)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="courses-search-clear" onClick={() => setSearch('')}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Navigation & Filter Bar ── */}
        <div className="courses-filter-section">
          {/* Main Tab Toggle: All Courses vs My Learning */}
          <div className="courses-tabs">
            <button
              className={`courses-tab ${viewTab === 'all' ? 'courses-tab--active' : ''}`}
              onClick={() => setViewTab('all')}
            >
              Explore Courses ({SAMPLE_COURSES.length})
            </button>
            <button
              className={`courses-tab ${viewTab === 'enrolled' ? 'courses-tab--active' : ''}`}
              onClick={() => setViewTab('enrolled')}
            >
              My Enrolled Courses ({enrolledIds.size})
            </button>
          </div>

          {/* Categories Pills */}
          <div className="courses-categories-scroll">
            {CATEGORIES.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`category-pill ${activeCategory === id ? 'category-pill--active' : ''}`}
                onClick={() => setActiveCategory(id)}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* Level Filter & Active Filter Info */}
          <div className="courses-filter-controls">
            <div className="filter-level-wrap">
              <label htmlFor="level-select">Level:</label>
              <select
                id="level-select"
                className="level-select"
                value={activeLevel}
                onChange={(e) => setActiveLevel(e.target.value)}
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {(activeCategory !== 'all' || activeLevel !== 'All Levels' || search) && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setActiveCategory('all')
                  setActiveLevel('All Levels')
                  setSearch('')
                }}
              >
                Reset Filters ↺
              </button>
            )}
          </div>
        </div>

        {/* ── Course List Grid ── */}
        {filteredCourses.length === 0 ? (
          <div className="courses-empty-card">
            <div className="courses-empty-icon">🔍</div>
            <h3>No courses match your filter</h3>
            <p>Try adjusting your search terms or resetting category filters.</p>
            <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setActiveCategory('all'); setActiveLevel('All Levels') }}>
              Show All Courses
            </Button>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id)
              return (
                <div
                  key={course.id}
                  className={`course-card ${course.featured ? 'course-card--featured' : ''}`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="course-card__header">
                    <span className="course-badge">{course.badge}</span>
                    <span className={`level-tag level-tag--${course.level.toLowerCase().replace(' ', '-')}`}>
                      {course.level}
                    </span>
                  </div>

                  <h3 className="course-card__title">{course.title}</h3>
                  <p className="course-card__sub">{course.subtitle}</p>

                  <div className="course-card__tags">
                    {course.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="skill-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="course-card__meta">
                    <div className="instructor-info">
                      <span className="instructor-avatar">{course.instructor.avatar}</span>
                      <div className="instructor-text">
                        <span className="instructor-name">{course.instructor.name}</span>
                        <span className="instructor-role">{course.instructor.title}</span>
                      </div>
                    </div>

                    <div className="course-stats">
                      <span className="course-rating">⭐ {course.rating}</span>
                      <span className="course-duration">⏱️ {course.duration}</span>
                    </div>
                  </div>

                  <div className="course-card__footer">
                    <span className="modules-count">📚 {course.modulesCount} Modules</span>
                    <Button
                      variant={isEnrolled ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={(e) => handleEnrollToggle(course.id, e)}
                    >
                      {isEnrolled ? '✓ Enrolled' : 'Enroll Now →'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Course Preview Modal ── */}
        {selectedCourse && (
          <div className="course-modal-backdrop" onClick={() => setSelectedCourse(null)}>
            <div className="course-modal" onClick={(e) => e.stopPropagation()}>
              <button className="course-modal-close" onClick={() => setSelectedCourse(null)}>
                ✕
              </button>

              <div className="course-modal-header">
                <div className="course-modal-badge-row">
                  <span className="course-badge">{selectedCourse.badge}</span>
                  <span className={`level-tag level-tag--${selectedCourse.level.toLowerCase().replace(' ', '-')}`}>
                    {selectedCourse.level}
                  </span>
                </div>
                <h2 className="course-modal-title">{selectedCourse.title}</h2>
                <p className="course-modal-subtitle">{selectedCourse.subtitle}</p>
              </div>

              <div className="course-modal-body">
                <div className="course-modal-main">
                  <h4>About this Course</h4>
                  <p>{selectedCourse.description}</p>

                  <h4>Curriculum & Modules</h4>
                  <div className="curriculum-list">
                    {selectedCourse.curriculum.map((mod, idx) => (
                      <div key={idx} className="curriculum-item">
                        <div className="curriculum-item-left">
                          <span className="curriculum-icon">📖</span>
                          <div>
                            <div className="curriculum-title">{mod.title}</div>
                            <div className="curriculum-sub">{mod.lessons} Lessons • Interactive Practice Included</div>
                          </div>
                        </div>
                        <span className="curriculum-duration">{mod.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="course-modal-sidebar">
                  <div className="modal-instructor-card">
                    <span className="modal-instructor-avatar">{selectedCourse.instructor.avatar}</span>
                    <div className="modal-instructor-name">{selectedCourse.instructor.name}</div>
                    <div className="modal-instructor-title">{selectedCourse.instructor.title}</div>
                  </div>

                  <div className="modal-details-list">
                    <div className="modal-detail-item">
                      <span>⏱️ Total Duration</span>
                      <strong>{selectedCourse.duration}</strong>
                    </div>
                    <div className="modal-detail-item">
                      <span>📚 Modules</span>
                      <strong>{selectedCourse.modulesCount} Modules</strong>
                    </div>
                    <div className="modal-detail-item">
                      <span>👥 Enrolled Students</span>
                      <strong>{selectedCourse.studentsCount}+</strong>
                    </div>
                    <div className="modal-detail-item">
                      <span>⭐ Rating</span>
                      <strong>{selectedCourse.rating} ({selectedCourse.reviewsCount} reviews)</strong>
                    </div>
                  </div>

                  <Button
                    variant={enrolledIds.has(selectedCourse.id) ? 'secondary' : 'primary'}
                    size="md"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={(e) => handleEnrollToggle(selectedCourse.id, e)}
                  >
                    {enrolledIds.has(selectedCourse.id) ? '✓ Enrolled (In Progress)' : 'Enroll in Course Now →'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
