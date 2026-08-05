import React, { useState } from "react";
import "./mockinterview.css";

const COMPANIES = ["TCS", "Infosys", "Accenture", "Wipro"];
const ROLES = ["Java Developer", "Software Engineer", "Full Stack Developer"];

function Mockinterview() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const isReady = company !== "" && role !== "";

  const handleStart = () => {
    if (!isReady) return;
    // Hook up navigation / API call here
    console.log("Starting interview:", { company, role });
  };

  return (
    <div className="mock-page">
      <div className="mock-glow" aria-hidden="true" />

      <header className="mock-header">
        <span className="mock-eyebrow">
          <span className="mock-status-dot" />
          AI interviewer ready
        </span>
        <h1>Mock Interview</h1>
        <p>Run a focused practice round tailored to a real company and role.</p>
      </header>

      <div className="mock-card">
        <div className="mock-card-heading">
          <span className="mock-step">Session setup</span>
          <h2>Choose your scenario</h2>
        </div>

        <div className="mock-form">
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <div className="select-wrap">
              <select
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              >
                <option value="">Select company</option>
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <div className="select-wrap">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="start-btn"
          onClick={handleStart}
          disabled={!isReady}
        >
          Start interview
          <span className="start-btn-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export default Mockinterview;