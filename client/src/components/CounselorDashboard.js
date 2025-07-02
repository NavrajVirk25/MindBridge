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

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Mock student cases
    setStudents([
      {
        id: 1,
        name: 'Alex Johnson',
        studentId: '100123456',
        lastSession: '2025-06-28',
        nextSession: '2025-07-03',
        priority: 'medium',
        notes: 'Making good progress with anxiety management',
        program: 'Computer Science'
      },
      {
        id: 2,
        name: 'Emma Chen',
        studentId: '100234567',
        lastSession: '2025-06-30',
        nextSession: '2025-07-05',
        priority: 'high',
        notes: 'Requires follow-up on stress management techniques',
        program: 'Business Administration'
      },
      {
        id: 3,
        name: 'Marcus Williams',
        studentId: '100345678',
        lastSession: '2025-06-25',
        nextSession: '2025-07-02',
        priority: 'low',
        notes: 'Stable progress, monthly check-ins',
        program: 'Engineering'
      }
    ]);

    // Mock appointments
    setAppointments([
      {
        id: 1,
        student: 'Alex Johnson',
        date: '2025-07-03',
        time: '2:00 PM',
        type: 'Individual Session',
        duration: '50 minutes',
        status: 'confirmed',
        notes: 'Follow-up on coping strategies'
      },
      {
        id: 2,
        student: 'Emma Chen',
        date: '2025-07-03',
        time: '3:30 PM',
        type: 'Crisis Intervention',
        duration: '30 minutes',
        status: 'urgent',
        notes: 'Immediate support needed'
      },
      {
        id: 3,
        student: 'Marcus Williams',
        date: '2025-07-02',
        time: '10:00 AM',
        type: 'Group Therapy Prep',
        duration: '30 minutes',
        status: 'confirmed',
        notes: 'Prepare for group session'
      }
    ]);

    // Mock crisis alerts
    setCrisisAlerts([
      {
        id: 1,
        student: 'Emma Chen',
        type: 'High Risk Assessment',
        timestamp: '2025-07-01 14:30',
        severity: 'high',
        description: 'Student indicated thoughts of self-harm in mood tracker',
        status: 'active',
        action: 'Schedule immediate intervention'
      },
      {
        id: 2,
        student: 'Jamie Taylor',
        type: 'Missed Critical Appointment',
        timestamp: '2025-07-01 10:00',
        severity: 'medium',
        description: 'No-show for scheduled crisis follow-up',
        status: 'pending',
        action: 'Contact student immediately'
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
      high: '#f56565',
      medium: '#ed8936', 
      low: '#48bb78'
    };
    return colors[priority] || '#718096';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: '#f56565',
      medium: '#ed8936',
      low: '#48bb78'
    };
    return colors[severity] || '#718096';
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
            🚨 Crisis Alerts
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
                    <span className="stat-number">2</span>
                    <span className="stat-label">Crisis Alerts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">8</span>
                    <span className="stat-label">This Week's Sessions</span>
                  </div>
                </div>
              </div>

              {/* Urgent Actions */}
              <div className="dashboard-card urgent-actions">
                <h3>Urgent Actions Required</h3>
                <div className="urgent-list">
                  {crisisAlerts.filter(alert => alert.status === 'active').map(alert => (
                    <div key={alert.id} className="urgent-item">
                      <div className="urgent-info">
                        <span className="urgent-type">{alert.type}</span>
                        <span className="urgent-student">{alert.student}</span>
                        <span className="urgent-time">{alert.timestamp}</span>
                      </div>
                      <button className="action-btn emergency small">
                        Address Now
                      </button>
                    </div>
                  ))}
                </div>
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

              {/* Recent Case Updates */}
              <div className="dashboard-card case-updates">
                <h3>Recent Case Updates</h3>
                <div className="case-list">
                  {students.slice(0, 3).map(student => (
                    <div key={student.id} className="case-item">
                      <div className="case-info">
                        <span className="case-name">{student.name}</span>
                        <span className="case-program">{student.program}</span>
                        <span className="case-note">{student.notes}</span>
                      </div>
                      <div 
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(student.priority) }}
                      ></div>
                    </div>
                  ))}
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => setSelectedTab('students')}
                >
                  View All Cases
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
                    <div 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(student.priority) }}
                    >
                      {student.priority} priority
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
                    <h4>{appointment.type}</h4>
                    <p className="appointment-datetime">
                      📅 {appointment.date} at {appointment.time}
                    </p>
                    <p className="appointment-student">
                      👤 {appointment.student}
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

        {/* Crisis Alerts Tab */}
        {selectedTab === 'crisis' && (
          <div className="crisis-content">
            <div className="crisis-header">
              <h2>Crisis Management Dashboard</h2>
              <div className="crisis-stats">
                <span className="crisis-stat active">
                  {crisisAlerts.filter(alert => alert.status === 'active').length} Active Alerts
                </span>
                <span className="crisis-stat pending">
                  {crisisAlerts.filter(alert => alert.status === 'pending').length} Pending Review
                </span>
              </div>
            </div>
            
            <div className="crisis-list">
              {crisisAlerts.map(alert => (
                <div key={alert.id} className={`crisis-card ${alert.severity}`}>
                  <div className="crisis-info">
                    <div className="crisis-main">
                      <h4>{alert.type}</h4>
                      <span className="crisis-student">Student: {alert.student}</span>
                      <span className="crisis-time">⏰ {alert.timestamp}</span>
                    </div>
                    <div className="crisis-description">
                      <p>{alert.description}</p>
                      <p className="crisis-action">🎯 Action: {alert.action}</p>
                    </div>
                  </div>
                  <div className="crisis-controls">
                    <div 
                      className="severity-indicator"
                      style={{ backgroundColor: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity} risk
                    </div>
                    <div className="crisis-buttons">
                      <button className="action-btn emergency">Address</button>
                      <button className="action-btn secondary">Escalate</button>
                      <button className="action-btn secondary">Notes</button>
                    </div>
                  </div>
                </div>
              ))}
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
                <div key={resource.id} className={`resource-card ${resource.urgency}`}>
                  <div className="resource-header">
                    <h4>{resource.title}</h4>
                    <span className={`urgency-badge ${resource.urgency}`}>
                      {resource.urgency === 'high' && '🚨 Critical'}
                      {resource.urgency === 'medium' && '⚡ Important'}
                      {resource.urgency === 'low' && '💡 Helpful'}
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