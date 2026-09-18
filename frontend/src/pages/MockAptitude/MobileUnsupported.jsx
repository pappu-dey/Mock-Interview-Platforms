import React from "react";
import "./MobileUnsupported.css";

export default function MobileUnsupported() {
  return (
    <div className="mobile-unsupported-page">
      <div className="mobile-unsupported-card">
        <div className="mobile-device-icon">💻</div>
        <div className="mobile-badge">DESKTOP / LAPTOP REQUIRED</div>
        <h2 className="mobile-title">Mobile Device Not Supported</h2>
        <p className="mobile-desc">
          PrepPilot Mock Aptitude exams simulate authentic company testing environments with mandatory
          <strong> Full-Screen Proctoring</strong>, <strong>Keyboard Lock</strong>, and <strong>Multi-Section Layouts</strong>.
        </p>
        <div className="mobile-warning-box">
          <span className="warn-icon">⚠️</span>
          <span>
            This feature does not support mobile phones or small handheld devices. Please log in on a <strong>laptop or desktop computer</strong> to start your assessment.
          </span>
        </div>
        <div className="mobile-requirements">
          <h4>Minimum Requirements:</h4>
          <ul>
            <li>✓ Desktop or Laptop Computer (Windows, Mac, Linux)</li>
            <li>✓ Minimum screen resolution: 1024 × 768</li>
            <li>✓ Google Chrome, Microsoft Edge, or Firefox browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

