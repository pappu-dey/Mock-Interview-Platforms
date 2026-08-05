import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
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

  if (route === '/practice') {
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
      page = <Dashboard onNavigate={handleNavigate} />
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
