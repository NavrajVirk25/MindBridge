// Import required packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const pool = require('./db'); // Import our database connection


// Create Express application
const app = express();

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Configure this to match your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(helmet()); // Add security headers
app.use(cors()); // Enable CORS for frontend communication
app.use(morgan('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON request bodies

// Basic route to test server is working
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MindBridge API',
    status: 'Server is running successfully'
  });
});

// Health check endpoint - useful for monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API endpoint to get mental health resources - NOW CONNECTED TO DATABASE!
app.get('/api/resources', async (req, res) => {
  try {
    // Query the database for resources
    const result = await pool.query('SELECT * FROM resources WHERE is_active = true ORDER BY urgency_level DESC');
    
    // Send the resources as JSON
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources from database',
      timestamp: new Date().toISOString()
    });
  }
});

// Start the server
// Import bcrypt at the top of your file (add this near your other imports)
const bcrypt = require('bcrypt');

// User authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Query database for user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = result.rows[0];
    
// For now, we'll do simple password comparison (we'll improve this)
// In production, you'd use bcrypt.compare() for hashed passwords
if (password === 'anything') { // Your current test password
  // Return user info (excluding password)
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type
    },
    timestamp: new Date().toISOString()
  });
} else {
  res.status(401).json({
    success: false,
    error: 'Invalid email or password'
  });
}
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
// Mood tracking endpoints
app.get('/api/mood/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get mood entries for a specific user
    const result = await pool.query(
      'SELECT * FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mood fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood entries'
    });
  }
});

// Enhanced mood entry endpoint with crisis detection
app.post('/api/mood', async (req, res) => {
  try {
    const { userId, moodLevel, notes } = req.body;
    
    // Validate input
    if (!userId || !moodLevel || moodLevel < 1 || moodLevel > 5) {
      return res.status(400).json({
        success: false,
        error: 'User ID and mood level (1-5) are required'
      });
    }
    
    // Insert new mood entry
    const moodResult = await pool.query(
      'INSERT INTO mood_entries (user_id, mood_level, notes) VALUES ($1, $2, $3) RETURNING *',
      [userId, moodLevel, notes || null]
    );
    
    // Crisis detection analysis (if notes provided)
    let crisisAnalysis = null;
    if (notes && notes.trim().length > 0) {
      crisisAnalysis = analyzeCrisisText(notes);
      
      // If crisis detected, store alert in database
      if (crisisAnalysis.severity > 0) {
        await pool.query(
          'INSERT INTO crisis_alerts (user_id, alert_type, severity_level, description, status) VALUES ($1, $2, $3, $4, $5)',
          [userId, crisisAnalysis.alertType, crisisAnalysis.severity, crisisAnalysis.description, 'pending']
        );
        
        console.log(`CRISIS ALERT: User ${userId} - Severity ${crisisAnalysis.severity} - ${crisisAnalysis.alertType}`);
      }
    }
    
    res.json({
      success: true,
      data: moodResult.rows[0],
      crisisDetected: crisisAnalysis ? crisisAnalysis.severity > 0 : false,
      message: 'Mood entry added successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mood entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add mood entry'
    });
  }
});

// Crisis detection function
function analyzeCrisisText(text) {
  const lowercaseText = text.toLowerCase();
  
  // Define crisis keywords and their severity levels
  const crisisKeywords = {
    critical: {
      keywords: ['suicide', 'kill myself', 'end it all', 'want to die', 'end my life', 'better off dead', 'nobody would miss me', 'say goodbye'],
      alertType: 'suicide_ideation',
      severity: 5
    },
    high: {
      keywords: ['hopeless', 'worthless', 'can\'t go on', 'nobody cares', 'hate myself', 'cut myself', 'hurt myself', 'ending everything'],
      alertType: 'self_harm',
      severity: 4
    },
    medium: {
      keywords: ['overwhelmed', 'panic attack', 'can\'t cope', 'anxiety attack', 'falling apart', 'breaking down'],
      alertType: 'severe_anxiety',
      severity: 3
    },
    low: {
      keywords: ['stressed', 'worried', 'anxious', 'sad', 'down', 'upset'],
      alertType: 'other',
      severity: 2
    }
  };
  
  let highestSeverity = 0;
  let detectedType = 'other';
  let detectedKeywords = [];
  
  // Check for crisis keywords
  for (const [level, config] of Object.entries(crisisKeywords)) {
    for (const keyword of config.keywords) {
      if (lowercaseText.includes(keyword)) {
        detectedKeywords.push(keyword);
        if (config.severity > highestSeverity) {
          highestSeverity = config.severity;
          detectedType = config.alertType;
        }
      }
    }
  }
  
  // Only create alerts for severity 3 and above (medium, high, critical)
  if (highestSeverity >= 3) {
    return {
      severity: highestSeverity,
      alertType: detectedType,
      keywords: detectedKeywords,
      description: `Crisis detected in mood entry: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}" | Keywords: ${detectedKeywords.join(', ')}`
    };
  }
  
  return { severity: 0, alertType: null, keywords: [], description: null };
}

