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
    // After login, navigate to the dashboard
    if (authed) {
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

  // ── /admin route — strictly guarded ────────────────────────────────────────
  if (route === '/admin') {
    if (!isAuthed) {
      // Not logged in → send to login
      navigate('/login')
      page = <AuthPage onLoginSuccess={syncAuth} />
    } else if (!isAdmin) {
      // Logged in but not the admin account → back to dashboard
      navigate('/dashboard')
      page = <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} user={user} theme={theme} toggleTheme={toggleTheme} />
    } else {
      // Only test@test.com reaches here
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
      {!isAuthed && route !== '/admin' && (
        <Navbar
          isAuthenticated={isAuthed}
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}
      <main>{page}</main>
      {/* Tripa AI chatbot — shown on all pages except /admin */}
      {route !== '/admin' && <Tripa />}
    </>
  )
}
