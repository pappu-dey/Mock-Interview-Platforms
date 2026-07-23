import React from "react";
import"./dashboard.css";
function Dashboard(){
    return(
        <div className="dashboard">
        <div className="Welcome-section">
            <h2> Welcome Back👋</h2>
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
        </div>
    );
}
export default Dashboard;