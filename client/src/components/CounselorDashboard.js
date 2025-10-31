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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [groupedAlerts, setGroupedAlerts] = useState([]);
  const [expandedStudentIds, setExpandedStudentIds] = useState(new Set());
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState('all'); // all, upcoming, past
  const [appointmentForm, setAppointmentForm] = useState({
    studentId: '',
    date: '',
    time: '',
    type: 'Counseling Session',
    duration: '50 minutes',
    notes: ''
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Group alerts by student when crisisAlerts changes
  useEffect(() => {
    if (crisisAlerts.length > 0) {
      const grouped = groupAlertsByStudent(crisisAlerts);
      setGroupedAlerts(grouped);
    }
  }, [crisisAlerts]);

  // Function to group crisis alerts by student
  const groupAlertsByStudent = (alerts) => {
    const studentMap = {};

    alerts.forEach(alert => {
      const studentId = alert.studentId;

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          studentId: studentId,
          studentName: alert.student,
          alerts: [],
          highestRiskLevel: 0,
          totalAlerts: 0,
          unaddressedCount: 0,
          latestAlert: null,
          latestMessage: ''
        };
      }

      studentMap[studentId].alerts.push(alert);
      studentMap[studentId].totalAlerts++;
      studentMap[studentId].highestRiskLevel = Math.max(
        studentMap[studentId].highestRiskLevel,
        alert.riskLevel
      );

      if (alert.status === 'active') {
        studentMap[studentId].unaddressedCount++;
      }

      // Track latest alert
      if (!studentMap[studentId].latestAlert ||
          new Date(alert.timestamp) > new Date(studentMap[studentId].latestAlert.timestamp)) {
        studentMap[studentId].latestAlert = alert;
        studentMap[studentId].latestMessage = alert.text.substring(0, 100) + (alert.text.length > 100 ? '...' : '');
      }
    });

    // Convert to array and sort by priority (highest risk first, then most recent)
    return Object.values(studentMap).sort((a, b) => {
      if (b.highestRiskLevel !== a.highestRiskLevel) {
        return b.highestRiskLevel - a.highestRiskLevel;
      }
      return new Date(b.latestAlert.timestamp) - new Date(a.latestAlert.timestamp);
    });
  };

  const loadDashboardData = async () => {
  try {
    // Fetch real crisis alerts from API
    const alertsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/crisis/alerts`);
    const alertsData = await alertsResponse.json();

    if (alertsData.success) {
      setCrisisAlerts(alertsData.data);
    }

    // Fetch real crisis analytics from API
    const analyticsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/crisis/analytics`);
    const analyticsData = await analyticsResponse.json();

    if (analyticsData.success) {
      setCrisisAnalytics(analyticsData.data);
    }

    // Fetch real appointments from API
    // Using counselor ID from currentUser (assuming counselor has an ID)
    const counselorId = 2; // Replace with actual counselor ID from auth/session
    const appointmentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments/${counselorId}`);
    const appointmentsData = await appointmentsResponse.json();

    // Declare formattedAppointments at higher scope
    let formattedAppointments = [];

    if (appointmentsData.success) {
      // Transform the data to match expected format
      formattedAppointments = appointmentsData.data.map(apt => ({
        id: apt.id,
        student: `${apt.student_first_name} ${apt.student_last_name}`,
        studentId: apt.student_id,
        date: new Date(apt.appointment_date).toISOString().split('T')[0],
        time: new Date(apt.appointment_date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        type: apt.notes || 'Counseling Session',
        duration: '50 minutes',
        status: apt.status,
        notes: apt.notes,
        riskLevel: 5 // Default risk level, can be enhanced later
      }));
      setAppointments(formattedAppointments);
    } else {
      // Fallback to empty array
      setAppointments([]);
    }

    // ⚠️ MOCK DATA - Replace with real student case data from API
    // TODO: Create /api/counselor/students endpoint for assigned student cases
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

    // Load resources from backend
    const resourcesResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/resources`);
    const resourcesData = await resourcesResponse.json();
    if (resourcesData.success) {
      setResources(resourcesData.data);
    }

    // Generate Recent Activity Feed (combine data from appointments and alerts)
    const generateRecentActivity = () => {
      const activities = [];
      const today = new Date();

      // Add completed appointments as activities
      formattedAppointments.forEach(apt => {
        const aptDate = new Date(apt.date + ' ' + apt.time);
        if (aptDate < today) {
          activities.push({
            id: `apt-${apt.id}`,
            type: 'appointment_completed',
            icon: '✅',
            title: `Completed session with ${apt.student}`,
            description: apt.type,
            timestamp: aptDate,
            priority: 'normal'
          });
        }
      });

      // Add recent crisis alerts as activities
      if (alertsData.success && alertsData.data.length > 0) {
        alertsData.data.slice(0, 5).forEach(alert => {
          activities.push({
            id: `alert-${alert.id}`,
            type: 'crisis_alert',
            icon: '🚨',
            title: `Crisis alert: ${alert.student}`,
            description: alert.category,
            timestamp: new Date(alert.timestamp),
            priority: alert.riskLevel >= 7 ? 'high' : 'normal'
          });
        });
      }

      // Sort by most recent
      activities.sort((a, b) => b.timestamp - a.timestamp);
      return activities.slice(0, 8); // Show last 8 activities
    };

    // Generate Pending Tasks
    const generatePendingTasks = () => {
      const tasks = [];

      // Tasks from upcoming appointments
      formattedAppointments.forEach(apt => {
        const aptDate = new Date(apt.date + ' ' + apt.time);
        const today = new Date();

        if (aptDate > today) {
          tasks.push({
            id: `task-apt-${apt.id}`,
            type: 'appointment',
            title: `Prepare for ${apt.student} session`,
            description: `${apt.type} scheduled for ${apt.date} at ${apt.time}`,
            dueDate: aptDate,
            priority: apt.riskLevel >= 7 ? 'high' : 'normal',
            completed: false
          });
        }
      });

      // Tasks from active crisis alerts (students needing follow-up)
      if (alertsData.success && alertsData.data.length > 0) {
        const activeAlerts = alertsData.data.filter(a => a.status === 'active');
        activeAlerts.forEach(alert => {
          tasks.push({
            id: `task-alert-${alert.id}`,
            type: 'follow_up',
            title: `Follow up with ${alert.student}`,
            description: `Unaddressed ${alert.category} alert - Risk Level ${alert.riskLevel}`,
            dueDate: new Date(), // Immediate
            priority: alert.riskLevel >= 7 ? 'urgent' : 'high',
            completed: false
          });
        });
      }

      // Sort by priority and due date
      tasks.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.dueDate - b.dueDate;
      });

      return tasks.slice(0, 6); // Show top 6 tasks
    };

    setRecentActivity(generateRecentActivity());
    setPendingTasks(generatePendingTasks());

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Fallback to empty arrays if API calls fail
    setCrisisAlerts([]);
    setCrisisAnalytics({});
    setAppointments([]);
  }
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

  const getRiskCategory = (level) => {
    if (level >= 9) return 'critical';
    if (level >= 7) return 'high';
    if (level >= 5) return 'moderate';
    return 'low';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatsForTriage = () => {
    const urgentCount = groupedAlerts.filter(s => s.highestRiskLevel >= 9 && s.unaddressedCount > 0).length;
    const highRiskCount = groupedAlerts.filter(s => s.highestRiskLevel >= 7 && s.highestRiskLevel < 9).length;
    const activeCases = groupedAlerts.filter(s => s.unaddressedCount > 0).length;
    return { urgentCount, highRiskCount, activeCases };
  };

  const toggleStudentExpansion = (studentId) => {
    setExpandedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const getPriorityStudents = () => {
    // Get top 2-3 most urgent students for the action bar
    return groupedAlerts
      .filter(s => s.unaddressedCount > 0 && s.highestRiskLevel >= 7)
      .slice(0, 3);
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const appointmentsToday = appointments.filter(apt => apt.date === today).length;
    const activeCases = groupedAlerts.filter(s => s.unaddressedCount > 0).length;
    return { appointmentsToday, activeCases };
  };

  const formatActivityTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    // Same day
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    // Within a week
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleTaskToggle = (taskId) => {
    setPendingTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      urgent: '#e53e3e',
      high: '#d69e2e',
      normal: '#4299e1',
      low: '#48bb78'
    };
    return colors[priority] || '#718096';
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentFilter === 'upcoming') {
      return appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= today;
      });
    } else if (appointmentFilter === 'past') {
      return appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate < today;
      });
    }
    return appointments;
  };

  const groupAppointmentsByDate = () => {
    const filtered = getFilteredAppointments();
    const grouped = {};

    filtered.forEach(apt => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });

    // Sort dates
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

    return sortedDates.map(date => ({
      date,
      appointments: grouped[date].sort((a, b) => {
        const timeA = new Date('1970/01/01 ' + a.time);
        const timeB = new Date('1970/01/01 ' + b.time);
        return timeA - timeB;
      })
    }));
  };

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();

    // Validate form
    if (!appointmentForm.studentId || !appointmentForm.date || !appointmentForm.time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time into a datetime
      const appointmentDateTime = new Date(`${appointmentForm.date}T${appointmentForm.time}`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: parseInt(appointmentForm.studentId),
          counselorId: 2, // Current counselor ID (should come from auth)
          appointmentDate: appointmentDateTime.toISOString(),
          notes: `${appointmentForm.type} - ${appointmentForm.duration}${appointmentForm.notes ? '. ' + appointmentForm.notes : ''}`
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Appointment scheduled successfully!');
        // Close modal
        setShowAppointmentModal(false);
        // Reset form
        setAppointmentForm({
          studentId: '',
          date: '',
          time: '',
          type: 'Counseling Session',
          duration: '50 minutes',
          notes: ''
        });
        // Reload appointments
        loadDashboardData();
      } else {
        alert('Failed to schedule appointment: ' + data.error);
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('An error occurred while scheduling the appointment');
    }
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
            {/* Priority Action Bar */}
            {getPriorityStudents().length > 0 && (
              <div className="priority-action-bar">
                <div className="priority-bar-header">
                  <span className="priority-bar-icon">🚨</span>
                  <span className="priority-bar-title">IMMEDIATE ATTENTION REQUIRED</span>
                </div>
                <div className="priority-bar-students">
                  {getPriorityStudents().map(student => (
                    <div
                      key={student.studentId}
                      className={`priority-bar-student risk-${getRiskCategory(student.highestRiskLevel)}`}
                    >
                      <div className="priority-bar-student-info">
                        <span className="priority-bar-student-name">{student.studentName}</span>
                        <span className="priority-bar-risk-badge" style={{ backgroundColor: getRiskColor(student.highestRiskLevel) }}>
                          RISK {student.highestRiskLevel}
                        </span>
                        <span className="priority-bar-alert-count">{student.unaddressedCount} new</span>
                      </div>
                      <button
                        className="priority-bar-action-btn"
                        onClick={() => setSelectedTab('crisis')}
                      >
                        CONTACT NOW
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="dashboard-grid">

              {/* Quick Stats - LEFT COLUMN (NOW USING REAL DATA) */}
              <div className="dashboard-card stats-card">
                <h3>Today's Overview</h3>
                <div className="stats-grid">
                  {(() => {
                    const stats = getTodayStats();
                    return (
                      <>
                        <div className="stat-item">
                          <span className="stat-number">{stats.appointmentsToday}</span>
                          <span className="stat-label">Appointments Today</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">{stats.activeCases}</span>
                          <span className="stat-label">Active Cases</span>
                        </div>
                        <div className="stat-item urgent">
                          <span className="stat-number">{crisisAnalytics.todayDetections || 0}</span>
                          <span className="stat-label">Crisis Alerts Today</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">{crisisAnalytics.avgResponseTime || '8 min'}</span>
                          <span className="stat-label">Avg Response Time</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Priority Students - MIDDLE COLUMN (REDESIGNED) */}
              <div className="dashboard-card priority-students-card">
                <h3>🚨 Priority Students</h3>
                <div className="priority-students-list">
                  {groupedAlerts.filter(s => s.unaddressedCount > 0).length > 0 ? (
                    groupedAlerts.filter(s => s.unaddressedCount > 0).map(student => {
                      const riskCategory = getRiskCategory(student.highestRiskLevel);
                      const isExpanded = expandedStudentIds.has(student.studentId);
                      const isUrgent = student.highestRiskLevel >= 9;

                      return (
                        <div
                          key={student.studentId}
                          className={`compact-priority-card risk-border-${riskCategory} ${isUrgent ? 'pulse-urgent-card' : ''}`}
                        >
                          <div className="compact-card-header">
                            <div className="compact-student-info">
                              <div className="compact-name-section">
                                <h4>{student.studentName}</h4>
                                <span className="compact-alert-count">
                                  ({student.totalAlerts} alert{student.totalAlerts !== 1 ? 's' : ''})
                                  {student.unaddressedCount > 0 && (
                                    <span className="compact-new-badge">{student.unaddressedCount} new</span>
                                  )}
                                </span>
                              </div>
                              <div className="compact-meta">
                                <span className="compact-category">{student.latestAlert.category}</span>
                                <span className="compact-time">{formatTimestamp(student.latestAlert.timestamp)}</span>
                              </div>
                            </div>
                            <div
                              className="compact-risk-badge"
                              style={{ backgroundColor: getRiskColor(student.highestRiskLevel) }}
                            >
                              {student.highestRiskLevel}
                            </div>
                          </div>

                          <div className="compact-message-preview">
                            "{student.latestMessage}"
                          </div>

                          <div className="compact-actions">
                            <button className="compact-action-btn contact">
                              📞 Contact
                            </button>
                            <button
                              className="compact-action-btn view-all"
                              onClick={() => toggleStudentExpansion(student.studentId)}
                            >
                              {isExpanded ? '▲ Hide' : `▼ View All (${student.totalAlerts})`}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="compact-expanded-alerts">
                              <h5>All Alerts:</h5>
                              {student.alerts.map(alert => (
                                <div key={alert.id} className="compact-expanded-alert">
                                  <div className="compact-expanded-header">
                                    <span className="compact-expanded-time">
                                      {new Date(alert.timestamp).toLocaleString()}
                                    </span>
                                    <span
                                      className="compact-expanded-risk"
                                      style={{ backgroundColor: getRiskColor(alert.riskLevel) }}
                                    >
                                      Risk: {alert.riskLevel}
                                    </span>
                                  </div>
                                  <div className="compact-expanded-text">"{alert.text}"</div>
                                  <div className="compact-expanded-category">
                                    Category: {alert.category} | Keywords: {alert.aiAnalysis.keywords.join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-priority-alerts">
                      <p>✅ No urgent alerts at this time</p>
                      <p className="sub-text">All students are stable</p>
                    </div>
                  )}
                </div>
                <button
                  className="view-all-btn"
                  onClick={() => setSelectedTab('crisis')}
                >
                  View Full Crisis Analytics
                </button>
              </div>

              {/* Today's Schedule - RIGHT COLUMN (NOW USING REAL DATA) */}
              <div className="dashboard-card schedule-preview">
                <h3>Today's Schedule</h3>
                <div className="schedule-list">
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayAppointments = appointments.filter(apt => apt.date === today);

                    if (todayAppointments.length === 0) {
                      return (
                        <div className="no-appointments">
                          <p>No appointments scheduled for today</p>
                        </div>
                      );
                    }

                    return todayAppointments.map(appointment => (
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
                    ));
                  })()}
                </div>
                <button
                  className="view-all-btn"
                  onClick={() => setSelectedTab('appointments')}
                >
                  View Full Calendar
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="quick-actions-panel">
              <h3>⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="quick-action-btn schedule" onClick={() => setSelectedTab('appointments')}>
                  <span className="action-icon">📅</span>
                  <span className="action-text">Schedule Appointment</span>
                </button>
                <button className="quick-action-btn crisis" onClick={() => setSelectedTab('crisis')}>
                  <span className="action-icon">🚨</span>
                  <span className="action-text">View Crisis Alerts</span>
                </button>
                <button className="quick-action-btn resources" onClick={() => setSelectedTab('resources')}>
                  <span className="action-icon">📚</span>
                  <span className="action-text">Share Resources</span>
                </button>
                <button className="quick-action-btn report">
                  <span className="action-icon">📊</span>
                  <span className="action-text">Generate Report</span>
                </button>
              </div>
            </div>

            {/* Bottom Section - Recent Activity and Pending Tasks */}
            <div className="bottom-section">
              {/* Recent Activity Feed */}
              <div className="dashboard-card activity-feed-card">
                <h3>🕒 Recent Activity</h3>
                <div className="activity-feed">
                  {recentActivity.length > 0 ? (
                    recentActivity.map(activity => (
                      <div key={activity.id} className={`activity-item ${activity.priority}`}>
                        <span className="activity-icon">{activity.icon}</span>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-description">{activity.description}</div>
                          <div className="activity-time">{formatActivityTime(activity.timestamp)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activity">
                      <p>No recent activity to display</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="dashboard-card pending-tasks-card">
                <h3>✅ Pending Tasks</h3>
                <div className="pending-tasks-list">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map(task => (
                      <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                        <input
                          type="checkbox"
                          className="task-checkbox"
                          checked={task.completed}
                          onChange={() => handleTaskToggle(task.id)}
                        />
                        <div className="task-content">
                          <div className="task-header">
                            <span className="task-title">{task.title}</span>
                            <span
                              className="task-priority-badge"
                              style={{ backgroundColor: getPriorityBadgeColor(task.priority) }}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div className="task-description">{task.description}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-tasks">
                      <p>🎉 All caught up! No pending tasks</p>
                    </div>
                  )}
                </div>
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

        {/* Appointments Tab - Redesigned */}
        {selectedTab === 'appointments' && (
          <div className="appointments-content">
            <div className="appointments-header">
              <h2>📅 Appointment Calendar</h2>
              <button
                className="action-btn primary schedule-btn"
                onClick={() => setShowAppointmentModal(true)}
              >
                + New Appointment
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="appointment-filters">
              <button
                className={`filter-tab ${appointmentFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAppointmentFilter('all')}
              >
                All Appointments ({appointments.length})
              </button>
              <button
                className={`filter-tab ${appointmentFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setAppointmentFilter('upcoming')}
              >
                Upcoming ({getFilteredAppointments().length > 0 && appointmentFilter !== 'upcoming' ? appointments.filter(apt => new Date(apt.date) >= new Date().setHours(0,0,0,0)).length : getFilteredAppointments().length})
              </button>
              <button
                className={`filter-tab ${appointmentFilter === 'past' ? 'active' : ''}`}
                onClick={() => setAppointmentFilter('past')}
              >
                Past ({getFilteredAppointments().length > 0 && appointmentFilter !== 'past' ? appointments.filter(apt => new Date(apt.date) < new Date().setHours(0,0,0,0)).length : getFilteredAppointments().length})
              </button>
            </div>

            {/* Appointments grouped by date */}
            <div className="appointments-timeline">
              {groupAppointmentsByDate().length > 0 ? (
                groupAppointmentsByDate().map(dateGroup => (
                  <div key={dateGroup.date} className="date-group">
                    <div className="date-header">
                      <h3>{formatDateHeader(dateGroup.date)}</h3>
                      <span className="date-count">{dateGroup.appointments.length} appointment{dateGroup.appointments.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="appointments-list">
                      {dateGroup.appointments.map(appointment => (
                        <div key={appointment.id} className="appointment-card-new">
                          <div className="appointment-time-indicator">
                            <div className="time-badge">{appointment.time}</div>
                            <div className="timeline-dot"></div>
                          </div>

                          <div className="appointment-content-new">
                            <div className="appointment-header-new">
                              <div className="appointment-title-section">
                                <h4>{appointment.type}</h4>
                                <span className={`status-badge-new ${appointment.status}`}>
                                  {appointment.status}
                                </span>
                                {appointment.riskLevel >= 7 && (
                                  <span
                                    className="risk-badge-new"
                                    style={{ backgroundColor: getRiskColor(appointment.riskLevel) }}
                                  >
                                    Risk {appointment.riskLevel}
                                  </span>
                                )}
                              </div>
                              <div className="appointment-actions-new">
                                <button className="action-btn-icon" title="Edit">✏️</button>
                                <button className="action-btn-icon" title="Cancel">❌</button>
                              </div>
                            </div>

                            <div className="appointment-info-grid">
                              <div className="info-item">
                                <span className="info-icon">👤</span>
                                <span className="info-text">{appointment.student}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-icon">⏱️</span>
                                <span className="info-text">{appointment.duration}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-icon">🆔</span>
                                <span className="info-text">ID: {appointment.studentId}</span>
                              </div>
                            </div>

                            {appointment.notes && (
                              <div className="appointment-notes-new">
                                <span className="notes-icon">📝</span>
                                <span className="notes-text">{appointment.notes}</span>
                              </div>
                            )}

                            <div className="appointment-footer">
                              <button className="start-session-btn">
                                Start Session →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-appointments-found">
                  <div className="no-appointments-icon">📭</div>
                  <h3>No appointments found</h3>
                  <p>
                    {appointmentFilter === 'upcoming' && 'No upcoming appointments scheduled.'}
                    {appointmentFilter === 'past' && 'No past appointments to display.'}
                    {appointmentFilter === 'all' && 'No appointments in the system.'}
                  </p>
                  <button
                    className="action-btn primary"
                    onClick={() => setShowAppointmentModal(true)}
                  >
                    Schedule Your First Appointment
                  </button>
                </div>
              )}
            </div>

            {/* Appointment Scheduling Modal */}
            {showAppointmentModal && (
              <div className="modal-overlay" onClick={() => setShowAppointmentModal(false)}>
                <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>📅 Schedule New Appointment</h3>
                    <button className="modal-close" onClick={() => setShowAppointmentModal(false)}>×</button>
                  </div>
                  <form onSubmit={handleScheduleAppointment}>
                    <div className="modal-body">
                      <div className="form-grid">
                        {/* Student Selection */}
                        <div className="form-group full-width">
                          <label htmlFor="studentId">Student <span className="required">*</span></label>
                          <select
                            id="studentId"
                            name="studentId"
                            value={appointmentForm.studentId}
                            onChange={handleFormChange}
                            required
                            className="form-select"
                          >
                            <option value="">Select a student...</option>
                            {students.map(student => (
                              <option key={student.id} value={student.id}>
                                {student.name} (ID: {student.studentId})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date */}
                        <div className="form-group">
                          <label htmlFor="date">Date <span className="required">*</span></label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={appointmentForm.date}
                            onChange={handleFormChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="form-input"
                          />
                        </div>

                        {/* Time */}
                        <div className="form-group">
                          <label htmlFor="time">Time <span className="required">*</span></label>
                          <input
                            type="time"
                            id="time"
                            name="time"
                            value={appointmentForm.time}
                            onChange={handleFormChange}
                            required
                            className="form-input"
                          />
                        </div>

                        {/* Session Type */}
                        <div className="form-group">
                          <label htmlFor="type">Session Type</label>
                          <select
                            id="type"
                            name="type"
                            value={appointmentForm.type}
                            onChange={handleFormChange}
                            className="form-select"
                          >
                            <option value="Counseling Session">Counseling Session</option>
                            <option value="Crisis Intervention">Crisis Intervention</option>
                            <option value="Follow-up Session">Follow-up Session</option>
                            <option value="Regular Check-in">Regular Check-in</option>
                            <option value="Initial Assessment">Initial Assessment</option>
                          </select>
                        </div>

                        {/* Duration */}
                        <div className="form-group">
                          <label htmlFor="duration">Duration</label>
                          <select
                            id="duration"
                            name="duration"
                            value={appointmentForm.duration}
                            onChange={handleFormChange}
                            className="form-select"
                          >
                            <option value="30 minutes">30 minutes</option>
                            <option value="50 minutes">50 minutes</option>
                            <option value="60 minutes">60 minutes</option>
                            <option value="90 minutes">90 minutes</option>
                          </select>
                        </div>

                        {/* Notes */}
                        <div className="form-group full-width">
                          <label htmlFor="notes">Additional Notes</label>
                          <textarea
                            id="notes"
                            name="notes"
                            value={appointmentForm.notes}
                            onChange={handleFormChange}
                            rows="3"
                            placeholder="Any specific topics or concerns to address..."
                            className="form-textarea"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="action-btn secondary"
                        onClick={() => setShowAppointmentModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="action-btn primary">
                        Schedule Appointment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Crisis Analytics Tab - Redesigned Triage System */}
        {selectedTab === 'crisis' && (
          <div className="crisis-triage-content">
            {/* Top Stats Bar */}
            <div className="triage-stats-bar">
              {(() => {
                const stats = getStatsForTriage();
                return (
                  <>
                    <div className="triage-stat urgent">
                      <span className="triage-stat-icon">🚨</span>
                      <div className="triage-stat-info">
                        <span className="triage-stat-number">{stats.urgentCount}</span>
                        <span className="triage-stat-label">Urgent (9-10)</span>
                      </div>
                    </div>
                    <div className="triage-stat high">
                      <span className="triage-stat-icon">⚠️</span>
                      <div className="triage-stat-info">
                        <span className="triage-stat-number">{stats.highRiskCount}</span>
                        <span className="triage-stat-label">High Risk (7-8)</span>
                      </div>
                    </div>
                    <div className="triage-stat active">
                      <span className="triage-stat-icon">📋</span>
                      <div className="triage-stat-info">
                        <span className="triage-stat-number">{stats.activeCases}</span>
                        <span className="triage-stat-label">Active Cases</span>
                      </div>
                    </div>
                    <div className="triage-stat response">
                      <span className="triage-stat-icon">⏱️</span>
                      <div className="triage-stat-info">
                        <span className="triage-stat-number">{crisisAnalytics.avgResponseTime || '8 min'}</span>
                        <span className="triage-stat-label">Avg Response</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Two-Panel Triage Layout */}
            <div className="triage-container">
              {/* Left Panel - Priority Queue */}
              <div className="priority-queue">
                <div className="priority-queue-header">
                  <h3>Priority Queue</h3>
                  <span className="queue-count">{groupedAlerts.length} Students</span>
                </div>

                <div className="priority-cards-list">
                  {groupedAlerts.map(student => {
                    const riskCategory = getRiskCategory(student.highestRiskLevel);
                    const isUrgentUnaddressed = student.highestRiskLevel >= 9 && student.unaddressedCount > 0;

                    return (
                      <div
                        key={student.studentId}
                        className={`priority-card risk-${riskCategory} ${isUrgentUnaddressed ? 'pulse-urgent' : ''} ${selectedStudent?.studentId === student.studentId ? 'selected' : ''}`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="priority-card-header">
                          <div className="student-name-section">
                            <h4>{student.studentName}</h4>
                            <span className="student-id-small">ID: {student.studentId}</span>
                          </div>
                          <div className="risk-level-badge" style={{ backgroundColor: getRiskColor(student.highestRiskLevel) }}>
                            {student.highestRiskLevel}
                          </div>
                        </div>

                        <div className="priority-card-info">
                          <div className="alert-count-badge">
                            {student.totalAlerts} alert{student.totalAlerts !== 1 ? 's' : ''}
                            {student.unaddressedCount > 0 && (
                              <span className="unaddressed-badge">{student.unaddressedCount} new</span>
                            )}
                          </div>
                          <div className="latest-time">{formatTimestamp(student.latestAlert.timestamp)}</div>
                        </div>

                        <div className="latest-message-preview">
                          "{student.latestMessage}"
                        </div>

                        <button className="address-now-btn">ADDRESS NOW →</button>
                      </div>
                    );
                  })}

                  {groupedAlerts.length === 0 && (
                    <div className="no-alerts-message">
                      <p>✅ No crisis alerts at this time</p>
                      <p className="sub-message">All students are stable</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Detail View */}
              <div className="detail-panel">
                {selectedStudent ? (
                  <>
                    <div className="detail-panel-header">
                      <div className="detail-student-info">
                        <h3>{selectedStudent.studentName}</h3>
                        <span className="detail-student-id">ID: {selectedStudent.studentId}</span>
                      </div>
                      <div className="detail-risk-summary">
                        <div className="detail-risk-badge" style={{ backgroundColor: getRiskColor(selectedStudent.highestRiskLevel) }}>
                          Risk Level: {selectedStudent.highestRiskLevel}
                        </div>
                        <div className="detail-alert-count">
                          {selectedStudent.totalAlerts} Total Alerts
                        </div>
                      </div>
                    </div>

                    <div className="detail-alerts-timeline">
                      <h4>Alert History (Newest First)</h4>
                      <div className="timeline-list">
                        {selectedStudent.alerts
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                          .map(alert => {
                            const status = getStatusBadge(alert.status);
                            return (
                              <div key={alert.id} className="timeline-alert-item">
                                <div className="timeline-alert-header">
                                  <div className="timeline-timestamp">
                                    {new Date(alert.timestamp).toLocaleString()}
                                  </div>
                                  <div className="timeline-risk-badge" style={{ backgroundColor: getRiskColor(alert.riskLevel) }}>
                                    Risk: {alert.riskLevel}
                                  </div>
                                  <span className="timeline-status-badge" style={{ backgroundColor: status.color }}>
                                    {status.icon} {status.text}
                                  </span>
                                </div>

                                <div className="timeline-alert-content">
                                  <div className="timeline-message">
                                    <strong>Message:</strong> "{alert.text}"
                                  </div>
                                  <div className="timeline-ai-analysis">
                                    <strong>AI Analysis:</strong> {alert.category} |
                                    Keywords: {alert.aiAnalysis.keywords.join(', ')} |
                                    Confidence: {alert.aiAnalysis.confidence}%
                                  </div>
                                </div>

                                <div className="timeline-actions">
                                  <button className="timeline-action-btn contact">📞 Contact Student</button>
                                  <button className="timeline-action-btn schedule">📅 Schedule Session</button>
                                  <button className="timeline-action-btn review">✓ Mark Reviewed</button>
                                  <button className="timeline-action-btn note">📝 Add Note</button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="detail-panel-placeholder">
                    <div className="placeholder-icon">👈</div>
                    <h3>Select a student to view details</h3>
                    <p>Click on any student card from the priority queue to see their full alert history and take action.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Keep the old detailed analytics below for reference - can be accessed via a sub-tab later */}
        {selectedTab === 'crisis-old' && (
          <div className="crisis-analytics-content">
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