// Get mood statistics for a user
app.get('/api/mood-stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get mood statistics
    const result = await pool.query(`
      SELECT 
        AVG(mood_level) as average_mood,
        COUNT(*) as total_entries,
        MAX(mood_level) as highest_mood,
        MIN(mood_level) as lowest_mood,
        DATE_TRUNC('day', created_at) as day,
        AVG(mood_level) as daily_average
      FROM mood_entries 
      WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY day DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mood stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mood statistics'
    });
  }
});

// Appointment endpoints
app.get('/api/appointments/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get appointments for a user (as student or counselor)
    const result = await pool.query(`
      SELECT 
        a.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        c.first_name as counselor_first_name,
        c.last_name as counselor_last_name
      FROM appointments a
      JOIN users s ON a.student_id = s.id
      JOIN users c ON a.counselor_id = c.id
      WHERE a.student_id = $1 OR a.counselor_id = $1
      ORDER BY a.appointment_date DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { studentId, counselorId, appointmentDate, notes } = req.body;
    
    // Validate input
    if (!studentId || !counselorId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        error: 'Student ID, counselor ID, and appointment date are required'
      });
    }
    
    // Insert new appointment
    const result = await pool.query(
      'INSERT INTO appointments (student_id, counselor_id, appointment_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, counselorId, appointmentDate, notes || null]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
});

// Update appointment status
app.put('/api/appointments/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: scheduled, completed, cancelled, or no_show'
      });
    }
    
    // Update appointment
    const result = await pool.query(
      'UPDATE appointments SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, notes, appointmentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
});
// Crisis Analytics API Endpoints

// Get active crisis alerts for counselor dashboard
app.get('/api/crisis/alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ca.*,
        u.first_name,
        u.last_name,
        u.email,
        me.notes as mood_entry_text,
        me.mood_level,
        me.created_at as mood_entry_date
      FROM crisis_alerts ca
      JOIN users u ON ca.user_id = u.id
      LEFT JOIN mood_entries me ON ca.user_id = me.user_id 
        AND DATE(ca.created_at) = DATE(me.created_at)
        AND ABS(EXTRACT(EPOCH FROM (ca.created_at - me.created_at))) < 300
      ORDER BY ca.created_at DESC
    `);
    
    // Format the data for the counselor dashboard
    const formattedAlerts = result.rows.map(row => ({
      id: row.id,
      student: `${row.first_name} ${row.last_name}`,
      studentId: `10012${String(row.user_id).padStart(4, '0')}`,
      riskLevel: row.severity_level,
      category: row.alert_type,
      timestamp: row.created_at,
      status: row.status === 'pending' ? 'active' : row.status,
      text: row.mood_entry_text || 'No mood entry text available',
      aiAnalysis: {
        keywords: extractKeywordsFromDescription(row.description),
        sentiment: row.alert_type,
        confidence: 85 // Default confidence level
      },
      counselorAssigned: 'Dr. Sarah Mitchell',
      actionTaken: row.status === 'pending' ? 'pending' : 'appointment_scheduled',
      priority: row.severity_level >= 4 ? 'critical' : 'high'
    }));
    
    res.json({
      success: true,
      data: formattedAlerts,
      count: formattedAlerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Crisis alerts fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crisis alerts'
    });
  }
});

// Get crisis analytics summary for dashboard
app.get('/api/crisis/analytics', async (req, res) => {
  try {
    // Get basic crisis statistics
    const totalAlertsResult = await pool.query(
      'SELECT COUNT(*) as total FROM crisis_alerts WHERE created_at >= NOW() - INTERVAL \'7 days\''
    );
    
    const todayAlertsResult = await pool.query(
      'SELECT COUNT(*) as today FROM crisis_alerts WHERE DATE(created_at) = CURRENT_DATE'
    );
    
    const activeAlertsResult = await pool.query(
      'SELECT COUNT(*) as active FROM crisis_alerts WHERE status = \'pending\''
    );
    
    // Get risk distribution
    const riskDistributionResult = await pool.query(`
      SELECT 
        severity_level,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY severity_level
      ORDER BY severity_level
    `);
    
    // Get trend data for last 7 days
    const trendDataResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        severity_level,
        COUNT(*) as count
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at), severity_level
      ORDER BY date DESC
    `);
    
    // Format risk distribution
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    riskDistributionResult.rows.forEach(row => {
      const level = row.severity_level;
      if (level <= 2) riskDistribution.low = parseFloat(row.percentage);
      else if (level === 3) riskDistribution.medium = parseFloat(row.percentage);
      else if (level === 4) riskDistribution.high = parseFloat(row.percentage);
      else if (level === 5) riskDistribution.critical = parseFloat(row.percentage);
    });
    
    // Format trend data
    const trendData = [];
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    last7Days.forEach(date => {
      const dayData = { date, low: 0, medium: 0, high: 0, critical: 0 };
      trendDataResult.rows.forEach(row => {
        if (row.date.toISOString().split('T')[0] === date) {
          const level = row.severity_level;
          if (level <= 2) dayData.low += parseInt(row.count);
          else if (level === 3) dayData.medium += parseInt(row.count);
          else if (level === 4) dayData.high += parseInt(row.count);
          else if (level === 5) dayData.critical += parseInt(row.count);
        }
      });
      trendData.push(dayData);
    });
    
    res.json({
      success: true,
      data: {
        totalDetections: parseInt(totalAlertsResult.rows[0].total),
        todayDetections: parseInt(todayAlertsResult.rows[0].today),
        activeAlerts: parseInt(activeAlertsResult.rows[0].active),
        avgResponseTime: '8 minutes',
        successfulInterventions: 96.2,
        riskDistribution,
        trendData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Crisis analytics fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crisis analytics'
    });
  }
});

