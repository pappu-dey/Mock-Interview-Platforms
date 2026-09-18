/**
 * Practice.jsx — Placement Practice Hub
 * 4 category cards in the center. On selecting one, the cards slide to a
 * compact column on the right, and the topic list slides into the middle.
 * No modal/popup — everything happens inline with a smooth transition.
 * Clicking a topic item shows a "Coming Soon" banner (no navigation).
 */

import React, { useState } from 'react'
import './Practice.css'

const CATEGORIES = [
  {
    id: 'aptitude',
    label: 'Quantitative Aptitude',
    icon: '📐',
    accent: '#E4A16A',
    items: [
      'Problems on Trains',
      'Time and Distance',
      'Height and Distance',
      'Time and Work',
      'Simple Interest',
      'Compound Interest',
      'Profit and Loss',
      'Partnership',
      'Percentage',
      'Problems on Ages',
      'Calendar',
      'Clock',
      'Average',
      'Area',
      'Volume and Surface Area',
      'Permutation and Combination',
      'Numbers',
      'Problems on Numbers',
      'Problems on H.C.F and L.C.M',
      'Decimal Fraction',
      'Simplification',
      'Square Root and Cube Root',
      'Surds and Indices',
      'Ratio and Proportion',
      'Chain Rule',
      'Pipes and Cistern',
      'Boats and Streams',
      'Alligation or Mixture',
      'Logarithm',
      'Races and Games',
      'Stocks and Shares',
      'Probability',
      'True Discount',
      "Banker's Discount",
      'Odd Man Out and Series',
    ],
  },
  {
    id: 'reasoning',
    label: 'Logical Reasoning',
    icon: '🧠',
    accent: '#B4652E',
    items: [
      'Number Series',
      'Letter and Symbol Series',
      'Verbal Classification',
      'Essential Part',
      'Analogies',
      'Artificial Language',
      'Matching Definitions',
      'Making Judgments',
      'Verbal Reasoning',
      'Logical Problems',
      'Logical Games',
      'Analyzing Arguments',
      'Statement and Assumption',
      'Course of Action',
      'Statement and Conclusion',
      'Theme Detection',
      'Cause and Effect',
      'Statement and Argument',
      'Logical Deduction',
    ],
  },
  {
    id: 'english',
    label: 'Verbal & English',
    icon: '📚',
    accent: '#4C9A6E',
    items: [
      'Spotting Errors',
      'Synonyms',
      'Antonyms',
      'Selecting Words',
      'Spellings',
      'Sentence Formation',
      'Ordering of Words',
      'Sentence Correction',
      'Sentence Improvement',
      'Completing Statements',
      'Ordering of Sentences',
      'Paragraph Formation',
      'Closet Test',
      'Comprehension',
      'One Word Substitutes',
      'Idioms and Phrases',
      'Change of Voice',
      'Change of Speech',
      'Verbal Analogies',
    ],
  },
  {
    id: 'technical',
    label: 'Technical & CS Basics',
    icon: '💻',
    accent: '#5B6B8C',
    items: [
      'Python Interview Questions',
      'C Programming Interview Questions',
      'Data Structure Basics',
      '.NET Interview Questions',
      'Software Testing Interview Questions',
      'Networking Basics',
      'Objective Networking Questions (CCNA)',
      'Operating System Basics',
      'Core Java',
      'Java Basics',
      'Advanced Java',
      'DBMS Basics',
      'Database Management System',
      'SQL Server General Questions',
      'SQL Server Common Questions',
      'SQL Server 2008',
      'Unix File Management',
      'Unix Memory Management',
    ],
  },
]

export default function Practice() {
  const [activeId, setActiveId] = useState(null)
  const [comingSoonItem, setComingSoonItem] = useState(null)

  const activeCategory = CATEGORIES.find((c) => c.id === activeId) || null
  const isSelected = Boolean(activeCategory)

  const selectCategory = (cat) => {
    setComingSoonItem(null)
    setActiveId(cat.id)
  }

  const goBack = () => {
    setActiveId(null)
    setComingSoonItem(null)
  }

  const handleItemClick = (item) => {
    setComingSoonItem(item)
  }

  return (
    <div className="practice-page">
      <div className="practice-inner">
        <h1 className="practice-title">Practice</h1>

        <div className={`practice-layout ${isSelected ? 'practice-layout--selected' : ''}`}>

          {/* ── Topic list panel (slides into the middle) ── */}
          <div className="practice-panel">
            {activeCategory && (
              <div className="practice-panel__inner">
                <div className="practice-panel__header">
                  <button className="practice-back-btn" onClick={goBack}>← Back</button>
                  <div className="practice-panel__title">
                    <span
                      className="practice-panel__icon"
                      style={{ background: `${activeCategory.accent}22`, color: activeCategory.accent }}
                    >
                      {activeCategory.icon}
                    </span>
                    <h2>{activeCategory.label}</h2>
                  </div>
                </div>

                {comingSoonItem && (
                  <div className="coming-soon-banner">
                    <strong>{comingSoonItem}</strong> — Coming Soon 🚧
                  </div>
                )}

                <ul className="practice-item-list">
                  {activeCategory.items.map((item) => (
                    <li key={item}>
                      <button
                        className={`practice-item ${comingSoonItem === item ? 'practice-item--active' : ''}`}
                        onClick={() => handleItemClick(item)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Category cards (slide to the right when one is selected) ── */}
          <div className="practice-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`practice-card ${activeId === cat.id ? 'practice-card--active' : ''}`}
                style={{ '--accent': cat.accent }}
                onClick={() => selectCategory(cat)}
              >
                <span className="practice-card__icon">{cat.icon}</span>
                <span className="practice-card__label">{cat.label}</span>
                <span className="practice-card__count">{cat.items.length} topics</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}