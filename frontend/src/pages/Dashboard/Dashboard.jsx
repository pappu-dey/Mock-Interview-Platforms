import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import authService from "../../services/authService";
import dashboardService from "../../services/dashboardService";
import logoImg from "../../assets/prepilot.png";
import Practice from "../Practice/Practice";
import MockInterview from "../mockinterview/mockinterview";
import Performance from "../Performance/Performance";
import Resume from "../Resume/Resume";
import Companies from "../Companies/Companies";
import Settings from "../Settings/Settings";
import Support from "../Support/Support";
import Profile from "../Profile/Profile";
import MockAptitudeWrapper from "../MockAptitude/index";

// ── derive display name & initials from email ──────────────────────────────
function nameFromEmail(email = '') {
  if (!email) return 'User'
  const local = email.split('@')[0]
  return local
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}
function initialsFromEmail(email = '') {
  const parts = (email.split('@')[0] || '').split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (email.slice(0, 2) || '??').toUpperCase()
}

// ---- small inline icon set (no external icon library required) ----
const Icon = {
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" />
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Support: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  ),
  ChevronDown: ({ size = 14 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronRight: ({ size = 12 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Trend: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Person: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Flame: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ---- fallback data (used while loading or on API error) ----
const DEFAULT_STATS = [
  { title: "Total Interviews", number: "12", change: "+3 this wk", icon: Icon.Users },
  { title: "Average Score", number: "85%", change: "+5.2%", icon: Icon.Trend },
  { title: "Questions Solved", number: "120", change: "+18 solved", icon: Icon.Book },
  { title: "Daily Streak", number: "5 Days", change: "🔥 Active", icon: Icon.Flame },
];

const DEFAULT_CHART_DATA = [
  { label: "Java", height: 52, color: "var(--accent-light)" },
  { label: "DSA", height: 78, color: "var(--accent)" },
  { label: "SQL", height: 64, color: "#EFE2D3" },
  { label: "System", height: 90, color: "#C97F4A" },
  { label: "HR", height: 45, color: "var(--accent-light)" },
  { label: "Behav.", height: 70, color: "var(--accent)" },
];

const DEFAULT_COMPANIES = [
  { name: "TCS", role: "Software Engineer", readiness: 82, status: "Ready", logoBg: "#3C6FBB", initials: "TCS" },
  { name: "Infosys", role: "Systems Engineer", readiness: 67, status: "In Progress", logoBg: "#1C6DB0", initials: "IN" },
  { name: "Wipro", role: "Project Engineer", readiness: 54, status: "In Progress", logoBg: "#5B2B82", initials: "WI" },
  { name: "Accenture", role: "Associate Developer", readiness: 90, status: "Ready", logoBg: "#7C2A8C", initials: "AC" },
];

const DEFAULT_MEETINGS = [
  { title: "Technical Mock Interview", subtitle: "with Ananya Kapoor", time: "3:00 PM", initials: "TM", color: "#C97F4A" },
  { title: "HR Round Practice", subtitle: "with Rahul Mehta", time: "6:30 PM", initials: "HR", color: "#E4A16A" },
  { title: "SQL Quiz Review", subtitle: "Self-paced", time: "Tomorrow", initials: "SQ", color: "#8C8C8C" },
];
const NAV_MAIN = [
  { label: "Dashboard", icon: Icon.Grid, section: "dashboard" },
  { label: "Practice", icon: Icon.Edit, section: "practice" },
  { label: "Mock Interviews", icon: Icon.Calendar, section: "interview" },
  { label: "Mock Aptitude", icon: Icon.Book, section: "aptitude" },
  { label: "Performance", icon: Icon.Chart, section: "performance" },
  { label: "Resume", icon: Icon.File, section: "resume" },
  { label: "Companies", icon: Icon.Building, section: "companies" },
];

const NAV_GENERAL = [
  { label: "Profile", icon: Icon.Person, section: "profile" },
  { label: "Settings", icon: Icon.Settings, section: "settings" },
  { label: "Support", icon: Icon.Support, section: "support" },
];

const STATS = [
  { title: "Total Interviews", number: "12", change: "+3 this wk", icon: Icon.Users },
  { title: "Average Score", number: "85%", change: "+5.2%", icon: Icon.Trend },
  { title: "Questions Solved", number: "120", change: "+18 solved", icon: Icon.Book },
  { title: "Daily Streak", number: "5 Days", change: "🔥 Active", icon: Icon.Flame },
];

const CHART_DATA = [
  { label: "Java", height: 52, color: "var(--accent-light)" },
  { label: "DSA", height: 78, color: "var(--accent)" },
  { label: "SQL", height: 64, color: "#EFE2D3" },
  { label: "System", height: 90, color: "#C97F4A" },
  { label: "HR", height: 45, color: "var(--accent-light)" },
  { label: "Behav.", height: 70, color: "var(--accent)" },
];

const COMPANIES = [
  { name: "TCS", role: "Software Engineer", readiness: 82, status: "Ready", logoBg: "#3C6FBB", initials: "TCS" },
  { name: "Infosys", role: "Systems Engineer", readiness: 67, status: "In Progress", logoBg: "#1C6DB0", initials: "IN" },
  { name: "Wipro", role: "Project Engineer", readiness: 54, status: "In Progress", logoBg: "#5B2B82", initials: "WI" },
  { name: "Accenture", role: "Associate Developer", readiness: 90, status: "Ready", logoBg: "#7C2A8C", initials: "AC" },
];

const MEETINGS = [
  { title: "Technical Mock Interview", subtitle: "with Ananya Kapoor", time: "3:00 PM", initials: "TM", color: "#C97F4A" },
  { title: "HR Round Practice", subtitle: "with Rahul Mehta", time: "6:30 PM", initials: "HR", color: "#E4A16A" },
  { title: "SQL Quiz Review", subtitle: "Self-paced", time: "Tomorrow", initials: "SQ", color: "#8C8C8C" },
];

const RECOMMENDATIONS = [
  { label: "Binary Tree questions", value: 40 },
  { label: "SQL Joins & Views", value: 65 },
  { label: "Java coding problems", value: 25 },
  { label: "HR Mock Interview", value: 80 },
];

function Sidebar({ activeSection, onSectionChange, theme, toggleTheme, isOpen, onClose }) {
  const isDark = theme === 'dark'

  function handleNav(section) {
    onSectionChange(section);
    onClose(); // close drawer on mobile after nav
  }

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
      <div className="logo">
        <img src={logoImg} alt="PrepPilot" className="logo-img" />
      </div>

      <nav className="nav-group">
        <div className="nav-label">Menu</div>
        {NAV_MAIN.map(({ label, icon: ItemIcon, section }) => (
          <button
            key={label}
            className={`nav-item${activeSection === section ? " active" : ""}`}
            onClick={() => handleNav(section)}
          >
            <ItemIcon />
            {label}
          </button>
        ))}
      </nav>

      <nav className="nav-group">
        <div className="nav-label">General</div>
        {NAV_GENERAL.map(({ label, icon: ItemIcon, section }) => (
          <button
            key={label}
            className={`nav-item${activeSection === section ? " active" : ""}`}
            onClick={() => handleNav(section)}
          >
            <ItemIcon />
            {label}
          </button>
        ))}

        {/* ── Theme Toggle ── */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          )}
          {isDark ? 'Light Mode' : 'Dark Mode'}
          <div className="theme-toggle__track">
            <div className="theme-toggle__thumb" />
          </div>
        </button>
      </nav>
    </aside>
  );
}

function Header({ user }) {
  const displayName = nameFromEmail(user?.email)
  const avatarInitials = initialsFromEmail(user?.email)
  return (
    <div className="header">
      <div>
        <h1>Dashboard</h1>
        <p className="sub">Welcome back, {displayName} — let's continue your interview prep.</p>
      </div>
      <button className="profile-pill">
        <div className="avatar">{avatarInitials}</div>
        <div>
          <div className="name">{displayName}</div>
        </div>
        <Icon.ChevronDown />
      </button>
    </div>
  );
}

function StatsRow({ stats }) {
  const items = stats && stats.length > 0 ? stats : DEFAULT_STATS;
  return (
    <div className="stats-row">
      {items.map(({ title, number, change, icon: StatIcon }) => (
        <div className="stat-card" key={title}>
          <div className="stat-top">
            <div className="stat-icon"><StatIcon /></div>
            <div className="stat-change">{change}</div>
          </div>
          <div className="stat-title">{title}</div>
          <div className="stat-number">{number}</div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsCard({ chartData }) {
  const items = chartData && chartData.length > 0 ? chartData : DEFAULT_CHART_DATA;
  return (
    <div className="analytics-card">
      <div className="analytics-head">
        <h2>Performance Overview</h2>
        <div className="filter-pill">
          Last 6 sessions
          <Icon.ChevronDown size={12} />
        </div>
      </div>
      <div className="analytics-body">
        <div className="chart-wrap">
          <div className="chart">
            {items.map(({ label, height, color }) => (
              <div className="bar-col" key={label}>
                <div className="bar" style={{ height: `${height}%`, background: color }} />
                <div className="bar-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="team-float">
          <h4>Your Mentors</h4>
          <div className="team-row">
            <div className="team-avatars">
              <div className="avatar" style={{ background: "#C97F4A" }}>AK</div>
              <div className="avatar" style={{ background: "#E4A16A" }}>RM</div>
              <div className="avatar" style={{ background: "#1B1B1D" }}>SD</div>
            </div>
          </div>
          <p>3 mentors reviewed your last mock interview and left feedback.</p>
        </div>
      </div>
    </div>
  );
}

function CompaniesTable({ companies }) {
  const items = companies && companies.length > 0 ? companies : DEFAULT_COMPANIES;
  return (
    <div className="table-card">
      <div className="table-head">
        <h2>Target Companies</h2>
        <div className="filter-pill">
          View all
          <Icon.ChevronRight />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Readiness</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ name, role, readiness, status, logoBg, initials }) => (
            <tr key={name}>
              <td>
                <div className="company-cell">
                  <div className="company-logo" style={{ background: logoBg }}>{initials}</div>
                  {name}
                </div>
              </td>
              <td className="row-pct">{role}</td>
              <td>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${readiness}%` }} />
                </div>
              </td>
              <td>
                <span className={`status-pill ${status === "Ready" ? "status-ready" : "status-progress"}`}>
                  {status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UpcomingInterviews({ meetings, onNavigate }) {
  const items = meetings && meetings.length > 0 ? meetings : DEFAULT_MEETINGS;
  return (
    <div className="dark-card">
      <div className="dark-card-head">
        <h3>Upcoming Interviews</h3>
        <span>{items.length} today</span>
      </div>
      {items.map(({ title, subtitle, time, initials, color }) => (
        <div
          className="meeting-row"
          key={title}
          role="button"
          tabIndex={0}
          onClick={() => onNavigate("/interview")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate("/interview")}
        >
          <div className="meeting-avatars">
            <div className="avatar" style={{ background: color }}>{initials}</div>
          </div>
          <div className="meeting-info">
            <div className="t">{title}</div>
            <div className="s">{subtitle}</div>
          </div>
          <div className="meeting-time">{time}</div>
        </div>
      ))}
    </div>
  );
}

function Recommendations() {
  return (
    <div className="progress-card">
      <h3>AI Recommendations</h3>
      {RECOMMENDATIONS.map(({ label, value }) => (
        <div className="plist-item" key={label}>
          <div className="plist-top">
            <span className="label">{label}</span>
            <span className="val">{value}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── inline content rendered for each section ──────────────────────────────
function DashboardHome({ user, onNavigate, stats, chartData, companies }) {
  return (
    <>
      <Header user={user} />
      <StatsRow stats={stats} />
      <AnalyticsCard chartData={chartData} />
      <CompaniesTable companies={companies} />
    </>
  );
}

export default function Dashboard({ onNavigate, onLogout, user: userProp, theme, toggleTheme }) {
  const user = userProp || authService.getCurrentUser()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [companies, setCompanies] = useState(DEFAULT_COMPANIES);
  const [meetings, setMeetings] = useState(DEFAULT_MEETINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [statsRes, chartRes, compRes, meetRes] = await Promise.allSettled([
          dashboardService.getDashboardStats(),
          dashboardService.getChartData(),
          dashboardService.getCompaniesReadiness(),
          dashboardService.getUpcomingInterviews(),
        ]);

        if (!isMounted) return;

        if (statsRes.status === 'fulfilled' && statsRes.value) {
          const d = statsRes.value;
          setStats([
            { title: "Total Interviews", number: String(d.totalInterviews ?? 12), change: d.weeklyChange || "+3 this wk", icon: Icon.Users },
            { title: "Average Score", number: `${Math.round(d.averageScore ?? 85)}%`, change: "+5.2%", icon: Icon.Trend },
            { title: "Questions Solved", number: String(d.questionsSolved ?? 0), change: "+ solved", icon: Icon.Book },
            { title: "Daily Streak", number: `${Math.max(1, d.currentStreak ?? 1)} Days`, change: "🔥 Active", icon: Icon.Flame },
          ]);
        }

        if (chartRes.status === 'fulfilled' && Array.isArray(chartRes.value) && chartRes.value.length > 0) {
          setChartData(chartRes.value.map(c => ({
            label: c.label || 'Topic',
            height: c.height || c.score || 60,
            color: c.color || 'var(--accent)'
          })));
        }

        if (compRes.status === 'fulfilled' && Array.isArray(compRes.value) && compRes.value.length > 0) {
          setCompanies(compRes.value.map(c => ({
            name: c.name || 'Company',
            role: c.role || 'Software Engineer',
            readiness: c.readiness ?? 75,
            status: c.status || (c.readiness >= 75 ? 'Ready' : 'In Progress'),
            logoBg: c.logoBg || '#3C6FBB',
            initials: c.initials || (c.name ? c.name.slice(0, 2).toUpperCase() : 'CO')
          })));
        }

        if (meetRes.status === 'fulfilled' && Array.isArray(meetRes.value) && meetRes.value.length > 0) {
          setMeetings(meetRes.value.map(m => ({
            title: m.title || 'Mock Interview',
            subtitle: m.subtitle || 'Scheduled Session',
            time: m.time || '3:00 PM',
            initials: m.initials || 'MI',
            color: m.color || '#C97F4A'
          })));
        }
      } catch (err) {
        console.warn("Could not load dashboard data from API, using fallback data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (activeSection === "dashboard") {
      loadDashboardData();
    }

    const handlePracticeStatsUpdated = () => {
      loadDashboardData();
    };
    window.addEventListener('practice-stats-updated', handlePracticeStatsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('practice-stats-updated', handlePracticeStatsUpdated);
    };
  }, [activeSection]);

  // Render the right content based on active section
  function renderContent() {
    switch (activeSection) {
      case "practice":    return <Practice />;
      case "interview":   return <MockInterview />;
      case "aptitude":    return <MockAptitudeWrapper />;
      case "performance": return <Performance />;
      case "resume":      return <Resume />;
      case "companies":   return <Companies />;
      case "settings":    return <Settings />;
      case "support":     return <Support />;
      case "profile":     return <Profile user={user} onLogout={onLogout} />;
      case "dashboard":
      default:
        return (
          <DashboardHome
            user={user}
            onNavigate={onNavigate}
            stats={stats}
            chartData={chartData}
            companies={companies}
          />
        );
    }
  }

  const isDefaultDashboard = activeSection === "dashboard";

  return (
    <div className="dashboard-page">
      <div className="shell">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          theme={theme}
          toggleTheme={toggleTheme}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main">
          {/* Mobile top bar with hamburger */}
          <div className="mobile-topbar">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <span /><span /><span />
            </button>
            <img src={logoImg} alt="PrepPilot" className="mobile-logo" />
            <div className="hamburger-spacer" />
          </div>

          {renderContent()}
        </main>

        {isDefaultDashboard && (
          <aside className="right">
            <UpcomingInterviews meetings={meetings} onNavigate={onNavigate} />
            <Recommendations />
          </aside>
        )}
      </div>
    </div>
  );
}