// Helper function to extract keywords from description
function extractKeywordsFromDescription(description) {
  if (!description) return [];
  const keywordMatch = description.match(/Keywords: (.+)$/);
  return keywordMatch ? keywordMatch[1].split(', ') : [];
}
// Admin Crisis Analytics API Endpoints

// Get platform-wide crisis statistics for admin dashboard
app.get('/api/admin/crisis/statistics', async (req, res) => {
  try {
    // Get total crisis detections for current month
    const totalDetectionsResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM crisis_alerts 
      WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    
    // Get crisis detections for today
    const todayDetectionsResult = await pool.query(`
      SELECT COUNT(*) as today 
      FROM crisis_alerts 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // Get active alerts count
    const activeAlertsResult = await pool.query(`
      SELECT COUNT(*) as active 
      FROM crisis_alerts 
      WHERE status = 'pending'
    `);
    
    // Get resolved alerts for today
    const resolvedTodayResult = await pool.query(`
      SELECT COUNT(*) as resolved 
      FROM crisis_alerts 
      WHERE DATE(resolved_at) = CURRENT_DATE
    `);
    
    // Get average response time (simulated for now)
    const avgResponseTime = 12; // minutes - you can calculate this based on actual data later
    
    // Get risk level distribution
    const riskDistributionResult = await pool.query(`
      SELECT 
        severity_level,
        COUNT(*) as count
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY severity_level
    `);
    
    // Format risk distribution
    const riskDistribution = {
      critical: 0,
      high: 0, 
      medium: 0,
      low: 0
    };
    
    riskDistributionResult.rows.forEach(row => {
      const level = row.severity_level;
      if (level === 5) riskDistribution.critical = parseInt(row.count);
      else if (level === 4) riskDistribution.high = parseInt(row.count);
      else if (level === 3) riskDistribution.medium = parseInt(row.count);
      else if (level <= 2) riskDistribution.low += parseInt(row.count);
    });
    
    // Get 7-day trend data
    const trendDataResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        severity_level,
        COUNT(*) as count
      FROM crisis_alerts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at), severity_level
      ORDER BY date DESC
    `);
    
    // Format trend data
    const trendData = [];
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    last7Days.forEach(date => {
      const dayData = { date, total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      trendDataResult.rows.forEach(row => {
        if (row.date.toISOString().split('T')[0] === date) {
          const level = row.severity_level;
          const count = parseInt(row.count);
          dayData.total += count;
          if (level === 5) dayData.critical += count;
          else if (level === 4) dayData.high += count;
          else if (level === 3) dayData.medium += count;
          else if (level <= 2) dayData.low += count;
        }
      });
      trendData.push(dayData);
    });
    
    res.json({
      success: true,
      data: {
        totalDetections: parseInt(totalDetectionsResult.rows[0].total),
        todayDetections: parseInt(todayDetectionsResult.rows[0].today),
        activeAlerts: parseInt(activeAlertsResult.rows[0].active),
        resolvedToday: parseInt(resolvedTodayResult.rows[0].resolved),
        avgResponseTime: `${avgResponseTime} minutes`,
        counselorResponseRate: 98.5, // Can be calculated from actual data later
        emergencyEscalations: 0, // Can be tracked separately
        successfulInterventions: 94.7, // Can be calculated from resolved vs total
        riskDistribution,
        trendData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin crisis statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin crisis statistics'
    });
  }
});

// Get platform statistics for admin dashboard  
app.get('/api/admin/platform/statistics', async (req, res) => {
  try {
    // Get user counts by role
    const userStatsResult = await pool.query(`
      SELECT 
        user_type,
        COUNT(*) as count
      FROM users 
      WHERE is_active = true
      GROUP BY user_type
    `);
    
    // Get total users
    const totalUsersResult = await pool.query(`
      SELECT COUNT(*) as total FROM users WHERE is_active = true
    `);
    
    // Get total mood entries (as a proxy for sessions)
    const sessionsResult = await pool.query(`
      SELECT COUNT(*) as total FROM mood_entries
    `);
    
    // Get active resources count
    const resourcesResult = await pool.query(`
      SELECT COUNT(*) as total FROM resources WHERE is_active = true
    `);
    
    // Get crisis interventions count
    const interventionsResult = await pool.query(`
      SELECT COUNT(*) as total FROM crisis_alerts
    `);
    
    // Format user statistics
    let activeStudents = 0;
    let activeCounselors = 0;
    
    userStatsResult.rows.forEach(row => {
      if (row.user_type === 'student') activeStudents = parseInt(row.count);
      else if (row.user_type === 'counselor') activeCounselors = parseInt(row.count);
    });
    
    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsersResult.rows[0].total),
        activeStudents: activeStudents,
        activeCounselors: activeCounselors,
        monthlyGrowth: 12.5, // Can be calculated from user registration dates
        totalSessions: parseInt(sessionsResult.rows[0].total),
        resourcesAccessed: parseInt(resourcesResult.rows[0].total),
        crisisInterventions: parseInt(interventionsResult.rows[0].total),
        userSatisfaction: 4.7, // Would come from feedback system
        systemUptime: 99.8
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Platform statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics'
    });
  }
});
// Import chat service
const chatService = require('./services/chatService');

