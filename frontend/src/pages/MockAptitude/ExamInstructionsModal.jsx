import React, { useState } from "react";
import { createPortal } from "react-dom";
import "./ExamInstructionsModal.css";

export default function ExamInstructionsModal({ category, onConfirm, onCancel }) {
  const [agreed, setAgreed] = useState(false);

  return createPortal(
    <div className="rules-overlay">
      <div className="rules-modal">
        {/* Header */}
        <div className="rules-header">
          <div className="rules-header-top">
            <div className="rules-header-badge">
              <span className="live-dot" /> PrepPilot Mock Assessment • Proctored
            </div>
            <div className="rules-security-tag">🛡️ Strict Anti-Cheat Active</div>
          </div>
          <h2 className="rules-title">{category.title} Examination Guidelines</h2>
          <p className="rules-subtitle">
            Review the simulated proctoring rules, security protocols, and navigation instructions before starting.
          </p>
        </div>

        {/* Quick Meta Cards */}
        <div className="rules-meta-grid">
          <div className="meta-pill">
            <span className="meta-icon">📋</span>
            <div>
              <div className="meta-val">{category.tag.split("•")[0]?.trim() || "25 Questions"}</div>
              <div className="meta-lbl">Total Questions</div>
            </div>
          </div>
          <div className="meta-pill">
            <span className="meta-icon">⏱️</span>
            <div>
              <div className="meta-val">{category.tag.split("•")[1]?.trim() || "30 min"}</div>
              <div className="meta-lbl">Duration</div>
            </div>
          </div>
          <div className="meta-pill">
            <span className="meta-icon">🎯</span>
            <div>
              <div className="meta-val">+1.00 / 0.00</div>
              <div className="meta-lbl">Marking Scheme</div>
            </div>
          </div>
          <div className="meta-pill">
            <span className="meta-icon">⚠️</span>
            <div>
              <div className="meta-val">Max 2</div>
              <div className="meta-lbl">Warnings Allowed</div>
            </div>
          </div>
        </div>

        {/* Rules Grid (2x2 Compact Cards + Navigation Strip) */}
        <div className="rules-grid-section">
          <div className="rules-grid">
            <div className="rule-card">
              <div className="rule-card-header">
                <span className="rule-badge-num">1</span>
                <span className="rule-card-icon">🖥️</span>
                <h4>Enforced Full Screen</h4>
              </div>
              <p>
                Launches in mandatory full-screen mode. The <strong>ESC key is blocked</strong> to avoid accidental exits.
                Exiting triggers an urgent breach alarm.
              </p>
            </div>

            <div className="rule-card">
              <div className="rule-card-header">
                <span className="rule-badge-num">2</span>
                <span className="rule-card-icon">🚫</span>
                <h4>No Tab / AI Switching</h4>
              </div>
              <p>
                Switching tabs, minimizing windows, or accessing external AI tools (ChatGPT, Claude, Gemini) is tracked and logged as a violation.
              </p>
            </div>

            <div className="rule-card">
              <div className="rule-card-header">
                <span className="rule-badge-num">3</span>
                <span className="rule-card-icon">⚡</span>
                <h4>3-Strike Disqualification</h4>
              </div>
              <p>
                You receive at most <strong>2 warnings</strong>. On the <strong>3rd infraction</strong>, the exam instantly terminates and auto-submits with a disqualified status.
              </p>
            </div>

            <div className="rule-card">
              <div className="rule-card-header">
                <span className="rule-badge-num">4</span>
                <span className="rule-card-icon">🔒</span>
                <h4>Clipboard & Keys Locked</h4>
              </div>
              <p>
                Copy (Ctrl+C), paste (Ctrl+V), text selection, right-click, DevTools (F12), and page reload (F5) are completely disabled.
              </p>
            </div>
          </div>

          {/* Navigation & Submit Notice Strip */}
          <div className="rules-notice-strip">
            <span className="notice-icon">🧭</span>
            <span>
              <strong>Navigation & Submit:</strong> Use the 4-box question palette on the right to jump between questions. Only <strong>one single Submit Exam button</strong> is provided in the bottom bar to finalize results.
            </span>
          </div>
        </div>

        {/* Declaration Checkbox */}
        <label className={`rules-checkbox-row ${agreed ? "checked" : ""}`}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="checkbox-custom">
            {agreed && <span className="checkmark">✓</span>}
          </span>
          <span className="checkbox-text">
            I confirm that I will take this exam honestly. I acknowledge that leaving full-screen, pressing ESC, or switching windows triggers warnings, and 3 infractions will disqualify me.
          </span>
        </label>

        {/* Actions */}
        <div className="rules-actions">
          <button className="btn-cancel-modal" onClick={onCancel}>
            Cancel & Return
          </button>
          <button
            className="btn-start-modal"
            disabled={!agreed}
            onClick={() => {
              if (agreed) {
                try {
                  const el = document.documentElement;
                  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
                  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                  else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                  else if (el.msRequestFullscreen) el.msRequestFullscreen();
                } catch (e) {}
                onConfirm(category);
              }
            }}
          >
            Start Exam in Full Screen 🚀
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
