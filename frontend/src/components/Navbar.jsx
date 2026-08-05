/**
 * Navbar.jsx — Top navigation bar
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a sticky, accessible navigation bar.
 *
 * Props:
 *   isAuthenticated  boolean   — show user avatar & logout vs login/signup buttons
 *   user             object    — { email, role } from authService.getCurrentUser()
 *   onLogout         function  — called when the user clicks "Log Out"
 *   onNavigate       function  — optional: called with a route string (e.g. '/profile')
 *                                Use this if you're NOT using React Router yet.
 *
 * When React Router is wired up replace the <a> tags / onNavigate prop
 * with <Link to="…"> from 'react-router-dom'.
 */

import React, { useState, useRef, useEffect } from 'react'
import Button from './Button'
import './Navbar.css'

// ── helper: get initials from email ──────────────────────────────────────────
function initials(email = '') {
  if (!email) return '?'
  const [localPart] = email.split('@')
  const parts = localPart.split(/[._-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return localPart.slice(0, 2).toUpperCase()
}

// ── role badge colour helper ──────────────────────────────────────────────────
const ROLE_LABELS = {
  student: { label: '🎓 Student', bg: '#FFD400' },
  company: { label: '🏢 Company', bg: '#C8E6FF' },
  admin:   { label: '🔑 Admin',   bg: '#FF3864' },
}

export default function Navbar({
  isAuthenticated = false,
  user            = {},
  onLogout        = () => {},
  onNavigate      = () => {},
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  // Close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 720) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const role      = user.role?.toLowerCase() ?? 'student'
  const roleInfo  = ROLE_LABELS[role] ?? ROLE_LABELS.student

  const navLinks = isAuthenticated
    ? role === 'company'
      ? [
          { label: 'Dashboard',   href: '/dashboard' },
          { label: 'Post a Job',  href: '/post-job'  },
          { label: 'Candidates',  href: '/candidates' },
          { label: 'Practice',    href: '/practice'  },
        ]
      : [
          { label: 'Dashboard',       href: '/dashboard'   },
          { label: 'Mock Interview',  href: '/interview'   },
          { label: 'Browse Jobs',     href: '/jobs'        },
          { label: 'Practice',        href: '/practice'    },
        ]
    : [
        { label: 'Features', href: '#features' },
        { label: 'How it works', href: '#how' },
        { label: 'Practice', href: '/practice' },
        { label: 'Pricing', href: '#pricing' },
      ]

  const handleNav = (href) => {
    setMobileOpen(false)
    setDropdownOpen(false)
    onNavigate(href)
  }

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">

          {/* ── Logo ── */}
          <a
            href="/"
            className="navbar__logo"
            onClick={(e) => { e.preventDefault(); handleNav('/') }}
            aria-label="Mock Interview Platform home"
          >
            <span className="navbar__logo-dot" aria-hidden="true" />
            MIP
          </a>

          {/* ── Centre links ── */}
          <ul className="navbar__links" role="list">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => { e.preventDefault(); handleNav(href) }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* ── Right actions ── */}
          <div className="navbar__actions">
            {isAuthenticated ? (
              /* Avatar + dropdown */
              <div className="navbar__avatar-wrap" ref={dropdownRef}>
                <button
                  id="navbar-avatar-btn"
                  className="navbar__avatar"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  aria-label={`User menu for ${user.email}`}
                  title={user.email}
                >
                  {initials(user.email)}
                </button>

                {dropdownOpen && (
                  <div
                    className="navbar__dropdown"
                    role="menu"
                    aria-label="User menu"
                  >
                    <div className="navbar__dropdown-header">
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          background: roleInfo.bg,
                          border: '1.5px solid #0D0D0D',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.07em',
                        }}
                      >
                        {roleInfo.label}
                      </span>
                      <span className="navbar__dropdown-email">{user.email}</span>
                    </div>

                    <a
                      href="/profile"
                      className="navbar__dropdown-item"
                      role="menuitem"
                      onClick={(e) => { e.preventDefault(); handleNav('/profile') }}
                    >
                      👤 My Profile
                    </a>

                    <a
                      href="/settings"
                      className="navbar__dropdown-item"
                      role="menuitem"
                      onClick={(e) => { e.preventDefault(); handleNav('/settings') }}
                    >
                      ⚙️ Settings
                    </a>

                    <button
                      className="navbar__dropdown-item navbar__dropdown-item--danger"
                      role="menuitem"
                      onClick={() => { setDropdownOpen(false); onLogout() }}
                    >
                      🚪 Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleNav('/login')}
                  id="navbar-login-btn"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNav('/register')}
                  id="navbar-register-btn"
                >
                  Sign Up →
                </Button>
              </>
            )}

            {/* Hamburger */}
            <button
              className={`navbar__hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              id="navbar-hamburger-btn"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="navbar__mobile-menu" role="menu">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              role="menuitem"
              onClick={(e) => { e.preventDefault(); handleNav(href) }}
            >
              {label}
            </a>
          ))}
          {isAuthenticated ? (
            <>
              <a href="/profile" role="menuitem" onClick={(e) => { e.preventDefault(); handleNav('/profile') }}>
                👤 My Profile
              </a>
              <button role="menuitem" onClick={() => { setMobileOpen(false); onLogout() }}>
                🚪 Log Out
              </button>
            </>
          ) : (
            <>
              <a href="/login"    role="menuitem" onClick={(e) => { e.preventDefault(); handleNav('/login') }}>Log In</a>
              <a href="/register" role="menuitem" onClick={(e) => { e.preventDefault(); handleNav('/register') }}>Sign Up</a>
            </>
          )}
        </div>
      )}
    </>
  )
}
