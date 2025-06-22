import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// AdminLogin provides the highest level of access for platform administrators
// who need to configure institution settings, manage users, and access analytics.
// This interface emphasizes security, control, and system-level functionality.
function AdminLogin() {
  const navigate = useNavigate();
  
  // Complex form state for multi-step authentication process
  const [formData, setFormData] = useState({
    adminId: '',                    // High-level administrative identifier
    institutionCode: '',            // Ensures admin belongs to correct institution
    password: '',
    twoFactorCode: '',             // Enhanced security for administrators
    securityLevel: 'standard'       // Different admin access levels
  });

  // Multi-step authentication states
  const [currentStep, setCurrentStep] = useState(1); // 1: credentials, 2: two-factor
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [institutionVerified, setInstitutionVerified] = useState(false);

  // Enhanced input handler with step-aware validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors when user starts correcting input
    if (errorMessage) {
      setErrorMessage('');
    }
    
    // Special handling for institution code verification
    if (name === 'institutionCode') {
      // Simulate institution verification (in real app, this would be an API call)
      const validCodes = ['KPU-MAIN', 'KPU-SURREY', 'KPU-RICHMOND', 'KPU-TECH'];
      setInstitutionVerified(validCodes.includes(value.toUpperCase()));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Multi-step authentication handler
  const handleAuthenticationStep = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      // Step 1: Validate primary credentials
      if (!formData.adminId || !formData.institutionCode || !formData.password) {
        setErrorMessage('All administrative credentials are required for security verification.');
        return;
      }
      
      if (!institutionVerified) {
        setErrorMessage('Institution code not recognized. Please verify your institution identifier.');
        return;
      }
      
      setIsLoading(true);
      
      // Simulate credential verification delay
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep(2); // Move to two-factor authentication
        
        // In real application, this would send 2FA code to admin's device
        alert('Two-factor authentication code sent to your registered device. Enter the 6-digit code to complete login.');
      }, 1500);
      
    } else {
      // Step 2: Validate two-factor authentication
      if (!formData.twoFactorCode || formData.twoFactorCode.length !== 6) {
        setErrorMessage('Please enter the complete 6-digit authentication code.');
        return;
      }
      
      setIsLoading(true);
      
      // Simulate final authentication
      setTimeout(() => {
        setIsLoading(false);
        
        alert(`Administrator Access Granted!\n\nAdmin ID: ${formData.adminId}\nInstitution: ${formData.institutionCode}\nSecurity Level: ${formData.securityLevel}\n\nAccessing administrative dashboard...\n\nFull implementation in INFO 4290!`);
      }, 2000);
    }
  };

  // Function to restart authentication process if needed
  const resetAuthentication = () => {
    setCurrentStep(1);
    setFormData(prev => ({
      ...prev,
      twoFactorCode: ''
    }));
    setErrorMessage('');
  };

  return (
    <div className="login-page admin-theme">
      <div className="login-container admin-container">
        
        {/* Administrative header with security emphasis */}
        <div className="login-header">
          <span className="login-icon">⚙️</span>
          <h2>Platform Administrator Portal</h2>
          <p>
            Multi-factor authenticated access to system administration, 
            institutional configuration, and platform analytics.
          </p>
          
          {/* Step indicator for multi-step process */}
          <div className="auth-steps">
            <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Credentials</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Two-Factor Auth</span>
            </div>
          </div>
        </div>

        {/* Error display with enhanced styling for admin context */}
        {errorMessage && (
          <div className="error-message admin-error">
            <span className="error-icon">🔐</span>
            <p><strong>Security Alert:</strong> {errorMessage}</p>
          </div>
        )}

        {/* Multi-step authentication form */}
        <form onSubmit={handleAuthenticationStep} className="login-form admin-form">
          
          {currentStep === 1 && (
            // Step 1: Primary Credentials
            <>
              <div className="form-group">
                <label htmlFor="adminId">
                  Administrator ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="adminId"
                  name="adminId"
                  value={formData.adminId}
                  onChange={handleInputChange}
                  placeholder="Enter administrator identifier"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
                <small className="field-help">
                  Your unique system administrator identifier
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="institutionCode">
                  Institution Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="institutionCode"
                  name="institutionCode"
                  value={formData.institutionCode}
                  onChange={handleInputChange}
                  placeholder="e.g., KPU-MAIN"
                  required
                  disabled={isLoading}
                  style={{
                    borderColor: formData.institutionCode ? 
                      (institutionVerified ? '#48bb78' : '#f56565') : '#e2e8f0'
                  }}
                />
                <small className={`field-help ${institutionVerified ? 'verified' : ''}`}>
                  {institutionVerified ? 
                    '✅ Institution verified' : 
                    'Enter your institution identifier for verification'
                  }
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="securityLevel">Security Access Level</label>
                <select
                  id="securityLevel"
                  name="securityLevel"
                  value={formData.securityLevel}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="standard">Standard Administrator</option>
                  <option value="elevated">Elevated Administrator</option>
                  <option value="system">System Administrator</option>
                  <option value="super">Super Administrator</option>
                </select>
                <small className="field-help">
                  Determines available administrative functions and data access
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Administrator Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your secure administrator password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <small className="field-help">
                  Must meet enhanced security requirements for administrative access
                </small>
              </div>
            </>
          )}

          {currentStep === 2 && (
            // Step 2: Two-Factor Authentication
            <>
              <div className="two-factor-section">
                <h3>Two-Factor Authentication Required</h3>
                <p>
                  A 6-digit verification code has been sent to your registered security device. 
                  Enter the code below to complete authentication.
                </p>
                
                <div className="form-group two-factor-group">
                  <label htmlFor="twoFactorCode">
                    Authentication Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="twoFactorCode"
                    name="twoFactorCode"
                    value={formData.twoFactorCode}
                    onChange={handleInputChange}
                    placeholder="000000"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                    disabled={isLoading}
                    className="two-factor-input"
                    autoComplete="one-time-code"
                  />
                  <small className="field-help">
                    Enter the 6-digit code from your authenticator app or SMS
                  </small>
                </div>

                <div className="two-factor-help">
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={() => alert('New authentication code sent to your device')}
                  >
                    Resend Code
                  </button>
                  <span className="separator">•</span>
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={resetAuthentication}
                  >
                    Use Different Credentials
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Dynamic submit button based on current step */}
          <button 
            type="submit" 
            className="login-submit-btn admin-submit"
            disabled={isLoading || 
              (currentStep === 1 && (!formData.adminId || !formData.institutionCode || !formData.password)) ||
              (currentStep === 2 && formData.twoFactorCode.length !== 6)
            }
          >
            {isLoading ? 
              (currentStep === 1 ? 'Verifying Credentials...' : 'Authenticating Access...') :
              (currentStep === 1 ? 'Continue to Two-Factor Authentication' : 'Complete Administrator Login')
            }
          </button>
        </form>

        {/* Administrative tools preview */}
        <div className="admin-tools">
          <h4>Administrative Functions</h4>
          <p className="tools-description">
            High-level system management and institutional configuration
          </p>
          <div className="admin-tool-grid">
            <button 
              className="admin-tool-btn analytics"
              onClick={() => alert('Platform Analytics: Real-time usage statistics, student engagement metrics, and institutional insights')}
            >
              📊 Platform Analytics
            </button>
            <button 
              className="admin-tool-btn users"
              onClick={() => alert('User Management: Add/remove users, manage permissions, and configure access levels')}
            >
              👥 User Management
            </button>
            <button 
              className="admin-tool-btn config"
              onClick={() => alert('System Configuration: Customize platform features, branding, and institutional settings')}
            >
              🔧 System Configuration
            </button>
            <button 
              className="admin-tool-btn security"
              onClick={() => alert('Security Center: Monitor system security, review audit logs, and manage compliance')}
            >
              🛡️ Security Center
            </button>
          </div>
        </div>

        {/* Administrative footer with enhanced security information */}
        <div className="login-footer admin-footer">
          <div className="login-links">
            <a href="#security-settings">Security Settings</a>
            <span className="separator">•</span>
            <a href="#audit-logs">Audit Logs</a>
            <span className="separator">•</span>
            <a href="#system-status">System Status</a>
            <span className="separator">•</span>
            <a href="#emergency-contacts">Emergency Contacts</a>
          </div>
          
          <div className="security-notice admin-security">
            <p className="security-text">
              🔒 <strong>High Security Zone:</strong> All administrative actions are logged and monitored. 
              Unauthorized access attempts will be reported to security personnel.
            </p>
          </div>
          
          <div className="role-switch">
            <p>Need different access type?</p>
            <button 
              onClick={() => navigate('/login')} 
              className="back-btn admin-back"
            >
              Choose Different Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;