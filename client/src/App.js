import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import UnifiedLogin from './components/UnifiedLogin';
import StudentDashboard from './components/StudentDashboard';
import CounselorDashboard from './components/CounselorDashboard';
import AdminDashboard from './components/AdminDashboard';
import ChatComponent from './components/ChatComponent';

// LandingPage component - contains all your existing functionality
function LandingPage() {
  const navigate = useNavigate();
  
  // All your existing state variables
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [userIntent, setUserIntent] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // Fetch resources from your backend
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/resources`);
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        setResources(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Navigate to login page
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Filter resources based on search
  const filteredResources = resources.filter(resource => 
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle intent selection
  const handleIntentClick = (intent) => {
    setUserIntent(intent);
    
    switch(intent) {
      case 'immediate':
        const crisisResource = document.querySelector('.resource-card.high');
        if (crisisResource) {
          crisisResource.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      case 'explore':
        const resourcesSection = document.querySelector('.resources-section');
        if (resourcesSection) {
          resourcesSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'browsing':
        setShowWelcomeMessage(true);
        setTimeout(() => setShowWelcomeMessage(false), 5000);
        break;
      default:
        break;
    }
  };

  return (
    <div className="App">

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">MindBridge</div>
          <div className="nav-actions">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button 
              className="login-btn" 
              onClick={handleLoginClick}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your Mental Health Matters</h1>
          <p className="hero-subtitle">
            Access personalized support, connect with peers, and discover resources 
            tailored to your university community.
          </p>
          
          {/* User intent section */}
          <div className="user-intent-section">
            <p className="intent-prompt">How can we help you today?</p>
            <div className="intent-buttons">
              <button 
                className="intent-btn urgent"
                onClick={() => handleIntentClick('immediate')}
              >
                <span className="intent-icon">🚨</span>
                I need immediate help
              </button>
              <button 
                className="intent-btn explore"
                onClick={() => handleIntentClick('explore')}
              >
                <span className="intent-icon">🔍</span>
                I want to explore resources
              </button>
              <button 
                className="intent-btn browse"
                onClick={() => handleIntentClick('browsing')}
              >
                <span className="intent-icon">👋</span>
                Just looking around
              </button>
            </div>
            
            {showWelcomeMessage && (
              <div className="welcome-message">
                <p>Welcome! Take your time exploring. We're here when you're ready. 🌟</p>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="hero-cta">
            <button 
              className="cta-button primary"
              onClick={handleLoginClick}
            >
              Get Started
            </button>
            <p className="cta-subtext">Join thousands of students on their wellness journey</p>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="hero-decoration">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>
      </section>

      {/* Wave transition */}
      <div className="wave-container">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 C150,120 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" className="wave-path"></path>
        </svg>
      </div>

      {/* Features section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Supporting Your Mental Health Journey</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Personalized Support</h4>
              <p>AI-powered recommendations tailored to your specific needs and situation.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>Peer Connections</h4>
              <p>Connect with trained peer supporters who understand your journey.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏥</div>
              <h4>Professional Resources</h4>
              <p>Access to licensed counselors and mental health professionals.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h4>24/7 Availability</h4>
              <p>Support when you need it most, available around the clock.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources section */}
      <section className="resources-section">
        <div className="container">
          <h2 className="section-title">Mental Health Resources</h2>
          
          {/* Search functionality */}
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Resource cards */}
          <div className="resources-grid">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading resources...</p>
              </div>
            )}
            
            {error && (
              <div className="error-state">
                <p>Error loading resources: {error}</p>
              </div>
            )}
            
            {!loading && !error && filteredResources.length === 0 && searchTerm && (
              <div className="no-results">
                <p>No resources found for "{searchTerm}"</p>
                <p>Try adjusting your search terms or browse all resources.</p>
              </div>
            )}
            
            {!loading && !error && filteredResources.map(resource => (
              <div 
                key={resource.id} 
                className={`resource-card ${resource.urgency}`}
              >
                <div className="resource-header">
                  <h4>{resource.title}</h4>
                  <span className={`urgency-badge ${resource.urgency}`}>
                    {resource.urgency === 'high' && '🚨 Immediate'}
                    {resource.urgency === 'medium' && '⚡ Soon'}
                    {resource.urgency === 'low' && '💡 When Ready'}
                  </span>
                </div>
                <div className="resource-category">{resource.category}</div>
                <p className="resource-description">{resource.description}</p>
                {resource.phone && (
                  <a href={`tel:${resource.phone}`} className="resource-phone">
                    📞 {resource.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 MindBridge. Your privacy is protected.</p>
          <p className="footer-message">Help is always available. You are not alone.</p>
        </div>
      </footer>
    </div>
  );
}

// Simple, clean App component focused on routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UnifiedLogin />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/counselor" element={<CounselorDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/chat" element={<ChatComponent />} />
      </Routes>
    </Router>
  );
}

export default App;