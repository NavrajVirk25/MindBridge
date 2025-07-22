import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is a peer supporter from URL params
  const isPeerSupporter = new URLSearchParams(location.search).get('peer') === 'true';
  
  const [currentUser] = useState({
    name: isPeerSupporter ? 'Emma Chen' : 'Alex Johnson',
    email: isPeerSupporter ? 'peer.supporter@student.kpu.ca' : 'alex.johnson@student.kpu.ca',
    studentId: isPeerSupporter ? '100234567' : '100123456',
    program: isPeerSupporter ? 'Psychology' : 'Computer Science',
    year: '3rd Year',
    peerStatus: isPeerSupporter ? 'Certified Peer Supporter' : null
  });

  const [resources, setResources] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [currentMood, setCurrentMood] = useState('');
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Peer supporter specific state
  const [peerSessions, setPeerSessions] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [peerSchedule, setPeerSchedule] = useState([]);

  // Helper function to convert mood level (1-5) to text
  const convertMoodLevelToText = (level) => {
    const moodMap = {
      5: 'excellent',
      4: 'good', 
      3: 'okay',
      2: 'low',
      1: 'difficult'
    };
    return moodMap[level] || 'okay';
  };

  // Load dashboard data with real API integration
  const loadDashboardData = useCallback(async () => {
    // Load resources from backend
    try {
      const response = await fetch('http://localhost:5000/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data.data.slice(0, 4)); // Show first 4 resources
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    }

    // Load real user data from localStorage (from login)
    const userData = JSON.parse(localStorage.getItem('mindbridge_user') || '{}');
    const userId = userData.id || 1; // Fallback to user ID 1

    // Load real mood entries from API
    try {
      const moodResponse = await fetch(`http://localhost:5000/api/mood/${userId}`);
      if (moodResponse.ok) {
        const moodData = await moodResponse.json();
        // Convert API mood data to display format
        const formattedMoodEntries = moodData.data.map(entry => ({
          date: entry.created_at.split('T')[0], // Extract date from timestamp
          mood: convertMoodLevelToText(entry.mood_level), // Convert 1-5 to text
          note: entry.notes || 'No notes'
        }));
        setMoodEntries(formattedMoodEntries);
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
      // Keep mock data as fallback
      setMoodEntries([
        { date: '2025-07-01', mood: 'good', note: 'Had a great study session' },
        { date: '2025-06-30', mood: 'okay', note: 'Feeling a bit stressed about exams' }
      ]);
    }

    // Load real appointments from API
    try {
      const appointmentsResponse = await fetch(`http://localhost:5000/api/appointments/${userId}`);
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        // Convert API appointment data to display format
        const formattedAppointments = appointmentsData.data.map(appointment => ({
          id: appointment.id,
          date: appointment.appointment_date.split('T')[0], // Extract date
          time: new Date(appointment.appointment_date).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          type: 'Counseling Session',
          counselor: `${appointment.counselor_first_name} ${appointment.counselor_last_name}`,
          status: appointment.status
        }));
        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Keep mock data as fallback
      setAppointments([
        {
          id: 1,
          date: '2025-07-03',
          time: '2:00 PM',
          type: 'Counseling Session',
          counselor: 'Dr. Sarah Mitchell',
          status: 'confirmed'
        }
      ]);
    }

    // Load peer supporter specific data (keep as mock for now)
    if (isPeerSupporter) {
      // Mock peer sessions
      setPeerSessions([
        {
          id: 1,
          student: 'Marcus W.',
          date: '2025-07-03',
          time: '3:00 PM',
          duration: '45 minutes',
          type: 'Academic Stress',
          status: 'scheduled'
        },
        {
          id: 2,
          student: 'Sarah K.',
          date: '2025-07-02',
          time: '1:00 PM',
          duration: '30 minutes',
          type: 'Anxiety Support',
          status: 'completed'
        }
      ]);

      // Mock support requests
      setSupportRequests([
        {
          id: 1,
          student: 'Anonymous Student',
          request: 'Looking for someone to talk about exam anxiety',
          urgency: 'medium',
          timestamp: '2025-07-01 14:30',
          status: 'pending'
        },
        {
          id: 2,
          student: 'J.D.',
          request: 'Need support with time management and stress',
          urgency: 'low',
          timestamp: '2025-07-01 10:15',
          status: 'pending'
        }
      ]);

      // Mock peer schedule
      setPeerSchedule([
        { day: 'Monday', time: '2:00 PM - 4:00 PM', available: true },
        { day: 'Wednesday', time: '10:00 AM - 12:00 PM', available: true },
        { day: 'Friday', time: '1:00 PM - 3:00 PM', available: false }
      ]);
    }
  }, [isPeerSupporter]);

  // Load data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle mood submission with real API
  const handleMoodSubmit = async () => {
    if (currentMood) {
      const userData = JSON.parse(localStorage.getItem('mindbridge_user') || '{}');
      const userId = userData.id || 1;
      
      // Convert mood text to number for API
      const moodLevelMap = {
        'excellent': 5,
        'good': 4,
        'okay': 3,
        'low': 2,
        'difficult': 1
      };
      
      try {
        const response = await fetch('http://localhost:5000/api/mood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            moodLevel: moodLevelMap[currentMood],
            notes: `Mood logged via dashboard`
          })
        });
        
        if (response.ok) {
          // Refresh mood data after successful submission
          loadDashboardData();
          setCurrentMood('');
          setShowMoodTracker(false);
          alert('Mood logged successfully! 🌟');
        } else {
          alert('Failed to log mood. Please try again.');
        }
      } catch (error) {
        console.error('Error logging mood:', error);
        alert('Error logging mood. Please try again.');
      }
    }
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      'excellent': '😊',
      'good': '🙂',
      'okay': '😐',
      'low': '😔',
      'difficult': '😞'
    };
    return moodMap[mood] || '😐';
  };

  const handleLogout = () => {
    localStorage.removeItem('mindbridge_user');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">MindBridge</h1>
            <span className="user-role">Student Portal</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="welcome-text">Welcome back, {currentUser.name}! 👋</span>
              <div className="user-details">
                <span>{currentUser.program} • {currentUser.year}</span>
                {isPeerSupporter && (
                  <span className="peer-badge">• {currentUser.peerStatus}</span>
                )}
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'resources' ? 'active' : ''}`}
            onClick={() => setSelectedTab('resources')}
          >
            📚 Resources
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'mood' ? 'active' : ''}`}
            onClick={() => setSelectedTab('mood')}
          >
            💭 Mood Tracker
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setSelectedTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'support' ? 'active' : ''}`}
            onClick={() => setSelectedTab('support')}
          >
            {isPeerSupporter ? '🤝 Peer Support Hub' : '🤝 Peer Support'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <div className="dashboard-grid">
              
              {/* Quick Actions */}
              <div className="dashboard-card quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn primary"
                    onClick={() => setShowMoodTracker(true)}
                  >
                    😊 Log Today's Mood
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => setSelectedTab('appointments')}
                  >
                    📅 Book Appointment
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => setSelectedTab('support')}
                  >
                    🤝 Find Peer Support
                  </button>
                  <button className="action-btn emergency">
                    🚨 Crisis Support
                  </button>
                </div>
              </div>

              {/* Recent Mood */}
              <div className="dashboard-card mood-summary">
                <h3>How You've Been Feeling</h3>
                <div className="mood-trend">
                  {moodEntries.slice(0, 7).map((entry, index) => (
                    <div key={index} className="mood-day">
                      <span className="mood-emoji">{getMoodEmoji(entry.mood)}</span>
                      <span className="mood-date">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
                <p className="mood-insight">
                  You've been tracking your mood consistently! Keep it up! 🌟
                </p>
              </div>

              {/* Upcoming Appointments */}
              <div className="dashboard-card appointments-preview">
                <h3>Upcoming Appointments</h3>
                {appointments.length > 0 ? (
                  <div className="appointment-list">
                    {appointments.slice(0, 2).map(appointment => (
                      <div key={appointment.id} className="appointment-item">
                        <div className="appointment-info">
                          <span className="appointment-type">{appointment.type}</span>
                          <span className="appointment-time">{appointment.date} at {appointment.time}</span>
                          <span className="appointment-with">
                            with {appointment.counselor}
                          </span>
                        </div>
                        <span className={`appointment-status ${appointment.status}`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-appointments">No upcoming appointments. Would you like to schedule one?</p>
                )}
                <button 
                  className="view-all-btn"
                  onClick={() => setSelectedTab('appointments')}
                >
                  View All Appointments
                </button>
              </div>

              {/* Featured Resources */}
              <div className="dashboard-card featured-resources">
                <h3>Resources for You</h3>
                <div className="resource-list">
                  {resources.map(resource => (
                    <div key={resource.id} className="resource-item">
                      <span className={`resource-priority ${resource.urgency_level}`}>
                        {resource.urgency_level === 'high' && '🚨'}
                        {resource.urgency_level === 'medium' && '⚡'}
                        {resource.urgency_level === 'low' && '💡'}
                      </span>
                      <div className="resource-details">
                        <span className="resource-title">{resource.title}</span>
                        <span className="resource-category">{resource.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => setSelectedTab('resources')}
                >
                  Browse All Resources
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {selectedTab === 'resources' && (
          <div className="resources-content">
            <h2>Mental Health Resources</h2>
            <div className="resources-grid">
              {resources.map(resource => (
                <div key={resource.id} className={`resource-card ${resource.urgency_level}`}>
                  <div className="resource-header">
                    <h4>{resource.title}</h4>
                    <span className={`urgency-badge ${resource.urgency_level}`}>
                      {resource.urgency_level === 'high' && '🚨 Immediate'}
                      {resource.urgency_level === 'medium' && '⚡ Soon'}
                      {resource.urgency_level === 'low' && '💡 When Ready'}
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
        )}

        {/* Mood Tracker Tab */}
        {selectedTab === 'mood' && (
          <div className="mood-content">
            <div className="mood-header">
              <h2>Mood Tracker</h2>
              <button 
                className="add-mood-btn"
                onClick={() => setShowMoodTracker(true)}
              >
                + Log Today's Mood
              </button>
            </div>
            
            <div className="mood-history">
              <h3>Your Mood Journey</h3>
              <div className="mood-entries">
                {moodEntries.map((entry, index) => (
                  <div key={index} className="mood-entry">
                    <div className="mood-date">{new Date(entry.date).toLocaleDateString()}</div>
                    <div className="mood-display">
                      <span className="mood-emoji large">{getMoodEmoji(entry.mood)}</span>
                      <span className="mood-label">{entry.mood}</span>
                    </div>
                    {entry.note && <div className="mood-note">{entry.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {selectedTab === 'appointments' && (
          <div className="appointments-content">
            <div className="appointments-header">
              <h2>Appointments</h2>
              <button className="book-appointment-btn">
                + Book New Appointment
              </button>
            </div>
            
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-details">
                    <h4>{appointment.type}</h4>
                    <p className="appointment-datetime">
                      📅 {appointment.date} at {appointment.time}
                    </p>
                    <p className="appointment-provider">
                      👤 {appointment.counselor}
                    </p>
                  </div>
                  <div className="appointment-actions">
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                    <button className="action-btn small">Reschedule</button>
                    <button className="action-btn small secondary">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Peer Support Tab */}
        {selectedTab === 'support' && (
          <div className="support-content">
            {!isPeerSupporter ? (
              // Regular student peer support view
              <div>
                <h2>Peer Support Network</h2>
                
                <div className="support-options">
                  <div className="support-card">
                    <h3>🤝 Connect with Peer Supporters</h3>
                    <p>Chat with trained student volunteers who understand your experience.</p>
                    <button className="action-btn primary">Find Peer Support</button>
                  </div>
                  
                  <div className="support-card">
                    <h3>👥 Join Support Groups</h3>
                    <p>Participate in group sessions with other students facing similar challenges.</p>
                    <button className="action-btn secondary">Browse Groups</button>
                  </div>
                  
                  <div className="support-card">
                    <h3>💬 Anonymous Chat</h3>
                    <p>Get support through our confidential peer chat service.</p>
                    <button className="action-btn secondary">Start Anonymous Chat</button>
                  </div>
                </div>
              </div>
            ) : (
              // Peer supporter dashboard view
              <div>
                <h2>Peer Support Hub</h2>
                
                <div className="peer-dashboard-grid">
                  {/* Active Support Requests */}
                  <div className="dashboard-card support-requests">
                    <h3>Pending Support Requests</h3>
                    <div className="requests-list">
                      {supportRequests.filter(req => req.status === 'pending').map(request => (
                        <div key={request.id} className="request-item">
                          <div className="request-info">
                            <span className="request-student">{request.student}</span>
                            <span className="request-text">{request.request}</span>
                            <span className="request-time">{request.timestamp}</span>
                          </div>
                          <div className="request-actions">
                            <span className={`urgency-badge ${request.urgency}`}>
                              {request.urgency}
                            </span>
                            <button className="action-btn small primary">Accept</button>
                            <button className="action-btn small secondary">Forward</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Peer Sessions */}
                  <div className="dashboard-card peer-sessions">
                    <h3>Upcoming Sessions</h3>
                    <div className="sessions-list">
                      {peerSessions.filter(session => session.status === 'scheduled').map(session => (
                        <div key={session.id} className="session-item">
                          <div className="session-info">
                            <span className="session-student">{session.student}</span>
                            <span className="session-type">{session.type}</span>
                            <span className="session-time">{session.date} at {session.time}</span>
                            <span className="session-duration">Duration: {session.duration}</span>
                          </div>
                          <div className="session-actions">
                            <button className="action-btn small primary">Start Session</button>
                            <button className="action-btn small secondary">Reschedule</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peer Schedule */}
                  <div className="dashboard-card peer-schedule">
                    <h3>My Availability Schedule</h3>
                    <div className="schedule-list">
                      {peerSchedule.map((slot, index) => (
                        <div key={index} className="schedule-slot">
                          <span className="schedule-day">{slot.day}</span>
                          <span className="schedule-time">{slot.time}</span>
                          <span className={`availability-status ${slot.available ? 'available' : 'unavailable'}`}>
                            {slot.available ? '✓ Available' : '✗ Unavailable'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button className="action-btn secondary">Update Schedule</button>
                  </div>

                  {/* Peer Training & Resources */}
                  <div className="dashboard-card peer-training">
                    <h3>Training & Resources</h3>
                    <div className="training-items">
                      <div className="training-item">
                        <span className="training-title">Crisis Intervention Training</span>
                        <span className="training-status completed">✓ Completed</span>
                      </div>
                      <div className="training-item">
                        <span className="training-title">Active Listening Workshop</span>
                        <span className="training-status completed">✓ Completed</span>
                      </div>
                      <div className="training-item">
                        <span className="training-title">Quarterly Refresher</span>
                        <span className="training-status pending">⏳ Due July 15</span>
                      </div>
                    </div>
                    <button className="action-btn secondary">View All Training</button>
                  </div>

                  {/* Quick Actions for Peer Supporters */}
                  <div className="dashboard-card peer-actions">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                      <button className="action-btn primary">
                        📞 Start Emergency Consultation
                      </button>
                      <button className="action-btn secondary">
                        📝 Log Session Notes
                      </button>
                      <button className="action-btn secondary">
                        🚨 Escalate to Professional
                      </button>
                      <button className="action-btn secondary">
                        📚 Access Training Materials
                      </button>
                    </div>
                  </div>

                  {/* Session Statistics */}
                  <div className="dashboard-card peer-stats">
                    <h3>My Impact</h3>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-number">23</span>
                        <span className="stat-label">Sessions This Month</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">4.8</span>
                        <span className="stat-label">Average Rating</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">156</span>
                        <span className="stat-label">Total Sessions</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">12</span>
                        <span className="stat-label">Hours This Week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <div className="modal-overlay" onClick={() => setShowMoodTracker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>How are you feeling today?</h3>
              <button 
                className="close-btn"
                onClick={() => setShowMoodTracker(false)}
              >
                ×
              </button>
            </div>
            <div className="mood-options">
              {['excellent', 'good', 'okay', 'low', 'difficult'].map(mood => (
                <button
                  key={mood}
                  className={`mood-option ${currentMood === mood ? 'selected' : ''}`}
                  onClick={() => setCurrentMood(mood)}
                >
                  <span className="mood-emoji large">{getMoodEmoji(mood)}</span>
                  <span className="mood-label">{mood}</span>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button 
                className="action-btn primary"
                onClick={handleMoodSubmit}
                disabled={!currentMood}
              >
                Log Mood
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => setShowMoodTracker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;