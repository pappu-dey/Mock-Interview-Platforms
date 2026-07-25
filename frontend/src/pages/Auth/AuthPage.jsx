import React, { useState, useEffect, useRef } from 'react'
import './AuthPage.css'
import authService from '../../services/authService'

const API_BASE = 'http://localhost:8080/api/auth'

// ─── Helper: friendly server error message ───────────────────────────────────
function parseError(err, fallback) {
  if (err && err.name === 'TypeError' && err.message.includes('fetch')) {
    return '⚡ Cannot connect to server — make sure the Spring Boot backend is running on port 8080.'
  }
  return fallback
}

// ─── Password field with show/hide toggle ─────────────────────────────────────
function PasswordField({ id, value, onChange, placeholder = '••••••••', autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="input-wrap">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        required
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="peek-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

// ─── Auth Page (Login / Register) ─────────────────────────────────────────────
export default function AuthPage({ onLoginSuccess = () => { } }) {
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

  const emailRef = useRef(null)

  // Autofocus the email field whenever the form (re)appears
  useEffect(() => {
    emailRef.current?.focus()
  }, [isLogin])

  // ─── Switch tabs ──────────────────────────────────────────────────────────
  const switchTab = (toLogin) => {
    setIsLogin(toLogin)
    setError('')
    setSuccessMsg('')
    setEmail('')
    setPassword('')
    setPassword2('')
  }

  // Clear the error banner as soon as the person starts correcting their input
  const withClearError = (setter) => (e) => {
    if (error) setError('')
    setter(e.target.value)
  }

  const passwordsMismatch = !isLogin && password2.length > 0 && password !== password2

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
        // Persist session
        localStorage.setItem('jwt_token', data.token)
        localStorage.setItem('user_role', data.role)
        localStorage.setItem('user_email', email)

        // Smooth exit animation, then notify App to re-sync → App routes to Dashboard
        setExiting(true)
        setTimeout(() => {
          onLoginSuccess()
        }, 400)
      }
    } catch (err) {
      setError(parseError(err, 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
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
            aria-pressed={isLogin}
          >
            Login
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => switchTab(false)}
            aria-pressed={!isLogin}
          >
            Sign up
          </button>
        </div>

        {/* ── Banners ── */}
        {error && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            <span className="alert-icon" aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" role="status" aria-live="polite">
            <span className="alert-icon" aria-hidden="true">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {isLogin ? (
          <form className="form" onSubmit={handleLogin}>
            <label className="field-label" htmlFor="login-email">Email</label>
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              placeholder="you@domain.com"
              required
              autoComplete="email"
              value={email}
              onChange={withClearError(setEmail)}
            />

            <label className="field-label" htmlFor="login-password">Password</label>
            <PasswordField
              id="login-password"
              value={password}
              onChange={withClearError(setPassword)}
              autoComplete="current-password"
            />

            <a href="#" className="forgot">Forgot password?</a>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
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
              ref={emailRef}
              id="signup-email"
              type="email"
              placeholder="you@domain.com"
              required
              autoComplete="email"
              value={email}
              onChange={withClearError(setEmail)}
            />

            <label className="field-label" htmlFor="signup-password">Password</label>
            <PasswordField
              id="signup-password"
              value={password}
              onChange={withClearError(setPassword)}
              autoComplete="new-password"
            />

            <label className="field-label" htmlFor="signup-password2">
              Re-enter password
              {passwordsMismatch && <span className="field-hint hint-bad">Doesn't match</span>}
              {!isLogin && password2.length > 0 && !passwordsMismatch && (
                <span className="field-hint hint-good">Matches ✓</span>
              )}
            </label>
            <PasswordField
              id="signup-password2"
              value={password2}
              onChange={withClearError(setPassword2)}
              autoComplete="new-password"
            />

            <label className="field-label">I am a</label>
            <div className="form-toggle role-toggle">
              <button
                type="button"
                className={role === 'student' ? 'active' : ''}
                onClick={() => setRole('student')}
                aria-pressed={role === 'student'}
              >
                Student
              </button>
              <button
                type="button"
                className={role === 'company' ? 'active' : ''}
                onClick={() => setRole('company')}
                aria-pressed={role === 'company'}
              >
                Company
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || passwordsMismatch}>
              {loading && <span className="spinner" aria-hidden="true" />}
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
