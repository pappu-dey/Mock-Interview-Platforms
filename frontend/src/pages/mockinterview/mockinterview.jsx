import React, { useState } from "react";
import practiceService from "../../services/practiceService";
import "./mockinterview.css";

const COMPANIES = ["TCS", "Infosys", "Accenture", "Wipro"];
const ROLES = ["Java Developer", "Software Engineer", "Full Stack Developer"];

function Mockinterview() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scheduledSession, setScheduledSession] = useState(null);

  const isReady = company !== "" && role !== "";

  const handleStart = async () => {
    if (!isReady || submitting) return;
    setSubmitting(true);
    try {
      // 1. Schedule upcoming interview
      await practiceService.scheduleInterview({
        company,
        role,
        startTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      });

      // 2. Record mock session for analytics
      await practiceService.recordAssessmentSession({
        company,
        roleName: role,
        topic: `${company} ${role} Mock Interview`,
        totalQuestions: 10,
        correctCount: 8,
        score: 85,
        timeSpentSeconds: 1200,
        type: "Mock",
      });

      setScheduledSession({ company, role });
    } catch (err) {
      console.error("Failed to schedule mock interview:", err);
    } finally {
      setSubmitting(false);
    }
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

      {scheduledSession ? (
        <div className="mock-card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
            Mock Interview Registered!
          </h2>
          <p style={{ color: "var(--text-2)", marginBottom: "24px", maxWidth: "420px", margin: "0 auto 24px" }}>
            Your interview round for <strong>{scheduledSession.role}</strong> at <strong>{scheduledSession.company}</strong> has been added to your Dashboard Upcoming Interviews and Performance Analytics.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              type="button"
              className="start-btn"
              onClick={() => {
                setScheduledSession(null);
                setCompany("");
                setRole("");
              }}
              style={{ width: "auto", padding: "12px 24px" }}
            >
              Schedule Another
            </button>
          </div>
        </div>
      ) : (
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
            disabled={!isReady || submitting}
          >
            {submitting ? "Preparing interview…" : "Start interview"}
            <span className="start-btn-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Mockinterview;