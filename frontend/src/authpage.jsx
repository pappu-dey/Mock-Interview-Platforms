import React, { useState, useEffect } from 'react'
import './authpage.css'

const API_BASE = 'http://localhost:8080/api/auth'

// ─── Helper: friendly server error message ───────────────────────────────────
function parseError(err, fallback) {
  if (err && err.name === 'TypeError' && err.message.includes('fetch')) {
    return '⚡ Cannot connect to server — make sure the Spring Boot backend is running on port 8080.'
  }
  return fallback
}

// ─── Welcome Page ─────────────────────────────────────────────────────────────
function WelcomePage({ email, role, token, onLogout }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // tiny delay so the CSS transition fires after mount
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  const roleEmoji = { student: '🎓', company: '🏢', admin: '🔑' }
  const quickLinks = role === 'company'
    ? [
        { label: 'Post a Job', icon: '📋' },
        { label: 'View Candidates', icon: '👥' },
        { label: 'Schedule Interview', icon: '📅' },
      ]
    : [
        { label: 'Browse Jobs', icon: '🔍' },
        { label: 'Mock Interview', icon: '🎤' },
        { label: 'My Progress', icon: '📊' },
      ]

  return (
    <div className={`container welcome-container ${visible ? 'welcome-visible' : ''}`}>
      {/* ── Floating particles bg ── */}
      <span className="particle p1" />
      <span className="particle p2" />
      <span className="particle p3" />

      <div className="welcome-card">
        {/* Header strip */}
        <div className="welcome-header">
          <div className="corner-tag">AUTHENTICATED ✓</div>
          <div className="welcome-avatar">{roleEmoji[role?.toLowerCase()] ?? '👤'}</div>
          <h1 className="welcome-title">Welcome back!</h1>
          <p className="welcome-email">{email}</p>
          <span className={`role-badge role-${role?.toLowerCase()}`}>{role}</span>
        </div>

        {/* Quick actions */}
        <div className="welcome-body">
          <p className="section-label">Quick Actions</p>
          <div className="quick-grid">
            {quickLinks.map(({ label, icon }) => (
              <button key={label} className="quick-card" type="button">
                <span className="quick-icon">{icon}</span>
                <span className="quick-label">{label}</span>
              </button>
            ))}
          </div>

          {/* Token preview */}
          <details className="token-block">
            <summary>JWT Token</summary>
            <code className="token-code">{token?.slice(0, 64)}…</code>
          </details>

          <button className="submit-btn logout-btn" onClick={onLogout} type="button">
            Log Out →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Auth Page (Login / Register) ─────────────────────────────────────────────
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState('student')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // transition state
  const [exiting, setExiting] = useState(false)

  // post-login state
  const [loggedIn, setLoggedIn] = useState(false)
  const [loggedInEmail, setLoggedInEmail] = useState('')
  const [loggedInRole, setLoggedInRole] = useState('')
  const [loggedInToken, setLoggedInToken] = useState('')

  // ─── Switch tabs ──────────────────────────────────────────────────────────
  const switchTab = (toLogin) => {
    setIsLogin(toLogin)
    setError('')
    setSuccessMsg('')
    setEmail('')
    setPassword('')
    setPassword2('')
  }

  // ─── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Registration failed.')
      } else {
        setSuccessMsg(data.message || 'Account created! You can now log in.')
        setEmail('')
        setPassword('')
        setPassword2('')
        setTimeout(() => switchTab(true), 1600)
      }
    } catch (err) {
      setError(parseError(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Invalid credentials.')
      } else {
        localStorage.setItem('jwt_token', data.token)
        localStorage.setItem('user_role', data.role)
        localStorage.setItem('user_email', email)

        // Smooth exit animation, then show welcome page
        setExiting(true)
        setTimeout(() => {
          setLoggedInEmail(email)
          setLoggedInRole(data.role)
          setLoggedInToken(data.token)
          setLoggedIn(true)
        }, 400)
      }
    } catch (err) {
      setError(parseError(err, 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    setLoggedIn(false)
    setExiting(false)
    setLoggedInEmail('')
    setLoggedInRole('')
    setLoggedInToken('')
    setEmail('')
    setPassword('')
    setError('')
  }

  // ─── Render welcome ───────────────────────────────────────────────────────
  if (loggedIn) {
    return (
      <WelcomePage
        email={loggedInEmail}
        role={loggedInRole}
        token={loggedInToken}
        onLogout={handleLogout}
      />
    )
  }

  // ─── Render auth form ─────────────────────────────────────────────────────
  return (
    <div className={`container ${exiting ? 'form-exit' : ''}`}>
      <div className="form-container">
        <div className="corner-tag">AUTH.001</div>

        <h1 className="brand">ACCESS</h1>

        <div className="form-toggle">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => switchTab(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => switchTab(false)}
          >
            Sign up
          </button>
        </div>

        {/* ── Banners ── */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" role="status">
            {successMsg}
          </div>
        )}

        {isLogin ? (
          <form className="form" onSubmit={handleLogin}>
            <label className="field-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@domain.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="field-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <a href="#" className="forgot">Forgot password?</a>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Authenticating…' : 'Log In →'}
            </button>

            <p>
              Not a member?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchTab(false) }}>Sign up</a>
            </p>
          </form>
        ) : (
          <form className="form" onSubmit={handleRegister}>
            <label className="field-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@domain.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="field-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label className="field-label" htmlFor="signup-password2">Re-enter password</label>
            <input
              id="signup-password2"
              type="password"
              placeholder="••••••••"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />

            <label className="field-label">I am a</label>
            <div className="form-toggle role-toggle">
              <button
                type="button"
                className={role === 'student' ? 'active' : ''}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={role === 'company' ? 'active' : ''}
                onClick={() => setRole('company')}
              >
                Company
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign Up →'}
            </button>

            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchTab(true) }}>Log in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}