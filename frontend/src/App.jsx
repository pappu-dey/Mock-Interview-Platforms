import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Tripa from './components/Tripa/Tripa'
import AuthPage from './pages/Auth/AuthPage'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Profile/Profile'
import LandingPage from './pages/LandingPage/LandingPage'
import MockInterview from './pages/mockinterview/mockinterview'
import Practice from './pages/Practice/Practice'
import Courses from './pages/Courses/Courses'
import Performance from './pages/Performance/Performance'
import Resume from './pages/Resume/Resume'
import Companies from './pages/Companies/Companies'
import Settings from './pages/Settings/Settings'
import Support from './pages/Support/Support'
import AdminPanel from './pages/Admin/AdminPanel'
import authService from './services/authService'

// ─── Theme hook ────────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pp-theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('pp-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return [theme, toggleTheme]
}

// ─── Thin router helper ────────────────────────────────────────────────────────
function useRoute() {
  const [route, setRoute] = useState(window.location.pathname || '/')

  const navigate = (href) => {
    window.history.pushState({}, '', href)
    setRoute(href)
  }

  useEffect(() => {
    const handlePop = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  return [route, navigate]
}

export default function App() {
  const [route, navigate] = useRoute()
  const [theme, toggleTheme] = useTheme()

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [isAuthed, setIsAuthed] = useState(() => authService.isAuthenticated())
  const [user, setUser] = useState(() => authService.getCurrentUser())

  function syncAuth() {
    const authed = authService.isAuthenticated()
    const currentUser = authService.getCurrentUser()
    setIsAuthed(authed)
    setUser(currentUser)
    // After login, navigate to the dashboard unless already on /amiadmin or /admin
    if (authed && route !== '/amiadmin' && route !== '/admin') {
      navigate('/dashboard')
    }
  }

  function handleLogout() {
    authService.logout()
    setIsAuthed(false)
    setUser({})
    navigate('/')
  }

  function handleNavigate(href) {
    // scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' })
    navigate(href)
  }

  // ── Page rendering ──────────────────────────────────────────────────────────
  let page
  const isAdmin = isAuthed && authService.isAdmin()
  const isAdminRoute = route === '/amiadmin' || route === '/admin'

  // ── /amiadmin & /admin route — strictly guarded by ADMIN role ──────────────
  if (isAdminRoute) {
    if (!isAuthed) {
      // Not logged in → show login
      page = <AuthPage onLoginSuccess={syncAuth} />
    } else if (!isAdmin) {
      // Logged in but not an ADMIN role → show "you are not an admin"
      page = (
        <div className="admin-denied" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <div className="admin-denied__icon" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚫</div>
          <h1>you are not an admin</h1>
          <p style={{ opacity: 0.75, marginBottom: '1.5rem' }}>This area is restricted to users with the ADMIN role.</p>
          <button
            className="admin-denied__btn"
            onClick={() => handleNavigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      )
    } else {
      page = <AdminPanel onNavigate={handleNavigate} />
    }
  } else if (route === '/practice') {
    page = <Practice />
  } else if (route === '/performance') {
    page = <Performance />
  } else if (route === '/resume') {
    page = <Resume />
  } else if (route === '/companies') {
    page = <Companies />
  } else if (route === '/settings') {
    page = <Settings />
  } else if (route === '/support') {
    page = <Support />
  } else if (route === '/courses') {
    page = <Courses />
  } else if (isAuthed) {
    if (route === '/profile') {
      page = <Profile user={user} onLogout={handleLogout} />
    } else if (route === '/interview') {
      page = <MockInterview />
    } else {
      // authenticated default → Dashboard
      page = <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} user={user} theme={theme} toggleTheme={toggleTheme} />
    }
  } else {
    if (route === '/login' || route === '/register') {
      page = <AuthPage onLoginSuccess={syncAuth} />
    } else {
      // public default → landing page
      page = <LandingPage onNavigate={handleNavigate} />
    }
  }

  return (
    <>
      {!isAuthed && !isAdminRoute && (
        <Navbar
          isAuthenticated={isAuthed}
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
      <main>{page}</main>
      {/* Tripa AI chatbot — shown on all pages except admin */}
      {!isAdminRoute && <Tripa />}
    </>
  )
}
