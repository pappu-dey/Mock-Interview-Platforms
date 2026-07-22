/**
 * LandingPage.jsx — Mock Interview Platform  ·  Public Landing Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Hero          — headline + CTA + stats card
 *   2. Ticker        — scrolling marquee
 *   3. Features      — 8-feature grid
 *   4. How It Works  — 3 steps on dark bg
 *   5. Numbers Strip — 4 big animated counters
 *   6. Companies     — partner company chips
 *   7. Testimonials  — 3 student quotes
 *   8. CTA Banner    — "Join Fast" urgency section
 *   9. Footer
 *
 * Props:
 *   onNavigate(href)  — called when user clicks any CTA
 */

import React, { useEffect, useRef, useState } from 'react'
import './LandingPage.css'

// ─── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

// ─── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView]
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🎤', title: 'Mock Interviews',      desc: 'Practice with real-world interview questions from top companies. Get instant AI-powered feedback.' },
  { icon: '🧠', title: 'Aptitude Training',    desc: 'Sharpen quantitative, logical & verbal reasoning with 500+ curated practice problems.' },
  { icon: '📋', title: 'Job Applications',     desc: 'Discover and apply to openings from 30+ partner companies — all in one place.' },
  { icon: '📊', title: 'Progress Analytics',   desc: 'Track your scores, streaks, and weak spots with detailed performance dashboards.' },
  { icon: '🏢', title: 'Company-Specific Prep',desc: 'Study tailored question banks built around each company\'s actual interview pattern.' },
  { icon: '💬', title: 'Expert Mentorship',    desc: 'Book 1-on-1 sessions with industry professionals who\'ve cracked top-tier interviews.' },
  { icon: '⏱️',  title: 'Timed Challenges',    desc: 'Simulate real exam pressure with timed coding rounds, MCQs, and case studies.' },
  { icon: '🎯', title: 'Placement Roadmap',    desc: 'Personalised week-by-week preparation plans calibrated to your target company.' },
]

const STEPS = [
  { icon: '✍️',  title: 'Create Your Profile', desc: 'Sign up in 30 seconds. Tell us your target role, preferred companies, and experience level.' },
  { icon: '🎯', title: 'Practice & Prepare',   desc: 'Work through mock rounds, aptitude tests, and company-specific question banks at your pace.' },
  { icon: '🚀', title: 'Get Placed',            desc: 'Apply to live openings, track your interviews, and land your dream offer.' },
]

const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Infosys', 'TCS', 'Wipro',
  'Accenture', 'Flipkart', 'Paytm', 'Zoho', 'BYJU\'S', 'Swiggy',
]

const TESTIMONIALS = [
  {
    quote: 'I cracked my Infosys interview in the first attempt. The mock rounds here felt exactly like the real thing — the feedback helped me fix my weak spots in just 2 weeks.',
    name: 'Riya Sharma',
    role: 'SDE @ Infosys · B.Tech CSE 2025',
    initials: 'RS',
    stars: 5,
  },
  {
    quote: 'The aptitude section is gold. I\'d failed placement tests twice before. After 3 weeks of daily practice here, I cleared Wipro, TCS, and Accenture — all in the same season!',
    name: 'Arjun Nair',
    role: 'Analyst @ Wipro · MCA 2025',
    initials: 'AN',
    stars: 5,
  },
  {
    quote: 'The company-specific question banks are surprisingly accurate. My Amazon interview had almost the same problem patterns. This platform is genuinely built for students.',
    name: 'Priya Menon',
    role: 'SDE-1 @ Amazon · B.Tech IT 2024',
    initials: 'PM',
    stars: 5,
  },
]

const TICKER_ITEMS = [
  '🎤 Mock Interviews',
  '🧠 500+ Practice Questions',
  '🏢 30+ Partner Companies',
  '📊 Real-time Feedback',
  '🎯 Company-specific Prep',
  '🚀 Get Placed Faster',
  '⏱️ Timed Aptitude Tests',
  '💬 Expert Mentorship',
]

// ─── Number Cell with animation ────────────────────────────────────────────────
function NumberCell({ target, suffix, label, inView }) {
  const count = useCounter(target, 1600, inView)
  return (
    <div className="lp-num-cell">
      <div className="lp-num-big">
        <span className="lp-counter">{count}</span>
        <span className="lp-num-plus">{suffix}</span>
      </div>
      <div className="lp-num-label">{label}</div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage({ onNavigate = () => {} }) {
  const [numRef, numInView] = useInView(0.3)

  // duplicate ticker items for seamless loop
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="lp">

      {/* ══════════════════════════════════════════════════════════════════════
          §1  HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="lp-hero" aria-labelledby="hero-headline">
        <span className="lp-hero__bg-letter" aria-hidden="true">MIP</span>

        <div className="lp-hero__inner">

          {/* Left */}
          <div className="lp-hero__text">
            <div className="lp-hero__label">
              <span className="lp-hero__label-dot" />
              India's #1 Mock Interview Platform
            </div>

            <h1 className="lp-hero__headline" id="hero-headline">
              Build Your<br />
              <em>Career</em><br />
              With Confidence
            </h1>

            <p className="lp-hero__sub">
              Practice mock interviews, crack aptitude tests, and land offers from
              top companies — all in one place. Join <strong>100+ students</strong> who
              are already ahead of the curve.
            </p>

            <div className="lp-hero__ctas">
              <button
                className="lp-btn lp-btn--primary"
                id="hero-get-started-btn"
                onClick={() => onNavigate('/register')}
              >
                Start for Free →
              </button>
              <button
                className="lp-btn lp-btn--outline"
                id="hero-learn-more-btn"
                onClick={() => onNavigate('/login')}
              >
                Log In
              </button>
            </div>
            <p className="lp-hero__note">No credit card required  ·  Free forever plan available</p>
          </div>

          {/* Right — floating stats card */}
          <div className="lp-hero__card" role="complementary" aria-label="Platform statistics">
            <span className="lp-hero__card-tag">Live Stats</span>
            <ul className="lp-stat-list">
              {[
                { icon: '👥', num: '100+', label: 'Active Students' },
                { icon: '🏢', num: '30+',  label: 'Partner Companies' },
                { icon: '❓', num: '500+', label: 'Practice Questions' },
                { icon: '🎤', num: '1K+',  label: 'Mock Interviews Done' },
              ].map(({ icon, num, label }) => (
                <li className="lp-stat-item" key={label}>
                  <span className="lp-stat-icon" aria-hidden="true">{icon}</span>
                  <div className="lp-stat-text">
                    <div className="lp-stat-num">{num}</div>
                    <div className="lp-stat-label">{label}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="lp-hero__urgency">
              <span className="lp-urgency-pulse" />
              <span className="lp-urgency-text">⚡ New students joining right now — don't miss out!</span>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §2  TICKER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="lp-ticker" aria-hidden="true">
        <div className="lp-ticker__track">
          {tickerItems.map((item, i) => (
            <React.Fragment key={i}>
              <span className="lp-ticker__item">{item}</span>
              <span className="lp-ticker__sep">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          §3  FEATURES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="lp-section" aria-labelledby="feat-heading">
        <div className="lp-section-head">
          <span className="lp-section-label">What You Get</span>
          <h2 className="lp-section-title" id="feat-heading">
            Everything You Need<br /><span>To Get Placed</span>
          </h2>
          <div className="lp-section-line" />
        </div>

        <div className="lp-feat-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <article className="lp-feat-card" key={title}>
              <span className="lp-feat-icon" aria-hidden="true">{icon}</span>
              <h3 className="lp-feat-title">{title}</h3>
              <p className="lp-feat-desc">{desc}</p>
              <span className="lp-feat-arrow" aria-hidden="true">→</span>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §4  HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="lp-steps-wrap" aria-labelledby="steps-heading">
        <div className="lp-steps-inner">
          <div className="lp-section-head">
            <span className="lp-section-label">The Process</span>
            <h2 className="lp-section-title" id="steps-heading">
              How It <span>Works</span>
            </h2>
            <div className="lp-section-line" />
          </div>

          <div className="lp-steps">
            {STEPS.map(({ icon, title, desc }, i) => (
              <div className="lp-step" key={title}>
                <span className="lp-step__num" aria-hidden="true">0{i + 1}</span>
                <div className="lp-step__icon" aria-hidden="true">{icon}</div>
                <h3 className="lp-step__title">{title}</h3>
                <p className="lp-step__desc">{desc}</p>
                {i < STEPS.length - 1 && (
                  <span className="lp-step__connector" aria-hidden="true">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §5  BIG NUMBERS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="lp-numbers" ref={numRef} aria-label="Platform statistics">
        <div className="lp-numbers__grid">
          <NumberCell target={100}  suffix="+" label="Active Students"    inView={numInView} />
          <NumberCell target={30}   suffix="+" label="Partner Companies"  inView={numInView} />
          <NumberCell target={500}  suffix="+" label="Practice Questions" inView={numInView} />
          <NumberCell target={95}   suffix="%" label="Placement Rate"     inView={numInView} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §6  COMPANIES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="lp-companies-wrap" aria-labelledby="co-heading">
        <div className="lp-companies-inner">
          <div className="lp-section-head">
            <span className="lp-section-label">Partner Companies</span>
            <h2 className="lp-section-title" id="co-heading">
              30+ Companies<br /><span>Hiring From Us</span>
            </h2>
            <div className="lp-section-line" />
          </div>

          <div className="lp-company-grid">
            {COMPANIES.map((name) => (
              <div className="lp-company-chip" key={name}>
                <span className="lp-co-dot" aria-hidden="true" />
                {name}
              </div>
            ))}
            <div className="lp-company-chip" style={{ fontStyle: 'italic', opacity: 0.5 }}>
              + more joining…
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §7  TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="lp-testi-wrap" aria-labelledby="testi-heading">
        <div className="lp-testi-inner">
          <div className="lp-section-head">
            <span className="lp-section-label">Student Stories</span>
            <h2 className="lp-section-title" id="testi-heading">
              Real Students,<br /><span>Real Offers</span>
            </h2>
            <div className="lp-section-line" />
          </div>

          <div className="lp-testi-grid">
            {TESTIMONIALS.map(({ quote, name, role, initials, stars }) => (
              <article className="lp-testi-card" key={name}>
                <div className="lp-testi-stars" aria-label={`${stars} out of 5 stars`}>
                  {'★'.repeat(stars)}
                </div>
                <p className="lp-testi-quote">{quote}</p>
                <div className="lp-testi-person">
                  <div className="lp-testi-avatar" aria-hidden="true">{initials}</div>
                  <div>
                    <div className="lp-testi-name">{name}</div>
                    <div className="lp-testi-role">{role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §8  CTA BANNER — "Join Fast"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="lp-cta-wrap" aria-labelledby="cta-heading">
        <span className="lp-cta-bg-text" aria-hidden="true">JOIN NOW</span>
        <div className="lp-cta-inner">
          <span className="lp-cta-tag">⚡ Limited Early Spots</span>
          <h2 className="lp-cta-title" id="cta-heading">
            Don't Wait.<br />
            Start Today.
          </h2>
          <p className="lp-cta-sub">
            100+ students are already practising. The companies are already hiring.
            Every day you wait is a day someone else gets ahead.
            <strong> Join fast — your dream offer is waiting.</strong>
          </p>
          <div className="lp-cta-btns">
            <button
              className="lp-btn lp-btn--primary"
              id="cta-register-btn"
              onClick={() => onNavigate('/register')}
            >
              Create Free Account →
            </button>
            <button
              className="lp-btn lp-btn--outline"
              id="cta-login-btn"
              onClick={() => onNavigate('/login')}
            >
              Already a Member? Log In
            </button>
          </div>
          <p className="lp-cta-note">✓ Free forever plan  ·  ✓ No credit card  ·  ✓ Setup in 30 seconds</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §9  FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            MIP
            <span>Mock Interview Platform · India</span>
          </div>
          <ul className="lp-footer__links">
            {[
              { label: 'Features',  href: '#features' },
              { label: 'Companies', href: '#companies' },
              { label: 'Login',     href: '/login'    },
              { label: 'Sign Up',   href: '/register' },
            ].map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={(e) => { e.preventDefault(); onNavigate(href) }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="lp-footer__copy">
          © {new Date().getFullYear()} Mock Interview Platform. Built with ❤️ for Indian students.
        </p>
      </footer>

    </div>
  )
}
