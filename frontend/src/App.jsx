import React, { useState, useEffect } from 'react'
import Navbar       from './components/Navbar'
import AuthPage     from './pages/authpage.jsx'
import Profile      from './pages/Profile/Profile'
import LandingPage  from './pages/LandingPage/LandingPage'
import authService  from './services/authService'
import Navbar      from './components/Navbar'
import AuthPage    from './pages/Auth/AuthPage'
import Dashboard   from './pages/Dashboard/Dashboard'
import Profile     from './pages/Profile/Profile'
import LandingPage from './pages/LandingPage/LandingPage'
import authService from './services/authService'

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

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [isAuthed, setIsAuthed] = useState(() => authService.isAuthenticated())
  const [user,     setUser]     = useState(() => authService.getCurrentUser())

  function syncAuth() {
    setIsAuthed(authService.isAuthenticated())
    setUser(authService.getCurrentUser())
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

  if (isAuthed) {
    if (route === '/profile') {
      page = <Profile user={user} onLogout={handleLogout} />
    } else {
      // authenticated default → show auth welcome/dashboard
      page = <AuthPage onLoginSuccess={syncAuth} />
      // authenticated default → Dashboard
      page = <Dashboard />
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
      <Navbar
        isAuthenticated={isAuthed}
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <main>{page}</main>
    </>
  )
}
