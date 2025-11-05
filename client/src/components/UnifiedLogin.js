import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// UnifiedLogin creates a single, intelligent authentication interface that adapts
// to different user types based on their credentials and input patterns.
function UnifiedLogin() {
  const navigate = useNavigate();

  // Core authentication state that works for all user types
  const [formData, setFormData] = useState({
    identifier: '',        // Can be email, employee ID, or admin ID
    password: '',
    rememberMe: false
  });

  // Dynamic form state that adapts based on detected user type
  const [userType, setUserType] = useState(null);           // Detected user category
  const [additionalFields, setAdditionalFields] = useState({}); // Type-specific fields
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Advanced state for multi-step authentication (when needed for admins)
  const [authStep, setAuthStep] = useState(1);

  // Password reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter code & new password
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [generatedCode, setGeneratedCode] = useState(''); // For development - shows the code

  // Institutionally-aware user type detection
  const detectUserType = (identifier) => {
    if (!identifier) return null;

    // KPU-specific student detection (including peer supporters)
    if (identifier.includes('@student.kpu.ca')) {
      return 'student';
    }

    // KPU employee detection - automatically set as counselor
    if (identifier.includes('@employee.kpu.ca') ||
        (identifier.includes('@kpu.ca') && !identifier.includes('@student.'))) {
      return 'counselor';
    }

    // Administrative access patterns
    if (identifier.toLowerCase().includes('admin') ||
        identifier.match(/^admin-\w+@kpu\.ca$/) ||
        identifier.includes('@admin.kpu.ca')) {
      return 'admin';
    }

    // Default to student for other patterns
    return 'student';
  };

  // Check if user is a peer supporter
  const isPeerSupporter = (identifier) => {
    return identifier && (
      identifier.toLowerCase().includes('peer') ||
      identifier.toLowerCase().includes('support')
    );
  };

  // Monitor identifier changes to detect user type
  useEffect(() => {
    const detectedType = detectUserType(formData.identifier);
    setUserType(detectedType);

    // Clear error when user changes input
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [formData.identifier, errorMessage]);

  // Handle all form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name in formData) {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      setAdditionalFields(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Main authentication handler
  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.identifier || !formData.password) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    // Type-specific validation
    if (userType === 'counselor' && !additionalFields.department) {
      setErrorMessage('Department selection is required for professional access.');
      return;
    }

    // Handle multi-step authentication for administrators
    if (userType === 'admin') {
      if (!additionalFields.institutionCode) {
        setErrorMessage('Institution code is required for administrative access.');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Make API call to your backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.identifier,
          password: formData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Store user data and JWT token in localStorage (for session management)
        localStorage.setItem('mindbridge_user', JSON.stringify(result.user));
        localStorage.setItem('mindbridge_token', result.token);

        // Navigate to appropriate dashboard
       const isPeer = isPeerSupporter(formData.identifier);

// Fix routing: peer supporters should use student dashboard with peer parameter
let dashboardType = result.user.userType;
if (dashboardType === 'peer_supporter') {
  dashboardType = 'student';
}

const dashboardPath = `/dashboard/${dashboardType}${isPeer ? '?peer=true' : ''}`;
        
        navigate(dashboardPath);
      } else {
        setErrorMessage(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Unable to connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset handlers
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedCode(result.resetCode || ''); // For development
        setResetMessage(result.message);
        setResetStep(2);
      } else {
        setResetError(result.error || 'Failed to generate reset code');
      }
    } catch (error) {
      setResetError('Unable to connect to server. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!resetCode || !newPassword || !confirmPassword) {
      setResetError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          resetCode: resetCode,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setResetMessage('Password reset successful! You can now log in with your new password.');
        setTimeout(() => {
          closeResetModal();
        }, 2000);
      } else {
        setResetError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setResetError('Unable to connect to server. Please try again.');
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetMessage('');
    setResetError('');
    setGeneratedCode('');
  };

  return (
    <div className="unified-login-page">
      <div className="unified-login-container">

        {/* Header with back navigation integrated */}
        <div className="login-header">
          <button
            className="back-btn"
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontSize: '14px',
              padding: '6px 12px'
            }}
          >
            ← Home
          </button>

          <h1 className="login-title">Welcome to MindBridge</h1>
          <p className="login-subtitle">
            Sign in to access your personalized mental health support platform
          </p>
        </div>

        {/* Error display */}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Main login form */}
        <form className="unified-login-form" onSubmit={handleLogin}>

          {/* User type indicator */}
          {userType && (
            <div className={`user-type-indicator ${userType}`}>
              {userType === 'student' && '🎓 Student Access'}
              {userType === 'counselor' && '🧠 Professional Access'}
              {userType === 'admin' && '⚙️ Administrative Access'}
            </div>
          )}

          {/* Universal identifier field */}
          <div className="form-group">
            <label htmlFor="identifier">Email or ID</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Enter your email or ID"
              required
              disabled={isLoading}
            />
            {formData.identifier && userType && (
              <small className="field-help">
                {userType === 'student' && !isPeerSupporter(formData.identifier) && 'Student account detected'}
                {userType === 'student' && isPeerSupporter(formData.identifier) && '🎓 Peer Supporter account detected'}
                {userType === 'counselor' && 'Professional account detected'}
                {userType === 'admin' && 'Administrative account detected'}
              </small>
            )}
          </div>

          {/* Department selection for counselors */}
          {userType === 'counselor' && (
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={additionalFields.department || ''}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select your department</option>
                <option value="counseling">Counseling Services</option>
                <option value="psychology">Psychology Department</option>
                <option value="health">Student Health Services</option>
                <option value="crisis">Crisis Intervention Team</option>
              </select>
            </div>
          )}

          {/* Administrative fields for step 1 of admin authentication */}
          {userType === 'admin' && authStep === 1 && (
            <div className="form-group">
              <label htmlFor="institutionCode">Institution Code</label>
              <input
                type="text"
                id="institutionCode"
                name="institutionCode"
                value={additionalFields.institutionCode || ''}
                onChange={handleInputChange}
                placeholder="e.g., KPU-MAIN"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Universal password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Remember me option for non-admin users */}
          {userType !== 'admin' && (
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe">Remember me on this device</label>
            </div>
          )}

          {/* Dynamic submit button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' :
             authStep === 2 ? 'Verify & Sign In' :
             'Sign In'}
          </button>

          {/* Help links */}
          <div className="login-links">
            <button
              type="button"
              className="link-button"
              onClick={() => setShowResetModal(true)}
            >
              Forgot password?
            </button>
            <span className="separator">•</span>
            <button
              type="button"
              className="link-button"
              onClick={() => alert('24/7 Support: Call 1-800-HELP or email support@mindbridge.ca')}
            >
              Need help?
            </button>
          </div>
        </form>

        {/* Footer with additional help */}
        <div className="login-footer">
          <div className="login-links">
            <button
              type="button"
              className="link-button"
              onClick={() => alert('Crisis Support: If you are in immediate danger, call 911 or go to your nearest emergency room.')}
            >
              Crisis Support
            </button>
            <span className="separator">•</span>
            <button
              type="button"
              className="link-button"
              onClick={() => alert('Technical Support: IT Help Desk - ext. 4357')}
            >
              Technical Support
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={closeResetModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{resetStep === 1 ? 'Reset Password' : 'Enter Reset Code'}</h2>
              <button className="modal-close" onClick={closeResetModal}>×</button>
            </div>

            <div className="modal-body">
              {resetMessage && (
                <div className="success-message" style={{
                  padding: '12px',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  {resetMessage}
                </div>
              )}

              {resetError && (
                <div className="error-message" style={{
                  padding: '12px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  {resetError}
                </div>
              )}

              {resetStep === 1 ? (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <input
                      type="email"
                      id="reset-email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your KPU email"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Generate Reset Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  {generatedCode && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      color: '#856404',
                      borderRadius: '4px',
                      marginBottom: '15px',
                      fontSize: '14px'
                    }}>
                      <strong>Development Mode:</strong> Your reset code is: <strong>{generatedCode}</strong>
                      <br />
                      <small>(In production, this would be sent via email)</small>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="reset-code">Reset Code</label>
                    <input
                      type="text"
                      id="reset-code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Reset Password
                  </button>

                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="btn-secondary"
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    Back
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedLogin;