import React from "react";
import "./MockAptitude.css";

const CATEGORIES = [
  {
    id: "quantitative",
    title: "Quantitative Practice",
    description: "Number series, percentages, ratios, profit & loss, time-work, and more.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="36" height="36" rx="8" fill="#1a4fba" opacity="0.12" />
        <text x="24" y="30" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1a4fba">∑</text>
      </svg>
    ),
    tag: "25 Questions • 30 min",
    color: "#1a4fba",
    bg: "#e8effe",
  },
  {
    id: "technical",
    title: "Technical Practice",
    description: "C / C++ / Java basics, data structures, algorithms, OS, DBMS, Networks.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="36" height="36" rx="8" fill="#0d6e3f" opacity="0.12" />
        <polyline points="16,18 10,24 16,30" stroke="#0d6e3f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="32,18 38,24 32,30" stroke="#0d6e3f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="21" y1="32" x2="27" y2="16" stroke="#0d6e3f" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    tag: "30 Questions • 40 min",
    color: "#0d6e3f",
    bg: "#e6f4ee",
  },
  {
    id: "reasoning",
    title: "Reasoning Practice",
    description: "Logical puzzles, seating arrangements, blood relations, syllogisms, coding-decoding.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="36" height="36" rx="8" fill="#7c3aed" opacity="0.12" />
        <circle cx="24" cy="24" r="10" stroke="#7c3aed" strokeWidth="3" />
        <path d="M24 14 L24 24 L31 24" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    tag: "20 Questions • 25 min",
    color: "#7c3aed",
    bg: "#f0ebff",
  },
  {
    id: "verbal",
    title: "Verbal Practice",
    description: "Reading comprehension, sentence correction, fill in the blanks, synonyms & antonyms.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="36" height="36" rx="8" fill="#b45309" opacity="0.12" />
        <path d="M14 16 h20 M14 22 h14 M14 28 h18 M14 34 h10" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    tag: "20 Questions • 20 min",
    color: "#b45309",
    bg: "#fef3e2",
  },
];

export default function MockAptitude({ onSelectCategory, onStartExam }) {
  const handleClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else if (onStartExam) {
      onStartExam(cat);
    }
  };

  return (
    <div className="aptitude-page">
      <div className="aptitude-header">
        <div className="proctored-badge">
          <span className="live-dot" /> PrepPilot Mock Assessment
        </div>
        <h1 className="aptitude-title">Mock Aptitude Assessment</h1>
        <p className="aptitude-sub">
          Select a category to begin a full-screen, secure aptitude exam — formatted with original company exam interfaces, timed sections, and active proctoring.
        </p>
        <div className="aptitude-notice">
          <span className="notice-icon">🛡️</span>
          <span>
            <strong>Anti-Cheat & Strict Security:</strong> Clicking any module will prompt the full-screen rules & instructions.
            Exiting full-screen, pressing ESC, or switching windows/tabs will be logged as violations. 3 violations lead to automatic disqualification.
          </span>
        </div>
      </div>

      <div className="aptitude-grid">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="aptitude-card"
            style={{ "--card-color": cat.color, "--card-bg": cat.bg }}
            onClick={() => handleClick(cat)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick(cat)}
          >
            <div className="card-icon">{cat.icon}</div>
            <div className="card-body">
              <h2 className="card-title">{cat.title}</h2>
              <p className="card-desc">{cat.description}</p>
              <div className="card-tags-row">
                <span className="card-tag">{cat.tag}</span>
                <span className="proctored-pill">🔒 Proctored</span>
              </div>
            </div>
            <div className="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

