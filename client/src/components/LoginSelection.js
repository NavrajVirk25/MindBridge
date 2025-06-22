import React from 'react';
import { useNavigate } from 'react-router-dom';

// This component acts as a role selection hub for your platform
// Think of it as a sophisticated reception desk that directs different
// types of users to their appropriate destinations
function LoginSelection() {
  const navigate = useNavigate();

  // This function handles navigation to specific login pages
  // The role parameter determines which specialized login interface to show
  // Using navigate() instead of href maintains React Router's single-page
  // application behavior, making transitions smooth and fast
  const handleRoleSelection = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="login-selection-page">
      <div className="login-selection-container">
        {/* Header section that welcomes users and explains the choice */}
        <div className="login-selection-header">
          <h1 className="login-title">Access MindBridge</h1>
          <p className="login-subtitle">
            Choose your role to access the features designed specifically for you
          </p>
        </div>
        
        {/* Role selection cards - each card represents a different user journey */}
        <div className="login-options">
          
          {/* Student/Peer Card - Emphasizes support and community */}
          <div 
            className="login-option-card student"
            onClick={() => handleRoleSelection('student')}
          >
            <span className="option-icon">🎓</span>
            <h3>Student & Peer Support</h3>
            <p>
              Access mental health resources, connect with trained peer supporters, 
              and track your personal wellness journey in a safe, confidential environment.
            </p>
            <button className="select-btn">Get Support →</button>
          </div>

          {/* Counselor Card - Focuses on professional tools and responsibilities */}
          <div 
            className="login-option-card counselor"
            onClick={() => handleRoleSelection('counselor')}
          >
            <span className="option-icon">🧠</span>
            <h3>Mental Health Professional</h3>
            <p>
              Access professional tools for managing student cases, responding to crisis 
              situations, and coordinating with campus mental health services.
            </p>
            <button className="select-btn">Professional Access →</button>
          </div>

          {/* Administrator Card - Emphasizes control and system management */}
          <div 
            className="login-option-card admin"
            onClick={() => handleRoleSelection('admin')}
          >
            <span className="option-icon">⚙️</span>
            <h3>Platform Administrator</h3>
            <p>
              Configure platform settings, manage university-specific resources, 
              view analytics dashboard, and customize the platform for your institution.
            </p>
            <button className="select-btn">Admin Portal →</button>
          </div>
        </div>

        {/* Navigation option to return to the main landing page */}
       <div className="back-link">
  <button 
    onClick={() => navigate('/')}
    className="back-button"
  >
    ← Back to Home
  </button>
</div>
      </div>
    </div>
  );
}

// This export statement is crucial - it tells React how to import this component
// The 'default' keyword means this is the primary export from this file
export default LoginSelection;