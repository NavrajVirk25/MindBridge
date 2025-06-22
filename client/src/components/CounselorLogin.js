import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// CounselorLogin serves mental health professionals who need secure access
// to student records, crisis management tools, and professional resources.
// The interface emphasizes security, efficiency, and professional workflows.
function CounselorLogin() {
  const navigate = useNavigate();
  
  // Form state management using controlled components
  // Notice how we're tracking more specialized information for professionals
  const [formData, setFormData] = useState({
    employeeId: '',           // Professional identifier rather than personal email
    password: '',
    department: '',           // Helps with access control and resource routing
    workstation: 'shared'     // Important for security in shared office environments
  });

  // Loading state to provide professional-feeling feedback
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state to demonstrate professional error handling
  const [errorMessage, setErrorMessage] = useState('');

  // Enhanced input handler that includes validation feedback
  // Professional interfaces often need immediate validation to prevent errors
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear any existing error when user starts correcting input
    if (errorMessage) {
      setErrorMessage('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Simulated professional authentication with enhanced security considerations
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation to demonstrate professional form requirements
    if (!formData.employeeId || !formData.department) {
      setErrorMessage('Employee ID and Department are required for security compliance.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    // Simulate authentication delay with professional messaging
    setTimeout(() => {
      setIsLoading(false);
      
      // In a real application, this would validate credentials against
      // professional databases and establish secure session tokens
      alert(`Professional Access Granted!\n\nEmployee: ${formData.employeeId}\nDepartment: ${formData.department}\nWorkstation: ${formData.workstation}\n\nFull implementation coming in INFO 4290!`);
    }, 2000); // Slightly longer delay to simulate security checks
  };

  return (
    <div className="login-page counselor-theme">
      <div className="login-container">
        
        {/* Professional header with security emphasis */}
        <div className="login-header">
          <span className="login-icon">🧠</span>
          <h2>Mental Health Professional Portal</h2>
          <p>
            Secure access to student records, crisis management tools, and professional resources. 
            All activities are logged for compliance and security.
          </p>
        </div>

        {/* Error display for immediate feedback */}
        {errorMessage && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Professional authentication form */}
        <form onSubmit={handleLogin} className="login-form professional-form">
          
          {/* Employee ID field - more formal than email for professionals */}
          <div className="form-group">
            <label htmlFor="employeeId">
              Employee ID <span className="required">*</span>
            </label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="Enter your university employee ID"
              required
              disabled={isLoading}
              // Professional forms often include additional attributes for security
              autoComplete="username"
            />
            <small className="field-help">
              Your official university employee identification number
            </small>
          </div>

          {/* Department selection for access control and routing */}
          <div className="form-group">
            <label htmlFor="department">
              Department <span className="required">*</span>
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select your department</option>
              <option value="counseling">Counseling & Psychological Services</option>
              <option value="wellness">Student Wellness Center</option>
              <option value="accessibility">Accessibility Services</option>
              <option value="health">Student Health Services</option>
              <option value="crisis">Crisis Intervention Team</option>
              <option value="academic">Academic Support Services</option>
            </select>
            <small className="field-help">
              Determines your access level and available resources
            </small>
          </div>

          {/* Secure password field */}
          <div className="form-group">
            <label htmlFor="password">
              Secure Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your secure password"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
            <small className="field-help">
              Passwords must meet university security requirements
            </small>
          </div>

          {/* Workstation type for security logging */}
          <div className="form-group">
            <label htmlFor="workstation">Workstation Type</label>
            <select
              id="workstation"
              name="workstation"
              value={formData.workstation}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="shared">Shared/Public Computer</option>
              <option value="personal">Personal/Private Computer</option>
              <option value="office">Secure Office Computer</option>
            </select>
            <small className="field-help">
              Affects session timeout and security settings
            </small>
          </div>

          {/* Professional submit button with enhanced messaging */}
          <button 
            type="submit" 
            className="login-submit-btn professional-submit"
            disabled={isLoading || !formData.employeeId || !formData.department}
          >
            {isLoading ? 'Authenticating Professional Access...' : 'Access Professional Dashboard'}
          </button>
        </form>

        {/* Quick access tools for professionals */}
        <div className="professional-tools">
          <h4>Quick Access Tools</h4>
          <p className="tools-description">
            Access critical functions even before full authentication
          </p>
          <div className="tool-buttons">
            <button 
              className="tool-btn crisis-btn"
              onClick={() => alert('Crisis Dashboard: Monitor active crisis situations and emergency protocols')}
            >
              🚨 Crisis Dashboard
            </button>
            <button 
              className="tool-btn calendar-btn"
              onClick={() => alert('Professional Calendar: View appointments, scheduling, and availability')}
            >
              📅 Today\'s Schedule
            </button>
            <button 
              className="tool-btn resources-btn"
              onClick={() => alert('Professional Resources: Clinical guidelines, referral networks, and protocols')}
            >
              📋 Clinical Resources
            </button>
          </div>
        </div>

        {/* Professional footer with security and support information */}
        <div className="login-footer professional-footer">
          <div className="login-links">
            <a href="#credential-reset">Reset Credentials</a>
            <span className="separator">•</span>
            <a href="#security-training">Security Training</a>
            <span className="separator">•</span>
            <a href="#it-support">IT Support Desk</a>
          </div>
          
          <div className="security-notice">
            <p className="security-text">
              🔒 This is a secure system. All access is monitored and logged for compliance.
            </p>
          </div>
          
          <div className="role-switch">
            <p>Need different access level?</p>
            <button 
              onClick={() => navigate('/login')} 
              className="back-btn"
            >
              Choose Different Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CounselorLogin;