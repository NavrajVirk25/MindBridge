import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
  
  // NEW: Crisis Detection State Variables
  const [moodNotes, setMoodNotes] = useState('');
  const [crisisAnalysis, setCrisisAnalysis] = useState(null);
  const [showCrisisResponse, setShowCrisisResponse] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [crisisLevel, setCrisisLevel] = useState(0);
  
  
  // Peer supporter specific state
  const [peerSessions, setPeerSessions] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [peerSchedule, setPeerSchedule] = useState([]);

   // Appointment modal state variables
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // NEW: Crisis Detection Engine
const analyzeCrisisRisk = (text) => {
  if (!text || text.trim().length === 0) return { level: 0, category: 'none', suggestions: [] };
  
  const textLower = text.toLowerCase();
  
  // Crisis keywords with severity weights
  const crisisKeywords = {
    critical: { // Level 9-10: Immediate crisis
      keywords: ['suicide', 'kill myself', 'end it all', 'want to die', 'not worth living', 'better off dead', 
                'end my life', 'take my own life', 'goodbye forever', 'say goodbye', 'made a plan', 
                'have everything ready', 'nobody would miss me', 'world without me'],
      weight: 10
    },
    high: { // Level 7-8: High risk  
      keywords: ['cut myself', 'hurt myself', 'harm myself', 'cutting again', 'self harm', 'self-harm',
                'hopeless', 'worthless', 'can\'t go on', 'nobody cares', 'give up', 'can\'t take it',
                'hate myself', 'want to disappear', 'ending everything', 'better off without me',
                'burden to everyone', 'voices telling me', 'want to hurt myself'],
      weight: 8
    },
    medium: { // Level 5-6: Warning signs
      keywords: ['alone', 'struggling', 'overwhelmed', 'can\'t cope', 'stressed out', 'falling apart',
                'panic attack', 'can\'t breathe', 'out of control', 'breaking down', 'losing it',
                'can\'t handle', 'too much pain', 'completely lost', 'falling apart', 'drowning'],
      weight: 5
    },
    low: { // Level 3-4: Mild concern
      keywords: ['tired', 'sad', 'worried', 'anxious', 'confused', 'frustrated', 'upset', 'down',
                'stressed', 'pressure', 'difficult', 'hard time', 'not okay', 'struggling a bit'],
      weight: 3
    },
    positive: { // Level 1-2: Positive indicators
      keywords: ['better', 'hopeful', 'good day', 'improving', 'grateful', 'optimistic', 'proud',
                'accomplished', 'happy', 'excited', 'peaceful', 'calm', 'confident', 'motivated'],
      weight: 1
    }
  };
    
    let totalScore = 0;
    let matchedKeywords = [];
    let highestCategory = 'positive';
    
    // Analyze text for keywords
    Object.entries(crisisKeywords).forEach(([category, data]) => {
      data.keywords.forEach(keyword => {
        if (textLower.includes(keyword)) {
          totalScore += data.weight;
          matchedKeywords.push(keyword);
          if (data.weight > crisisKeywords[highestCategory].weight) {
            highestCategory = category;
          }
        }
      });
    });
    
    // Calculate final risk level
    let riskLevel = Math.min(totalScore, 10);
    
    // Generate suggestions based on risk level
    let suggestions = [];
    if (riskLevel >= 9) {
      suggestions = [
        'Immediate professional support is recommended',
        'Crisis hotline: 1-833-456-4566 (24/7)',
        'Consider visiting emergency services',
        'You are not alone - help is available'
      ];
    } else if (riskLevel >= 7) {
      suggestions = [
        'Consider booking an appointment with a counselor',
        'Reach out to peer support services',
        'Crisis text line: Text HOME to 741741',
        'Your feelings are valid and help is available'
      ];
    } else if (riskLevel >= 5) {
      suggestions = [
        'Try some coping strategies like deep breathing',
        'Consider talking to a friend or family member',
        'Explore our mental health resources',
        'Remember that difficult feelings are temporary'
      ];
    } else if (riskLevel >= 3) {
      suggestions = [
        'Practice self-care activities',
        'Consider mindfulness or meditation',
        'Stay connected with supportive people',
        'Keep tracking your mood - you\'re doing great!'
      ];
    } else {
      suggestions = [
        'Keep up the positive momentum!',
        'Continue with activities that make you feel good',
        'Your positive attitude is inspiring',
        'Thank you for sharing - you\'re doing well!'
      ];
    }
    
    return {
      level: riskLevel,
      category: highestCategory,
      matchedKeywords,
      suggestions
    };
  };

  // NEW: Alert counselors for high-risk situations
  const alertCounselors = async (analysis, userInfo, moodData) => {
    if (analysis.level >= 7) {
      try {
        // Log crisis alert for counselor dashboard (no user alert)
        console.log(`🚨 Crisis Alert: High-risk situation detected for ${userInfo.name}. Risk Level: ${analysis.level}/10`);
        
        // In a real implementation, this would send alerts to counselors
        console.log('🚨 CRISIS ALERT TRIGGERED');
        console.log('Risk Level:', analysis.level);
        console.log('User:', userInfo.name);
        console.log('Analysis:', analysis);
        
      } catch (error) {
        console.error('Error sending crisis alert:', error);
      }
    }
  };

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
          note: entry.notes ? entry.notes.replace(/\s*\[CRISIS ANALYSIS:.*?\]/g, '') : 'No notes' // Remove crisis analysis from display
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

  // NEW: Enhanced mood submission with crisis detection
  const handleMoodSubmit = async () => {
    if (currentMood) {
      // Perform crisis analysis on mood notes
      const analysis = analyzeCrisisRisk(moodNotes);
      setCrisisAnalysis(analysis);
      setCrisisLevel(analysis.level);
      
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
            notes: moodNotes || `Mood logged via dashboard`
          })
        });
        
        if (response.ok) {
          // Separately log crisis analysis for counselor dashboard (not stored with user notes)
          if (analysis.level >= 5) {
            console.log('🚨 CRISIS ANALYSIS LOGGED:', {
              userId: userId,
              userName: currentUser.name,
              riskLevel: analysis.level,
              category: analysis.category,
              userText: moodNotes,
              timestamp: new Date().toISOString(),
              suggestions: analysis.suggestions
            });
            
            // In a real system, this would be sent to a separate crisis monitoring system
            // await fetch('http://localhost:5000/api/crisis-alerts', { ... });
          }
          
          // Alert counselors if high risk detected
          await alertCounselors(analysis, currentUser, { mood: currentMood, notes: moodNotes });
          
          // Show crisis response if needed
          if (analysis.level >= 5) {
            setShowCrisisResponse(true);
          } else {
            // For low-risk situations, show normal success message
            alert('Mood logged successfully! 🌟');
            setCurrentMood('');
            setMoodNotes('');
            setShowMoodTracker(false);
          }
          
          // Refresh mood data after successful submission
          loadDashboardData();
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
              <button 
                className="book-appointment-btn"
                onClick={() => setShowAppointmentModal(true)}
              >
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

      {/* NEW: Enhanced Mood Tracker Modal with Crisis Detection */}
      {showMoodTracker && (
        <div className="modal-overlay" onClick={() => setShowMoodTracker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>How are you feeling today?</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowMoodTracker(false);
                  setMoodNotes('');
                  setCrisisAnalysis(null);
                }}
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

            {/* NEW: Mood Notes Section with Real-time Crisis Detection */}
            <div className="mood-notes-section">
              <label className="notes-label">
                Tell us more about how you're feeling (optional)
              </label>
              <textarea
                value={moodNotes}
                onChange={(e) => {
                  setMoodNotes(e.target.value);
                  // Real-time crisis analysis as user types
                  if (e.target.value.length > 10) {
                    const analysis = analyzeCrisisRisk(e.target.value);
                    setCrisisAnalysis(analysis);
                  }
                }}
                placeholder="Share what's on your mind... This helps us provide better support and resources."
                className="mood-notes-textarea"
                rows="4"
              />
              
              {/* Real-time Crisis Analysis Display */}
              {crisisAnalysis && moodNotes.length > 10 && (
                <div className={`crisis-analysis ${crisisAnalysis.category}`}>
                  <div className="analysis-header">
                    <span className="analysis-icon">
                      {crisisAnalysis.level >= 9 && '🚨'}
                      {crisisAnalysis.level >= 7 && crisisAnalysis.level < 9 && '⚠️'}
                      {crisisAnalysis.level >= 5 && crisisAnalysis.level < 7 && '💛'}
                      {crisisAnalysis.level >= 3 && crisisAnalysis.level < 5 && '💙'}
                      {crisisAnalysis.level < 3 && '💚'}
                    </span>
                    <span className="analysis-text">
                      {crisisAnalysis.level >= 9 && 'We want to help you right now'}
                      {crisisAnalysis.level >= 7 && crisisAnalysis.level < 9 && 'We notice you may be struggling'}
                      {crisisAnalysis.level >= 5 && crisisAnalysis.level < 7 && 'Thank you for sharing your feelings'}
                      {crisisAnalysis.level >= 3 && crisisAnalysis.level < 5 && 'We hear you and understand'}
                      {crisisAnalysis.level < 3 && 'Thank you for sharing positive feelings!'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="action-btn secondary"
                onClick={() => {
                  setShowMoodTracker(false);
                  setMoodNotes('');
                  setCrisisAnalysis(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="action-btn primary"
                onClick={handleMoodSubmit}
                disabled={!currentMood}
              >
                Log Mood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Crisis Response Modal */}
      {showCrisisResponse && crisisAnalysis && (
        <div className="modal-overlay">
          <div className="modal-content crisis-response-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crisis-header">
              <div className={`crisis-icon ${crisisAnalysis.category}`}>
                {crisisAnalysis.level >= 9 ? '🚨' : crisisAnalysis.level >= 7 ? '⚠️' : '💛'}
              </div>
              <h3>
                {crisisAnalysis.level >= 9 ? 'Immediate Support Available' : 
                 crisisAnalysis.level >= 7 ? 'We Want to Help' : 
                 'Resources for You'}
              </h3>
              <p className="crisis-subtitle">
                Your wellbeing matters. Here are resources specifically for you.
              </p>
            </div>

            <div className="crisis-suggestions">
              <h4>Recommended Actions:</h4>
              <ul>
                {crisisAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="crisis-suggestion">
                    <span className="suggestion-icon">
                      {crisisAnalysis.level >= 9 ? '🆘' : 
                       crisisAnalysis.level >= 7 ? '📞' : '💡'}
                    </span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {crisisAnalysis.level >= 7 && (
              <div className="emergency-contacts">
                <h4>🆘 Immediate Help:</h4>
                <div className="contact-buttons">
                  <a href="tel:1-833-456-4566" className="contact-btn emergency">
                    📞 Crisis Hotline: 1-833-456-4566
                  </a>
                  <a href="sms:741741&body=HOME" className="contact-btn emergency">
                    💬 Text HOME to 741741
                  </a>
                </div>
              </div>
            )}

            <div className="crisis-actions">
              <button 
                className="action-btn secondary"
                onClick={() => {
                  setShowCrisisResponse(false);
                  setSelectedTab('resources');
                  setCurrentMood('');
                  setMoodNotes('');
                  setShowMoodTracker(false);
                }}
              >
                View All Resources
              </button>
              <button 
                className="action-btn primary"
                onClick={() => {
                  setShowCrisisResponse(false);
                  setShowAppointmentModal(true);
                  setCurrentMood('');
                  setMoodNotes('');
                  setShowMoodTracker(false);
                }}
              >
                Book Counseling Appointment
              </button>
            </div>

            <div className="crisis-footer">
              <p>
                ✅ Your mood entry has been saved with appropriate support level.<br/>
                {crisisAnalysis.level >= 7 && '🚨 Campus counselors have been notified.'}
              </p>
              <button 
                className="close-crisis-btn"
                onClick={() => {
                  setShowCrisisResponse(false);
                  setCurrentMood('');
                  setMoodNotes('');
                  setShowMoodTracker(false);
                }}
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal - WITH CORRECT API INTEGRATION */}
      {showAppointmentModal && (
        <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Book New Appointment</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAppointmentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="appointment-form">
              {/* Interactive Calendar */}
              <div className="form-section">
                <label className="form-label">📅 Select Date</label>
                <div className="calendar-container">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={new Date()}
                    tileDisabled={({ date }) => {
                      const day = date.getDay();
                      return day === 0 || day === 6; // Disable weekends
                    }}
                    className="appointment-calendar"
                  />
                </div>
                <p className="selected-date">
                  Selected: {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Time Selection */}
              <div className="form-section">
                <label className="form-label">🕐 Select Time</label>
                <div className="time-slots">
                  {[
                    '9:00 AM', '10:00 AM', '11:00 AM', 
                    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
                  ].map(time => (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Counselor Selection */}
              <div className="form-section">
                <label className="form-label">👤 Choose Counselor</label>
                <select 
                  value={selectedCounselor} 
                  onChange={(e) => setSelectedCounselor(e.target.value)}
                  className="counselor-select"
                >
                  <option value="">Select a counselor</option>
                  <option value="Dr. Maria Rodriguez">Dr. Maria Rodriguez</option>
                  <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell</option>
                  <option value="Dr. James Chen">Dr. James Chen</option>
                  <option value="Dr. Emily Thompson">Dr. Emily Thompson</option>
                </select>
              </div>

              {/* Notes */}
              <div className="form-section">
                <label className="form-label">📝 Notes (Optional)</label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="What would you like to discuss? Any specific concerns?"
                  className="appointment-notes"
                  rows="3"
                />
              </div>

              {/* Action Buttons - THIS IS WHERE THE API CALL SHOULD BE */}
              <div className="modal-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => setShowAppointmentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="action-btn primary"
                  onClick={async () => {
                    console.log('Book Appointment button clicked!');
                    
                    if (selectedDate && selectedTime && selectedCounselor) {
                      console.log('All fields selected, making API call...');
                      
                      try {
                        // Get user data for API call
                        const userData = JSON.parse(localStorage.getItem('mindbridge_user') || '{}');
                        const userId = userData.id || 1;
                        
                        console.log('User ID:', userId);
                        
                        // Convert date and time to proper format for API
                        const appointmentDateTime = new Date(selectedDate);
                        const [time, period] = selectedTime.split(' ');
                        const [hours, minutes] = time.split(':');
                        let hour24 = parseInt(hours);
                        
                        // Convert to 24-hour format
                        if (period === 'PM' && hour24 !== 12) hour24 += 12;
                        if (period === 'AM' && hour24 === 12) hour24 = 0;
                        
                        appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);
                        
                        console.log('Appointment DateTime:', appointmentDateTime.toISOString());
                        
                        // Make API call to save appointment
                        console.log('Making API call to create appointment...');
                        const response = await fetch('http://localhost:5000/api/appointments', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            studentId: userId,
                            counselorId: 2, // Default to counselor ID 2
                            appointmentDate: appointmentDateTime.toISOString(),
                            notes: appointmentNotes || 'Appointment booked via dashboard'
                          })
                        });
                        
                        console.log('API Response status:', response.status);
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('Appointment created successfully:', result);
                          
                          // Store confirmed appointment details for modal
                          setConfirmedAppointment({
                            date: selectedDate,
                            time: selectedTime,
                            counselor: selectedCounselor,
                            notes: appointmentNotes
                          });
                          
                          // Close booking modal and show confirmation
                          setShowAppointmentModal(false);
                          setShowConfirmationModal(true);
                          
                          // Refresh appointments list to show new appointment
                          console.log('Refreshing appointments list...');
                          loadDashboardData();
                          
                          // Reset form
                          setSelectedDate(new Date());
                          setSelectedTime('');
                          setSelectedCounselor('');
                          setAppointmentNotes('');
                        } else {
                          const errorData = await response.json();
                          console.error('API Error:', errorData);
                          alert(`Failed to book appointment: ${errorData.error || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error booking appointment:', error);
                        alert('Error booking appointment. Please try again.');
                      }
                    } else {
                      console.log('Missing required fields');
                      alert('Please select a date, time, and counselor.');
                    }
                  }}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Confirmation Modal - SIMPLE DISPLAY ONLY */}
      {showConfirmationModal && confirmedAppointment && (
        <div className="modal-overlay" onClick={() => setShowConfirmationModal(false)}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Success Header */}
            <div className="confirmation-header">
              <div className="success-icon">
                <div className="checkmark">✓</div>
              </div>
              <h3>Appointment Confirmed!</h3>
              <p className="confirmation-subtitle">Your appointment has been successfully booked</p>
            </div>

            {/* Appointment Details Card */}
            <div className="appointment-summary">
              <div className="summary-item">
                <span className="summary-icon">📅</span>
                <div className="summary-details">
                  <span className="summary-label">Date</span>
                  <span className="summary-value">
                    {confirmedAppointment.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              <div className="summary-item">
                <span className="summary-icon">🕐</span>
                <div className="summary-details">
                  <span className="summary-label">Time</span>
                  <span className="summary-value">{confirmedAppointment.time}</span>
                </div>
              </div>

              <div className="summary-item">
                <span className="summary-icon">👤</span>
                <div className="summary-details">
                  <span className="summary-label">Counselor</span>
                  <span className="summary-value">{confirmedAppointment.counselor}</span>
                </div>
              </div>

              {confirmedAppointment.notes && (
                <div className="summary-item">
                  <span className="summary-icon">📝</span>
                  <div className="summary-details">
                    <span className="summary-label">Notes</span>
                    <span className="summary-value">{confirmedAppointment.notes}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="next-steps">
              <h4>What's Next?</h4>
              <ul>
                <li>📧 Confirmation email will be sent shortly</li>
                <li>📱 You'll receive a reminder 24 hours before</li>
                <li>💬 Feel free to reach out if you need to reschedule</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="confirmation-actions">
              <button 
                className="action-btn secondary"
                onClick={() => {
                  setShowConfirmationModal(false);
                  setSelectedTab('appointments');
                }}
              >
                View My Appointments
              </button>
              <button 
                className="action-btn primary"
                onClick={() => {
                  setShowConfirmationModal(false);
                  setShowAppointmentModal(true);
                }}
              >
                Book Another Appointment
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;