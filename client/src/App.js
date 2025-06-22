import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import UnifiedLogin from './components/UnifiedLogin';

// This component contains all your existing landing page functionality
// We've extracted it from App so that App can focus on routing
function LandingPage() {
  // useNavigate is a hook that gives us the ability to programmatically change pages
  // Think of it as a remote control for navigation
  const navigate = useNavigate();
  
  // All your existing state variables remain exactly the same
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [userIntent, setUserIntent] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // Your existing useEffect for fetching resources - unchanged
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/resources');
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


  // Your existing useEffect for dark mode - unchanged
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // MODIFIED: This function now navigates to the login page instead of showing a message
  const handleLoginClick = () => {
    navigate('/login'); // This is the key change - we navigate instead of showing a message
  };

  // Your existing filter logic - unchanged
  const filteredResources = resources.filter(resource => 
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Your existing intent handler - unchanged
  const handleIntentClick = (intent) => {
    setUserIntent(intent);
    
    switch(intent) {
      case 'immediate':
        const crisisResource = document.querySelector('.resource-card.high');
        if (crisisResource) {
          crisisResource.scrollIntoView({ behavior: 'smooth', block: 'center' });
          crisisResource.style.boxShadow = '0 0 20px rgba(245, 101, 101, 0.5)';
          setTimeout(() => {
            crisisResource.style.boxShadow = '';
          }, 2000);
        }
        break;
        
      case 'explore':
        const resourcesSection = document.querySelector('.resources-section');
        if (resourcesSection) {
          resourcesSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
        
      case 'looking':
        setShowWelcomeMessage(true);
        setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 4000);
        break;
        
      default:
        break;
    }
  };

  // Your entire existing return statement - completely unchanged except for removing the login message
  return (
    <div className="App">
      {/* Hero Section */}
      <section className="hero-section">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo">MindBridge</h1>
            <div className="nav-actions">
              {/* Dark Mode Toggle */}
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

        <div className="hero-content">
          <h2 className="hero-title">
            Your Mental Health Journey Starts Here
          </h2>
          <p className="hero-subtitle">
            A safe space for university students to find support, resources, and community
          </p>
          
           {/* Add this new call-to-action button */}
  <div className="hero-cta">
    <button 
      className="cta-button primary"
      onClick={handleLoginClick}
    >
      Get Started
    </button>
    <p className="cta-subtext">
      Join thousands of students taking control of their mental wellness
    </p>
  </div>
          {/* Removed the login message since we now have actual navigation */}
          
          {/* Interactive user intent section */}
          <div className="user-intent-section">
            <p className="intent-prompt">What brings you to MindBridge today?</p>
            <div className="intent-buttons">
              <button 
                className="intent-btn urgent"
                onClick={() => handleIntentClick('immediate')}
              >
                <span className="intent-icon">🆘</span>
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
                onClick={() => handleIntentClick('looking')}
              >
                <span className="intent-icon">👋</span>
                Just looking around
              </button>
            </div>
            
            {/* Welcome message for "just looking" users */}
            {showWelcomeMessage && (
              <div className="welcome-message">
                <p>Welcome! Take your time exploring. We're here whenever you're ready. 💜</p>
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="hero-decoration">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
        </div>

        {/* Wave transition */}
        <div className="wave-container">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,40 C150,90 350,0 600,50 C850,100 1050,10 1200,40 L1200,120 L0,120 Z"
                  className="wave-path">
            </path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h3 className="section-title">How MindBridge Supports You</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h4>Peer Support</h4>
              <p>Connect with fellow students who understand your journey</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h4>AI-Powered Guidance</h4>
              <p>Get personalized resource recommendations when you need them</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h4>Curated Resources</h4>
              <p>Access mental health resources tailored to student life</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Private & Secure</h4>
              <p>Your mental health journey remains confidential</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="resources-section">
        <div className="container">
          <h3 className="section-title">Available Resources</h3>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search resources by title, category, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading resources...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Unable to load resources. Please try again later.</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredResources.length === 0 && searchTerm && (
                <div className="no-results">
                  <p>No resources found for "{searchTerm}"</p>
                  <p>Try different keywords or browse all resources</p>
                </div>
              )}
              
              <div className="resources-grid">
                {filteredResources.map(resource => (
                  <div key={resource.id} className={`resource-card ${resource.urgency}`}>
                    <div className="resource-header">
                      <h4>{resource.title}</h4>
                      <span className={`urgency-badge ${resource.urgency}`}>
                        {resource.urgency === 'high' ? 'Immediate Help' : 
                         resource.urgency === 'medium' ? 'Professional Support' : 
                         'Self-Help'}
                      </span>
                    </div>
                    <p className="resource-category">{resource.category}</p>
                    <p className="resource-description">{resource.description}</p>
                    {resource.phone && (
                      <a href={`tel:${resource.phone}`} className="resource-phone">
                        📞 {resource.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2024 MindBridge - Supporting Student Mental Health</p>
          <p className="footer-message">Remember: It's okay to not be okay. Help is always available.</p>
        </div>
      </footer>
    </div>
  );
}

// The App component now serves as the routing controller
// It decides which component to show based on the current URL
function App() {
  return (
    <Router>
      <Routes>
        {/* When users visit the root URL ("/"), show the LandingPage */}
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<UnifiedLogin />} />
      </Routes>
    </Router>
  );
}

export default App;