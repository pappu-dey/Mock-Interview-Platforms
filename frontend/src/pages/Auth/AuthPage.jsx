import React, { useState, useEffect, useRef } from 'react'
import './AuthPage.css'
import authService from '../../services/authService'

// ─── Helper: friendly server error message ───────────────────────────────────
function parseError(err, fallback) {
  if (err && err.name === 'TypeError' && err.message?.includes('fetch')) {
    return '⚡ Cannot connect to server — make sure the Spring Boot backend is running on port 8080.'
  }
  return err?.message || fallback
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

// ─── Auth Page (Login / Register / Forgot Password) ──────────────────────────
export default function AuthPage({ onLoginSuccess = () => { } }) {
  // mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login')
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

  // Autofocus the email field whenever mode changes
  useEffect(() => {
    emailRef.current?.focus()
  }, [mode])

  // ─── Switch mode ────────────────────────────────────────────────────────────
  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setSuccessMsg('')
    setEmail('')
    setPassword('')
    setPassword2('')
  }

  const withClearError = (setter) => (e) => {
    if (error) setError('')
    setter(e.target.value)
  }

  const passwordsMismatch = (mode === 'register' || mode === 'forgot') && password2.length > 0 && password !== password2

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
      const res = await authService.register(email, password, role)
      setSuccessMsg(res.message || 'Account created! You can now log in.')
      setEmail('')
      setPassword('')
      setPassword2('')
      setTimeout(() => switchMode('login'), 1600)
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
      await authService.login(email, password)
      setExiting(true)
      setTimeout(() => {
        onLoginSuccess()
      }, 400)
    } catch (err) {
      setError(parseError(err, 'Invalid credentials. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await authService.forgotPassword(email, password)
      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login…')
      setEmail('')
      setPassword('')
      setPassword2('')
      setTimeout(() => switchMode('login'), 1800)
    } catch (err) {
      setError(parseError(err, 'Could not reset password. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // ─── Render auth form ─────────────────────────────────────────────────────
  return (
    <div className={`container ${exiting ? 'form-exit' : ''}`}>
      <div className="form-container">
        <div className="corner-tag">AUTH.001</div>

        <h1 className="brand">
          {mode === 'forgot' ? 'RESET' : 'ACCESS'}
        </h1>

        {mode !== 'forgot' ? (
          <div className="form-toggle">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
              aria-pressed={mode === 'login'}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
              aria-pressed={mode === 'register'}
            >
              Sign up
            </button>
          </div>
        ) : (
          <p style={{ marginTop: '-0.5rem', marginBottom: '1.25rem', textAlign: 'left' }}>
            Enter your account email and new password.
          </p>
        )}

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

        {mode === 'login' && (
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

            <a
              href="#"
              className="forgot"
              onClick={(e) => { e.preventDefault(); switchMode('forgot') }}
            >
              Forgot password?
            </a>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading ? 'Authenticating…' : 'Log In →'}
            </button>

            <p>
              Not a member?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchMode('register') }}>Sign up</a>
            </p>
          </form>
        )}

        {mode === 'register' && (
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
              {password2.length > 0 && !passwordsMismatch && (
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
              <a href="#" onClick={(e) => { e.preventDefault(); switchMode('login') }}>Log in</a>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="form" onSubmit={handleForgotPassword}>
            <label className="field-label" htmlFor="forgot-email">Account Email</label>
            <input
              ref={emailRef}
              id="forgot-email"
              type="email"
              placeholder="you@domain.com"
              required
              autoComplete="email"
              value={email}
              onChange={withClearError(setEmail)}
            />

            <label className="field-label" htmlFor="forgot-password">New Password</label>
            <PasswordField
              id="forgot-password"
              value={password}
              onChange={withClearError(setPassword)}
              autoComplete="new-password"
              placeholder="New password"
            />

            <label className="field-label" htmlFor="forgot-password2">
              Re-enter New Password
              {passwordsMismatch && <span className="field-hint hint-bad">Doesn't match</span>}
              {password2.length > 0 && !passwordsMismatch && (
                <span className="field-hint hint-good">Matches ✓</span>
              )}
            </label>
            <PasswordField
              id="forgot-password2"
              value={password2}
              onChange={withClearError(setPassword2)}
              autoComplete="new-password"
              placeholder="Re-enter new password"
            />

            <button type="submit" className="submit-btn" disabled={loading || passwordsMismatch}>
              {loading && <span className="spinner" aria-hidden="true" />}
              {loading ? 'Updating Password…' : 'Reset Password →'}
            </button>

            <p>
              Remembered your password?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchMode('login') }}>← Back to Login</a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
