import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// UnifiedLogin creates a single, intelligent authentication interface that adapts
// to different user types based on their credentials and input patterns.
// This approach reduces cognitive load and provides a more professional experience.
function UnifiedLogin() {
  const navigate = useNavigate();
  
  // Core authentication state that works for all user types
  // This forms the foundation of our form data management
  const [formData, setFormData] = useState({
    identifier: '',        // Can be email, employee ID, or admin ID
    password: '',
    rememberMe: false
  });

  // Dynamic form state that adapts based on detected user type
  // These state variables control how the form behaves and what fields appear
  const [userType, setUserType] = useState(null);           // Detected user category
  const [additionalFields, setAdditionalFields] = useState({}); // Type-specific fields
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Advanced state for multi-step authentication (when needed for admins)
  const [authStep, setAuthStep] = useState(1);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // State for handling manual role selection when automatic detection is ambiguous
  // This is crucial for handling KPU employees who need role clarification
  const [manualRoleSelection, setManualRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Institutionally-aware user type detection that works with real university email systems
  // This demonstrates how MindBridge can be customized for specific institutional deployments
  const detectUserType = (identifier) => {
    if (!identifier) return null;
    
    // KPU-specific student detection using the actual institutional domain structure
    // This pattern would be configurable for different university deployments
    if (identifier.includes('@student.kpu.ca')) {
      return 'student';
    }
    
    // KPU employee detection - but we need to distinguish between different types of employees
    // Mental health professionals would still be employees, so we need additional logic
    if (identifier.includes('@employee.kpu.ca')) {
      // For demonstration purposes, we'll assume that employees need role clarification
      // In a real deployment, you might integrate with HR systems or department directories
      // to automatically determine if someone is a mental health professional
      return 'employee'; // This will trigger our role clarification interface
    }
    
    // Administrative access patterns - these might use special administrative domains
    // or specific identifier formats that indicate system administration roles
    if (identifier.toLowerCase().includes('admin') || 
        identifier.match(/^admin-\w+@kpu\.ca$/) ||
        identifier.includes('@admin.kpu.ca')) {
      return 'admin';
    }
    
    // Legacy or alternative email patterns - some institutions maintain multiple formats
    // during transition periods or for specific use cases
    if (identifier.includes('@kpu.ca') && !identifier.includes('@student.') && !identifier.includes('@employee.')) {
      // This might be a legacy format or special case that needs manual clarification
      return 'legacy';
    }
    
    // External or non-institutional access - this could be for guest counselors,
    // contractors, or other special cases that need administrative approval
    if (identifier.includes('@') && !identifier.includes('kpu.ca')) {
      return 'external';
    }
    
    // Non-email identifiers - these might be employee numbers, student IDs, or other
    // institutional identifiers that need additional context
    if (!identifier.includes('@')) {
      return 'institutional-id';
    }
    
    return null;
  };

  // Dynamic input handler that adapts the form based on user input
  // This function demonstrates sophisticated state management for complex forms
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear any existing error messages when user starts making changes
    if (errorMessage) setErrorMessage('');
    
    // Handle identifier input with intelligent user type detection
    if (name === 'identifier') {
      // Detect user type as they type their identifier
      const detectedType = detectUserType(value);
      
      // Handle the ambiguous employee case where we need role clarification
      if (detectedType === 'employee' || detectedType === 'legacy') {
        setManualRoleSelection(true);
        setUserType(detectedType); // Set to employee/legacy to show the context message
        setSelectedRole(null); // Clear any previous role selection
      } else {
        setManualRoleSelection(false);
        setUserType(detectedType);
        setSelectedRole(null);
      }
      
      // Reset additional fields when user type changes
      // This ensures clean state transitions between different user types
      if (detectedType !== userType) {
        setAdditionalFields({});
        setAuthStep(1);
      }
    }
    
    // Handle manual role selection for employees who need clarification
    // This creates a smooth transition from ambiguous detection to specific role selection
    if (name === 'roleSelection') {
      setSelectedRole(value);
      setUserType(value); // Update the user type to the selected role
      setManualRoleSelection(false); // Hide the role selection interface
    }
    
    // Handle both main form data and additional fields
    // This pattern allows us to manage complex form state efficiently
    if (['identifier', 'password', 'rememberMe'].includes(name)) {
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

  // Unified authentication handler that adapts based on user type
  // This demonstrates how a single function can handle multiple authentication flows
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation that applies to all user types
    if (!formData.identifier || !formData.password) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }
    
    // Type-specific validation based on the user's role
    if ((userType === 'counselor' || selectedRole === 'counselor') && !additionalFields.department) {
      setErrorMessage('Department selection is required for professional access.');
      return;
    }
    
    // Handle multi-step authentication for administrators
    if (userType === 'admin') {
      if (authStep === 1) {
        // First step of admin authentication
        if (!additionalFields.institutionCode) {
          setErrorMessage('Institution code is required for administrative access.');
          return;
        }
        
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          setAuthStep(2);
          alert('Two-factor authentication required. Please enter the verification code sent to your device.');
        }, 1500);
        return;
      } else {
        // Second step: two-factor authentication
        if (!additionalFields.twoFactorCode || additionalFields.twoFactorCode.length !== 6) {
          setErrorMessage('Please enter the complete 6-digit verification code.');
          return;
        }
      }
    }
    
    setIsLoading(true);
    
    // Simulate authentication process with type-specific messaging
    // In a real application, this would make API calls to authenticate users
    setTimeout(() => {
      setIsLoading(false);
      
      const userTypeNames = {
        student: 'Student Dashboard',
        counselor: 'Professional Portal',
        admin: 'Administrative Console',
        'other-staff': 'Staff Portal'
      };
      
      // Use selectedRole if available, otherwise fall back to userType
      const finalUserType = selectedRole || userType;
      const dashboardName = userTypeNames[finalUserType] || 'Platform Dashboard';
      
      alert(`Authentication Successful!\n\nAccessing ${dashboardName}...\n\nUser Type: ${finalUserType}\nIdentifier: ${formData.identifier}\n\nFull implementation coming in INFO 4290!`);
    }, 2000);
  };

  return (
    <div className="unified-login-page">
      <div className="unified-login-container">
        
        {/* Clean, professional header that builds trust and sets expectations */}
        <div className="login-header">
          <h1 className="login-title">Welcome to MindBridge</h1>
          <p className="login-subtitle">
            Sign in to access your personalized mental health support platform
          </p>
        </div>

        {/* Error display with clean styling that provides helpful feedback */}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Unified authentication form that adapts based on user type */}
        <form onSubmit={handleLogin} className="unified-login-form">
          
          {/* Universal identifier field that works for all user types */}
          <div className="form-group">
            <label htmlFor="identifier">Email or ID</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Enter your email, employee ID, or admin identifier"
              required
              disabled={isLoading}
              className="identifier-input"
            />
            
            {/* Enhanced user type indication with institutional context */}
            {/* This provides immediate feedback about what the system understands */}
            {userType && (
              <div className="user-type-indication">
                {userType === 'student' && (
                  <div className="context-message student-context">
                    <span className="context-icon">🎓</span>
                    <div className="context-text">
                      <strong>KPU Student Access Detected</strong>
                      <p>You'll have access to peer support, wellness resources, and crisis intervention tools.</p>
                    </div>
                  </div>
                )}
                
                {userType === 'employee' && (
                  <div className="context-message employee-context">
                    <span className="context-icon">👔</span>
                    <div className="context-text">
                      <strong>KPU Employee Access Detected</strong>
                      <p>Please specify your role to access the appropriate professional tools and resources.</p>
                    </div>
                  </div>
                )}
                
                {userType === 'admin' && (
                  <div className="context-message admin-context">
                    <span className="context-icon">⚙️</span>
                    <div className="context-text">
                      <strong>Administrative Access Detected</strong>
                      <p>You'll have access to platform configuration, analytics, and institutional management tools.</p>
                    </div>
                  </div>
                )}
                
                {userType === 'legacy' && (
                  <div className="context-message legacy-context">
                    <span className="context-icon">📧</span>
                    <div className="context-text">
                      <strong>Alternative KPU Email Format</strong>
                      <p>Please clarify your role to ensure you receive the appropriate access level.</p>
                    </div>
                  </div>
                )}
                
                {userType === 'external' && (
                  <div className="context-message external-context">
                    <span className="context-icon">🌐</span>
                    <div className="context-text">
                      <strong>External Access</strong>
                      <p>External access requires pre-authorization. Contact IT support if you should have access.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* KPU-specific role clarification for employee access */}
          {/* This appears when the system needs clarification about an employee's specific role */}
          {(userType === 'employee' || userType === 'legacy') && manualRoleSelection && (
            <div className="role-clarification kpu-employee">
              <label>Select your role at KPU:</label>
              <div className="role-selection-buttons">
                <button
                  type="button"
                  className={`role-select-btn ${selectedRole === 'counselor' ? 'selected' : ''}`}
                  onClick={() => handleInputChange({target: {name: 'roleSelection', value: 'counselor'}})}
                >
                  <div className="role-title">Mental Health Professional</div>
                  <div className="role-description">Counseling Services, Wellness Center, Crisis Team</div>
                </button>
                <button
                  type="button"
                  className={`role-select-btn ${selectedRole === 'student' ? 'selected' : ''}`}
                  onClick={() => handleInputChange({target: {name: 'roleSelection', value: 'student'}})}
                >
                  <div className="role-title">Student Employee or Peer Supporter</div>
                  <div className="role-description">Work-study, research assistant, trained peer supporter</div>
                </button>
                <button
                  type="button"
                  className={`role-select-btn ${selectedRole === 'other-staff' ? 'selected' : ''}`}
                  onClick={() => handleInputChange({target: {name: 'roleSelection', value: 'other-staff'}})}
                >
                  <div className="role-title">Other KPU Staff</div>
                  <div className="role-description">Academic, administrative, or support staff</div>
                </button>
              </div>
              <small className="clarification-help">
                This ensures you see the tools and resources relevant to your role at KPU
              </small>
            </div>
          )}

          {/* Conditional fields that appear based on detected or selected user type */}
          {/* Department selection for mental health professionals */}
          {(userType === 'counselor' || selectedRole === 'counselor') && (
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
                <option value="counseling">Counseling & Psychological Services</option>
                <option value="wellness">Student Wellness Center</option>
                <option value="accessibility">Accessibility Services</option>
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

          {/* Two-factor authentication for step 2 of admin authentication */}
          {userType === 'admin' && authStep === 2 && (
            <div className="form-group">
              <label htmlFor="twoFactorCode">Verification Code</label>
              <input
                type="text"
                id="twoFactorCode"
                name="twoFactorCode"
                value={additionalFields.twoFactorCode || ''}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
                disabled={isLoading}
              />
              <small className="field-help">
                Enter the verification code sent to your registered device
              </small>
            </div>
          )}

          {/* Universal password field that everyone needs */}
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
          {/* Admins typically shouldn't have persistent sessions for security reasons */}
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

          {/* Dynamic submit button that adapts to context */}
          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 
              (userType === 'admin' && authStep === 1 ? 'Verifying...' : 'Signing In...') :
              (userType === 'admin' && authStep === 1 ? 'Continue' : 'Sign In')
            }
          </button>
        </form>

        {/* Quick access for emergency situations (context-aware) */}
        {/* This appears only for students who might need immediate crisis support */}
        {(userType === 'student' || selectedRole === 'student') && (
          <div className="emergency-access">
            <p>Need immediate support?</p>
            <button 
              className="emergency-btn"
              onClick={() => alert('Connecting to crisis support services...')}
            >
              Crisis Support Available 24/7
            </button>
          </div>
        )}

        {/* Clean footer without overwhelming options */}
        <div className="login-footer">
          <div className="login-links">
            <button 
              type="button"
              className="link-button"
              onClick={() => alert('Password reset functionality coming in INFO 4290')}
            >
              Forgot Password?
            </button>
            <span className="separator">•</span>
            <button 
              type="button"
              className="link-button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              Advanced Options
            </button>
          </div>
          
          {/* Progressive disclosure of advanced options */}
          {showAdvancedOptions && (
            <div className="advanced-options">
              <button 
                type="button"
                className="link-button"
                onClick={() => alert('Accessibility options would be configured here')}
              >
                Accessibility Settings
              </button>
              <button 
                type="button"
                className="link-button"
                onClick={() => alert('Alternative login methods would be available here')}
              >
                Alternative Login
              </button>
            </div>
          )}
          
          <div className="back-navigation">
            <button 
              onClick={() => navigate('/')} 
              className="back-btn"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedLogin;