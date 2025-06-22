import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// The StudentLogin component creates a safe, welcoming entry point for students
// and peer supporters. The design emphasizes accessibility and immediate support options.
function StudentLogin() {
  const navigate = useNavigate();
  
  // State management for form data using React's controlled component pattern
  // This approach gives us complete control over form behavior and validation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Loading state to provide feedback during form submission
  // Even though we're not implementing real authentication, showing loading
  // states demonstrates professional user experience design
  const [isLoading, setIsLoading] = useState(false);

  // This function handles all input changes in a centralized way
  // The destructuring extracts exactly the properties we need from the event
  // This pattern scales well as forms become more complex
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      // Use 'checked' for checkboxes, 'value' for everything else
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Simulated login process that demonstrates proper async handling
  // In INFO 4290, this function would make real API calls to authenticate users
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from causing page refresh
    setIsLoading(true);
    
    // Simulate network delay to show loading state in action
    setTimeout(() => {
      setIsLoading(false);
      alert('Student dashboard will be implemented in INFO 4290! Your login data was: ' + 
            JSON.stringify(formData, null, 2));
    }, 1500);
  };

  return (
    <div className="login-page student-theme">
      <div className="login-container">
        
        {/* Header that welcomes students with supportive messaging */}
        <div className="login-header">
          <span className="login-icon">🎓</span>
          <h2>Student & Peer Support Access</h2>
          <p>
            Welcome back! Your mental health journey continues here. 
            We're glad you're taking care of yourself.
          </p>
        </div>

        {/* Login form using controlled components for all inputs */}
        <form onSubmit={handleLogin} className="login-form">
          
          {/* Email input with university-specific placeholder */}
          <div className="form-group">
            <label htmlFor="email">University Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@kpu.ca"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password input with security considerations */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your secure password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Remember me checkbox to show attention to user convenience */}
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe">Keep me signed in on this device</label>
          </div>

          {/* Submit button with loading state and encouraging language */}
          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting to your dashboard...' : 'Access My Support Dashboard'}
          </button>
        </form>

        {/* Emergency access section - crucial for mental health platforms */}
        {/* This shows that help is available even without full login */}
        <div className="emergency-access">
          <h4>Need immediate support?</h4>
          <div className="emergency-buttons">
            <button 
              className="emergency-btn crisis"
              onClick={() => alert('Crisis support hotline: 1-800-273-8255')}
            >
              🆘 Crisis Support
            </button>
            <button 
              className="emergency-btn peer"
              onClick={() => alert('Connecting to available peer supporter...')}
            >
              💬 Connect with Peer
            </button>
          </div>
          <p className="emergency-note">
            These services are available 24/7, even without logging in.
          </p>
        </div>

        {/* Footer with helpful links and role switching option */}
        <div className="login-footer">
          <div className="login-links">
            <a href="#forgot-password">Forgot Password?</a>
            <span className="separator">•</span>
            <a href="#create-account">Create Account</a>
            <span className="separator">•</span>
            <a href="#accessibility">Accessibility Options</a>
          </div>
          
          <div className="role-switch">
            <p>Not a student?</p>
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

export default StudentLogin;