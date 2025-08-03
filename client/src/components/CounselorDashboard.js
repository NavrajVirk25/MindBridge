import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CounselorDashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState({
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@employee.kpu.ca',
    employeeId: 'EMP-2145',
    department: 'Counseling Services',
    title: 'Licensed Mental Health Counselor'
  });

  const [selectedTab, setSelectedTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [crisisAlerts, setCrisisAlerts] = useState([]);
  const [resources, setResources] = useState([]);
  const [crisisAnalytics, setCrisisAnalytics] = useState({});

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Enhanced crisis alerts with AI detection data
    setCrisisAlerts([
  {
    id: 1,
    student: 'Alex Johnson',
    studentId: '100123456',
    riskLevel: 9,
    category: 'critical',
    timestamp: '2025-08-02 16:59:04',
    status: 'active',
    text: 'I can\'t handle this anymore. Everything feels hopeless and I just want the pain to stop. Nobody would miss me anyway.',
    aiAnalysis: {
      keywords: ['can\'t handle', 'hopeless', 'want pain to stop', 'nobody would miss me'],
      sentiment: 'critical_distress',
      confidence: 94
    },
    counselorAssigned: 'Dr. Sarah Mitchell',
    actionTaken: 'pending',
    priority: 'critical'
  },
  {
    id: 2,
    student: 'Emma Chen',
    studentId: '100234567',
    riskLevel: 7,
    category: 'high',
    timestamp: '2025-08-02 14:30:22',
    status: 'addressed',
    text: 'I feel completely overwhelmed with midterms coming up. Having panic attacks daily and can\'t sleep. Starting to think about dropping out.',
    aiAnalysis: {
      keywords: ['completely overwhelmed', 'panic attacks', 'can\'t sleep', 'dropping out'],
      sentiment: 'severe_stress',
      confidence: 89
    },
    counselorAssigned: 'Dr. Sarah Mitchell',
    actionTaken: 'appointment_scheduled',
    priority: 'high'
  },
  {
    id: 3,
    student: 'Marcus Williams',
    studentId: '100345679',
    riskLevel: 8,
    category: 'high',
    timestamp: '2025-08-02 11:15:33',
    status: 'monitoring',
    text: 'Been having thoughts about ending everything. My family would be better off without me. I\'m just a burden to everyone.',
    aiAnalysis: {
      keywords: ['ending everything', 'better off without me', 'burden to everyone'],
      sentiment: 'suicidal_ideation',
      confidence: 96
    },
    counselorAssigned: 'Dr. James Chen',
    actionTaken: 'emergency_contact_made',
    priority: 'critical'
  },
  {
    id: 4,
    student: 'Priya Sharma',
    studentId: '100456780',
    riskLevel: 6,
    category: 'medium',
    timestamp: '2025-08-02 09:45:12',
    status: 'addressed',
    text: 'Really struggling with loneliness since moving away from home. Feel disconnected from everyone and constantly sad.',
    aiAnalysis: {
      keywords: ['struggling', 'loneliness', 'disconnected', 'constantly sad'],
      sentiment: 'depressive_symptoms',
      confidence: 78
    },
    counselorAssigned: 'Dr. Emily Thompson',
    actionTaken: 'follow_up_scheduled',
    priority: 'high'
  },
  {
    id: 5,
    student: 'Jordan Blake',
    studentId: '100567891',
    riskLevel: 8,
    category: 'high',
    timestamp: '2025-08-01 22:30:15',
    status: 'resolved',
    text: 'I hate myself so much. Cut myself again tonight. The voices in my head won\'t stop telling me I\'m worthless.',
    aiAnalysis: {
      keywords: ['hate myself', 'cut myself', 'voices in my head', 'worthless'],
      sentiment: 'self_harm_psychosis',
      confidence: 92
    },
    counselorAssigned: 'Dr. Sarah Mitchell',
    actionTaken: 'emergency_intervention_completed',
    priority: 'critical'
  },
  {
    id: 6,
    student: 'Taylor Kim',
    studentId: '100678902',
    riskLevel: 5,
    category: 'medium',
    timestamp: '2025-08-01 16:20:33',
    status: 'addressed',
    text: 'Feeling really anxious about my future. Sometimes wonder if things will ever get better. Having trouble eating.',
    aiAnalysis: {
      keywords: ['really anxious', 'wonder if things will get better', 'trouble eating'],
      sentiment: 'anxiety_depression',
      confidence: 71
    },
    counselorAssigned: 'Dr. Maria Rodriguez',
    actionTaken: 'resource_package_sent',
    priority: 'medium'
  },
  {
    id: 7,
    student: 'Sam Rodriguez',
    studentId: '100789013',
    riskLevel: 9,
    category: 'critical',
    timestamp: '2025-08-01 13:45:28',
    status: 'resolved',
    text: 'Made a plan to end my life tonight. Have everything ready. Just wanted to say goodbye to someone.',
    aiAnalysis: {
      keywords: ['plan to end my life', 'have everything ready', 'say goodbye'],
      sentiment: 'imminent_suicide_risk',
      confidence: 98
    },
    counselorAssigned: 'Dr. James Chen',
    actionTaken: 'emergency_services_contacted',
    priority: 'critical'
  },
  {
    id: 8,
    student: 'Aisha Patel',
    studentId: '100890124',
    riskLevel: 6,
    category: 'medium',
    timestamp: '2025-08-01 11:10:45',
    status: 'monitoring',
    text: 'Panic attacks are getting worse. Can\'t focus on anything. Starting to isolate myself from friends.',
    aiAnalysis: {
      keywords: ['panic attacks getting worse', 'can\'t focus', 'isolate myself'],
      sentiment: 'escalating_anxiety',
      confidence: 84
    },
    counselorAssigned: 'Dr. Emily Thompson',
    actionTaken: 'weekly_check_ins_scheduled',
    priority: 'high'
  }
]);

// Enhanced crisis analytics data for more realistic presentation
setCrisisAnalytics({
  totalDetections: 47,
  todayDetections: 8,
  avgResponseTime: '8 minutes',
  successfulInterventions: 96.2,
  trendData: [
    { date: '2025-07-26', low: 12, medium: 6, high: 4, critical: 1 },
    { date: '2025-07-27', low: 15, medium: 4, high: 2, critical: 0 },
    { date: '2025-07-28', low: 18, medium: 8, high: 3, critical: 2 },
    { date: '2025-07-29', low: 14, medium: 7, high: 1, critical: 1 },
    { date: '2025-07-30', low: 16, medium: 9, high: 4, critical: 1 },
    { date: '2025-08-01', low: 20, medium: 11, high: 5, critical: 2 },
    { date: '2025-08-02', low: 22, medium: 13, high: 6, critical: 3 }
  ],
  riskDistribution: {
    low: 58,
    medium: 28,
    high: 11,
    critical: 3
  }
});

    // Mock student cases
    setStudents([
      {
        id: 1,
        name: 'Alex Johnson',
        studentId: '100123456',
        lastSession: '2025-06-28',
        nextSession: '2025-07-03',
        priority: 'urgent',
        notes: 'Recent crisis alert - requires immediate attention',
        program: 'Computer Science',
        riskLevel: 8,
        totalSessions: 12
      },
      {
        id: 2,
        name: 'Emma Chen',
        studentId: '100234567',
        lastSession: '2025-06-30',
        nextSession: '2025-07-05',
        priority: 'high',
        notes: 'Follow-up on stress management - showing improvement',
        program: 'Business Administration',
        riskLevel: 6,
        totalSessions: 8
      },
      {
        id: 3,
        name: 'Marcus Williams',
        studentId: '100345678',
        lastSession: '2025-06-25',
        nextSession: '2025-07-02',
        priority: 'low',
        notes: 'Stable progress, monthly check-ins',
        program: 'Engineering',
        riskLevel: 2,
        totalSessions: 15
      }
    ]);

    // Mock appointments
    setAppointments([
      {
        id: 1,
        student: 'Alex Johnson',
        studentId: '100123456',
        date: '2025-07-03',
        time: '2:00 PM',
        type: 'Crisis Intervention',
        duration: '50 minutes',
        status: 'urgent',
        notes: 'Emergency session - high risk assessment',
        riskLevel: 8
      },
      {
        id: 2,
        student: 'Emma Chen',
        studentId: '100234567',
        date: '2025-07-03',
        time: '3:30 PM',
        type: 'Follow-up Session',
        duration: '30 minutes',
        status: 'confirmed',
        notes: 'Progress review and coping strategies',
        riskLevel: 6
      },
      {
        id: 3,
        student: 'Marcus Williams',
        studentId: '100345678',
        date: '2025-07-02',
        time: '10:00 AM',
        type: 'Regular Check-in',
        duration: '30 minutes',
        status: 'confirmed',
        notes: 'Monthly wellness check',
        riskLevel: 2
      }
    ]);

    // Load resources from backend
    fetch('http://localhost:5000/api/resources')
      .then(response => response.json())
      .then(data => setResources(data.data))
      .catch(error => console.error('Error loading resources:', error));
  };

  const handleLogout = () => {
    navigate('/');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#e53e3e',
      urgent: '#e53e3e',
      high: '#d69e2e', 
      medium: '#ecc94b',
      low: '#48bb78'
    };
    return colors[priority] || '#718096';
  };

  const getRiskColor = (level) => {
    if (level >= 9) return '#e53e3e'; // Critical - Red
    if (level >= 7) return '#d69e2e'; // High - Orange  
    if (level >= 5) return '#ecc94b'; // Medium - Yellow
    return '#48bb78'; // Low - Green
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: '#e53e3e', text: 'Needs Attention', icon: '🚨' },
      addressed: { color: '#d69e2e', text: 'In Progress', icon: '⏳' },
      monitoring: { color: '#4299e1', text: 'Monitoring', icon: '👁️' },
      resolved: { color: '#48bb78', text: 'Resolved', icon: '✅' }
    };
    return statusConfig[status] || statusConfig.active;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">MindBridge</h1>
            <span className="user-role">Professional Portal</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="welcome-text">Welcome back, {currentUser.name}! 👩‍⚕️</span>
              <div className="user-details">
                <span>{currentUser.department} • {currentUser.title}</span>
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
            className={`nav-tab ${selectedTab === 'students' ? 'active' : ''}`}
            onClick={() => setSelectedTab('students')}
          >
            👥 Student Cases
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setSelectedTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'crisis' ? 'active' : ''}`}
            onClick={() => setSelectedTab('crisis')}
          >
            🚨 Crisis Analytics
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'resources' ? 'active' : ''}`}
            onClick={() => setSelectedTab('resources')}
          >
            📚 Resources
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <div className="dashboard-grid">
              
              {/* Quick Stats */}
              <div className="dashboard-card stats-card">
                <h3>Today's Overview</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">5</span>
                    <span className="stat-label">Appointments Today</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">12</span>
                    <span className="stat-label">Active Cases</span>
                  </div>
                  <div className="stat-item urgent">
                    <span className="stat-number">{crisisAnalytics.todayDetections}</span>
                    <span className="stat-label">Crisis Alerts Today</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{crisisAnalytics.avgResponseTime}</span>
                    <span className="stat-label">Avg Response Time</span>
                  </div>
                </div>
              </div>

              {/* Urgent Actions */}
              <div className="dashboard-card urgent-actions">
                <h3>🚨 Urgent Crisis Alerts</h3>
                <div className="urgent-list">
                  {crisisAlerts.filter(alert => alert.status === 'active').map(alert => (
                    <div key={alert.id} className="urgent-item crisis-urgent">
                      <div className="urgent-info">
                        <div className="crisis-header-mini">
                          <div 
                            className="risk-indicator-mini" 
                            style={{ backgroundColor: getRiskColor(alert.riskLevel) }}
                          >
                            {alert.riskLevel}
                          </div>
                          <div className="urgent-details">
                            <span className="urgent-student">{alert.student}</span>
                            <span className="urgent-type">AI Risk: {alert.category}</span>
                            <span className="urgent-time">{alert.timestamp}</span>
                          </div>
                        </div>
                        <div className="crisis-text-mini">"{alert.text}"</div>
                      </div>
                      <button className="action-btn emergency small">
                        Address Now
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => setSelectedTab('crisis')}
                >
                  View Crisis Analytics
                </button>
              </div>

              {/* Today's Schedule */}
              <div className="dashboard-card schedule-preview">
                <h3>Today's Schedule</h3>
                <div className="schedule-list">
                  {appointments.filter(apt => apt.date === '2025-07-03').map(appointment => (
                    <div key={appointment.id} className="schedule-item">
                      <div className="schedule-time">{appointment.time}</div>
                      <div className="schedule-details">
                        <span className="schedule-student">{appointment.student}</span>
                        <span className="schedule-type">{appointment.type}</span>
                        {appointment.riskLevel >= 7 && (
                          <span className="risk-badge" style={{ backgroundColor: getRiskColor(appointment.riskLevel) }}>
                            Risk: {appointment.riskLevel}
                          </span>
                        )}
                      </div>
                      <span className={`appointment-status ${appointment.status}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => setSelectedTab('appointments')}
                >
                  View Full Calendar
                </button>
              </div>

              {/* Crisis Analytics Preview */}
              <div className="dashboard-card crisis-analytics-preview">
                <h3>Crisis Detection Analytics</h3>
                <div className="analytics-summary">
                  <div className="analytics-stat">
                    <span className="analytics-number">{crisisAnalytics.successfulInterventions}%</span>
                    <span className="analytics-label">Success Rate</span>
                  </div>
                  <div className="analytics-stat">
                    <span className="analytics-number">{crisisAnalytics.totalDetections}</span>
                    <span className="analytics-label">This Week</span>
                  </div>
                </div>
                <div className="risk-distribution-mini">
                  <h4>Risk Distribution</h4>
                  {Object.entries(crisisAnalytics.riskDistribution || {}).map(([level, percentage]) => (
                    <div key={level} className="risk-bar-mini">
                      <span className="risk-label-mini">{level}</span>
                      <div className="risk-bar-container">
                        <div 
                          className={`risk-bar-fill ${level}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="risk-percentage">{percentage}%</span>
                    </div>
                  ))}
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => setSelectedTab('crisis')}
                >
                  View Full Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Cases Tab */}
        {selectedTab === 'students' && (
          <div className="students-content">
            <div className="students-header">
              <h2>Student Case Management</h2>
              <button className="action-btn primary">
                + Add New Case
              </button>
            </div>
            
            <div className="students-grid">
              {students.map(student => (
                <div key={student.id} className="student-card">
                  <div className="student-header">
                    <div className="student-info">
                      <h4>{student.name}</h4>
                      <span className="student-id">ID: {student.studentId}</span>
                      <span className="student-program">{student.program}</span>
                    </div>
                    <div className="student-badges">
                      <div 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(student.priority) }}
                      >
                        {student.priority}
                      </div>
                      <div 
                        className="risk-badge-student"
                        style={{ backgroundColor: getRiskColor(student.riskLevel) }}
                      >
                        Risk: {student.riskLevel}
                      </div>
                    </div>
                  </div>
                  
                  <div className="student-details">
                    <div className="detail-item">
                      <span className="detail-label">Last Session:</span>
                      <span className="detail-value">{student.lastSession}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Next Session:</span>
                      <span className="detail-value">{student.nextSession}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Sessions:</span>
                      <span className="detail-value">{student.totalSessions}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{student.notes}</span>
                    </div>
                  </div>
                  
                  <div className="student-actions">
                    <button className="action-btn secondary small">View File</button>
                    <button className="action-btn secondary small">Schedule</button>
                    <button className="action-btn primary small">Contact</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {selectedTab === 'appointments' && (
          <div className="appointments-content">
            <div className="appointments-header">
              <h2>Appointment Calendar</h2>
              <button className="action-btn primary">
                + Schedule Appointment
              </button>
            </div>
            
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-details">
                    <div className="appointment-header">
                      <h4>{appointment.type}</h4>
                      {appointment.riskLevel >= 7 && (
                        <div 
                          className="risk-indicator-appointment"
                          style={{ backgroundColor: getRiskColor(appointment.riskLevel) }}
                        >
                          Risk {appointment.riskLevel}
                        </div>
                      )}
                    </div>
                    <p className="appointment-datetime">
                      📅 {appointment.date} at {appointment.time}
                    </p>
                    <p className="appointment-student">
                      👤 {appointment.student} (ID: {appointment.studentId})
                    </p>
                    <p className="appointment-duration">
                      ⏱️ Duration: {appointment.duration}
                    </p>
                    {appointment.notes && (
                      <p className="appointment-notes">
                        📝 {appointment.notes}
                      </p>
                    )}
                  </div>
                  <div className="appointment-actions">
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                    <button className="action-btn small secondary">Edit</button>
                    <button className="action-btn small primary">Start Session</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crisis Analytics Tab - Enhanced */}
        {selectedTab === 'crisis' && (
          <div className="crisis-analytics-content">
            {/* Crisis Analytics Header */}
            <div className="crisis-analytics-header">
              <h2>🚨 AI-Powered Crisis Detection & Analytics</h2>
              <div className="crisis-stats-header">
                <div className="crisis-stat-item">
                  <span className="crisis-stat-number">{crisisAlerts.filter(alert => alert.status === 'active').length}</span>
                  <span className="crisis-stat-label">Active Alerts</span>
                </div>
                <div className="crisis-stat-item">
                  <span className="crisis-stat-number">{crisisAnalytics.todayDetections}</span>
                  <span className="crisis-stat-label">Today's Detections</span>
                </div>
                <div className="crisis-stat-item">
                  <span className="crisis-stat-number">{crisisAnalytics.avgResponseTime}</span>
                  <span className="crisis-stat-label">Avg Response</span>
                </div>
                <div className="crisis-stat-item">
                  <span className="crisis-stat-number">{crisisAnalytics.successfulInterventions}%</span>
                  <span className="crisis-stat-label">Success Rate</span>
                </div>
              </div>
            </div>

            <div className="crisis-analytics-grid">
              {/* Active Crisis Alerts */}
              <div className="crisis-alerts-section">
                <div className="section-header">
                  <h3>🚨 Active Crisis Alerts</h3>
                  <span className="alert-count">{crisisAlerts.filter(alert => alert.status === 'active').length} Active</span>
                </div>
                
                <div className="crisis-alerts-list">
                  {crisisAlerts.map(alert => {
                    const status = getStatusBadge(alert.status);
                    return (
                      <div key={alert.id} className={`crisis-alert-card ${alert.status}`}>
                        <div className="alert-header">
                          <div className="alert-student">
                            <div 
                              className="risk-indicator" 
                              style={{ backgroundColor: getRiskColor(alert.riskLevel) }}
                            >
                              {alert.riskLevel}
                            </div>
                            <div className="student-info">
                              <h4>{alert.student}</h4>
                              <p>ID: {alert.studentId}</p>
                              <p>{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="alert-status">
                            <span className="status-badge" style={{ backgroundColor: status.color }}>
                              {status.icon} {status.text}
                            </span>
                          </div>
                        </div>
                        
                        <div className="alert-content">
                          <div className="crisis-text">
                            <strong>Student Text:</strong> "{alert.text}"
                          </div>
                          <div className="ai-analysis">
                            <strong>AI Analysis:</strong>
                            <span className="ai-details">
                              Keywords: {alert.aiAnalysis.keywords.join(', ')} | 
                              Confidence: {alert.aiAnalysis.confidence}% | 
                              Category: {alert.category}
                            </span>
                          </div>
                          <div className="alert-details">
                            <span className="assigned-counselor">
                              👤 {alert.counselorAssigned}
                            </span>
                            <span className="action-taken">
                              📋 {alert.actionTaken.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {alert.status === 'active' && (
                          <div className="alert-actions">
                            <button className="action-btn emergency">📞 Contact Student</button>
                            <button className="action-btn primary">📅 Schedule Emergency Session</button>
                            <button className="action-btn secondary">🚨 Escalate to Emergency</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Crisis Analytics Charts */}
              <div className="crisis-charts-section">
                {/* Crisis Trend Chart */}
                <div className="chart-card">
                  <h3>📈 Crisis Detection Trends (Last 7 Days)</h3>
                  <div className="trend-chart">
                    <div className="chart-legend">
                      <span className="legend-item low">🟢 Low Risk</span>
                      <span className="legend-item medium">🟡 Medium Risk</span>
                      <span className="legend-item high">🟠 High Risk</span>
                      <span className="legend-item critical">🔴 Critical</span>
                    </div>
                    <div className="chart-bars">
                      {crisisAnalytics.trendData?.map((day, index) => (
                        <div key={index} className="chart-day">
                          <div className="chart-bar">
                            <div 
                              className="bar-segment critical" 
                              style={{ height: `${day.critical * 20}px` }}
                              title={`Critical: ${day.critical}`}
                            ></div>
                            <div 
                              className="bar-segment high" 
                              style={{ height: `${day.high * 15}px` }}
                              title={`High: ${day.high}`}
                            ></div>
                            <div 
                              className="bar-segment medium" 
                              style={{ height: `${day.medium * 8}px` }}
                              title={`Medium: ${day.medium}`}
                            ></div>
                            <div 
                              className="bar-segment low" 
                              style={{ height: `${day.low * 3}px` }}
                              title={`Low: ${day.low}`}
                            ></div>
                          </div>
                          <div className="chart-label">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div className="chart-card">
                  <h3>🎯 Risk Level Distribution</h3>
                  <div className="distribution-chart">
                    {Object.entries(crisisAnalytics.riskDistribution || {}).map(([level, percentage]) => (
                      <div key={level} className="distribution-item">
                        <div className="distribution-label">
                          <span className={`risk-dot ${level}`}></span>
                          {level.charAt(0).toUpperCase() + level.slice(1)} Risk
                        </div>
                        <div className="distribution-bar">
                          <div 
                            className={`distribution-fill ${level}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="distribution-value">{percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Detection Insights */}
                <div className="chart-card">
                  <h3>🤖 AI Detection Insights</h3>
                  <div className="ai-insights">
                    <div className="insight-item">
                      <div className="insight-icon">🎯</div>
                      <div className="insight-details">
                        <h4>94.7% Accuracy</h4>
                        <p>AI detection confidence rate</p>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon">⚡</div>
                      <div className="insight-details">
                        <h4>Real-time</h4>
                        <p>Instant crisis analysis</p>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon">🛡️</div>
                      <div className="insight-details">
                        <h4>Privacy Protected</h4>
                        <p>PIPEDA compliant analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crisis Response Protocols */}
            <div className="protocols-section">
              <h3>📋 Crisis Response Protocols</h3>
              <div className="protocols-grid">
                <div className="protocol-card critical">
                  <h4>🚨 Critical Risk (9-10)</h4>
                  <ul>
                    <li>Immediate counselor notification</li>
                    <li>Emergency contact within 30 minutes</li>
                    <li>Campus security alert if needed</li>
                    <li>Family notification protocol</li>
                  </ul>
                </div>
                <div className="protocol-card high">
                  <h4>⚠️ High Risk (7-8)</h4>
                  <ul>
                    <li>Counselor notification within 2 hours</li>
                    <li>Same-day appointment scheduling</li>
                    <li>Follow-up check within 24 hours</li>
                    <li>Peer support activation</li>
                  </ul>
                </div>
                <div className="protocol-card medium">
                  <h4>💛 Medium Risk (5-6)</h4>
                  <ul>
                    <li>Resource recommendations sent</li>
                    <li>Appointment offered within 48 hours</li>
                    <li>Self-help tools provided</li>
                    <li>Weekly check-in scheduled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {selectedTab === 'resources' && (
          <div className="resources-content">
            <div className="resources-header">
              <h2>Resource Management</h2>
              <button className="action-btn primary">
                + Add Resource
              </button>
            </div>
            
            <div className="resources-grid">
              {resources.map(resource => (
                <div key={resource.id} className={`resource-card ${resource.urgency_level}`}>
                  <div className="resource-header">
                    <h4>{resource.title}</h4>
                    <span className={`urgency-badge ${resource.urgency_level}`}>
                      {resource.urgency_level === 'high' && '🚨 Critical'}
                      {resource.urgency_level === 'medium' && '⚡ Important'}
                      {resource.urgency_level === 'low' && '💡 Helpful'}
                    </span>
                  </div>
                  <div className="resource-category">{resource.category}</div>
                  <p className="resource-description">{resource.description}</p>
                  {resource.phone && (
                    <div className="resource-contact">
                      📞 {resource.phone}
                    </div>
                  )}
                  <div className="resource-actions">
                    <button className="action-btn secondary small">Edit</button>
                    <button className="action-btn secondary small">Share</button>
                    <button className="action-btn primary small">Assign</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CounselorDashboard;