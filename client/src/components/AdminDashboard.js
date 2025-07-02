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

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Mock platform statistics
    setPlatformStats({
      totalUsers: 2847,
      activeStudents: 2341,
      activeCounselors: 45,
      monthlyGrowth: 12.5,
      totalSessions: 15623,
      resourcesAccessed: 8934,
      crisisInterventions: 23,
      userSatisfaction: 4.7
    });

    // Mock user data
    setUsers([
      {
        id: 1,
        name: 'Alex Johnson',
        email: 'alex.johnson@student.kpu.ca',
        role: 'student',
        status: 'active',
        lastLogin: '2025-07-01',
        joinDate: '2024-09-15',
        sessionsCount: 12
      },
      {
        id: 2,
        name: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@employee.kpu.ca',
        role: 'counselor',
        status: 'active',
        lastLogin: '2025-07-01',
        joinDate: '2024-08-20',
        sessionsCount: 245
      },
      {
        id: 3,
        name: 'Emma Chen',
        email: 'emma.chen@student.kpu.ca',
        role: 'student',
        status: 'active',
        lastLogin: '2025-06-30',
        joinDate: '2024-09-10',
        sessionsCount: 8
      },
      {
        id: 4,
        name: 'Dr. Michael Roberts',
        email: 'michael.roberts@employee.kpu.ca',
        role: 'counselor',
        status: 'inactive',
        lastLogin: '2025-06-25',
        joinDate: '2024-07-15',
        sessionsCount: 189
      }
    ]);

    // Mock system health
    setSystemHealth({
      serverStatus: 'healthy',
      apiResponseTime: 245,
      databaseConnections: 95,
      storageUsage: 67,
      activeConnections: 324,
      errorRate: 0.02
    });

    // Mock recent activity
    setRecentActivity([
      {
        id: 1,
        type: 'user_registration',
        description: 'New student registered: Marcus Williams',
        timestamp: '2025-07-01 15:30',
        severity: 'info'
      },
      {
        id: 2,
        type: 'crisis_alert',
        description: 'Crisis intervention initiated for student ID: 100234567',
        timestamp: '2025-07-01 14:30',
        severity: 'high'
      },
      {
        id: 3,
        type: 'system_update',
        description: 'Platform updated to version 2.4.1',
        timestamp: '2025-07-01 12:00',
        severity: 'info'
      },
      {
        id: 4,
        type: 'counselor_added',
        description: 'New counselor verified: Dr. Lisa Thompson',
        timestamp: '2025-07-01 10:15',
        severity: 'info'
      }
    ]);
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
        
        {/* Analytics Tab */}
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <h2>Platform Analytics</h2>
            
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
                    <span className="health-label">API Response</span>
                    <span className="health-value">{systemHealth.apiResponseTime || 0}ms</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Active Users</span>
                    <span className="health-value">{systemHealth.activeConnections || 0}</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Error Rate</span>
                    <span className="health-value">{((systemHealth.errorRate || 0) * 100).toFixed(2)}%</span>
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

        {/* User Management Tab */}
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
              <button className="filter-btn">Admins</button>
            </div>
            
            <div className="users-table">
              <div className="table-header">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Last Login</span>
                <span>Sessions</span>
                <span>Actions</span>
              </div>
              {users.map(user => (
                <div key={user.id} className="table-row">
                  <span className="user-name">{user.name}</span>
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
                  <span className="user-login">{user.lastLogin}</span>
                  <span className="user-sessions">{user.sessionsCount}</span>
                  <div className="user-actions">
                    <button className="action-btn small secondary">Edit</button>
                    <button className="action-btn small secondary">View</button>
                    <button className="action-btn small emergency">Block</button>
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
              
              <div className="dashboard-card content-section">
                <h3>📢 Announcements</h3>
                <p>System-wide notifications and important updates</p>
                <div className="content-stats">
                  <span>3 Active Announcements</span>
                  <span>1 Scheduled</span>
                </div>
                <button className="action-btn secondary">Manage Announcements</button>
              </div>
            </div>
          </div>
        )}

        {/* System Monitor Tab */}
        {selectedTab === 'system' && (
          <div className="system-content">
            <div className="system-header">
              <h2>System Monitoring</h2>
              <div className="system-status">
                <span className="status-indicator healthy">● All Systems Operational</span>
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
                    <span className="metric-name">Database Connections</span>
                    <span className="metric-value">{systemHealth.databaseConnections || 0}%</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Storage Usage</span>
                    <span className="metric-value">{systemHealth.storageUsage || 0}%</span>
                    <div className="metric-bar">
                      <div className="metric-fill warning" style={{width: '67%'}}></div>
                    </div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Active Connections</span>
                    <span className="metric-value">{systemHealth.activeConnections || 0}</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{width: '40%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card backup-status">
                <h3>Backup & Security</h3>
                <div className="backup-info">
                  <div className="backup-item">
                    <span className="backup-label">Last Backup</span>
                    <span className="backup-value success">July 1, 2025 - 03:00 AM</span>
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
                    <span className="backup-label">SSL Certificate</span>
                    <span className="backup-value">Valid until Dec 2025</span>
                  </div>
                </div>
                <button className="action-btn secondary">Run Backup Now</button>
              </div>
              
              <div className="dashboard-card error-logs">
                <h3>Error Monitoring</h3>
                <div className="error-summary">
                  <div className="error-stat">
                    <span className="error-count">12</span>
                    <span className="error-label">Errors (24h)</span>
                  </div>
                  <div className="error-stat">
                    <span className="error-count">3</span>
                    <span className="error-label">Critical</span>
                  </div>
                  <div className="error-stat">
                    <span className="error-count">99.8%</span>
                    <span className="error-label">Uptime</span>
                  </div>
                </div>
                <button className="action-btn secondary">View Full Logs</button>
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
                <h3>🔐 Security Settings</h3>
                <div className="setting-item">
                  <label>Two-Factor Authentication</label>
                  <div className="toggle-switch">
                    <input type="checkbox" checked readOnly />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Session Timeout (minutes)</label>
                  <input type="number" value="60" />
                </div>
                <div className="setting-item">
                  <label>Password Requirements</label>
                  <select>
                    <option>Strong (recommended)</option>
                    <option>Medium</option>
                    <option>Basic</option>
                  </select>
                </div>
                <button className="action-btn primary">Update Security</button>
              </div>
              
              <div className="dashboard-card settings-section">
                <h3>📧 Notification Settings</h3>
                <div className="setting-item">
                  <label>Crisis Alert Email</label>
                  <input type="email" value="crisis@kpu.ca" />
                </div>
                <div className="setting-item">
                  <label>System Notifications</label>
                  <div className="toggle-switch">
                    <input type="checkbox" checked readOnly />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Weekly Reports</label>
                  <div className="toggle-switch">
                    <input type="checkbox" checked readOnly />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <button className="action-btn primary">Save Notifications</button>
              </div>
              
              <div className="dashboard-card settings-section danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-actions">
                  <div className="danger-item">
                    <div className="danger-info">
                      <span className="danger-title">Export All Data</span>
                      <span className="danger-description">Download complete platform data</span>
                    </div>
                    <button className="action-btn secondary">Export</button>
                  </div>
                  <div className="danger-item">
                    <div className="danger-info">
                      <span className="danger-title">Reset Platform</span>
                      <span className="danger-description">Reset all settings to default</span>
                    </div>
                    <button className="action-btn emergency">Reset</button>
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