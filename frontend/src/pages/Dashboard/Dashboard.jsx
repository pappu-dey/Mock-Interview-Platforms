import React from 'react'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>Welcome Back 👋</h2>
        <p>Let's continue your interview preparation.</p>
      </div>
      <div className="stats-container">
        <div className="card">
          <h3>12</h3>
          <p>Total interviews</p>
        </div>
        <div className="card">
          <h3>85%</h3>
          <p>Average Score</p>
        </div>
        <div className="card">
          <h3>95%</h3>
          <p>Best score</p>
        </div>
        <div className="card">
          <h3>120</h3>
          <p>Questions solved</p>
        </div>    
    </div>
  <div className="quick-actions">
    <h2>Quick Actions</h2>
    <div className="action-buttons">
      <button>Start Mock Interview</button>
      <button>Practice coding</button>
      <button>View performance</button>
      <button>upload Resume</button>
    </div>
  </div>
  <div className="performance-section">
  <h2>Performance Overview</h2>

  <div className="performance-card">
    <p>Interview Progress</p>

    <progress value="75" max="100"></progress>

    <span>75% Completed</span>
  </div>
</div>
<div className="recent-activity">
  <h2>Recent Activity</h2>

  <ul>
    <li>✅ Completed Java Mock Interview</li>
    <li>✅ Solved 10 DSA Questions</li>
    <li>✅ Uploaded Resume</li>
    <li>✅ Attempted SQL Quiz</li>
  </ul>
</div>
<div className="recommendations">
  <h2>AI Recommendations</h2>

  <div className="recommendation-card">
    <p>📚 Practice Binary Tree questions</p>
    <p>🗄️ Revise SQL Joins and Views</p>
    <p>💻 Solve 5 Java coding problems</p>
    <p>🎤 Take an HR Mock Interview</p>
  </div>
</div>
<div className="company-section">
  <h2>Target Companies</h2>

  <div className="company-cards">
    <div className="company-card">TCS</div>
    <div className="company-card">Infosys</div>
    <div className="company-card">Wipro</div>
    <div className="company-card">Accenture</div>
  </div>
</div>
  </div>
  );
}

export default Dashboard;

