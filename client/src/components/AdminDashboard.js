import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState({
    name: 'Jennifer Walsh',
    email: 'jennifer.walsh@admin.kpu.ca',
    adminId: 'ADM-001',
    institution: 'Kwantlen Polytechnic University',
    role: 'Platform Administrator'
  });

  const [selectedTab, setSelectedTab] = useState('overview');
  const [platformStats, setPlatformStats] = useState({});
  const [users, setUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [crisisManagement, setCrisisManagement] = useState({});

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
  try {
    // Fetch real crisis statistics from API
    const crisisStatsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/crisis/statistics`);
    const crisisStatsData = await crisisStatsResponse.json();

    // Fetch real platform statistics from API
    const platformStatsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/platform/statistics`);
    const platformStatsData = await platformStatsResponse.json();
    
    if (crisisStatsData.success && platformStatsData.success) {
      // Combine platform stats with crisis data
      setPlatformStats({
        ...platformStatsData.data,
        crisisDetections: crisisStatsData.data.totalDetections,
        successfulInterventions: crisisStatsData.data.successfulInterventions,
        avgResponseTime: parseInt(crisisStatsData.data.avgResponseTime),
        criticalAlerts: crisisStatsData.data.activeAlerts
      });
      
      // Set crisis management data
      setCrisisManagement({
        totalDetections: crisisStatsData.data.totalDetections,
        activeAlerts: crisisStatsData.data.activeAlerts,
        resolvedToday: crisisStatsData.data.resolvedToday,
        avgResponseTime: crisisStatsData.data.avgResponseTime,
        counselorResponseRate: crisisStatsData.data.counselorResponseRate,
        emergencyEscalations: crisisStatsData.data.emergencyEscalations,
        riskDistribution: crisisStatsData.data.riskDistribution,
        trendData: crisisStatsData.data.trendData,
        // ⚠️ MOCK DATA - Replace with API call when counselor workload endpoint is available
        counselorWorkload: [
          { name: 'Dr. Sarah Mitchell', activeCases: 12, crisisAlerts: 3, responseTime: '8 min' },
          { name: 'Dr. James Chen', activeCases: 15, crisisAlerts: 2, responseTime: '12 min' },
          { name: 'Dr. Maria Rodriguez', activeCases: 10, crisisAlerts: 1, responseTime: '15 min' },
          { name: 'Dr. Emily Thompson', activeCases: 8, crisisAlerts: 2, responseTime: '10 min' }
        ]
      });
    }

    // ⚠️ MOCK DATA - Replace with real user data from /api/admin/users endpoint
    // TODO: Create API endpoint to fetch all platform users
    setUsers([
      {
        id: 1,
        name: 'Alex Johnson',
        email: 'alex.johnson@student.kpu.ca',
        role: 'student',
        status: 'active',
        lastLogin: '2025-07-01',
        joinDate: '2024-09-15',
        sessionsCount: 12,
        riskLevel: 8,
        recentCrisis: true
      },
      {
        id: 2,
        name: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@employee.kpu.ca',
        role: 'counselor',
        status: 'active',
        lastLogin: '2025-07-01',
        joinDate: '2024-08-20',
        sessionsCount: 245,
        activeCases: 12,
        crisisAlerts: 3
      },
      {
        id: 3,
        name: 'Emma Chen',
        email: 'emma.chen@student.kpu.ca',
        role: 'student',
        status: 'active',
        lastLogin: '2025-06-30',
        joinDate: '2024-09-10',
        sessionsCount: 8,
        riskLevel: 6,
        recentCrisis: false
      },
      {
        id: 4,
        name: 'Dr. Michael Roberts',
        email: 'michael.roberts@employee.kpu.ca',
        role: 'counselor',
        status: 'inactive',
        lastLogin: '2025-06-25',
        joinDate: '2024-07-15',
        sessionsCount: 189,
        activeCases: 0,
        crisisAlerts: 0
      }
    ]);

    setSystemHealth({
      serverStatus: 'healthy',
      apiResponseTime: 245,
      databaseConnections: 95,
      storageUsage: 67,
      activeConnections: 324,
      errorRate: 0.02,
      crisisSystemStatus: 'operational',
      aiModelAccuracy: 94.7,
      alertDeliveryRate: 99.2
    });

    setRecentActivity([
      {
        id: 1,
        type: 'crisis_alert',
        description: 'High-risk crisis detected for student Alex J. - AI confidence 87%',
        timestamp: '2025-08-02 16:59',
        severity: 'high',
        details: 'Automatic counselor notification sent'
      },
      {
        id: 2,
        type: 'crisis_resolved',
        description: 'Crisis intervention successful for student ID: 100345679',
        timestamp: '2025-08-02 14:30',
        severity: 'info',
        details: 'Emergency contact completed, follow-up scheduled'
      },
      {
        id: 3,
        type: 'user_registration',
        description: 'New student registered: Marcus Williams',
        timestamp: '2025-08-02 12:15',
        severity: 'info',
        details: 'Account verified and activated'
      }
    ]);
    
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    // Fallback to empty data if API calls fail
    setPlatformStats({});
    setCrisisManagement({});
  }
};

  const handleLogout = () => {
    navigate('/');
  };

  const getRoleColor = (role) => {
    const colors = {
      student: '#667eea',
      counselor: '#48bb78',
      admin: '#ed8936'
    };
    return colors[role] || '#718096';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#48bb78',
      inactive: '#f56565',
      pending: '#ed8936'
    };
    return colors[status] || '#718096';
  };

  const getRiskColor = (level) => {
    if (level >= 9) return '#e53e3e'; // Critical
    if (level >= 7) return '#d69e2e'; // High
    if (level >= 5) return '#ecc94b'; // Medium
    return '#48bb78'; // Low
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: '#f56565',
      medium: '#ed8936',
      low: '#48bb78',
      info: '#4299e1'
    };
    return colors[severity] || '#718096';
  };

  const formatNumber = (num) => {
    if (num == null || num === undefined) return '0';
    return Number(num).toLocaleString();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">MindBridge</h1>
            <span className="user-role">Administrative Console</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="welcome-text">Welcome back, {currentUser.name}! ⚙️</span>
              <div className="user-details">
                <span>{currentUser.institution} • {currentUser.role}</span>
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
            📊 Analytics
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'crisis' ? 'active' : ''}`}
            onClick={() => setSelectedTab('crisis')}
          >
            🚨 Crisis Management
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'users' ? 'active' : ''}`}
            onClick={() => setSelectedTab('users')}
          >
            👥 User Management
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'content' ? 'active' : ''}`}
            onClick={() => setSelectedTab('content')}
          >
            📝 Content Management
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'system' ? 'active' : ''}`}
            onClick={() => setSelectedTab('system')}
          >
            🖥️ System Monitor
          </button>
          <button 
            className={`nav-tab ${selectedTab === 'settings' ? 'active' : ''}`}
            onClick={() => setSelectedTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        
        {/* Analytics Tab - Enhanced with Crisis Data */}
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <h2>Platform Analytics & Crisis Overview</h2>
            
            <div className="analytics-grid">
              {/* Key Metrics */}
              <div className="dashboard-card analytics-card">
                <h3>Platform Overview</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-number">{formatNumber(platformStats.totalUsers || 0)}</span>
                    <span className="metric-label">Total Users</span>
                    <span className="metric-change positive">+{platformStats.monthlyGrowth || 0}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-number">{formatNumber(platformStats.activeStudents || 0)}</span>
                    <span className="metric-label">Active Students</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-number">{platformStats.activeCounselors || 0}</span>
                    <span className="metric-label">Active Counselors</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-number">{platformStats.userSatisfaction || 0}</span>
                    <span className="metric-label">User Rating</span>
                    <span className="metric-change positive">⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>

              {/* Crisis Statistics */}
              <div className="dashboard-card crisis-stats-card">
                <h3>🚨 Crisis Detection Analytics</h3>
                <div className="crisis-metrics-grid">
                  <div className="crisis-metric-item">
                    <span className="crisis-metric-number">{platformStats.crisisDetections || 0}</span>
                    <span className="crisis-metric-label">Total Detections</span>
                    <span className="crisis-metric-period">This Month</span>
                  </div>
                  <div className="crisis-metric-item success">
                    <span className="crisis-metric-number">{platformStats.successfulInterventions || 0}%</span>
                    <span className="crisis-metric-label">Success Rate</span>
                    <span className="crisis-metric-change positive">+3.2% improvement</span>
                  </div>
                  <div className="crisis-metric-item">
                    <span className="crisis-metric-number">{platformStats.avgResponseTime || 0} min</span>
                    <span className="crisis-metric-label">Avg Response</span>
                    <span className="crisis-metric-change positive">-2 min faster</span>
                  </div>
                  <div className="crisis-metric-item critical">
                    <span className="crisis-metric-number">{platformStats.criticalAlerts || 0}</span>
                    <span className="crisis-metric-label">Critical Alerts</span>
                    <span className="crisis-metric-period">Active</span>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="dashboard-card usage-stats">
                <h3>Usage Statistics</h3>
                <div className="usage-list">
                  <div className="usage-item">
                    <span className="usage-label">Total Sessions Conducted</span>
                    <span className="usage-value">{formatNumber(platformStats.totalSessions || 0)}</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-label">Resources Accessed</span>
                    <span className="usage-value">{formatNumber(platformStats.resourcesAccessed || 0)}</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-label">Crisis Interventions</span>
                    <span className="usage-value critical">{platformStats.crisisInterventions || 0}</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-label">System Uptime</span>
                    <span className="usage-value success">{platformStats.systemUptime || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Crisis Trend Visualization */}
              <div className="dashboard-card crisis-trend-card">
                <h3>📈 Crisis Detection Trends (7 Days)</h3>
                <div className="admin-trend-chart">
                  <div className="admin-chart-legend">
                    <span className="admin-legend-item critical">🔴 Critical</span>
                    <span className="admin-legend-item high">🟠 High</span>
                    <span className="admin-legend-item medium">🟡 Medium</span>
                    <span className="admin-legend-item low">🟢 Low</span>
                  </div>
                  <div className="admin-chart-bars">
                    {crisisManagement.trendData?.map((day, index) => (
                      <div key={index} className="admin-chart-day">
                        <div className="admin-chart-bar">
                          <div 
                            className="admin-bar-segment critical" 
                            style={{ height: `${day.critical * 25}px` }}
                            title={`Critical: ${day.critical}`}
                          ></div>
                          <div 
                            className="admin-bar-segment high" 
                            style={{ height: `${day.high * 15}px` }}
                            title={`High: ${day.high}`}
                          ></div>
                          <div 
                            className="admin-bar-segment medium" 
                            style={{ height: `${day.medium * 10}px` }}
                            title={`Medium: ${day.medium}`}
                          ></div>
                          <div 
                            className="admin-bar-segment low" 
                            style={{ height: `${day.low * 8}px` }}
                            title={`Low: ${day.low}`}
                          ></div>
                        </div>
                        <div className="admin-chart-label">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="admin-chart-total">{day.total}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Health Overview */}
              <div className="dashboard-card system-overview">
                <h3>System Health</h3>
                <div className="health-indicators">
                  <div className="health-item">
                    <span className="health-label">Server Status</span>
                    <span className="health-status healthy">● Online</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Crisis AI System</span>
                    <span className="health-status healthy">● Operational</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">AI Model Accuracy</span>
                    <span className="health-value">{systemHealth.aiModelAccuracy || 0}%</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Alert Delivery</span>
                    <span className="health-value">{systemHealth.alertDeliveryRate || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="dashboard-card recent-activity">
                <h3>Recent Platform Activity</h3>
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-info">
                        <span className="activity-description">{activity.description}</span>
                        <span className="activity-details">{activity.details}</span>
                        <span className="activity-time">{activity.timestamp}</span>
                      </div>
                      <div 
                        className="activity-indicator"
                        style={{ backgroundColor: getSeverityColor(activity.severity) }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crisis Management Tab - New */}
        {selectedTab === 'crisis' && (
          <div className="crisis-management-content">
            <div className="crisis-management-header">
              <h2>🚨 Crisis Management System</h2>
              <div className="crisis-management-stats">
                <div className="crisis-stat-card">
                  <span className="crisis-stat-number">{crisisManagement.activeAlerts}</span>
                  <span className="crisis-stat-label">Active Alerts</span>
                </div>
                <div className="crisis-stat-card">
                  <span className="crisis-stat-number">{crisisManagement.resolvedToday}</span>
                  <span className="crisis-stat-label">Resolved Today</span>
                </div>
                <div className="crisis-stat-card">
                  <span className="crisis-stat-number">{crisisManagement.avgResponseTime}</span>
                  <span className="crisis-stat-label">Avg Response</span>
                </div>
                <div className="crisis-stat-card">
                  <span className="crisis-stat-number">{crisisManagement.counselorResponseRate}%</span>
                  <span className="crisis-stat-label">Counselor Response Rate</span>
                </div>
              </div>
            </div>

            <div className="crisis-management-grid">
              {/* Crisis Risk Distribution */}
              <div className="dashboard-card crisis-distribution">
                <h3>Risk Level Distribution</h3>
                <div className="risk-distribution-admin">
                  {Object.entries(crisisManagement.riskDistribution || {}).map(([level, count]) => (
                    <div key={level} className="risk-distribution-item">
                      <div className="risk-distribution-label">
                        <span className={`risk-dot-admin ${level}`}></span>
                        {level.charAt(0).toUpperCase() + level.slice(1)} Risk
                      </div>
                      <div className="risk-distribution-count">{count}</div>
                      <div className="risk-distribution-bar">
                        <div 
                          className={`risk-distribution-fill ${level}`}
                          style={{ width: `${(count / 89) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counselor Workload */}
              <div className="dashboard-card counselor-workload">
                <h3>Counselor Crisis Workload</h3>
                <div className="counselor-workload-list">
                  {crisisManagement.counselorWorkload?.map((counselor, index) => (
                    <div key={index} className="counselor-workload-item">
                      <div className="counselor-info">
                        <h4>{counselor.name}</h4>
                        <div className="counselor-stats">
                          <span className="counselor-stat">
                            📋 {counselor.activeCases} Active Cases
                          </span>
                          <span className="counselor-stat crisis">
                            🚨 {counselor.crisisAlerts} Crisis Alerts
                          </span>
                          <span className="counselor-stat">
                            ⏱️ {counselor.responseTime} Response
                          </span>
                        </div>
                      </div>
                      <div className="counselor-workload-indicator">
                        <div 
                          className="workload-bar"
                          style={{ 
                            width: `${(counselor.activeCases / 20) * 100}%`,
                            backgroundColor: counselor.activeCases > 15 ? '#e53e3e' : counselor.activeCases > 10 ? '#d69e2e' : '#48bb78'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crisis Response Configuration */}
              <div className="dashboard-card crisis-config">
                <h3>Crisis Response Configuration</h3>
                <div className="crisis-config-list">
                  <div className="config-item">
                    <div className="config-label">AI Model Sensitivity</div>
                    <div className="config-control">
                      <input type="range" min="1" max="10" defaultValue="7" />
                      <span className="config-value">7/10</span>
                    </div>
                  </div>
                  <div className="config-item">
                    <div className="config-label">Auto-Escalation Threshold</div>
                    <div className="config-control">
                      <select defaultValue="8">
                        <option value="7">Risk Level 7</option>
                        <option value="8">Risk Level 8</option>
                        <option value="9">Risk Level 9</option>
                      </select>
                    </div>
                  </div>
                  <div className="config-item">
                    <div className="config-label">Response Time Target</div>
                    <div className="config-control">
                      <input type="number" defaultValue="15" min="5" max="60" />
                      <span className="config-unit">minutes</span>
                    </div>
                  </div>
                  <div className="config-item">
                    <div className="config-label">Emergency Notifications</div>
                    <div className="config-control">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <button className="action-btn primary">Save Configuration</button>
              </div>

              {/* AI Model Performance */}
              <div className="dashboard-card ai-performance">
                <h3>🤖 AI Model Performance</h3>
                <div className="ai-performance-metrics">
                  <div className="ai-metric">
                    <div className="ai-metric-icon">🎯</div>
                    <div className="ai-metric-info">
                      <span className="ai-metric-value">94.7%</span>
                      <span className="ai-metric-label">Detection Accuracy</span>
                    </div>
                  </div>
                  <div className="ai-metric">
                    <div className="ai-metric-icon">⚡</div>
                    <div className="ai-metric-info">
                      <span className="ai-metric-value">0.3s</span>
                      <span className="ai-metric-label">Analysis Time</span>
                    </div>
                  </div>
                  <div className="ai-metric">
                    <div className="ai-metric-icon">🔄</div>
                    <div className="ai-metric-info">
                      <span className="ai-metric-value">v2.4.1</span>
                      <span className="ai-metric-label">Model Version</span>
                    </div>
                  </div>
                </div>
                <div className="ai-actions">
                  <button className="action-btn secondary">View Model Logs</button>
                  <button className="action-btn secondary">Retrain Model</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab - Enhanced */}
        {selectedTab === 'users' && (
          <div className="users-content">
            <div className="users-header">
              <h2>User Management</h2>
              <div className="users-actions">
                <button className="action-btn secondary">Export Users</button>
                <button className="action-btn primary">+ Add User</button>
              </div>
            </div>
            
            <div className="users-filters">
              <button className="filter-btn active">All Users</button>
              <button className="filter-btn">Students</button>
              <button className="filter-btn">Counselors</button>
              <button className="filter-btn">High Risk</button>
            </div>
            
            <div className="users-table">
              <div className="table-header">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Risk Level</span>
                <span>Last Login</span>
                <span>Actions</span>
              </div>
              {users.map(user => (
                <div key={user.id} className="table-row">
                  <span className="user-name">
                    {user.name}
                    {user.recentCrisis && <span className="crisis-indicator">🚨</span>}
                  </span>
                  <span className="user-email">{user.email}</span>
                  <span 
                    className="user-role"
                    style={{ color: getRoleColor(user.role) }}
                  >
                    {user.role}
                  </span>
                  <span 
                    className="user-status"
                    style={{ color: getStatusColor(user.status) }}
                  >
                    ● {user.status}
                  </span>
                  <span className="user-risk">
                    {user.riskLevel ? (
                      <span 
                        className="risk-badge-table"
                        style={{ backgroundColor: getRiskColor(user.riskLevel) }}
                      >
                        {user.riskLevel}
                      </span>
                    ) : (
                      user.role === 'counselor' ? `${user.crisisAlerts} alerts` : '—'
                    )}
                  </span>
                  <span className="user-login">{user.lastLogin}</span>
                  <div className="user-actions">
                    <button className="action-btn small secondary">Edit</button>
                    <button className="action-btn small secondary">View</button>
                    {user.recentCrisis && (
                      <button className="action-btn small emergency">Crisis</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {selectedTab === 'content' && (
          <div className="content-content">
            <div className="content-header">
              <h2>Content Management</h2>
              <button className="action-btn primary">
                + Add Content
              </button>
            </div>
            
            <div className="content-sections">
              <div className="dashboard-card content-section">
                <h3>🏥 Mental Health Resources</h3>
                <p>Manage crisis hotlines, counseling services, and self-help resources</p>
                <div className="content-stats">
                  <span>24 Active Resources</span>
                  <span>12 Pending Review</span>
                </div>
                <button className="action-btn secondary">Manage Resources</button>
              </div>
              
              <div className="dashboard-card content-section">
                <h3>🚨 Crisis Response Content</h3>
                <p>Emergency protocols, crisis hotlines, and intervention procedures</p>
                <div className="content-stats">
                  <span>15 Crisis Protocols</span>
                  <span>8 Emergency Contacts</span>
                </div>
                <button className="action-btn secondary">Manage Crisis Content</button>
              </div>
              
              <div className="dashboard-card content-section">
                <h3>📚 Educational Content</h3>
                <p>Articles, videos, and guides for mental health education</p>
                <div className="content-stats">
                  <span>156 Articles</span>
                  <span>23 Videos</span>
                </div>
                <button className="action-btn secondary">Manage Content</button>
              </div>
              
              <div className="dashboard-card content-section">
                <h3>🎨 Platform Customization</h3>
                <p>Customize branding, colors, and institution-specific content</p>
                <div className="content-stats">
                  <span>KPU Theme Active</span>
                  <span>Last Updated: June 15</span>
                </div>
                <button className="action-btn secondary">Customize Platform</button>
              </div>
            </div>
          </div>
        )}

        {/* System Monitor Tab - Enhanced */}
        {selectedTab === 'system' && (
          <div className="system-content">
            <div className="system-header">
              <h2>System Monitoring</h2>
              <div className="system-status">
                <span className="status-indicator healthy">● All Systems Operational</span>
                <span className="status-indicator healthy">● Crisis AI Online</span>
                <span className="last-updated">Last updated: 2 minutes ago</span>
              </div>
            </div>
            
            <div className="system-grid">
              <div className="dashboard-card system-metrics">
                <h3>Performance Metrics</h3>
                <div className="metrics-list">
                  <div className="metric-row">
                    <span className="metric-name">API Response Time</span>
                    <span className="metric-value">{systemHealth.apiResponseTime || 0}ms</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{width: '25%'}}></div>
                    </div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Crisis AI Response</span>
                    <span className="metric-value">0.3s</span>
                    <div className="metric-bar">
                      <div className="metric-fill success" style={{width: '15%'}}></div>
                    </div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Database Connections</span>
                    <span className="metric-value">{systemHealth.databaseConnections || 0}%</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Alert Delivery Rate</span>
                    <span className="metric-value">{systemHealth.alertDeliveryRate || 0}%</span>
                    <div className="metric-bar">
                      <div className="metric-fill success" style={{width: '99%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card crisis-system-health">
                <h3>🚨 Crisis System Health</h3>
                <div className="crisis-health-info">
                  <div className="crisis-health-item">
                    <span className="crisis-health-label">AI Model Status</span>
                    <span className="crisis-health-value success">Operational</span>
                  </div>
                  <div className="crisis-health-item">
                    <span className="crisis-health-label">Detection Accuracy</span>
                    <span className="crisis-health-value">{systemHealth.aiModelAccuracy}%</span>
                  </div>
                  <div className="crisis-health-item">
                    <span className="crisis-health-label">Alert Queue</span>
                    <span className="crisis-health-value">0 Pending</span>
                  </div>
                  <div className="crisis-health-item">
                    <span className="crisis-health-label">Last Model Update</span>
                    <span className="crisis-health-value">Aug 2, 2025</span>
                  </div>
                </div>
                <button className="action-btn secondary">View Crisis Logs</button>
              </div>
              
              <div className="dashboard-card backup-status">
                <h3>Backup & Security</h3>
                <div className="backup-info">
                  <div className="backup-item">
                    <span className="backup-label">Last Backup</span>
                    <span className="backup-value success">August 2, 2025 - 03:00 AM</span>
                  </div>
                  <div className="backup-item">
                    <span className="backup-label">Backup Size</span>
                    <span className="backup-value">2.4 GB</span>
                  </div>
                  <div className="backup-item">
                    <span className="backup-label">Security Scan</span>
                    <span className="backup-value success">No threats detected</span>
                  </div>
                  <div className="backup-item">
                    <span className="backup-label">Crisis Data Backup</span>
                    <span className="backup-value success">Encrypted & Secure</span>
                  </div>
                </div>
                <button className="action-btn secondary">Run Backup Now</button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="settings-content">
            <h2>Platform Configuration</h2>
            
            <div className="settings-sections">
              <div className="dashboard-card settings-section">
                <h3>🏫 Institution Settings</h3>
                <div className="setting-item">
                  <label>Institution Name</label>
                  <input type="text" value="Kwantlen Polytechnic University" readOnly />
                </div>
                <div className="setting-item">
                  <label>Primary Domain</label>
                  <input type="text" value="kpu.ca" readOnly />
                </div>
                <div className="setting-item">
                  <label>Time Zone</label>
                  <select>
                    <option>Pacific Standard Time (PST)</option>
                  </select>
                </div>
                <button className="action-btn primary">Save Changes</button>
              </div>
              
              <div className="dashboard-card settings-section">
                <h3>🚨 Crisis Detection Settings</h3>
                <div className="setting-item">
                  <label>AI Crisis Detection</label>
                  <div className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Crisis Alert Email</label>
                  <input type="email" defaultValue="crisis@kpu.ca" />
                </div>
                <div className="setting-item">
                  <label>Emergency Response Team</label>
                  <input type="email" defaultValue="emergency@kpu.ca" />
                </div>
                <div className="setting-item">
                  <label>Auto-Escalation</label>
                  <div className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <button className="action-btn primary">Update Crisis Settings</button>
              </div>
              
              <div className="dashboard-card settings-section">
                <h3>🔐 Security Settings</h3>
                <div className="setting-item">
                  <label>Two-Factor Authentication</label>
                  <div className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Session Timeout (minutes)</label>
                  <input type="number" defaultValue="60" />
                </div>
                <div className="setting-item">
                  <label>Crisis Data Encryption</label>
                  <div className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <button className="action-btn primary">Update Security</button>
              </div>
              
              <div className="dashboard-card settings-section danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-actions">
                  <div className="danger-item">
                    <div className="danger-info">
                      <span className="danger-title">Export Crisis Data</span>
                      <span className="danger-description">Download complete crisis detection logs</span>
                    </div>
                    <button className="action-btn secondary">Export</button>
                  </div>
                  <div className="danger-item">
                    <div className="danger-info">
                      <span className="danger-title">Reset AI Model</span>
                      <span className="danger-description">Reset crisis detection AI to default</span>
                    </div>
                    <button className="action-btn emergency">Reset AI</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;