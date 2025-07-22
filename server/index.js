// Import required packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./db'); // Import our database connection
require('dotenv').config();

// Create Express application
const app = express();

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

// Add new mood entry
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
    const result = await pool.query(
      'INSERT INTO mood_entries (user_id, mood_level, notes) VALUES ($1, $2, $3) RETURNING *',
      [userId, moodLevel, notes || null]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
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

app.listen(PORT, () => {
  console.log(`MindBridge server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the welcome message`);
});