// Store socket-to-user mappings
const socketUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> socketId

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✓ New client connected:', socket.id);

  // User authentication and room joining
  socket.on('authenticate', async (data) => {
    console.log('🔐 Authenticate event received:', data);
    try {
      const { userId, userType } = data;
      console.log('👤 Processing authentication for:', userId, userType);

      // Store socket-user mapping
      socketUsers.set(socket.id, { userId, userType });
      userSockets.set(userId, socket.id);

      console.log(`✅ User authenticated: ${userId} (${userType})`);

      // If peer supporter, update their online status
      if (userType === 'peer_supporter') {
        await chatService.updatePeerSupporterStatus(userId, true, socket.id);
        console.log(`Peer supporter ${userId} is now online`);
      }

      // Get or create active chat room
      let chatRoom = await chatService.getActiveChatRoom(userId);

      // If student and no active room, create one and try to match
      if (!chatRoom && userType === 'student') {
        // Create waiting room
        chatRoom = await chatService.createChatRoom(userId, null, true);
        console.log(`Created chat room ${chatRoom.id} for student ${userId}`);

        // Try to find available peer supporter
        const availablePeer = await chatService.findAvailablePeerSupporter();

        if (availablePeer) {
          // Assign peer supporter to room
          await chatService.assignPeerSupporter(chatRoom.id, availablePeer.id);
          chatRoom.peer_support_id = availablePeer.id;
          chatRoom.status = 'active';

          console.log(`Matched student ${userId} with peer supporter ${availablePeer.id}`);

          // Notify peer supporter of new chat
          const peerSocketId = userSockets.get(availablePeer.id);
          if (peerSocketId) {
            io.to(peerSocketId).emit('new_chat_assigned', {
              chatRoomId: chatRoom.id,
              studentId: userId
            });
          }
        }
      }

      if (chatRoom) {
        // Join socket room
        socket.join(`chat_${chatRoom.id}`);
        console.log(`📥 User ${userId} joined chat room ${chatRoom.id}`);

        // Get chat history
        const history = await chatService.getChatHistory(chatRoom.id);
        console.log(`📚 Retrieved ${history.length} messages from history`);

        const chatReadyData = {
          chatRoomId: chatRoom.id,
          status: chatRoom.status,
          isAnonymous: chatRoom.is_anonymous,
          history: history.map(msg => ({
            id: msg.id,
            message: msg.message,
            sender: msg.sender_id === userId ? 'me' : 'other',
            timestamp: msg.created_at
          }))
        };

        // Send chat room info and history
        console.log(`📤 Sending chat_ready to user ${userId}:`, chatReadyData);
        socket.emit('chat_ready', chatReadyData);

        // Mark messages as read
        await chatService.markMessagesAsRead(chatRoom.id, userId);
      } else {
        console.log(`⏳ No chat room for user ${userId}, sending waiting status`);
        socket.emit('chat_ready', {
          status: 'waiting',
          message: 'Waiting for available peer supporter...'
        });
      }

    } catch (error) {
      console.error('❌ Authentication error:', error);
      console.error('Error stack:', error.stack);
      socket.emit('error', { message: 'Authentication failed: ' + error.message });
    }
  });

  // Handle incoming chat messages
  socket.on('chat_message', async (data) => {
    try {
      const userInfo = socketUsers.get(socket.id);
      if (!userInfo) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { userId } = userInfo;
      const { chatRoomId, message } = data;

      console.log(`💬 Message from user ${userId} in room ${chatRoomId}: ${message}`);

      // Save message to database
      const savedMessage = await chatService.saveMessage(chatRoomId, userId, message);
      console.log(`✅ Message saved to DB with ID: ${savedMessage.id}`);

      // Get all sockets in this room
      const socketsInRoom = await io.in(`chat_${chatRoomId}`).fetchSockets();
      console.log(`📢 Broadcasting to ${socketsInRoom.length} users in room`);

      // Send to each socket with correct sender designation
      socketsInRoom.forEach(recipientSocket => {
        const recipientInfo = socketUsers.get(recipientSocket.id);
        if (recipientInfo) {
          // Convert both to numbers to ensure proper comparison
          const recipientUserId = Number(recipientInfo.userId);
          const senderUserId = Number(userId);
          const isSender = recipientUserId === senderUserId;

          console.log(`  → Comparing: recipient=${recipientUserId} vs sender=${senderUserId} => isSender=${isSender}`);

          recipientSocket.emit('chat_message', {
            id: savedMessage.id,
            message: savedMessage.message,
            sender: isSender ? 'me' : 'other',
            senderId: savedMessage.sender_id,
            timestamp: savedMessage.created_at
          });
          console.log(`  → Sent to user ${recipientUserId} as '${isSender ? 'me' : 'other'}'`);
        }
      });

    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle chat room closing
  socket.on('close_chat', async (data) => {
    try {
      const userInfo = socketUsers.get(socket.id);
      if (!userInfo) return;

      const { chatRoomId } = data;

      await chatService.closeChatRoom(chatRoomId);

      // Notify everyone in the room
      io.to(`chat_${chatRoomId}`).emit('chat_closed', {
        message: 'Chat session has ended'
      });

      console.log(`Chat room ${chatRoomId} closed`);

    } catch (error) {
      console.error('Error closing chat:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const userInfo = socketUsers.get(socket.id);
    if (!userInfo) return;

    const { chatRoomId, isTyping } = data;

    // Broadcast typing status to others in the room
    socket.to(`chat_${chatRoomId}`).emit('user_typing', {
      isTyping,
      userId: userInfo.userId
    });
  });

  // Handle disconnect
  socket.on('disconnect', async (reason) => {
    const userInfo = socketUsers.get(socket.id);

    if (userInfo) {
      const { userId, userType } = userInfo;

      console.log(`✗ User ${userId} disconnected: ${reason}`);

      // If peer supporter, update their status to offline
      if (userType === 'peer_supporter') {
        await chatService.updatePeerSupporterStatus(userId, false, null);
        console.log(`Peer supporter ${userId} is now offline`);
      }

      // Clean up mappings
      socketUsers.delete(socket.id);
      userSockets.delete(userId);
    } else {
      console.log('✗ Client disconnected:', socket.id, '| Reason:', reason);
    }
  });

  // Send welcome message
  socket.emit('welcome', {
    message: 'Connected to MindBridge Socket.io server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
});

// Start the server (use 'server' instead of 'app' for Socket.io support)
server.listen(PORT, () => {
  console.log(`MindBridge server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the welcome message`);
  console.log(`Socket.io server is ready for real-time connections`);
});